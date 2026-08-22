use axum::{extract::{Query, State}, http::StatusCode, Json};
use serde::Deserialize;
use uuid::Uuid;

use crate::handlers::auth::AuthenticatedUser;
use crate::models::{AppState, NewResourceReq, Resource, UserRole};

#[derive(Deserialize)]
pub struct ResourceQuery {
    pub grade: Option<String>,
    pub subject: Option<String>,
}

pub async fn list_resources(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Query(query): Query<ResourceQuery>,
) -> Result<Json<Vec<Resource>>, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor, UserRole::Parent])?;

    let records = match auth.role {
        UserRole::Admin => {
            sqlx::query_as::<_, Resource>(
                "SELECT id, title, subject, grade, type, url, uploaded_by, uploaded_at FROM resources WHERE ($1::text IS NULL OR grade = $1) AND ($2::text IS NULL OR subject = $2)",
            )
            .bind(query.grade)
            .bind(query.subject)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Tutor => {
            sqlx::query_as::<_, Resource>(
                "SELECT id, title, subject, grade, type, url, uploaded_by, uploaded_at FROM resources WHERE ($1::text IS NULL OR grade = $1) AND ($2::text IS NULL OR subject = $2)",
            )
            .bind(query.grade)
            .bind(query.subject)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
        UserRole::Parent => {
            let linked_grade = sqlx::query_scalar::<_, Option<String>>("SELECT s.grade FROM students s JOIN users u ON u.student_id = s.id WHERE u.id = $1")
                .bind(auth.user_id)
                .fetch_optional(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
                .flatten()
                .ok_or((StatusCode::FORBIDDEN, "No linked student found".to_string()))?;

            let grade_filter = query.grade.clone().unwrap_or(linked_grade);
            sqlx::query_as::<_, Resource>(
                "SELECT id, title, subject, grade, type, url, uploaded_by, uploaded_at FROM resources WHERE grade = $1 AND ($2::text IS NULL OR subject = $2)",
            )
            .bind(grade_filter)
            .bind(query.subject)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        }
    };

    Ok(Json(records))
}

pub async fn create_resource(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(payload): Json<NewResourceReq>,
) -> Result<(StatusCode, Json<Resource>), (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin, UserRole::Tutor])?;

    let resource = sqlx::query_as::<_, Resource>(
        "INSERT INTO resources (id, title, subject, grade, type, url, uploaded_by, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now()) RETURNING id, title, subject, grade, type, url, uploaded_by, uploaded_at",
    )
    .bind(Uuid::new_v4())
    .bind(&payload.title)
    .bind(&payload.subject)
    .bind(&payload.grade)
    .bind(&payload.r#type)
    .bind(&payload.url)
    .bind(payload.uploaded_by)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(resource)))
}