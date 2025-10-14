use ratatui::widgets::ListState;
use std::time::Instant;

use crate::{pages::ethereum::EthereumPageData, types::NetworkEnum};

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
    // ethereum page tab index
    pub ethereum_page_current_tab_index: usize,
    pub ethereum_page_data: EthereumPageData,
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
            ethereum_page_current_tab_index: 0,
            ethereum_page_data: EthereumPageData::default(),
            solana_page_current_tab_index: 0,
            bsc_page_current_tab_index: 0,
            base_page_current_tab_index: 0,
            aptos_page_current_tab_index: 0,
            sui_page_current_tab_index: 0,
            hyperevm_page_current_tab_index: 0,
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
