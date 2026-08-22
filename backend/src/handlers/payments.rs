use axum::{
    body::Bytes,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::models::{AppState, Fee};

#[derive(Debug, Deserialize)]
pub struct CreateOrderRequest {
    #[serde(alias = "feeId")]
    pub fee_id: Option<String>,
    #[serde(default)]
    pub amount: Option<f64>,
    #[serde(default)]
    pub currency: Option<String>,
}

impl CreateOrderRequest {
    fn fee_id(&self) -> Option<Uuid> {
        self.fee_id.as_deref().and_then(|value| Uuid::parse_str(value).ok())
    }
}

#[derive(Debug, Deserialize)]
struct RazorpayWebhookPayload {
    event: String,
    payload: RazorpayPayload,
}

#[derive(Debug, Deserialize)]
struct RazorpayPayload {
    payment: Option<RazorpayPayment>,
    order: Option<RazorpayOrder>,
}

#[derive(Debug, Deserialize)]
struct RazorpayPayment {
    entity: Option<RazorpayPaymentEntity>,
}

#[derive(Debug, Deserialize)]
struct RazorpayOrder {
    entity: Option<RazorpayOrderEntity>,
}

#[derive(Debug, Deserialize)]
struct RazorpayPaymentEntity {
    notes: Option<RazorpayNotes>,
}

#[derive(Debug, Deserialize)]
struct RazorpayOrderEntity {
    notes: Option<RazorpayNotes>,
}

#[derive(Debug, Deserialize, Default)]
struct RazorpayNotes {
    #[serde(alias = "feeId")]
    fee_id: Option<String>,
    #[serde(alias = "studentId")]
    student_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CreateOrderResponse {
    #[serde(rename = "keyId")]
    pub key_id: String,
    pub order: serde_json::Value,
}

fn verify_webhook_signature(secret: &str, raw_body: &[u8], signature: &str) -> bool {
    type HmacSha256 = Hmac<Sha256>;
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC should be valid");
    mac.update(raw_body);
    let expected = hex::encode(mac.finalize().into_bytes());
    let signature_bytes = signature.as_bytes();
    let expected_bytes = expected.as_bytes();
    signature_bytes.len() == expected_bytes.len()
        && constant_time_compare(signature_bytes, expected_bytes)
}

fn constant_time_compare(lhs: &[u8], rhs: &[u8]) -> bool {
    let mut diff = lhs.len() as u8 ^ rhs.len() as u8;
    let mut index = 0usize;
    while index < lhs.len() && index < rhs.len() {
        diff |= lhs[index] ^ rhs[index];
        index += 1;
    }
    diff == 0
}

async fn lookup_fee_by_id(state: &AppState, fee_id: Uuid) -> Result<Fee, (StatusCode, String)> {
    sqlx::query_as::<_, Fee>(
        "SELECT id, student_id, amount, due_date, status, paid_at FROM fees WHERE id = $1",
    )
    .bind(fee_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Fee not found".to_string()))
}

async fn mark_fee_paid(state: &AppState, fee_id: Uuid) -> Result<(), (StatusCode, String)> {
    let updated = sqlx::query(
        "UPDATE fees SET status = 'paid', paid_at = NOW() WHERE id = $1 AND status != 'paid'",
    )
    .bind(fee_id)
    .execute(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update fee status".to_string()))?;

    if updated.rows_affected() == 0 {
        return Ok(());
    }

    Ok(())
}

pub async fn create_payment_order(
    State(state): State<AppState>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<CreateOrderResponse>), (StatusCode, String)> {
    let fee_id = payload
        .fee_id()
        .ok_or((StatusCode::BAD_REQUEST, "feeId is required".to_string()))?;

    let fee = lookup_fee_by_id(&state, fee_id).await?;
    if fee.status == "paid" {
        return Err((StatusCode::BAD_REQUEST, "This fee is already marked paid".to_string()));
    }

    if state.razorpay_key_id.is_empty() || state.razorpay_key_secret.is_empty() {
        return Err((StatusCode::SERVICE_UNAVAILABLE, "Razorpay is not configured".to_string()));
    }

    let amount_in_paise = (fee.amount * 100.0).round() as i64;
    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.razorpay.com/v1/orders")
        .basic_auth(&state.razorpay_key_id, Some(&state.razorpay_key_secret))
        .json(&serde_json::json!({
            "amount": amount_in_paise,
            "currency": payload.currency.as_deref().unwrap_or("INR"),
            "receipt": fee.id.to_string(),
            "notes": {
                "feeId": fee.id.to_string(),
                "studentId": fee.student_id.to_string()
            }
        }))
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, format!("Failed to create Razorpay order: {e}")))?;

    let status = resp.status();
    let body: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, format!("Failed to read Razorpay response: {e}")))?;

    if !status.is_success() {
        let message = body.get("error")
            .and_then(|v| v.get("description"))
            .and_then(|v| v.as_str())
            .unwrap_or("Could not create the payment order");
        return Err((StatusCode::BAD_GATEWAY, message.to_string()));
    }

    Ok((
        StatusCode::OK,
        Json(CreateOrderResponse {
            key_id: state.razorpay_key_id.clone(),
            order: body,
        }),
    ))
}

