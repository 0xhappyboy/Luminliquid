use crossterm::event::{self, Event, KeyCode};
use ratatui::{Terminal, backend::CrosstermBackend};
use std::{
    io,
    time::{Duration, Instant},
};

use crate::{
    app::{App, AreaFocusEnum},
    index::ui,
    global::NetworkEnum,
};

/// event poll
/// program main loop
pub fn event_poll(
    terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>,
    mut app: App,
) -> io::Result<()> {
    let tick_rate = Duration::from_millis(1000);
    let mut last_key_time = Instant::now();
    let key_debounce = Duration::from_millis(150);
    loop {
        terminal.draw(|f| ui(f, &mut app))?;
        let timeout = tick_rate
            .checked_sub(app.last_update.elapsed())
            .unwrap_or_else(|| Duration::from_secs(0));
        if event::poll(timeout)? {
            if let Event::Key(key) = event::read()? {
                if last_key_time.elapsed() < key_debounce {
                    continue;
                }
                last_key_time = Instant::now();
                if app.search_mode {
                    match key.code {
                        KeyCode::Enter => {}
                        KeyCode::Esc => {}
                        KeyCode::Char(c) => {}
                        KeyCode::Backspace => {}
                        KeyCode::Delete => {}
                        _ => {}
                    }
                } else {
                    match key.code {
                        // quit app
                        KeyCode::Char('q') => app.quit = true,
                        KeyCode::Esc => {
                            app.focus = AreaFocusEnum::LeftMenu;
                        }
                        KeyCode::Char('/') => {
                            app.search_mode = true;
                            app.focus = AreaFocusEnum::Search;
                        }
                        KeyCode::Char('r') => {}
                        // ================== Number keys switch tab pages start ==================
                        KeyCode::Char('1') => {
                            if !matches!(app.focus, AreaFocusEnum::LeftMenu) {
                                app.current_content_tab = 0;
                            }
                        }
                        KeyCode::Char('2') => {
                            if !matches!(app.focus, AreaFocusEnum::LeftMenu) {
                                app.current_content_tab = 1;
                            }
                        }
                        KeyCode::Char('3') => {
                            if !matches!(app.focus, AreaFocusEnum::LeftMenu) {
                                app.current_content_tab = 2;
                            }
                        }
                        KeyCode::Char('4') => {
                            if !matches!(app.focus, AreaFocusEnum::LeftMenu) {
                                app.current_content_tab = 3;
                            }
                        }
                        // ================== Number keys switch tab pages end ==================
                        // ============ Switch the right content area subframe start ============
                        KeyCode::Tab => match app.focus {
                            AreaFocusEnum::LeftMenu => {}
                            AreaFocusEnum::ContentArea(area_index) => {
                                let max_area = match app.current_menu_item {
                                    NetworkEnum::Ethereum => 3,
                                    NetworkEnum::Solana => 5,
                                    NetworkEnum::Bsc => 4,
                                    _ => 2,
                                };
                                if area_index < max_area {
                                    app.focus = AreaFocusEnum::ContentArea(area_index + 1);
                                } else {
                                    app.focus = AreaFocusEnum::ContentArea(0);
                                }
                            }
                            _ => {
                                app.focus = AreaFocusEnum::ContentArea(0);
                            }
                        },
                        // ============ Switch the right content area subframe end ============
                        KeyCode::Down => match app.focus {
                            AreaFocusEnum::LeftMenu => {
                                app.next_menu();
                            }
                            AreaFocusEnum::ContentArea(area_index) => {
                                app.next_content_item(area_index);
                            }
                            _ => {}
                        },
                        KeyCode::Up => match app.focus {
                            AreaFocusEnum::LeftMenu => {
                                app.previous_menu();
                            }
                            AreaFocusEnum::ContentArea(area_index) => {
                                app.previous_content_item(area_index);
                            }
                            _ => {}
                        },
                        KeyCode::Right => match app.focus {
                            AreaFocusEnum::LeftMenu => {
                                app.previous_menu();
                            }
                            AreaFocusEnum::ContentArea(area_index) => {
                                app.previous_content_item(area_index);
                            }
                            _ => {}
                        },
                        KeyCode::Left => match app.focus {
                            AreaFocusEnum::LeftMenu => {
                                app.previous_menu();
                            }
                            AreaFocusEnum::ContentArea(area_index) => {
                                app.previous_content_item(area_index);
                            }
                            _ => {}
                        },
                        KeyCode::Enter => match app.focus {
                            AreaFocusEnum::LeftMenu => {
                                app.focus = AreaFocusEnum::ContentArea(0);
                            }
                            AreaFocusEnum::ContentArea(area_index) => {
                                app.handle_content_enter(area_index);
                            }
                            _ => {}
                        },
                        _ => {}
                    }
                }
            }
        }
        if app.last_update.elapsed() >= tick_rate {
            app.last_update = Instant::now();
        }
        if app.quit {
            return Ok(());
        }
    }
}
