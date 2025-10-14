use ratatui::widgets::{ListState, TableState};
use std::time::Instant;

use crate::{
    i18n::I18N,
    pages::ethereum::{EthereumPageData, EthereumPageTabEnum},
    types::NetworkEnum,
    widgets::market_table::TokenData,
};

// focus area enum
#[derive(Debug, Clone, PartialEq)]
pub enum AreaFocusEnum {
    LeftMenu,
    ContentTabs,
    ContentArea(usize),
    Search,
    None,
}

pub struct App {
    pub left_menu_items: Vec<NetworkEnum>,
    pub left_menu_state: ListState,
    pub current_menu_item: NetworkEnum,
    pub current_content_tab: usize,
    // ethereum page parameters
    pub ethereum_page_current_tab: EthereumPageTabEnum,
    pub ethereum_page_data: EthereumPageData,
    pub ethereum_page_tokens: Vec<TokenData>,
    pub ethereum_page_table_state: TableState,
    pub ethereum_page_selected_token: Option<TokenData>,
    pub ethereum_page_market_table_show_detail: bool,
    // solana page tab index
    pub solana_page_current_tab_index: usize,
    // bsc page tab index
    pub bsc_page_current_tab_index: usize,
    // base page tab index
    pub base_page_current_tab_index: usize,
    // aptos page tab index
    pub aptos_page_current_tab_index: usize,
    // sui page tab index
    pub sui_page_current_tab_index: usize,
    // hyperevm page tab index
    pub hyperevm_page_current_tab_index: usize,
    pub focus: AreaFocusEnum,
    pub quit: bool,
    pub last_update: Instant,
    pub search_mode: bool,
    pub content_selection: Vec<ListState>,
    // system setting
    pub i18n: I18N,
}

impl App {
    pub fn new() -> Self {
        let menu_items = NetworkEnum::all_vec();
        let mut left_menu_state = ListState::default();
        left_menu_state.select(Some(0));
        let mut block_list_state = ListState::default();
        block_list_state.select(Some(0));
        let mut tx_list_state = ListState::default();
        tx_list_state.select(Some(0));
        let content_selection = vec![
            ListState::default(),
            ListState::default(),
            ListState::default(),
            ListState::default(),
            ListState::default(),
            ListState::default(),
        ];
        // tokens
        let tokens = vec![
            TokenData::new("Bitcoin", "BTC", 45000.0),
            TokenData::new("Ethereum", "ETH", 3000.0),
            TokenData::new("Binance Coin", "BNB", 350.0),
            TokenData::new("Cardano", "ADA", 1.2),
            TokenData::new("Solana", "SOL", 120.0),
            TokenData::new("Polkadot", "DOT", 25.0),
            TokenData::new("Dogecoin", "DOGE", 0.15),
            TokenData::new("Avalanche", "AVAX", 40.0),
        ];
        let mut table_state = TableState::default();
        table_state.select(Some(0));

        Self {
            left_menu_items: menu_items.clone(),
            left_menu_state,
            current_menu_item: menu_items[0].clone(),
            current_content_tab: 0,
            focus: AreaFocusEnum::LeftMenu,
            quit: false,
            last_update: Instant::now(),
            search_mode: false,
            content_selection,
            ethereum_page_current_tab: EthereumPageTabEnum::Status,
            ethereum_page_data: EthereumPageData::default(),
            ethereum_page_tokens: tokens,
            ethereum_page_table_state: table_state,
            ethereum_page_selected_token: None,
            ethereum_page_market_table_show_detail: false,
            solana_page_current_tab_index: 0,
            bsc_page_current_tab_index: 0,
            base_page_current_tab_index: 0,
            aptos_page_current_tab_index: 0,
            sui_page_current_tab_index: 0,
            hyperevm_page_current_tab_index: 0,
            i18n: I18N::EN,
        }
    }
    pub fn next_menu(&mut self) {
        let i = match self.left_menu_state.selected() {
            Some(i) => {
                if i >= self.left_menu_items.len() - 1 {
                    0
                } else {
                    i + 1
                }
            }
            None => 0,
        };
        self.left_menu_state.select(Some(i));
        self.current_menu_item = self.left_menu_items[i].clone();
    }
    pub fn previous_menu(&mut self) {
        let i = match self.left_menu_state.selected() {
            Some(i) => {
                if i == 0 {
                    self.left_menu_items.len() - 1
                } else {
                    i - 1
                }
            }
            None => 0,
        };
        self.left_menu_state.select(Some(i));
        self.current_menu_item = self.left_menu_items[i].clone();
    }
    pub fn next_content_item(&mut self, area_index: usize) {}
    pub fn previous_content_item(&mut self, area_index: usize) {}
    pub fn get_content_item_count(&self, area_index: usize) -> usize {
        0
    }
    pub fn handle_content_enter(&mut self, area_index: usize) {}
}
