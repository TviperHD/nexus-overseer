/**
 * File watcher integration for Monaco Editor
 * Handles external file changes and conflicts
 */

import { setupFileWatchListeners } from './fileSystemEvents';
import { useEditorStore } from '@/stores/editorStore';
import { useTabStore } from '@/stores/tabStore';
import { useToastStore } from '@/stores/toastStore';
import { readFile } from './fileSystem';
import { normalizePath } from './pathUtils';
import type { FileWatchEvent } from '@/types/filesystem';

/**
 * Conflict state for file watching
 */
interface FileConflict {
  filePath: string;
  fileName: string;
  editorContent: string;
  diskContent: string;
}

let activeConflict: FileConflict | null = null;
let conflictResolveCallback: ((action: 'reload' | 'keep') => void) | null = null;

/**
 * Set up file watch listeners for editor
 * Handles file-modified, file-deleted, and file-renamed events
 * 
 * @returns Cleanup function to remove listeners
 */
export async function setupEditorFileWatcher(): Promise<() => void> {

  const cleanup = await setupFileWatchListeners({
    onModified: async (event: FileWatchEvent) => {
      if (event.type !== 'modified') return;
      
      // Always get fresh state (don't use closure-captured state)
      const editorStore = useEditorStore.getState();
      const tabStore = useTabStore.getState();
      
      const filePath = normalizePath(event.path);
      
      // Find the file in the editor store using normalized path
      // getTabFromFile normalizes internally, so we can pass either format
      const tabId = editorStore.getTabFromFile(event.path);
      
      if (!tabId) {
        // File not open in editor, ignore
        return;
      }

      // Get the actual file path from the tab (normalized path stored in tabToFileMap)
      const actualFilePath = editorStore.getFileFromTab(tabId);
      if (!actualFilePath) {
        console.warn('Could not get file path from tab:', tabId);
        return;
      }
      
      // Get current editor content (use normalized path for lookup)
      const normalizedActualPath = normalizePath(actualFilePath);
      const currentContent = editorStore.fileContent.get(normalizedActualPath);
      
      // Read new file content from disk (use original event path for file operations)
      try {
        const fileData = await readFile(event.path);
        const newContent = fileData.content;
        
        // Check if content actually differs
        const contentDiffers = currentContent !== newContent;
        
        if (contentDiffers) {
          // Content differs - always show dialog to ask user
          // Only create new conflict if one doesn't already exist for this file
          if (activeConflict && activeConflict.filePath === actualFilePath) {
            // Update existing conflict with latest disk content
            activeConflict.diskContent = newContent;
          } else {
            // Create new conflict
            const tabGroup = tabStore.tabGroups.find((g) =>
              g.tabs.some((t) => t.id === tabId)
            );
            const tab = tabGroup?.tabs.find((t) => t.id === tabId);
            const hasUnsavedChanges = tab?.isModified || false;
            
            const fileName = actualFilePath.split(/[/\\]/).pop() || actualFilePath;
            activeConflict = {
              filePath: actualFilePath,
              fileName,
              editorContent: currentContent || '',
              diskContent: newContent,
            };
            
            // Trigger conflict dialog (will be handled by UI component)
            // The dialog will show different options based on whether there are unsaved changes
            window.dispatchEvent(new CustomEvent('file-conflict', {
              detail: {
                filePath: activeConflict.filePath,
                fileName: activeConflict.fileName,
                hasUnsavedChanges,
              },
            }));
          }
        }
      } catch (error) {
        console.error(`Failed to handle file modification for ${filePath}:`, error);
      }
    },

    onDeleted: async (event: FileWatchEvent) => {
      if (event.type !== 'deleted') return;
      
      // Always get fresh state
      const editorStore = useEditorStore.getState();
      const tabStore = useTabStore.getState();
      
      const filePath = event.path;
      const tabId = editorStore.getTabFromFile(filePath);
      
      if (!tabId) {
        // File not open in editor, ignore
        return;
      }

      // File was deleted externally
      console.warn(`File ${filePath} was deleted externally`);
      
      // TODO: Show warning dialog and mark file as read-only or close it
      // For now, we'll just log a warning
      // The file tab should probably be marked as read-only or closed
    },

    onRenamed: async (event: FileWatchEvent) => {
      if (event.type !== 'renamed') return;
      
      // Always get fresh state
      const editorStore = useEditorStore.getState();
      const tabStore = useTabStore.getState();
      
      const oldPath = event.old;
      const newPath = event.new;
      const tabId = editorStore.getTabFromFile(oldPath);
      
      if (!tabId) {
        // File not open in editor, ignore
        return;
      }

      // File was renamed externally
      
      // Update file path in editor store
      const content = editorStore.fileContent.get(oldPath);
      const viewState = editorStore.getViewState(oldPath);
      
      if (content !== undefined) {
        // Update mappings
        const newFileToTabMap = new Map(editorStore.fileToTabMap);
        const newTabToFileMap = new Map(editorStore.tabToFileMap);
        const newFileContent = new Map(editorStore.fileContent);
        const newFileViewState = new Map(editorStore.fileViewState);
        
        newFileToTabMap.delete(oldPath);
        newFileToTabMap.set(newPath, tabId);
        newTabToFileMap.set(tabId, newPath);
        newFileContent.delete(oldPath);
        newFileContent.set(newPath, content);
        if (viewState) {
          newFileViewState.delete(oldPath);
          newFileViewState.set(newPath, viewState);
        }
        
        useEditorStore.setState({
          fileToTabMap: newFileToTabMap,
          tabToFileMap: newTabToFileMap,
          fileContent: newFileContent,
          fileViewState: newFileViewState,
          activeFileId: editorStore.activeFileId === oldPath ? newPath : editorStore.activeFileId,
        });
        
        // Update tab label and filePath
        const tabGroup = tabStore.tabGroups.find((g) =>
          g.tabs.some((t) => t.id === tabId)
        );
        if (tabGroup) {
          const fileName = newPath.split(/[/\\]/).pop() || newPath;
          tabStore.updateTab(tabGroup.id, tabId, {
            label: fileName,
            filePath: newPath,
          });
        }
        
      }
    },
  });
  
  return cleanup;
}

