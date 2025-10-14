use std::sync::Arc;

use tokio::sync::mpsc;

use crate::types::BackgroundThreadData;

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
    async fn clear_all_task(&mut self) {}
}
