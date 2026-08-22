pub mod auth;
pub mod attendance;
pub mod scores;
pub mod resources;
pub mod notifications;
pub mod health;
pub mod students;
pub mod parents;
pub mod fees;
pub mod leads;
pub mod payments;

// Re-export handler functions/types so callers can `use crate::handlers::{health, home}`
pub use auth::*;
pub use attendance::*;
pub use scores::*;
pub use resources::*;
pub use notifications::*;
pub use health::*;
pub use students::*;
pub use parents::*;
pub use fees::*;
pub use leads::*;
pub use payments::*;