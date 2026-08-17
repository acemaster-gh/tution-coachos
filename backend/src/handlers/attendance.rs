use axum::{extract::{Query, State}, http::StatusCode, Json};
use uuid::Uuid;

use crate::models::{AppState, Attendance, NewAttendanceReq, UserRole};
use crate::handlers::auth::AuthenticatedUser;

#[derive(Deserialize)]
pub struct AttendanceQuery {
    pub student_id: Option<Uuid>,
}

pub async fn list_attendance(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Query(query): Query<AttendanceQuery>,
) -> Result<Json<Vec<Attendance>>, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor, UserRole::Parent])?;

    let records = match auth.role {
        UserRole::Admin => {
            sqlx::query_as::<_, Attendance>(
                "SELECT id, student_id, date, present, created_at FROM attendance WHERE ($1::uuid IS NULL OR student_id = $1)",
            )
            .bind(query.student_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Tutor => {
            sqlx::query_as::<_, Attendance>(
                "SELECT a.id, a.student_id, a.date, a.present, a.created_at FROM attendance a JOIN students s ON s.id = a.student_id WHERE s.tutor_id = $1 AND ($2::uuid IS NULL OR a.student_id = $2)",
            )
            .bind(auth.user_id)
            .bind(query.student_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Parent => {
            let linked_student_id = sqlx::query_scalar::<_, Option<Uuid>>("SELECT student_id FROM users WHERE id = $1")
                .bind(auth.user_id)
                .fetch_optional(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
                .flatten()
                .ok_or((StatusCode::FORBIDDEN, "No linked student found".to_string()))?;

            let student_id = query.student_id.unwrap_or(linked_student_id);
            if student_id != linked_student_id {
                return Err((StatusCode::FORBIDDEN, "Forbidden".to_string()));
            }

            sqlx::query_as::<_, Attendance>(
                "SELECT id, student_id, date, present, created_at FROM attendance WHERE student_id = $1",
            )
            .bind(student_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
    };

    Ok(Json(records))
}

pub async fn mark_attendance(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(payload): Json<NewAttendanceReq>,
) -> Result<(StatusCode, Json<Attendance>), (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor])?;

    let attendance = sqlx::query_as::<_, Attendance>(
        "INSERT INTO attendance (id, student_id, date, present) VALUES ($1, $2, $3, $4) ON CONFLICT (student_id, date) DO UPDATE SET present = EXCLUDED.present, created_at = now() RETURNING id, student_id, date, present, created_at",
    )
    .bind(Uuid::new_v4())
    .bind(payload.student_id)
    .bind(payload.date)
    .bind(payload.present)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(attendance)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn attendance_payload_uses_date_and_present_flag() {
        let payload = NewAttendanceReq {
            student_id: Uuid::new_v4(),
            date: chrono::NaiveDate::from_ymd_opt(2026, 8, 17).unwrap(),
            present: true,
        };

        assert_eq!(payload.present, true);
        assert_eq!(payload.date.to_string(), "2026-08-17");
    }
}
