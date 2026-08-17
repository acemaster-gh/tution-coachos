use axum::{
    async_trait,
    extract::{FromRequestParts, Query, State},
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Redirect},
    Json,
};
use argon2::Argon2;
use argon2::password_hash::{PasswordHash, PasswordVerifier};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use oauth2::{
    reqwest::async_http_client, AuthorizationCode, CsrfToken, PkceCodeChallenge,
    Scope, TokenResponse,
};
use rand_core::OsRng;
use uuid::Uuid;

use crate::models::{
    AppState, Claims, GoogleUserInfo, LoginReq, OAuthCallbackQuery, RegisterReq, User, UserRole,
};

pub struct AuthenticatedUser {
    pub user_id: Uuid,
    pub role: UserRole,
}

impl AuthenticatedUser {
    pub fn require_role(&self, allowed: &[UserRole]) -> Result<(), (StatusCode, String)> {
        if allowed.iter().any(|role| *role == self.role) {
            Ok(())
        } else {
            Err((StatusCode::FORBIDDEN, "Forbidden".to_string()))
        }
    }
}

#[async_trait]
impl FromRequestParts<AppState> for AuthenticatedUser {
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|h| h.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Missing authorization header"))?;

        if !auth_header.starts_with("Bearer ") {
            return Err((StatusCode::UNAUTHORIZED, "Invalid authorization format"));
        }

        let token = &auth_header[7..];
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid or expired token"))?;

        let user_id = Uuid::parse_str(&token_data.claims.sub)
            .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid user ID in token"))?;

        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, role, google_id, student_id FROM users WHERE id = $1",
        )
        .bind(user_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid or expired token"))?
        .ok_or((StatusCode::UNAUTHORIZED, "User not found"))?;

        let role = UserRole::from_str(&user.role)
            .ok_or((StatusCode::UNAUTHORIZED, "Invalid user role"))?;

        Ok(AuthenticatedUser { user_id, role })
    }
}

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterReq>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let role = payload.role.as_deref().unwrap_or("parent");
    let password_hash = argon2::PasswordHasher::hash_password(
        &Argon2::default(),
        payload.password.as_bytes(),
        &argon2::password_hash::SaltString::generate(&mut OsRng),
    )
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .to_string();

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, google_id, student_id",
    )
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(role)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, format!("Email exists or DB error: {}", e)))?;

    Ok((StatusCode::CREATED, Json(user)))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginReq>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let row = sqlx::query_as::<_, (Uuid, String, Option<String>)>(
        "SELECT id, role, password_hash FROM users WHERE email = $1",
    )
    .bind(&payload.email)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string()))?;

    let (user_id, role, stored_hash) = match row {
        Some((id, role, Some(hash))) => (id, role, hash),
        _ => return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string())),
    };

    let parsed_hash = PasswordHash::new(&stored_hash)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string()))?;

    let is_valid = Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_ok();

    if !is_valid {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    let token = generate_jwt(user_id, &role, &state.jwt_secret)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string()))?;

    Ok(Json(serde_json::json!({ "token": token })))
}

pub async fn google_login(State(state): State<AppState>) -> Redirect {
    let (pkce_challenge, _pkce_verifier) = PkceCodeChallenge::new_random_sha256();
    let (auth_url, _csrf_token) = state
        .oauth_client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new(
            "https://www.googleapis.com/auth/userinfo.email".to_string(),
        ))
        .set_pkce_challenge(pkce_challenge)
        .url();

    Redirect::temporary(auth_url.as_str())
}

pub async fn google_callback(
    State(state): State<AppState>,
    Query(query): Query<OAuthCallbackQuery>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let token_res = state
        .oauth_client
        .exchange_code(AuthorizationCode::new(query.code))
        .request_async(async_http_client)
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("OAuth token exchange failed: {}", e)))?;

    let client = reqwest::Client::new();
    let user_info: GoogleUserInfo = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(token_res.access_token().secret())
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user_id = match sqlx::query_as::<_, (Uuid,)>(
        "SELECT id FROM users WHERE google_id = $1 OR email = $2",
    )
    .bind(&user_info.id)
    .bind(&user_info.email)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    {
        Some((id,)) => {
            let _ = sqlx::query("UPDATE users SET google_id = $1 WHERE id = $2")
                .bind(&user_info.id)
                .bind(id)
                .execute(&state.db)
                .await;
            id
        }
        None => {
            let new_user = sqlx::query_as::<_, (Uuid,)>(
                "INSERT INTO users (email, google_id, role) VALUES ($1, $2, 'parent') RETURNING id",
            )
            .bind(&user_info.email)
            .bind(&user_info.id)
            .fetch_one(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            new_user.0
        }
    };

    let jwt = generate_jwt(user_id, UserRole::Parent.as_str(), &state.jwt_secret)?;
    Ok(Json(serde_json::json!({ "token": jwt })))
}

pub fn generate_jwt(
    user_id: Uuid,
    role: &str,
    secret: &str,
) -> Result<String, (StatusCode, String)> {
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        role: role.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("JWT creation failed: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_supported_roles() {
        assert_eq!(UserRole::from_str("admin"), Some(UserRole::Admin));
        assert_eq!(UserRole::from_str("tutor"), Some(UserRole::Tutor));
        assert_eq!(UserRole::from_str("parent"), Some(UserRole::Parent));
    }

    #[test]
    fn role_guard_rejects_disallowed_access() {
        let auth = AuthenticatedUser {
            user_id: Uuid::new_v4(),
            role: UserRole::Parent,
        };

        let result = auth.require_role(&[UserRole::Admin, UserRole::Tutor]);
        assert!(result.is_err());

        let allowed = auth.require_role(&[UserRole::Parent]);
        assert!(allowed.is_ok());
    }
}
