use once_cell::sync::OnceCell;
use crate::models::AppState;

static GLOBAL_STATE: OnceCell<AppState> = OnceCell::new();

pub fn init(state: AppState) {
    let _ = GLOBAL_STATE.set(state);
}

pub fn get() -> &'static AppState {
    GLOBAL_STATE.get().expect("AppState not initialized")
}
