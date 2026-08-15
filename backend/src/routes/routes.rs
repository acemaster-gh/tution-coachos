use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};

use crate::handlers::{
    health, home,
    list_students, create_student, get_student, delete_student,
    list_parents, create_parent, get_parent, delete_parent,
    list_fees, create_fee, get_fee, delete_fee,
    list_leads, create_lead,
};

pub fn create_router() -> Router {
    // 1. PUBLIC ROUTES (No JWT Token Required)
    let public_routes = Router::new()
        .route("/", get(home))
        .route("/health", get(health))
        .route("/students", get(list_students).post(create_student))
        .route("/students/:id", get(get_student).delete(delete_student))
        .route("/parents", get(list_parents).post(create_parent))
        .route("/parents/:id", get(get_parent).delete(delete_parent))
        .route("/fees", get(list_fees).post(create_fee))
        .route("/fees/:id", get(get_fee).delete(delete_fee))
        .route("/leads", get(list_leads).post(create_lead));
    Router::new().nest("/api", public_routes)
}