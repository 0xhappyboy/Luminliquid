use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    widgets::{Block, Borders, List, ListItem},
};

use crate::{
    app::App,
    pages::{
        aptos::AptosPageUI, base::BasePageUI, binance::BinancePageUI, bitget::BitgetPageUI, bsc::BscPageUI, bybit::BybitPageUI, coinbase::CoinbasePageUI, ethereum::EthereumPageUI, hyperevm::HyperEvmPageUI, kraken::KrakenPageUI, okx::OkxPageUI, solana::SolanaPageUI, sui::SuiPageUI
    },
    widgets::menu::{MenuFocusArea, SubMenuTypeEnum, },
};

#[derive(Debug, Clone, PartialEq)]
pub struct SubMenuItem {
    pub name: String,
    pub description: String,
}

impl SubMenuItem {
    pub fn new(name: &str, description: &str) -> Self {
        Self {
            name: name.to_string(),
            description: description.to_string(),
        }
    }
}

// main app ui
pub fn ui(f: &mut ratatui::Frame, app: &mut App) {
    let size = f.size();
    let main_layout = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(10), Constraint::Percentage(90)].as_ref())
        .split(size);
    // show left menu area
    show_menu(f, app, main_layout[0]);
    // right content area
    match app.menu.current_menu_item {
        // ========================== network ==========================
        SubMenuTypeEnum::Ethereum => EthereumPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Solana  => SolanaPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Bsc  => BscPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Base  => BasePageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Aptos  => AptosPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Sui  => SuiPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::HyperEvm => HyperEvmPageUI::ui(f, app, main_layout[1]),
        // ========================== dex ==========================
        SubMenuTypeEnum::Uniswap  => BasePageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Pancakeswap  => AptosPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Raydium  => SuiPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Orca => HyperEvmPageUI::ui(f, app, main_layout[1]),
        // ========================== cex ==========================
        SubMenuTypeEnum::Binance=> BinancePageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Coinbase=> CoinbasePageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Bybit=> BybitPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Bitget=> BitgetPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Kraken=> KrakenPageUI::ui(f, app, main_layout[1]),
        SubMenuTypeEnum::Okx=> OkxPageUI::ui(f, app, main_layout[1]),
        _=>{}
    }
    if app.search_mode {}
}

// show menu
fn show_menu(f: &mut ratatui::Frame, app: &mut App, area: Rect) {
    let menu_items: Vec<ListItem> = app.menu
        .menu_items
        .iter()
        .enumerate()
        .flat_map(|(index, menu_item)| {
            let mut items = Vec::new();
            let is_main_selected = app.menu.main_menu_selection.selected() == Some(index);
            let has_main_focus = matches!(app.menu.focus, MenuFocusArea::MainMenu) && is_main_selected;
            let main_style = if has_main_focus {
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD)
            } else if is_main_selected {
                Style::default().fg(Color::Green)
            } else {
                Style::default().fg(Color::White)
            };
            let main_text = if menu_item.expanded {
                format!("▼ {}", menu_item.main.as_str())
            } else {
                format!("▶ {}", menu_item.main.as_str())
            };
            items.push(ListItem::new(main_text).style(main_style));
            if menu_item.expanded {
                for (sub_index, sub_item) in menu_item.sub_items.iter().enumerate() {
                    let is_sub_selected = menu_item.sub_menu_state.selected() == Some(sub_index);
                    let has_sub_focus = matches!(app.menu.focus, MenuFocusArea::SubMenu(menu_idx) if menu_idx == index) && is_sub_selected;
                    
                    let sub_style = if has_sub_focus {
                        Style::default()
                            .fg(Color::Yellow)
                            .add_modifier(Modifier::BOLD)
                    } else if is_sub_selected {
                        Style::default().fg(Color::Green)
                    } else {
                        Style::default().fg(Color::Gray)
                    };
                    let sub_text = if has_sub_focus {
                        format!("  └─▶ {}", sub_item.name)
                    } else {
                        format!("  └── {}", sub_item.name)
                    };
                    items.push(ListItem::new(sub_text).style(sub_style));
                }
            }
            items
        })
        .collect();
    let menu_border_style = if matches!(
        app.menu.focus,
        MenuFocusArea::MainMenu | MenuFocusArea::SubMenu(_)
    ) {
        Style::default().fg(Color::Yellow)
    } else {
        Style::default().fg(Color::Gray)
    };
    let menu = List::new(menu_items)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(format!(""))
                .border_style(menu_border_style),
        )
        .highlight_style(
            Style::default()
                .fg(Color::Yellow)
                .add_modifier(Modifier::BOLD),
        )
        .highlight_symbol("");
    f.render_stateful_widget(menu, area, &mut app.menu.main_menu_selection);
}
