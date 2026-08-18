use oauth2::basic::BasicClient;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::str::FromStr;
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub oauth_client: BasicClient,
    pub jwt_secret: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
    Tutor,
    Parent,
}

impl UserRole {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Admin => "admin",
            Self::Tutor => "tutor",
            Self::Parent => "parent",
        }
    }

    pub fn from_str(value: &str) -> Option<Self> {
        match value.trim().to_ascii_lowercase().as_str() {
            "admin" => Some(Self::Admin),
            "tutor" => Some(Self::Tutor),
            "parent" => Some(Self::Parent),
            _ => None,
        }
    }
}

impl std::fmt::Display for UserRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

impl FromStr for UserRole {
    type Err = String;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        Self::from_str(value).ok_or_else(|| format!("invalid role: {value}"))
    }
}

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

#[derive(sqlx::FromRow, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub role: String,
    pub google_id: Option<String>,
    pub student_id: Option<Uuid>,
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
    #[serde(default)]
    pub role: Option<String>,
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
pub struct Attendance {
    pub id: Uuid,
    pub student_id: Uuid,
    pub date: chrono::NaiveDate,
    pub present: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct NewAttendanceReq {
    pub student_id: Uuid,
    pub date: chrono::NaiveDate,
    pub present: bool,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Score {
    pub id: Uuid,
    pub student_id: Uuid,
    pub subject: String,
    pub score: f64,
    pub max_score: f64,
    pub date: chrono::NaiveDate,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct NewScoreReq {
    pub student_id: Uuid,
    pub subject: String,
    pub score: f64,
    pub max_score: f64,
    pub date: chrono::NaiveDate,
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