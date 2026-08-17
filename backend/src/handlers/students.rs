use axum::{extract::{Path, State}, http::StatusCode, Json};
use uuid::Uuid;

use crate::handlers::auth::AuthenticatedUser;
use crate::models::{AppState, NewStudentReq, Student, UserRole};

pub async fn list_students(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
) -> Result<Json<Vec<Student>>, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor, UserRole::Parent])?;

    let students = match auth.role {
        UserRole::Admin => {
            sqlx::query_as::<_, Student>("SELECT id, name, grade, tutor_id, parent_id FROM students")
                .fetch_all(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Tutor => {
            sqlx::query_as::<_, Student>(
                "SELECT id, name, grade, tutor_id, parent_id FROM students WHERE tutor_id = $1",
            )
            .bind(auth.user_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Parent => {
            let user = sqlx::query_scalar::<_, Option<Uuid>>("SELECT student_id FROM users WHERE id = $1")
                .bind(auth.user_id)
                .fetch_optional(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
                .flatten();

            let student_id = user.ok_or((StatusCode::FORBIDDEN, "No linked student found".to_string()))?;

            sqlx::query_as::<_, Student>(
                "SELECT id, name, grade, tutor_id, parent_id FROM students WHERE id = $1 OR parent_id = $1",
            )
            .bind(student_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
    };

    Ok(Json(students))
}

pub async fn create_student(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(payload): Json<NewStudentReq>,
) -> Result<(StatusCode, Json<Student>), (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor])?;

    let id = Uuid::new_v4();
    let student = sqlx::query_as::<_, Student>(
        "INSERT INTO students (id, name, grade, tutor_id, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, grade, tutor_id, parent_id",
    )
    .bind(id)
    .bind(&payload.name)
    .bind(&payload.grade)
    .bind(&payload.tutor_id)
    .bind(&payload.parent_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(student)))
}

pub async fn get_student(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Path(student_id): Path<Uuid>,
) -> Result<Json<Student>, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor, UserRole::Parent])?;

    let student = match auth.role {
        UserRole::Admin | UserRole::Tutor => {
            sqlx::query_as::<_, Student>(
                "SELECT id, name, grade, tutor_id, parent_id FROM students WHERE id = $1",
            )
            .bind(student_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| (StatusCode::NOT_FOUND, "Student not found".to_string()))?
        }
        UserRole::Parent => {
            let user_student = sqlx::query_scalar::<_, Option<Uuid>>("SELECT student_id FROM users WHERE id = $1")
                .bind(auth.user_id)
                .fetch_optional(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
                .flatten();

            let linked_student_id = user_student.ok_or((StatusCode::FORBIDDEN, "No linked student found".to_string()))?;

            if student_id != linked_student_id {
                return Err((StatusCode::FORBIDDEN, "Forbidden".to_string()));
            }

            sqlx::query_as::<_, Student>(
                "SELECT id, name, grade, tutor_id, parent_id FROM students WHERE id = $1",
            )
            .bind(student_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| (StatusCode::NOT_FOUND, "Student not found".to_string()))?
        }
    };

    Ok(Json(student))
}

pub async fn delete_student(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Path(student_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin])?;

    sqlx::query("DELETE FROM students WHERE id = $1")
        .bind(student_id)
        .execute(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}

