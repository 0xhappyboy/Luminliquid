#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod types;

fn main() {
    app_lib::run();
}
