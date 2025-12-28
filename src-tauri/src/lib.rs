use crate::{
    commands::windows_command::{
        close_window, drag_window, maximize_window, minimize_window, multi_panel_window,
        recovery_window,
    },
    context::AppState,
};

pub mod commands;
pub mod context;
pub mod global;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {})
        .invoke_handler(tauri::generate_handler![
            minimize_window,
            maximize_window,
            recovery_window,
            close_window,
            drag_window,
            multi_panel_window
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
