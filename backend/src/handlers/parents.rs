use axum::{extract::Path, http::StatusCode, Json};
use uuid::Uuid;

use crate::models::{NewParentReq, Parent};
use crate::app_state_global;

pub async fn list_parents() -> Result<Json<Vec<Parent>>, (StatusCode, String)> {
    let state = app_state_global::get();
    let parents = sqlx::query_as::<_, Parent>("SELECT id, name, phone, email FROM parents")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(parents))
}

pub async fn create_parent(Json(payload): Json<NewParentReq>) -> Result<(StatusCode, Json<Parent>), (StatusCode, String)> {
    let state = app_state_global::get();
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
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(parent)))
}

pub async fn get_parent(Path(parent_id): Path<Uuid>) -> Result<Json<Parent>, (StatusCode, String)> {
    let state = app_state_global::get();
    let parent = sqlx::query_as::<_, Parent>(
        "SELECT id, name, phone, email FROM parents WHERE id = $1",
    )
    .bind(parent_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Parent not found".to_string()))?;

    Ok(Json(parent))
}

pub async fn delete_parent(Path(parent_id): Path<Uuid>) -> Result<StatusCode, (StatusCode, String)> {
    let state = app_state_global::get();
    sqlx::query("DELETE FROM parents WHERE id = $1")
        .bind(parent_id)
        .execute(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}
