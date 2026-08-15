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

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Parent {
    pub id: Uuid,
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
}

#[derive(Deserialize)]
pub struct NewParentReq {
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Fee {
    pub id: Uuid,
    pub student_id: Uuid,
    pub amount: f64,
    pub due_date: chrono::NaiveDate,
    pub status: String,
    pub paid_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Deserialize)]
pub struct NewFeeReq {
    pub student_id: Uuid,
    pub amount: f64,
    pub due_date: chrono::NaiveDate,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Lead {
    pub id: Uuid,
    pub parent_name: String,
    pub phone: String,
    pub grade: String,
    pub subject: String,
    pub received_at: chrono::DateTime<chrono::Utc>,
    pub converted: bool,
}

#[derive(Deserialize)]
pub struct NewLeadReq {
    pub parent_name: String,
    pub phone: String,
    pub grade: String,
    pub subject: String,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Resource {
    pub id: Uuid,
    pub title: String,
    pub subject: String,
    pub grade: String,
    pub r#type: String,
    pub url: String,
    pub uploaded_by: Option<Uuid>,
    pub uploaded_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct NewResourceReq {
    pub title: String,
    pub subject: String,
    pub grade: String,
    pub r#type: String,
    pub url: String,
    pub uploaded_by: Option<Uuid>,
}