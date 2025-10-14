use std::sync::{Arc, atomic::Ordering};

use tokio::sync::mpsc;

use crate::{global::APPLICETION_CLOSE_FLAG, types::BackgroundThreadData};

pub enum TaskType {
    Ethereum,
}

pub struct TaskController {
    registry: Vec<tokio::task::JoinHandle<()>>,
}

impl TaskController {
    pub fn new(tasks: Vec<tokio::task::JoinHandle<()>>) -> Self {
        let mut task_handls: Vec<tokio::task::JoinHandle<()>> = vec![];
        tasks.into_iter().for_each(|t| {
            task_handls.push(t);
        });
        return Self {
            registry: task_handls,
        };
    }
    /// push task
    pub fn push(&mut self, task: tokio::task::JoinHandle<()>) {
        self.registry.push(task);
    }
    /// get tx rx
    pub fn tx_rx() -> (
        mpsc::UnboundedSender<BackgroundThreadData>,
        mpsc::UnboundedReceiver<BackgroundThreadData>,
    ) {
        let (tx, mut rx): (
            mpsc::UnboundedSender<BackgroundThreadData>,
            mpsc::UnboundedReceiver<BackgroundThreadData>,
        ) = mpsc::unbounded_channel();
        return (tx, rx);
    }
    /// clear all task
    pub fn clear_all_task() {
        APPLICETION_CLOSE_FLAG.store(true, Ordering::SeqCst);
    }
}
