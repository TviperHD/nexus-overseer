/**
 * File system utility functions for Nexus Overseer
 * Provides async wrappers around Tauri IPC commands
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  DirectoryEntry,
  FileMetadata,
  FileReadResult,
  FileWriteRequest,
} from '../types/filesystem';

/**
 * Check if running in Tauri environment
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Get invoke function or throw error if not in Tauri environment
 */
async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauriEnvironment()) {
    throw new Error(
      'Tauri API is not available. Make sure you are running the app in a Tauri window, not in a browser.'
    );
  }
  return await invoke<T>(command, args);
}

/**
 * Read a file from the file system
 * 
 * @param path - The file path to read
 * @returns File content with metadata
 * @throws Error if file read fails
 */
export async function readFile(path: string): Promise<FileReadResult> {
  try {
    return await safeInvoke<FileReadResult>('read_file_command', { path });
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

/**
 * Write a file to the file system
 * 
 * @param request - File write request with path, content, and options
 * @throws Error if file write fails
 */
export async function writeFile(request: FileWriteRequest): Promise<void> {
  try {
    // Ensure all fields are present (Rust expects them)
    const fullRequest: FileWriteRequest = {
      path: request.path,
      content: request.content,
      createIfNotExists: request.createIfNotExists ?? false,
      backup: request.backup ?? false,
    };
    await safeInvoke('write_file_command', { request: fullRequest });
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

/**
 * Delete a file from the file system
 * 
 * @param path - The file path to delete
 * @throws Error if file deletion fails
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    await safeInvoke('delete_file_command', { path });
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Get file metadata
 * 
 * @param path - The file path
 * @returns File metadata
 * @throws Error if metadata retrieval fails
 */
export async function getFileMetadata(path: string): Promise<FileMetadata> {
  try {
    return await safeInvoke<FileMetadata>('get_file_metadata_command', { path });
  } catch (error) {
    throw new Error(`Failed to get file metadata: ${error}`);
  }
}

/**
 * List directory contents
 * 
 * @param path - The directory path
 * @returns Array of directory entries
 * @throws Error if directory listing fails
 */
export async function listDirectory(path: string): Promise<DirectoryEntry[]> {
  try {
    return await safeInvoke<DirectoryEntry[]>('list_directory_command', { path });
  } catch (error) {
    throw new Error(`Failed to list directory: ${error}`);
  }
}

/**
 * Create a directory
 * 
 * @param path - The directory path to create
 * @throws Error if directory creation fails
 */
export async function createDirectory(path: string): Promise<void> {
  try {
    await safeInvoke('create_directory_command', { path });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error}`);
  }
}

/**
 * Delete a directory (recursive)
 * 
 * @param path - The directory path to delete
 * @throws Error if directory deletion fails
 */
export async function deleteDirectory(path: string): Promise<void> {
  try {
    await safeInvoke('delete_directory_command', { path });
  } catch (error) {
    throw new Error(`Failed to delete directory: ${error}`);
  }
}

/**
 * Check if a path exists
 * 
 * @param path - The path to check
 * @returns True if path exists, false otherwise
 * @throws Error if check fails
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    return await safeInvoke<boolean>('file_exists_command', { path });
  } catch (error) {
    throw new Error(`Failed to check file existence: ${error}`);
  }
}

/**
 * Watch a file for changes
 * 
 * @param path - The file path to watch
 * @throws Error if watching fails
 */
export async function watchFile(path: string): Promise<void> {
  try {
    await safeInvoke('watch_file_command', { path });
  } catch (error) {
    throw new Error(`Failed to watch file: ${error}`);
  }
}

/**
 * Watch a directory for changes
 * 
 * @param path - The directory path to watch
 * @param recursive - Whether to watch recursively
 * @throws Error if watching fails
 */
export async function watchDirectory(
  path: string,
  recursive: boolean = false
): Promise<void> {
  try {
    await safeInvoke('watch_directory_command', { path, recursive });
  } catch (error) {
    throw new Error(`Failed to watch directory: ${error}`);
  }
}

/**
 * Stop watching a path
 * 
 * @param path - The path to stop watching
 * @throws Error if unwatching fails
 */
export async function unwatch(path: string): Promise<void> {
  try {
    await safeInvoke('unwatch_command', { path });
  } catch (error) {
    throw new Error(`Failed to unwatch: ${error}`);
  }
}

/**
 * Stop watching all paths
 * 
 * @throws Error if unwatching fails
 */
export async function unwatchAll(): Promise<void> {
  try {
    await safeInvoke('unwatch_all_command');
  } catch (error) {
    throw new Error(`Failed to unwatch all: ${error}`);
  }
}

/**
 * Request permission for a path
 * 
 * @param path - The path to request permission for
 * @returns True if permission granted, false otherwise
 * @throws Error if request fails
 */
export async function requestPathPermission(path: string): Promise<boolean> {
  try {
    return await safeInvoke<boolean>('request_path_permission', { path });
  } catch (error) {
    throw new Error(`Failed to request path permission: ${error}`);
  }
}

/**
 * Add an allowed path
 * 
 * @param path - The path to add to allowed list
 * @throws Error if adding fails
 */
export async function addAllowedPath(path: string): Promise<void> {
  try {
    await safeInvoke('add_allowed_path', { path });
  } catch (error) {
    throw new Error(`Failed to add allowed path: ${error}`);
  }
}

/**
 * Get all allowed paths
 * 
 * @returns Array of allowed paths
 * @throws Error if retrieval fails
 */
export async function getAllowedPaths(): Promise<string[]> {
  try {
    return await safeInvoke<string[]>('get_allowed_paths');
  } catch (error) {
    throw new Error(`Failed to get allowed paths: ${error}`);
  }
}

