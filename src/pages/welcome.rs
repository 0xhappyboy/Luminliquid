use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Style},
    widgets::{Block, Borders},
};

use crate::app::{App, AreaFocusEnum};

pub struct Welcome;

impl Welcome {
    pub fn read(f: &mut ratatui::Frame, app: &mut App, area: Rect) {}
}
