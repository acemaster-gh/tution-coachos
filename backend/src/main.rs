mod handlers;
mod models;
mod routes;
mod app_state_global;

use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use oauth2::{basic::BasicClient, AuthUrl, ClientId, ClientSecret, RedirectUrl, TokenUrl};
use sqlx::PgPool;
use std::env;

use handlers::{google_callback, google_login, login, register, AuthenticatedUser};
use models::{AppState, User};
use axum::extract::State;

async fn get_me(State(state): State<AppState>, AuthenticatedUser(user_id): AuthenticatedUser,) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, google_id FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "User not found".to_string()))?;

    Ok(Json(user))
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let db = PgPool::connect(&database_url).await.unwrap();

    let google_client_id =
        ClientId::new(env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID missing"));
    let google_client_secret =
        ClientSecret::new(env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET missing"));
    let auth_url =
        AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string()).unwrap();
    let token_url =
        TokenUrl::new("https://oauth2.googleapis.com/token".to_string()).unwrap();
    let redirect_url =
        RedirectUrl::new("http://localhost:3000/auth/google/callback".to_string()).unwrap();

    let oauth_client = BasicClient::new(
        google_client_id,
        Some(google_client_secret),
        auth_url,
        Some(token_url),
    )
    .set_redirect_uri(redirect_url);

    let state = AppState {
        db,
        oauth_client,
        jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| "super-secret-key".to_string()),
    };

    let api_router = crate::routes::routes::create_router(state.clone());

    let app = Router::new()
        .merge(api_router)
        .route("/me", get(get_me))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .unwrap();

    println!("Server running on http://localhost:8080");

    axum::serve(listener, app)
        .await
        .unwrap();
}