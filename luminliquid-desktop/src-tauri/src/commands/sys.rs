use tauri::{command, Window};

use crate::global::{WINDOW_SIZE_MANAGE, WINDOW_SIZE_MANAGE_KEY};

/// minimize window
#[command]
pub fn minimize_window(window: Window) {
    window.minimize().unwrap();
}

/// maximize window
#[command]
pub fn maximize_window(window: Window) {
    if let Ok(inner_size) = window.inner_size() {
        WINDOW_SIZE_MANAGE.lock().unwrap().insert(
            WINDOW_SIZE_MANAGE_KEY.to_string(),
            (inner_size.width, inner_size.height),
        );
    }
    if window.is_maximized().unwrap() {
        window.unmaximize().unwrap();
    } else {
        window.maximize().unwrap();
    }
}

/// recovery window
#[command]
pub fn recovery_window(window: Window) {
    let w = WINDOW_SIZE_MANAGE
        .lock()
        .unwrap()
        .get(WINDOW_SIZE_MANAGE_KEY)
        .unwrap_or(&(
            window.inner_size().unwrap().width,
            window.inner_size().unwrap().height,
        ))
        .0;
    let h = WINDOW_SIZE_MANAGE
        .lock()
        .unwrap()
        .get(WINDOW_SIZE_MANAGE_KEY)
        .unwrap_or(&(
            window.inner_size().unwrap().width,
            window.inner_size().unwrap().height,
        ))
        .1;
    let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: w as f64,
        height: h as f64,
    }));
}

/// close window
#[command]
pub fn close_window(window: Window) {
    window.close().unwrap();
}
