/**
 * File system event listeners for Nexus Overseer
 * Handles file watch events from Tauri backend
 */

import { listen } from '@tauri-apps/api/event';
import type { FileWatchEvent } from '../types/filesystem';

/**
 * Event handler type for file watch events
 */
export type FileWatchEventHandler = (event: FileWatchEvent) => void;

/**
 * Set up file watch event listeners
 * 
 * @param handlers - Object with event handlers for each event type
 * @returns Cleanup function to remove all listeners
 */
export async function setupFileWatchListeners(handlers: {
  onCreated?: FileWatchEventHandler;
  onModified?: FileWatchEventHandler;
  onDeleted?: FileWatchEventHandler;
  onRenamed?: FileWatchEventHandler;
}): Promise<() => void> {
  const unlistenFunctions: (() => void)[] = [];

  // Listen for file created events
  if (handlers.onCreated) {
    const unlisten = await listen<any>(
      'file-created',
      (event) => {
        const payload = event.payload as any;
        // Handle enum serialization: {"Created": "path"} or {"type": "Created", "path": "..."}
        let path = '';
        if (payload.Created) {
          path = payload.Created;
        } else if (payload.path) {
          path = payload.path;
        } else if (typeof payload === 'string') {
          path = payload;
        }
        
        handlers.onCreated?.({
          type: 'created',
          path,
        });
      }
    );
    unlistenFunctions.push(unlisten);
  }

  // Listen for file modified events
  if (handlers.onModified) {
    const unlisten = await listen<any>(
      'file-modified',
      (event) => {
        const payload = event.payload as any;
        // Handle enum serialization: {"Modified": "path"} or {"type": "Modified", "path": "..."}
        let path = '';
        if (payload.Modified) {
          path = payload.Modified;
        } else if (payload.path) {
          path = payload.path;
        } else if (typeof payload === 'string') {
          path = payload;
        }
        
        handlers.onModified?.({
          type: 'modified',
          path,
        });
      }
    );
    unlistenFunctions.push(unlisten);
  }

  // Listen for file deleted events
  if (handlers.onDeleted) {
    const unlisten = await listen<any>(
      'file-deleted',
      (event) => {
        const payload = event.payload as any;
        // Handle enum serialization: {"Deleted": "path"} or {"type": "Deleted", "path": "..."}
        let path = '';
        if (payload.Deleted) {
          path = payload.Deleted;
        } else if (payload.path) {
          path = payload.path;
        } else if (typeof payload === 'string') {
          path = payload;
        }
        
        handlers.onDeleted?.({
          type: 'deleted',
          path,
        });
      }
    );
    unlistenFunctions.push(unlisten);
  }

  // Listen for file renamed events
  if (handlers.onRenamed) {
    const unlisten = await listen<any>(
      'file-renamed',
      (event) => {
        const payload = event.payload as any;
        // Handle enum serialization: {"Renamed": {"old": "...", "new": "..."}} or {"old": "...", "new": "..."}
        let oldPath = '';
        let newPath = '';
        if (payload.Renamed) {
          oldPath = payload.Renamed.old || '';
          newPath = payload.Renamed.new || '';
        } else if (payload.old && payload.new) {
          oldPath = payload.old;
          newPath = payload.new;
        }
        
        handlers.onRenamed?.({
          type: 'renamed',
          old: oldPath,
          new: newPath,
        });
      }
    );
    unlistenFunctions.push(unlisten);
  }

  // Return cleanup function
  return () => {
    unlistenFunctions.forEach((unlisten) => unlisten());
  };
}

