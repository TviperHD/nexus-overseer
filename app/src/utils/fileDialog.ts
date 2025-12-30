/**
 * File dialog utilities for opening and saving files
 * Uses Tauri's file dialog API
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * Check if running in Tauri environment
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Open a file dialog to select a file
 * @param options - Dialog options
 * @returns Selected file path or null if cancelled
 */
export async function openFileDialog(options?: {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
  multiple?: boolean;
}): Promise<string | string[] | null> {
  if (!isTauriEnvironment()) {
    console.warn('File dialog is only available in Tauri environment');
    return null;
  }

  try {
    // For Tauri v2, we can use the dialog plugin or invoke a Rust command
    // Try using invoke first (if we have a custom command)
    // Otherwise, we'll need to install @tauri-apps/plugin-dialog
    const result = await invoke<string | string[] | null>('open_file_dialog', {
      title: options?.title || 'Open File',
      filters: options?.filters || [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'html', 'css'] },
        { name: 'Code Files', extensions: ['ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'java', 'cpp', 'c', 'h'] },
      ],
      defaultPath: options?.defaultPath,
      multiple: options?.multiple || false,
    });

    return result;
  } catch (error) {
    // If invoke fails, try using the dialog plugin (if installed)
    // For now, we'll return null and show a message
    console.warn('File dialog not available. Please install @tauri-apps/plugin-dialog or implement open_file_dialog command.');
    console.error('Failed to open file dialog:', error);
    return null;
  }
}

/**
 * Open a file dialog to save a file
 * @param options - Dialog options
 * @returns Selected file path or null if cancelled
 */
export async function saveFileDialog(options?: {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<string | null> {
  if (!isTauriEnvironment()) {
    console.warn('File dialog is only available in Tauri environment');
    return null;
  }

  try {
    // For Tauri v2, we can use the dialog plugin or invoke a Rust command
    const result = await invoke<string | null>('save_file_dialog', {
      title: options?.title || 'Save File',
      filters: options?.filters || [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'html', 'css'] },
      ],
      defaultPath: options?.defaultPath,
    });

    return result;
  } catch (error) {
    console.warn('File dialog not available. Please install @tauri-apps/plugin-dialog or implement save_file_dialog command.');
    console.error('Failed to open save file dialog:', error);
    return null;
  }
}

