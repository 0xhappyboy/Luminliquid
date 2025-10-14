use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Style},
    widgets::{Block, Borders},
};

use crate::app::{App, AreaFocusEnum};
pub struct Solana;

impl Solana {
    pub fn read(f: &mut ratatui::Frame, app: &mut App, area: Rect) {
        let right_chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Length(3), Constraint::Min(10)].as_ref())
            .split(area);

        f.render_widget(
            Block::default()
                .borders(Borders::ALL)
                .title(" Solana Block 1 ")
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
                .title(" Solana Block 2 ")
                .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                    Style::default().fg(Color::Yellow)
                } else {
                    Style::default().fg(Color::Gray)
                }),
            right_chunks[1],
        );
    }
}
