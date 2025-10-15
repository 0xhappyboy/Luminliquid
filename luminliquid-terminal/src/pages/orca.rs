use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Style},
    widgets::{Block, Borders},
};

use crate::app::{App, AreaFocusEnum};
pub struct OrcaPageUI;

impl OrcaPageUI {
    pub fn ui(frame: &mut ratatui::Frame, app: &mut App, area: Rect) {
        let right_chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Length(3), Constraint::Min(10)].as_ref())
            .split(area);
        frame.render_widget(
            Block::default()
                .borders(Borders::ALL)
                .title(" Orca Block 1 ")
                .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                    Style::default().fg(Color::Yellow)
                } else {
                    Style::default().fg(Color::Gray)
                }),
            right_chunks[0],
        );
        frame.render_widget(
            Block::default()
                .borders(Borders::ALL)
                .title(" Orca Block 2 ")
                .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                    Style::default().fg(Color::Yellow)
                } else {
                    Style::default().fg(Color::Gray)
                }),
            right_chunks[1],
        );
    }
}