pub async fn payment_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    raw: Bytes,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, String)> {
    let secret = state.razorpay_webhook_secret.trim();
    if secret.is_empty() {
        return Err((StatusCode::SERVICE_UNAVAILABLE, "Webhook secret is not configured".to_string()));
    }

    let signature = headers
        .get("x-razorpay-signature")
        .and_then(|value| value.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing Razorpay signature".to_string()))?;

    if !verify_webhook_signature(secret, &raw, signature) {
        return Err((StatusCode::BAD_REQUEST, "Invalid Razorpay signature".to_string()));
    }

    let event: RazorpayWebhookPayload = serde_json::from_slice(&raw)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Malformed Razorpay payload".to_string()))?;

    let fee_id = match event.event.as_str() {
        "payment.captured" => event
            .payload
            .payment
            .and_then(|payment| payment.entity)
            .and_then(|entity| entity.notes)
            .and_then(|notes| notes.fee_id.clone()),
        "order.paid" => event
            .payload
            .order
            .and_then(|order| order.entity)
            .and_then(|entity| entity.notes)
            .and_then(|notes| notes.fee_id.clone()),
        _ => None,
    };

    if let Some(fee_id) = fee_id {
        let parsed_fee_id = Uuid::parse_str(&fee_id)
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid fee ID in Razorpay payload".to_string()))?;
        mark_fee_paid(&state, parsed_fee_id).await?;
    }

    Ok((StatusCode::OK, Json(serde_json::json!({"ok": true}))))
}

pub async fn mark_fee_paid_for_payment(
    State(state): State<AppState>,
    Path(fee_id): Path<Uuid>,
) -> Result<Json<Fee>, (StatusCode, String)> {
    let fee = lookup_fee_by_id(&state, fee_id).await?;
    if fee.status == "paid" {
        return Ok(Json(fee));
    }

    mark_fee_paid(&state, fee_id).await?;
    let updated = lookup_fee_by_id(&state, fee_id).await?;
    Ok(Json(updated))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verifies_expected_razorpay_signature() {
        let secret = "test-secret";
        let raw = br#"{"event":"payment.captured"}"#;
        let expected = "f962b4cdc1d54bae85fda03948777b50bcfaa8f2c73369cf66577802120415ee";
        assert_eq!(expected, expected_signature(secret, raw));
    }

    #[test]
    fn rejects_invalid_signature() {
        let secret = "test-secret";
        let raw = br#"{"event":"payment.captured"}"#;
        assert!(!verify_webhook_signature(secret, raw, "bad-signature"));
    }

    fn expected_signature(secret: &str, raw: &[u8]) -> String {
        type HmacSha256 = Hmac<Sha256>;
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(raw);
        hex::encode(mac.finalize().into_bytes())
    }
}
