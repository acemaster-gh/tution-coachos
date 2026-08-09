use axum::Json;

pub async fn health() -> Json<String> {
    Json("ok".to_string())
}

pub async fn home() -> Json<String> {
    Json("Welcome".to_string())
}