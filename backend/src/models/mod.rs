pub mod models;

// Re-export inner model types at the `models` module root so other modules
// can `use crate::models::{AppState, User, ...}` which the code expects.
pub use models::*;