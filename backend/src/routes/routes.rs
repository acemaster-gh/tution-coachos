use axum::{
    extract::State,
    http::{Request, StatusCode, header},
    middleware,
    middleware::Next,
    response::IntoResponse,
    routing::{get, post},
    Router,
};

use crate::models::AppState;

use crate::handlers::{
    auth, attendance::{list_attendance, mark_attendance}, health, home,
    list_students, create_student, get_student, delete_student,
    list_parents, create_parent, get_parent, delete_parent,
    list_fees, create_fee, get_fee, delete_fee,
    list_leads, create_lead,
    scores::{list_scores, add_score},
    notifications::{list_notifications, create_notification},
    resources::{list_resources, create_resource},
    create_payment_order, payment_webhook,
};

use jsonwebtoken::{decode, DecodingKey, Validation};
async fn require_auth(
    State(state): State<AppState>,
    req: Request<axum::body::Body>,
    next: Next,
) -> impl IntoResponse {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    let auth_header = match auth_header {
        Some(v) => v,
        None => return (StatusCode::UNAUTHORIZED, "Missing authorization header").into_response(),
    };

    if !auth_header.starts_with("Bearer ") {
        return (StatusCode::UNAUTHORIZED, "Invalid authorization format").into_response();
    }

    let token = &auth_header[7..];
    let token_data = decode::<crate::models::Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    );

    if token_data.is_err() {
        return (StatusCode::UNAUTHORIZED, "Invalid or expired token").into_response();
    }

    next.run(req).await
}

pub fn create_router(state: AppState) -> Router<crate::models::AppState> {
    // Public routes: health, home, and auth endpoints
    let public_routes = Router::new()
        .route("/", get(home))
        .route("/health", get(health))
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/google", get(auth::google_login))
        .route("/auth/google/callback", get(auth::google_callback))
        .route("/payments/webhook", post(payment_webhook));

    // Protected routes: require a valid JWT
    let protected_routes = Router::new()
        .route("/students", get(list_students).post(create_student))
        .route("/students/:id", get(get_student).delete(delete_student))
        .route("/parents", get(list_parents).post(create_parent))
        .route("/parents/:id", get(get_parent).delete(delete_parent))
        .route("/fees", get(list_fees).post(create_fee))
        .route("/fees/:id", get(get_fee).delete(delete_fee))
        .route("/payments/create-order", post(create_payment_order))
        .route("/leads", get(list_leads).post(create_lead))
        .route("/attendance", get(list_attendance).post(mark_attendance))
        .route("/scores", get(list_scores).post(add_score))
        .route("/resources", get(list_resources).post(create_resource))
        .route("/notifications", get(list_notifications).post(create_notification));

    let protected_routes = protected_routes.layer(middleware::from_fn_with_state(
        state,
        require_auth,
    ));

    let api = Router::new().merge(public_routes).merge(protected_routes);
    api
}