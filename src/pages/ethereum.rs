use std::rc::Rc;

use ratatui::{
    Frame,
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    symbols,
    text::{Line, Span, Text},
    widgets::{Block, Borders, Cell, List, ListItem, Paragraph, Row, Tabs},
};

use crate::{
    app::{App, AreaFocusEnum},
    i18n::I18N,
    widgets::market_table::{market_table, render_detail_popup},
};

pub enum EthereumPageTabEnum {
    Status,
    Market,
    Scan,
    Charts,
    Tools,
}

pub struct EthereumPageUI;

impl EthereumPageUI {
    pub fn ui(frame: &mut ratatui::Frame, app: &mut App, area: Rect) {
        let ethereum_page = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Length(3), Constraint::Min(10)].as_ref())
            .split(area);
        EthereumPageUI::tabs(frame, app, ethereum_page[0]);
        match app.ethereum_page_current_tab {
            EthereumPageTabEnum::Status => {
                EthereumPageUI::network_status(frame, app, ethereum_page[1])
            }
            EthereumPageTabEnum::Market => EthereumPageUI::market(frame, app, ethereum_page[1]),
            EthereumPageTabEnum::Scan => EthereumPageUI::content2(frame, app, ethereum_page[1]),
            EthereumPageTabEnum::Charts => EthereumPageUI::content2(frame, app, ethereum_page[1]),
            EthereumPageTabEnum::Tools => EthereumPageUI::content2(frame, app, ethereum_page[1]),
        }
    }
    pub fn tabs(frame: &mut ratatui::Frame, app: &mut App, ethereum_page: Rect) {
        let tab_titles = [
            EthereumPageTabEnum::Status,
            EthereumPageTabEnum::Market,
            EthereumPageTabEnum::Scan,
            EthereumPageTabEnum::Charts,
            EthereumPageTabEnum::Tools,
        ]
        .iter()
        .map(|tab| match tab {
            EthereumPageTabEnum::Status => format!("📊 Status").to_string(),
            EthereumPageTabEnum::Market => "📋 Market".to_string(),
            EthereumPageTabEnum::Scan => "📋 Scan".to_string(),
            EthereumPageTabEnum::Charts => "📈 Charts".to_string(),
            EthereumPageTabEnum::Tools => "🛠️ Tools".to_string(),
        })
        .collect::<Vec<_>>();
        let tabs = Tabs::new(tab_titles)
            .select(match app.ethereum_page_current_tab {
                EthereumPageTabEnum::Status => 0,
                EthereumPageTabEnum::Market => 1,
                EthereumPageTabEnum::Scan => 2,
                EthereumPageTabEnum::Charts => 3,
                EthereumPageTabEnum::Tools => 4,
            })
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
        frame.render_widget(tabs, ethereum_page);
    }

    pub fn content2(frame: &mut ratatui::Frame, app: &mut App, ethereum_page: Rect) {
        frame.render_widget(
            Block::default()
                .borders(Borders::ALL)
                .title(" Ethereum ")
                .border_style(if app.focus == AreaFocusEnum::ContentArea(0) {
                    Style::default().fg(Color::Yellow)
                } else {
                    Style::default().fg(Color::Gray)
                }),
            ethereum_page,
        );
    }
    /// network status widget
    pub fn network_status(frame: &mut ratatui::Frame, app: &mut App, ethereum_page: Rect) {
        // main layout
        // let main_layout = Layout::default()
        //     .direction(Direction::Vertical)
        //     .constraints([Constraint::Percentage(10), Constraint::Percentage(90)])
        //     .split(ethereum_page);

        let main_layout = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Length(3), Constraint::Min(0)])
            .split(ethereum_page);
        // test data
        let stats_spans = vec![
            // ETHER PRICE
            Span::styled(
                "ETHER ",
                Style::default()
                    .fg(Color::Gray)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "$4,009 ",
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled("+3.93% ", Style::default().fg(Color::Green)),
            Span::styled("  ", Style::default()),
            // MARKET CAP
            Span::styled(
                "MARKET ",
                Style::default()
                    .fg(Color::Gray)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "$483.9B ",
                Style::default()
                    .fg(Color::Blue)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled("  ", Style::default()),
            // TRANSACTIONS
            Span::styled(
                "TX ",
                Style::default()
                    .fg(Color::Gray)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "3,039M ",
                Style::default()
                    .fg(Color::Green)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled("15.7TPS ", Style::default().fg(Color::DarkGray)),
            Span::styled("  ", Style::default()),
            // GAS PRICE
            Span::styled(
                "GAS ",
                Style::default()
                    .fg(Color::Gray)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "1.3Gwei ",
                Style::default()
                    .fg(Color::Magenta)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled("$0.11 ", Style::default().fg(Color::DarkGray)),
            Span::styled("  ", Style::default()),
            // TX HISTORY
            Span::styled(
                "TX14D ",
                Style::default()
                    .fg(Color::Gray)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "1,950K ",
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled("  ", Style::default()),
            // BLOCK
            Span::styled(
                "BLOCK ",
                Style::default()
                    .fg(Color::Gray)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                "23,574K ",
                Style::default().fg(Color::Red).add_modifier(Modifier::BOLD),
            ),
        ];
        // test block data
        let block_data: Vec<(u64, &str, u32, &str, &str, u64)> = vec![
            (
                23574290,
                "18 secs ago",
                187,
                "12.5 ETH",
                "0x1a2b...3c4d",
                3421,
            ),
            (
                23574289,
                "25 secs ago",
                156,
                "8.2 ETH",
                "0x5e6f...7g8h",
                2987,
            ),
            (
                23574288,
                "37 secs ago",
                203,
                "15.7 ETH",
                "0x9i0j...1k2l",
                4123,
            ),
            (
                23574287,
                "49 secs ago",
                134,
                "3.1 ETH",
                "0x3m4n...5o6p",
                2678,
            ),
            (
                23574286,
                "1 min ago",
                178,
                "22.4 ETH",
                "0x7q8r...9s0t",
                3890,
            ),
            (23574285, "1 min ago", 145, "6.8 ETH", "0x1u2v...3w4x", 3124),
            (
                23574284,
                "2 mins ago",
                192,
                "18.3 ETH",
                "0x5y6z...7a8b",
                4012,
            ),
            (
                23574283,
                "2 mins ago",
                167,
                "11.2 ETH",
                "0x9c0d...1e2f",
                3543,
            ),
            (
                23574282,
                "3 mins ago",
                123,
                "7.9 ETH",
                "0x3g4h...5i6j",
                2891,
            ),
            (
                23574281,
                "3 mins ago",
                189,
                "14.6 ETH",
                "0x7k8l...9m0n",
                3987,
            ),
        ];
        // test transaction data
        let test_t = I18N::get(app.i18n.clone(), "success");
        let test_t2 = I18N::get(app.i18n.clone(), "awaid-confirme");
        let test_t3 = I18N::get(app.i18n.clone(), "fail");
        let transaction_data: Vec<(&str, &str, &str, &str, &str, u64)> = vec![
            (
                "0xa1b2...c3d4",
                "12.5 ETH",
                &test_t,
                "Uniswap V3",
                "0xe5f6...g7h8",
                342100,
            ),
            (
                "0xi9j0...k1l2",
                "8.2 ETH",
                &test_t,
                "OpenSea",
                "0xm3n4...o5p6",
                298700,
            ),
            (
                "0xq7r8...s9t0",
                "15.7 ETH",
                &test_t2,
                "Compound",
                "0xu1v2...w3x4",
                412300,
            ),
            (
                "0xy5z6...a7b8",
                "3.1 ETH",
                &test_t,
                "Aave",
                "0xc9d0...e1f2",
                267800,
            ),
            (
                "0xg3h4...i5j6",
                "22.4 ETH",
                &test_t3,
                "1inch",
                "0xk7l8...m9n0",
                389000,
            ),
            (
                "0xo1p2...q3r4",
                "6.8 ETH",
                &test_t,
                "SushiSwap",
                "0xs5t6...u7v8",
                312400,
            ),
            (
                "0xw9x0...y1z2",
                "18.3 ETH",
                &test_t,
                "Curve",
                "0xa3b4...c5d6",
                401200,
            ),
            (
                "0xe7f8...g9h0",
                "11.2 ETH",
                &test_t2,
                "MakerDAO",
                "0xi1j2...k3l4",
                354300,
            ),
            (
                "0xm5n6...o7p8",
                "7.9 ETH",
                &test_t,
                "Balancer",
                "0xq9r0...s1t2",
                289100,
            ),
            (
                "0xu3v4...w5x6",
                "14.6 ETH",
                &test_t,
                "Yearn",
                "0xy7z8...a9b0",
                398700,
            ),
        ];
        let stats_line = Line::from(stats_spans);
        let stats_block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Gray));
        let stats_paragraph = Paragraph::new(stats_line)
            .block(stats_block)
            .alignment(Alignment::Center);
        frame.render_widget(stats_paragraph, main_layout[0]);
        // bottom area
        let bottom_layout = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(50), Constraint::Percentage(50)])
            .split(main_layout[1]);
        // block info
        let block_items: Vec<ListItem> = block_data
            .iter()
            .map(|(block_num, time, tx_count, reward, validator, gas_used)| {
                let content = Text::from(vec![
                    Line::from(vec![
                        Span::styled("🟢 ", Style::default().fg(Color::Green)),
                        Span::styled(
                            format!("Block #{}", block_num),
                            Style::default()
                                .fg(Color::White)
                                .add_modifier(Modifier::BOLD),
                        ),
                        Span::styled(" • ", Style::default().fg(Color::DarkGray)),
                        Span::styled(
                            format!("{} TX", tx_count),
                            Style::default().fg(Color::Yellow),
                        ),
                    ]),
                    Line::from(vec![
                        Span::styled("   ", Style::default()),
                        Span::styled(*time, Style::default().fg(Color::DarkGray)),
                        Span::styled(" • Gas: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(format!("{}", gas_used), Style::default().fg(Color::Cyan)),
                        Span::styled(" • Reward: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(*reward, Style::default().fg(Color::Green)),
                    ]),
                    Line::from(vec![
                        Span::styled("   Validator: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(*validator, Style::default().fg(Color::Blue)),
                    ]),
                ]);
                ListItem::new(content)
            })
            .collect();
        let blocks_list = List::new(block_items)
            .block(
                Block::default()
                    .title("📦 Latest Blocks • 10 Blocks")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::Blue)),
            )
            .style(Style::default().bg(Color::Black))
            .highlight_style(
                Style::default()
                    .bg(Color::DarkGray)
                    .add_modifier(Modifier::BOLD),
            );
        // trade list
        let trade_list: Vec<ListItem> = transaction_data
            .iter()
            .map(|(hash, value, status, protocol, from, gas)| {
                let test_t = I18N::get(app.i18n.clone(), "success");
                let test_t2 = I18N::get(app.i18n.clone(), "awaid-confirme");
                let test_t3 = I18N::get(app.i18n.clone(), "fail");
                let status_color = match *status {
                    test_t => Color::Green,
                    test_t2 => Color::Yellow,
                    test_t3 => Color::Red,
                    _ => Color::Gray,
                };
                let status_icon = match *status {
                    test_t => "✅",
                    test_t2 => "⏳",
                    test_t3 => "❌",
                    _ => "●",
                };
                let content = Text::from(vec![
                    Line::from(vec![
                        Span::styled(status_icon, Style::default().fg(status_color)),
                        Span::styled(" ", Style::default()),
                        Span::styled(*hash, Style::default().fg(Color::Cyan)),
                        Span::styled(" • ", Style::default().fg(Color::DarkGray)),
                        Span::styled(
                            *value,
                            Style::default()
                                .fg(Color::White)
                                .add_modifier(Modifier::BOLD),
                        ),
                    ]),
                    Line::from(vec![
                        Span::styled("   Protocol: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(*protocol, Style::default().fg(Color::Yellow)),
                        Span::styled(" • Gas: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(format!("{}", gas), Style::default().fg(Color::Magenta)),
                    ]),
                    Line::from(vec![
                        Span::styled("   From: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(*from, Style::default().fg(Color::Blue)),
                        Span::styled(" • Status: ", Style::default().fg(Color::DarkGray)),
                        Span::styled(
                            *status,
                            Style::default()
                                .fg(status_color)
                                .add_modifier(Modifier::BOLD),
                        ),
                    ]),
                ]);
                ListItem::new(content)
            })
            .collect();
        let trade_widget_list = List::new(trade_list)
            .block(
                Block::default()
                    .title("💸 Latest Transactions • 10 TXs")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::Magenta)),
            )
            .style(Style::default().bg(Color::Black))
            .highlight_style(
                Style::default()
                    .bg(Color::DarkGray)
                    .add_modifier(Modifier::BOLD),
            );
        frame.render_widget(blocks_list, bottom_layout[0]);
        frame.render_widget(trade_widget_list, bottom_layout[1]);
    }

    /// market widget
    pub fn market(frame: &mut ratatui::Frame, app: &mut App, ethereum_page: Rect) {
        // market table
        market_table(frame, app, ethereum_page);
        // popup
        if app.ethereum_page_market_table_show_detail {
            render_detail_popup(frame, app);
        }
    }
}

pub struct EthereumPageData {}
impl EthereumPageData {}
impl Default for EthereumPageData {
    fn default() -> Self {
        Self {}
    }
}
