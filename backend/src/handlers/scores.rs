use axum::{extract::{Query, State}, http::StatusCode, Json};
use uuid::Uuid;
use serde::Deserialize;
use crate::handlers::auth::AuthenticatedUser;
use crate::models::{AppState, NewScoreReq, Score, UserRole};

#[derive(Deserialize)]
pub struct ScoreQuery {
    pub student_id: Option<Uuid>,
}

pub async fn list_scores(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Query(query): Query<ScoreQuery>,
) -> Result<Json<Vec<Score>>, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor, UserRole::Parent])?;

    let records = match auth.role {
        UserRole::Admin => {
            sqlx::query_as::<_, Score>(
                "SELECT id, student_id, subject, score, max_score, date, created_at FROM scores WHERE ($1::uuid IS NULL OR student_id = $1)",
            )
            .bind(query.student_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Tutor => {
            sqlx::query_as::<_, Score>(
                "SELECT s.id, s.student_id, s.subject, s.score, s.max_score, s.date, s.created_at FROM scores s JOIN students st ON st.id = s.student_id WHERE st.tutor_id = $1 AND ($2::uuid IS NULL OR s.student_id = $2)",
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

            sqlx::query_as::<_, Score>(
                "SELECT id, student_id, subject, score, max_score, date, created_at FROM scores WHERE student_id = $1",
            )
            .bind(student_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
    };

    Ok(Json(records))
}

pub async fn add_score(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(payload): Json<NewScoreReq>,
) -> Result<(StatusCode, Json<Score>), (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor])?;

    let score = sqlx::query_as::<_, Score>(
        "INSERT INTO scores (id, student_id, subject, score, max_score, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, student_id, subject, score, max_score, date, created_at",
    )
    .bind(Uuid::new_v4())
    .bind(payload.student_id)
    .bind(&payload.subject)
    .bind(payload.score)
    .bind(payload.max_score)
    .bind(payload.date)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(score)))
}
