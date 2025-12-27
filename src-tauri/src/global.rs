use std::{collections::HashMap, sync::Mutex};

use lazy_static::lazy_static;

pub const WINDOW_SIZE_MANAGE_KEY: &str = "maximize_previous_window_size";

lazy_static! {
    // k:width v:width
    pub static ref WINDOW_SIZE_MANAGE: Mutex<HashMap<String, (u32, u32)>> =
        Mutex::new(HashMap::new());
}
