use ratatui::widgets::{ListState, TableState};
use std::time::Instant;

use crate::{
    i18n::I18N,
    pages::ethereum::{EthereumPageData, EthereumPageTabEnum},
    widgets::{
        market_table::TokenData,
        menu::{MainMenuItemTypeEnum, Menu, MenuFocusArea, SubMenuTypeEnum},
    },
};

// focus area enum
#[derive(Debug, Clone, PartialEq)]
pub enum AreaFocusEnum {
    LeftMenu,
    ContentArea(usize),
    Search,
    None,
}

pub struct App {
    // left menu
    pub menu: Menu,
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
            menu: Menu::new(),
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
    // get current main menu index
    fn get_current_main_menu_index(&self) -> Option<usize> {
        self.menu.main_menu_selection.selected()
    }
    // next main menu
    pub fn next_main_menu(&mut self) {
        let i = match self.menu.main_menu_selection.selected() {
            Some(i) => {
                if i >= self.menu.menu_items.len() - 1 {
                    0
                } else {
                    i + 1
                }
            }
            None => 0,
        };
        self.menu.main_menu_selection.select(Some(i));

        if let Some(menu) = self.menu.menu_items.get(i) {
            self.menu.current_main_menu = menu.main.clone();
        }
    }
    // previous main menu
    pub fn previous_main_menu(&mut self) {
        let i = match self.menu.main_menu_selection.selected() {
            Some(i) => {
                if i == 0 {
                    self.menu.menu_items.len() - 1
                } else {
                    i - 1
                }
            }
            None => 0,
        };
        self.menu.main_menu_selection.select(Some(i));
        if let Some(menu) = self.menu.menu_items.get(i) {
            self.menu.current_main_menu = menu.main.clone();
        }
    }
    // next sub menu
    pub fn next_sub_menu(&mut self) {
        if let MenuFocusArea::SubMenu(main_index) = self.menu.focus {
            if let Some(menu) = self.menu.menu_items.get_mut(main_index) {
                menu.next_sub_menu();
            }
        }
    }
    // previous sub menu
    pub fn previous_sub_menu(&mut self) {
        if let MenuFocusArea::SubMenu(main_index) = self.menu.focus {
            if let Some(menu) = self.menu.menu_items.get_mut(main_index) {
                menu.previous_sub_menu();
            }
        }
    }
    // expand menu
    pub fn expand_menu(&mut self) {
        if let Some(main_index) = self.get_current_main_menu_index() {
            if let Some(menu) = self.menu.menu_items.get_mut(main_index) {
                menu.expanded = true;
                self.menu.focus = MenuFocusArea::SubMenu(main_index);
            }
        }
    }
    // collapse menu
    pub fn collapse_menu(&mut self) {
        if let MenuFocusArea::SubMenu(main_index) = self.menu.focus {
            if let Some(menu) = self.menu.menu_items.get_mut(main_index) {
                menu.expanded = false;
                self.menu.focus = MenuFocusArea::MainMenu;
            }
        } else if let MenuFocusArea::MainMenu = self.menu.focus {
            self.previous_main_menu();
        }
    }
    // handle sub menu selection
    pub fn handle_sub_menu_selection(&mut self) {
        if let MenuFocusArea::SubMenu(index) = self.menu.focus {
            self.focus = AreaFocusEnum::ContentArea(0);
            if let Some(menu) = self.menu.menu_items.get(index) {
                if let Some(sub_index) = menu.sub_menu_state.selected() {
                    if let Some(sub_item) = menu.sub_items.get(sub_index) {
                        let _main_menu_name = menu.main.as_str();
                        let _sub_menu_name = &sub_item.name;
                        match (&menu.main, sub_index) {
                            // =================== network ===================
                            (MainMenuItemTypeEnum::Network, 0) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Ethereum;
                            }
                            (MainMenuItemTypeEnum::Network, 1) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Solana;
                            }
                            (MainMenuItemTypeEnum::Network, 2) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Bsc;
                            }
                            (MainMenuItemTypeEnum::Network, 3) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Base;
                            }
                            (MainMenuItemTypeEnum::Network, 4) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Aptos;
                            }
                            (MainMenuItemTypeEnum::Network, 5) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Sui;
                            }
                            (MainMenuItemTypeEnum::Network, 6) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::HyperEvm;
                            }
                            // =================== Dex ===================
                            (MainMenuItemTypeEnum::Dex, 0) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Uniswap;
                            }
                            (MainMenuItemTypeEnum::Dex, 1) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Pancakeswap;
                            }
                            (MainMenuItemTypeEnum::Dex, 2) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Raydium;
                            }
                            (MainMenuItemTypeEnum::Dex, 3) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Orca;
                            }
                            // =================== Cex ===================
                            (MainMenuItemTypeEnum::Cex, 0) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Binance;
                            }
                            (MainMenuItemTypeEnum::Cex, 1) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Coinbase;
                            }
                            (MainMenuItemTypeEnum::Cex, 2) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Bybit;
                            }
                            (MainMenuItemTypeEnum::Cex, 3) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Bitget;
                            }
                            (MainMenuItemTypeEnum::Cex, 4) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Kraken;
                            }
                            (MainMenuItemTypeEnum::Cex, 5) => {
                                self.menu.current_menu_item = SubMenuTypeEnum::Okx;
                            }
                            _ => {}
                        }
                    }
                }
            }
        } else if let MenuFocusArea::MainMenu = self.menu.focus {
            self.expand_menu();
        }
    }
    pub fn next_content_item(&mut self, _area_index: usize) {}
    pub fn previous_content_item(&mut self, _area_index: usize) {}
    pub fn get_content_item_count(&self, _area_index: usize) -> usize {
        0
    }
    pub fn handle_content_enter(&mut self, _area_index: usize) {}
}
