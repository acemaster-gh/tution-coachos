use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};

use crate::state::AppState;
use crate::handlers::{health, home};

pub fn create_router(state: AppState) -> Router {
    // 1. PUBLIC ROUTES (No JWT Token Required)
    let public_routes = Router::new()
        .route("/", get(home))
        .route("/health", get(health));


    Router::new()
        .nest("/api", public_routes)
        .with_state(state)
}