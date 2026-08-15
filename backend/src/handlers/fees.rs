use axum::{extract::Path, http::StatusCode, Json};
use uuid::Uuid;

use crate::models::{Fee, NewFeeReq};
use crate::app_state_global;

pub async fn list_fees() -> Result<Json<Vec<Fee>>, (StatusCode, String)> {
    let state = app_state_global::get();
    let fees = sqlx::query_as::<_, Fee>("SELECT id, student_id, amount, due_date, status, paid_at FROM fees")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(fees))
}

pub async fn create_fee(Json(payload): Json<NewFeeReq>) -> Result<(StatusCode, Json<Fee>), (StatusCode, String)> {
    let state = app_state_global::get();
    let id = Uuid::new_v4();
    let fee = sqlx::query_as::<_, Fee>(
        "INSERT INTO fees (id, student_id, amount, due_date, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id, student_id, amount, due_date, status, paid_at",
    )
    .bind(id)
    .bind(&payload.student_id)
    .bind(&payload.amount)
    .bind(&payload.due_date)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(fee)))
}

pub async fn get_fee(Path(fee_id): Path<Uuid>) -> Result<Json<Fee>, (StatusCode, String)> {
    let state = app_state_global::get();
    let fee = sqlx::query_as::<_, Fee>(
        "SELECT id, student_id, amount, due_date, status, paid_at FROM fees WHERE id = $1",
    )
    .bind(fee_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Fee not found".to_string()))?;

    Ok(Json(fee))
}

pub async fn delete_fee(Path(fee_id): Path<Uuid>) -> Result<StatusCode, (StatusCode, String)> {
    let state = app_state_global::get();
    sqlx::query("DELETE FROM fees WHERE id = $1")
        .bind(fee_id)
        .execute(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}
