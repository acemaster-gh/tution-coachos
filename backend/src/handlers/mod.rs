pub mod auth;
pub mod health;
pub mod students;

// Re-export handler functions/types so callers can `use crate::handlers::{health, home}`
pub use auth::*;
pub use health::*;
pub use students::*;