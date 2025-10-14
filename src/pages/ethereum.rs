use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    symbols,
    widgets::{Block, Borders, Tabs},
};

use crate::app::{App, AreaFocusEnum};

pub enum EthereumTabEnum {
    Overview,
    Details,
    Charts,
    Tools,
}

pub struct EthereumPageUI;

impl EthereumPageUI {
    pub fn ui(frame: &mut ratatui::Frame, app: &mut App, area: Rect) {
        let right_chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Length(3), Constraint::Min(10)].as_ref())
            .split(area);
        let tab_titles = [
            EthereumTabEnum::Overview,
            EthereumTabEnum::Details,
            EthereumTabEnum::Charts,
            EthereumTabEnum::Tools,
        ]
        .iter()
        .map(|tab| match tab {
            EthereumTabEnum::Overview => format!("📊 Overview").to_string(),
            EthereumTabEnum::Details => "📋 Details".to_string(),
            EthereumTabEnum::Charts => "📈 Charts".to_string(),
            EthereumTabEnum::Tools => "🛠️ Tools".to_string(),
        })
        .collect::<Vec<_>>();
        let tabs = Tabs::new(tab_titles)
            .select(app.ethereum_page_current_tab_index)
            .block(
                Block::default()
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::Gray)),
            )
            .style(Style::default().fg(Color::White))
            .highlight_style(
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            )
            .divider(symbols::DOT);

        frame.render_widget(tabs, right_chunks[0]);
        frame.render_widget(
            Block::default()
                .borders(Borders::ALL)
                .title(" Ethereum 2 ")
                .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                    Style::default().fg(Color::Yellow)
                } else {
                    Style::default().fg(Color::Gray)
                }),
            right_chunks[1],
        );
    }
}

pub struct EthereumPageData {}
impl EthereumPageData {}
impl Default for EthereumPageData {
    fn default() -> Self {
        Self {}
    }
}
