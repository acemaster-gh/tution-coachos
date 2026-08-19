use axum::{extract::State, http::StatusCode, Json};
use uuid::Uuid;

use crate::handlers::auth::AuthenticatedUser;
use crate::models::{AppState, Notification, NewNotificationReq, UserRole};

pub async fn list_notifications(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
) -> Result<Json<Vec<Notification>>, (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin])?;

    let rows = sqlx::query_as::<_, Notification>(
        "SELECT id, channel, to_address, subject, body, sent_at, ok, error FROM notifications ORDER BY sent_at DESC",
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(rows))
}

pub async fn create_notification(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(payload): Json<NewNotificationReq>,
) -> Result<(StatusCode, Json<Notification>), (StatusCode, String)> {
    auth.require_role(&[UserRole::Admin])?;

    // For simplicity: we persist the notification and mark ok=true. External
    // integrations (Resend/Twilio) would be implemented later.
    let id = Uuid::new_v4();
    let rec = sqlx::query_as::<_, Notification>(
        "INSERT INTO notifications (id, channel, to_address, subject, body, sent_at, ok) VALUES ($1, $2, $3, $4, $5, now(), true) RETURNING id, channel, to_address, subject, body, sent_at, ok, error",
    )
    .bind(id)
    .bind(&payload.channel)
    .bind(&payload.to_address)
    .bind(&payload.subject)
    .bind(&payload.body)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    // Console fallback log
    println!("Notification queued: {} -> {} ({})", payload.channel, payload.to_address, payload.subject.as_deref().unwrap_or(""));

    Ok((StatusCode::CREATED, Json(rec)))
}

