use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    widgets::{Block, Borders, List, ListItem},
};

use crate::app::{App, AreaFocusEnum};

// main app ui
pub fn ui(f: &mut ratatui::Frame, app: &mut App) {
    let size = f.size();
    let main_layout = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(10), Constraint::Percentage(90)].as_ref())
        .split(size);
    // left menu area
    render_left_menu_area(f, app, main_layout[0]);
    // right area
    render_right_area(f, app, main_layout[1]);
    if app.search_mode {}
}

// render left menu area
fn render_left_menu_area(f: &mut ratatui::Frame, app: &mut App, area: Rect) {
    let menu_items: Vec<ListItem> = app
        .left_menu_items
        .iter()
        .map(|item| {
            let style = if app.focus == AreaFocusEnum::LeftMenu
                && Some(
                    app.left_menu_items
                        .iter()
                        .position(|i| i == item)
                        .unwrap_or(0),
                ) == app.left_menu_state.selected()
            {
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD)
            } else if app.current_menu == *item {
                Style::default().fg(Color::Green)
            } else {
                Style::default().fg(Color::White)
            };

            ListItem::new(item.as_str()).style(style)
        })
        .collect();
    let menu_border_style = if app.focus == AreaFocusEnum::LeftMenu {
        Style::default().fg(Color::Yellow)
    } else {
        Style::default().fg(Color::Gray)
    };
    let menu = List::new(menu_items)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(" 🌎 Network ")
                .border_style(menu_border_style),
        )
        .highlight_style(
            Style::default()
                .fg(Color::Yellow)
                .add_modifier(Modifier::BOLD),
        )
        .highlight_symbol("▶ ");

    f.render_stateful_widget(menu, area, &mut app.left_menu_state);
}
/// reader right area
fn render_right_area(f: &mut ratatui::Frame, app: &mut App, area: Rect) {
    let right_chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(3), Constraint::Min(10)].as_ref())
        .split(area);

    f.render_widget(
        Block::default()
            .borders(Borders::ALL)
            .title(" Block 1 ")
            .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                Style::default().fg(Color::Yellow)
            } else {
                Style::default().fg(Color::Gray)
            }),
        right_chunks[0],
    );
    f.render_widget(
        Block::default()
            .borders(Borders::ALL)
            .title(" Block 2 ")
            .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                Style::default().fg(Color::Yellow)
            } else {
                Style::default().fg(Color::Gray)
            }),
        right_chunks[1],
    );
}