/**
 * Resolve a file conflict
 * Called by the conflict dialog component
 */
export function resolveFileConflict(action: 'reload' | 'keep'): void {
  if (!activeConflict) {
    return;
  }

  const { filePath, editorContent, diskContent } = activeConflict;
  const editorStore = useEditorStore.getState();
  const tabStore = useTabStore.getState();
  
  // Normalize path for lookup (fileToTabMap uses normalized paths)
  const normalizedPath = normalizePath(filePath);
  const tabId = editorStore.getTabFromFile(filePath);

  if (action === 'reload') {
    // Reload from disk (discard editor changes)
    const currentTabId = editorStore.getTabFromFile(filePath);
    
    
    if (!currentTabId) {
      console.error(`Cannot reload: File ${filePath} (normalized: ${normalizedPath}) is not open in editor`);
      const toastStore = useToastStore.getState();
      toastStore.showToast(
        `Failed to reload: File is not open`,
        'error',
        5000
      );
      return;
    }
    
    // Update the content directly in the store (bypass updateFileContent to avoid marking as modified)
    // Create a completely new Map to ensure React detects the change
    const currentFileContent = editorStore.fileContent instanceof Map 
      ? editorStore.fileContent 
      : new Map();
    const newFileContent = new Map(currentFileContent);
    newFileContent.set(normalizedPath, diskContent);
    
    // Update the store with the new Map
    useEditorStore.setState({ fileContent: newFileContent });
    
    // Mark as not modified (since we reloaded from disk)
    const tabGroup = tabStore.tabGroups.find((g) =>
      g.tabs.some((t) => t.id === currentTabId)
    );
    if (tabGroup) {
      tabStore.updateTab(tabGroup.id, currentTabId, { isModified: false });
    }
    
    // Show success toast
    const toastStore = useToastStore.getState();
    toastStore.showToast(
      `Reloaded ${activeConflict.fileName} from disk`,
      'success',
      3000
    );
    
  } else {
    // Keep editor version (do nothing, editor content is already current)
    // File will be saved when user saves
  }

  // Clear conflict state
  activeConflict = null;
  conflictResolveCallback = null;
}

/**
 * Get current active conflict (if any)
 */
export function getActiveConflict(): FileConflict | null {
  return activeConflict;
}

