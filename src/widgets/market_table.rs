use ratatui::{
    Frame,
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Cell, Clear, Paragraph, Row, Table},
};

use crate::app::App;

// token data
#[derive(Clone)]
pub struct TokenData {
    name: String,
    symbol: String,
    current_price: f64,
    changes: Vec<f64>, // 5min, 10min, 30min, 1h, 8h, 12h
    volume: f64,
    market_cap: f64,
}

impl TokenData {
    pub fn new(name: &str, symbol: &str, price: f64) -> Self {
        // test change data
        let test_changes = vec![
            (rand::random::<f64>() - 0.5) * 0.1,  // 5m
            (rand::random::<f64>() - 0.5) * 0.15, // 10m
            (rand::random::<f64>() - 0.5) * 0.2,  // 30m
            (rand::random::<f64>() - 0.5) * 0.3,  // 1h
            (rand::random::<f64>() - 0.5) * 0.5,  // 8h
            (rand::random::<f64>() - 0.5) * 0.6,  // 12h
        ];
        Self {
            name: name.to_string(),
            symbol: symbol.to_string(),
            current_price: price,
            changes: test_changes,
            volume: price * 1000000.0 * rand::random::<f64>(),
            market_cap: price * 10000000.0 * rand::random::<f64>(),
        }
    }
    fn format_change(change: f64) -> String {
        let sign = if change >= 0.0 { "+" } else { "" };
        format!("{}{:.2}%", sign, change * 100.0)
    }
    fn get_change_style(change: f64) -> Style {
        if change >= 0.0 {
            Style::default().fg(Color::Green)
        } else {
            Style::default().fg(Color::Red)
        }
    }
}

/// market table widget
pub fn market_table(f: &mut Frame, app: &mut App, area: Rect) {
    // table head cell
    let head_cells = [
        "Token", "Price", "5m", "10m", "30m", "1h", "8h", "12h", "Volume",
    ]
    .iter()
    .map(|h| Cell::from(*h).style(Style::default().fg(Color::Yellow)));

    let header = Row::new(head_cells)
        .style(Style::default().bg(Color::DarkGray))
        .height(1);

    // table rows
    let rows: Vec<Row> = app
        .ethereum_page_tokens
        .iter()
        .map(|token| {
            // token symbol
            let name_cell = Cell::from(Line::from(vec![Span::styled(
                &token.symbol,
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            )]));
            let price_cell = Cell::from(format!("${:.2}", token.current_price));
            let change_cells: Vec<Cell> = token
                .changes
                .iter()
                .map(|&change| {
                    Cell::from(TokenData::format_change(change))
                        .style(TokenData::get_change_style(change))
                })
                .collect();
            // trade volume
            let volume_text = if token.volume >= 1_000_000_000.0 {
                format!("${:.1}B", token.volume / 1_000_000_000.0)
            } else if token.volume >= 1_000_000.0 {
                format!("${:.1}M", token.volume / 1_000_000.0)
            } else {
                format!("${:.0}", token.volume)
            };
            let volume_cell = Cell::from(volume_text);
            let mut cells = vec![name_cell, price_cell];
            cells.extend(change_cells);
            cells.push(volume_cell);
            Row::new(cells).height(1)
        })
        .collect();
    let total_columns = 9; // Token, Price, 5m, 10m, 30m, 1h, 8h, 12h, Volume
    let equal_width = area.width / total_columns;
    let table = Table::new(
        rows,
        [
            Constraint::Length(equal_width), // symbol
            Constraint::Length(equal_width), // price
            Constraint::Length(equal_width), // 5m
            Constraint::Length(equal_width), // 10m
            Constraint::Length(equal_width), // 30m
            Constraint::Length(equal_width), // 1h
            Constraint::Length(equal_width), // 8h
            Constraint::Length(equal_width), // 12h
            Constraint::Length(equal_width), // Volume
        ],
    )
    .header(header)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .title("Market Data (Press Enter for details, q to quit)"),
    )
    .highlight_style(
        Style::default()
            .bg(Color::DarkGray)
            .add_modifier(Modifier::BOLD),
    )
    .highlight_symbol(">> ");
    f.render_stateful_widget(table, area, &mut app.ethereum_page_table_state);
}

pub fn render_detail_popup(f: &mut Frame, app: &mut App) {
    let area = centered_rect(60, 50, f.size());
    if let Some(token) = &app.ethereum_page_selected_token {
        let popup_block = Block::default()
            .title("Token Details (Press Esc or q to close)")
            .borders(Borders::ALL)
            .style(Style::default().bg(Color::Black));
        f.render_widget(Clear, area);
        f.render_widget(popup_block, area);
        let inner_area = area.inner(&ratatui::layout::Margin {
            vertical: 2,
            horizontal: 2,
        });
        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints(
                [
                    Constraint::Length(3),
                    Constraint::Length(3),
                    Constraint::Length(3),
                    Constraint::Length(3),
                    Constraint::Length(10),
                    Constraint::Min(0),
                ]
                .as_ref(),
            )
            .split(inner_area);
        // token name
        let name = Paragraph::new(format!("{} ({})", token.name, token.symbol)).style(
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        );
        f.render_widget(name, chunks[0]);
        // price
        let price = Paragraph::new(format!("Current Price: ${:.2}", token.current_price))
            .style(Style::default().fg(Color::Yellow));
        f.render_widget(price, chunks[1]);
        // market cap
        let market_cap = Paragraph::new(format!("Market Cap: ${:.0}", token.market_cap))
            .style(Style::default().fg(Color::White));
        f.render_widget(market_cap, chunks[2]);
        // trade volume
        let volume = Paragraph::new(format!("24h Volume: ${:.0}", token.volume))
            .style(Style::default().fg(Color::White));
        f.render_widget(volume, chunks[3]);
        // price change
        let change_labels = ["5m", "10m", "30m", "1h", "8h", "12h"];
        let change_details: Vec<Line> = token
            .changes
            .iter()
            .enumerate()
            .map(|(i, &change)| {
                Line::from(vec![
                    Span::raw(format!("{}: ", change_labels[i])),
                    Span::styled(
                        TokenData::format_change(change),
                        TokenData::get_change_style(change),
                    ),
                ])
            })
            .collect();
        let changes = Paragraph::new(change_details).block(
            Block::default()
                .title("Price Changes")
                .borders(Borders::ALL),
        );
        f.render_widget(changes, chunks[4]);
        // hint
        let hint = Paragraph::new("Press Esc or q to close")
            .style(Style::default().fg(Color::Gray))
            .alignment(ratatui::layout::Alignment::Center);
        f.render_widget(hint, chunks[5]);
    }
}

fn centered_rect(percent_x: u16, percent_y: u16, r: Rect) -> Rect {
    let popup_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints(
            [
                Constraint::Percentage((100 - percent_y) / 2),
                Constraint::Percentage(percent_y),
                Constraint::Percentage((100 - percent_y) / 2),
            ]
            .as_ref(),
        )
        .split(r);
    Layout::default()
        .direction(Direction::Horizontal)
        .constraints(
            [
                Constraint::Percentage((100 - percent_x) / 2),
                Constraint::Percentage(percent_x),
                Constraint::Percentage((100 - percent_x) / 2),
            ]
            .as_ref(),
        )
        .split(popup_layout[1])[1]
}
