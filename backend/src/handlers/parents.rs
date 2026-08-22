use axum::{extract::{Path, State}, http::StatusCode, Json};
use uuid::Uuid;

use crate::models::{NewParentReq, Parent};
use crate::models::AppState;

pub async fn list_parents(State(state): State<AppState>) -> Result<Json<Vec<Parent>>, (StatusCode, String)> {
    let parents = sqlx::query_as::<_, Parent>("SELECT id, name, phone, email FROM parents")
        .fetch_all(&state.db)
        .await
        .map_err((StatusCode::INTERNAL_SERVER_ERROR, "Failed to create Parent".to_string()))?;

    Ok(Json(parents))
}

pub async fn create_parent(State(state): State<AppState>, Json(payload): Json<NewParentReq>) -> Result<(StatusCode, Json<Parent>), (StatusCode, String)> {
    let id = Uuid::new_v4();
    let parent = sqlx::query_as::<_, Parent>(
        "INSERT INTO parents (id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, email",
    )
    .bind(id)
    .bind(&payload.name)
    .bind(&payload.phone)
    .bind(&payload.email)
    .fetch_one(&state.db)
    .await
    .map_err( (StatusCode::BAD_REQUEST, "Unable to create a parent".to_string()))?;

    Ok((StatusCode::CREATED, Json(parent)))
}

pub async fn get_parent(State(state): State<AppState>, Path(parent_id): Path<Uuid>) -> Result<Json<Parent>, (StatusCode, String)> {
    let parent = sqlx::query_as::<_, Parent>(
        "SELECT id, name, phone, email FROM parents WHERE id = $1",
    )
    .bind(parent_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Parent not found".to_string()))?;

    Ok(Json(parent))
}

pub async fn delete_parent(State(state): State<AppState>, Path(parent_id): Path<Uuid>) -> Result<StatusCode, (StatusCode, String)> {
    sqlx::query("DELETE FROM parents WHERE id = $1")
        .bind(parent_id)
        .execute(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}
