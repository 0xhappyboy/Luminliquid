import { invoke } from '@tauri-apps/api/core';

const MINIMIZE_WINDOW = "minimize_window";
const MAXIMIZE_WINDOW = "maximize_window";
const RECOVERY_WINDOW = "recovery_window";
const DRAG_WINDOW = "drag_window";
const CLOSE_WINDOW = "close_window";
const MULTI_PANEL_WINDOW = "multi_panel_window";

export async function handleMinimizeWindow() {
    await invoke(MINIMIZE_WINDOW);
}

export async function handleMaximizeWindow() {
    await invoke(MAXIMIZE_WINDOW);
}

export async function handleRecoveryWindow() {
    await invoke(RECOVERY_WINDOW);
}

export async function handleCloseWindow() {
    await invoke(CLOSE_WINDOW);
}

export async function handleDragWindowMouseDown(event: React.MouseEvent<HTMLElement>) {
    await invoke(DRAG_WINDOW);
}

export async function handleMultiPanelWindow() {
    await invoke(MULTI_PANEL_WINDOW);
}
