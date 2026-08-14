use oauth2::basic::BasicClient;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub oauth_client: BasicClient,
    pub jwt_secret: String,
}

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(sqlx::FromRow, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub google_id: Option<String>,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Student {
    pub id: Uuid,
    pub name: String,
    pub grade: String,
    pub tutor_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
}

#[derive(Deserialize)]
pub struct NewStudentReq {
    pub name: String,
    pub grade: String,
    pub tutor_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
}

#[derive(Deserialize)]
pub struct RegisterReq {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginReq {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct OAuthCallbackQuery {
    pub code: String,
    pub state: String,
}

#[derive(Deserialize)]
pub struct GoogleUserInfo {
    pub id: String,
    pub email: String,
}