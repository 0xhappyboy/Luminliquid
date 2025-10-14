use ratatui::widgets::ListState;

use crate::global::{SUPPORT_CEX_LIST, SUPPORT_DEX_LIST, SUPPORT_NETWORK_LIST};

// main menu
#[derive(Debug, Clone, PartialEq)]
pub enum MainMenuItem {
    Network,
    Dex,
    Cex,
    Wallets,
}

impl MainMenuItem {
    pub fn as_str(&self) -> &'static str {
        match self {
            MainMenuItem::Dex => "📊 Dex",
            MainMenuItem::Cex => "📦 Cex",
            MainMenuItem::Network => "🌐 Network",
            MainMenuItem::Wallets => "👛 Wallets",
        }
    }
    pub fn all() -> Vec<MainMenuItem> {
        vec![
            MainMenuItem::Network,
            MainMenuItem::Dex,
            MainMenuItem::Cex,
            MainMenuItem::Wallets,
        ]
    }
}

// sub menu
#[derive(Debug, Clone, PartialEq)]
pub struct SubMenuItem {
    pub name: String,
}

impl SubMenuItem {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
        }
    }
}

// menu focus area
#[derive(Debug, Clone, PartialEq)]
pub enum MenuFocusArea {
    MainMenu,       // main menu
    SubMenu(usize), // sub menu
}

// menu item
#[derive(Debug, Clone)]
pub struct MenuItem {
    pub main: MainMenuItem,
    pub sub_items: Vec<SubMenuItem>,
    pub expanded: bool,
    pub sub_menu_state: ListState, // sub menu state
}

impl MenuItem {
    pub fn new(main: MainMenuItem, sub_items: Vec<SubMenuItem>) -> Self {
        let mut sub_menu_state = ListState::default();
        sub_menu_state.select(Some(0));
        Self {
            main,
            sub_items,
            expanded: false,
            sub_menu_state,
        }
    }
    pub fn next_sub_menu(&mut self) {
        let item_count = self.sub_items.len();
        if item_count == 0 {
            return;
        }

        let i = match self.sub_menu_state.selected() {
            Some(i) => {
                if i >= item_count - 1 {
                    0
                } else {
                    i + 1
                }
            }
            None => 0,
        };
        self.sub_menu_state.select(Some(i));
    }
    pub fn previous_sub_menu(&mut self) {
        let item_count = self.sub_items.len();
        if item_count == 0 {
            return;
        }
        let i = match self.sub_menu_state.selected() {
            Some(i) => {
                if i == 0 {
                    item_count - 1
                } else {
                    i - 1
                }
            }
            None => 0,
        };
        self.sub_menu_state.select(Some(i));
    }
    pub fn current_sub_menu(&self) -> Option<&SubMenuItem> {
        self.sub_menu_state
            .selected()
            .and_then(|index| self.sub_items.get(index))
    }
}

#[derive(Debug, Clone)]
pub struct Menu {
    // menu item list
    pub menu_items: Vec<MenuItem>,
    pub current_main_menu: MainMenuItem,
    // main menu selection status
    pub main_menu_selection: ListState,
    pub focus: MenuFocusArea,
}

impl Menu {
    pub fn new() -> Self {
        let menu_items = vec![
            MenuItem::new(
                MainMenuItem::Network,
                SUPPORT_NETWORK_LIST
                    .iter()
                    .map(|net| SubMenuItem::new(net.name))
                    .collect(),
            ),
            MenuItem::new(
                MainMenuItem::Dex,
                SUPPORT_DEX_LIST
                    .iter()
                    .map(|dex| SubMenuItem::new(dex))
                    .collect(),
            ),
            MenuItem::new(
                MainMenuItem::Cex,
                SUPPORT_CEX_LIST
                    .iter()
                    .map(|cex| SubMenuItem::new(cex))
                    .collect(),
            ),
            MenuItem::new(
                MainMenuItem::Wallets,
                vec![
                    SubMenuItem::new("Info"),
                    SubMenuItem::new("Analysis"),
                    SubMenuItem::new("Risk Manage"),
                ],
            ),
        ];
        let mut main_menu_selection = ListState::default();
        main_menu_selection.select(Some(0));
        Self {
            menu_items,
            current_main_menu: MainMenuItem::Network,
            main_menu_selection,
            focus: MenuFocusArea::MainMenu,
        }
    }
}
