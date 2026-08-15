use axum::{http::StatusCode, Json};
use uuid::Uuid;

use crate::models::{Lead, NewLeadReq};
use crate::app_state_global;

pub async fn list_leads() -> Result<Json<Vec<Lead>>, (StatusCode, String)> {
    let state = app_state_global::get();
    let leads = sqlx::query_as::<_, Lead>("SELECT id, parent_name, phone, grade, subject, received_at, converted FROM leads")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(leads))
}

pub async fn create_lead(Json(payload): Json<NewLeadReq>) -> Result<(StatusCode, Json<Lead>), (StatusCode, String)> {
    let state = app_state_global::get();
    let id = Uuid::new_v4();
    let lead = sqlx::query_as::<_, Lead>(
        "INSERT INTO leads (id, parent_name, phone, grade, subject, received_at, converted) VALUES ($1, $2, $3, $4, $5, now(), false) RETURNING id, parent_name, phone, grade, subject, received_at, converted",
    )
    .bind(id)
    .bind(&payload.parent_name)
    .bind(&payload.phone)
    .bind(&payload.grade)
    .bind(&payload.subject)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(lead)))
}
