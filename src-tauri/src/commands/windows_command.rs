use std::sync::Mutex;

use tauri::{command, PhysicalPosition, State, WebviewUrl, WebviewWindowBuilder, Window};

use crate::{
    context::AppState,
    global::{WINDOW_SIZE_MANAGE, WINDOW_SIZE_MANAGE_KEY},
};

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

/// drag window
#[tauri::command]
pub fn drag_window(window: tauri::Window) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())?;
    Ok(())
}

/// multi panel window
#[tauri::command]
pub async fn multi_panel_window(app: tauri::AppHandle) -> Result<(), String> {
    let label = format!("multi_panel_{}", chrono::Utc::now().timestamp_millis());
    let _window = WebviewWindowBuilder::new(&app, label, WebviewUrl::App("/multi_panel".into()))
        .inner_size(1200.0, 800.0)
        .title("Luminliquid - Multi Panel Trading")
        .min_inner_size(800.0, 600.0)
        .resizable(true)
        .decorations(false)
        .build()
        .map_err(|e| format!("create window error: {}", e))?;
    Ok(())
}
