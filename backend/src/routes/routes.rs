use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};

use crate::handlers::{health, home, list_students, create_student, get_student, delete_student};

pub fn create_router() -> Router {
    // 1. PUBLIC ROUTES (No JWT Token Required)
    let public_routes = Router::new()
        .route("/", get(home))
        .route("/health", get(health))
        .route("/students", get(list_students).post(create_student))
        .route("/students/:id", get(get_student).delete(delete_student));
    Router::new().nest("/api", public_routes)
}