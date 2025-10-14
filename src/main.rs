pub mod app;
pub mod events;
pub mod global;
pub mod index;
pub mod pages;
pub mod task;
pub mod types;

use std::{io, sync::atomic::Ordering};

use crossterm::{
    event::{DisableMouseCapture, EnableMouseCapture},
    execute,
    terminal::{EnterAlternateScreen, LeaveAlternateScreen, disable_raw_mode, enable_raw_mode},
};
use ratatui::{Terminal, backend::CrosstermBackend};
use tokio::sync::mpsc::UnboundedSender;

use crate::{
    app::App, events::event_poll, global::APPLICETION_CLOSE_FLAG, task::TaskController,
    types::BackgroundThreadData,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;
    // backgroun thread
    let (t, r) = TaskController::tx_rx();
    let tc = TaskController::new(vec![]);
    // register task
    register_task(tc, t);
    let app = App::new();
    let res = event_poll(r, &mut terminal, app);
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;
    if let Err(err) = res {
        println!("run app error{:?}", err);
    }
    Ok(())
}

/// register task
fn register_task(mut taskcontroller: TaskController, tx: UnboundedSender<BackgroundThreadData>) {
    taskcontroller.push(tokio::spawn(async move {
        // task...
        loop {
            if APPLICETION_CLOSE_FLAG.load(Ordering::SeqCst) {
                break;
            }
        }
    }));
}
