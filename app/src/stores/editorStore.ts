/**
 * Editor store for Monaco Editor integration
 * Manages file content, view state, and editor settings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTabStore } from './tabStore';
import { useToastStore } from './toastStore';
import { readFile, writeFile, watchFile, unwatch, requestPathPermission, addAllowedPath } from '../utils/fileSystem';
import { normalizePath } from '../utils/pathUtils';
import { detectLanguage } from '../utils/languageDetection';
import { getUserFriendlyErrorMessage, isLikelyBinaryFile, exceedsFileSizeLimit, formatFileSize } from '../utils/errorMessages';
import type { EditorSettings, EditorViewState } from '../types/editor';
import type { FileReadResult } from '../types/filesystem';
 
/**
 * Editor store state interface
 */
interface EditorStore {
  // File-to-tab mapping (file path -> tab ID)
  fileToTabMap: Map<string, string>;
  // Tab-to-file mapping (tab ID -> file path)
  tabToFileMap: Map<string, string>;
  // File content cache (file path -> content)
  fileContent: Map<string, string>;
  // File view state (file path -> view state)
  fileViewState: Map<string, EditorViewState>;
  // Currently active file path (null if no file active)
  activeFileId: string | null;
  // Editor settings (user preferences)
  editorSettings: EditorSettings;
  
  // Actions
  openFile: (path: string) => Promise<void>;
  closeFile: (filePath: string, force?: boolean) => Promise<void>;
  setActiveFile: (filePath: string) => void;
  updateFileContent: (filePath: string, content: string) => void;
  saveFile: (filePath: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;
  reloadFile: (filePath: string) => Promise<void>;
  getFileFromTab: (tabId: string) => string | null;
  getTabFromFile: (filePath: string) => string | null;
  updateViewState: (filePath: string, viewState: EditorViewState) => void;
  getViewState: (filePath: string) => EditorViewState | null;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  clearAllFiles: () => Promise<void>;
}

/**
 * Convert Map to array for persistence
 */
function mapToArray<K, V>(map: Map<K, V>): Array<[K, V]> {
  return Array.from(map.entries());
}

/**
 * Convert array to Map for hydration
 */
function arrayToMap<K, V>(array: Array<[K, V]> | undefined | null): Map<K, V> {
  if (!array || !Array.isArray(array)) {
    return new Map();
  }
  return new Map(array);
}

/**
 * Ensure a value is a Map instance
 */
function ensureMap<K, V>(value: unknown): Map<K, V> {
  if (value instanceof Map) {
    return value;
  }
  if (Array.isArray(value)) {
    return arrayToMap(value);
  }
  return new Map();
}

/**
 * Editor store using Zustand with persistence
 */
export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      fileToTabMap: new Map(),
      tabToFileMap: new Map(),
      fileContent: new Map(),
      fileViewState: new Map(),
      activeFileId: null,
      editorSettings: {
        theme: 'vs-dark',
        fontSize: 14,
        wordWrap: 'on',
        minimap: { enabled: true },
        lineNumbers: 'on',
        tabSize: 2,
        insertSpaces: true,
        fontFamily: 'Consolas, "Courier New", monospace',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        formatOnType: true,
      },

      /**
       * Open a file in the editor
       * Creates a file tab and loads file content
       */
      openFile: async (path: string) => {
        const state = get();
        
        // Normalize path for consistent storage and lookup
        const normalizedPath = normalizePath(path);
        
        // Check if file is already open
        const existingTabId = state.fileToTabMap.get(normalizedPath);
        if (existingTabId) {
          // File already open, switch to that tab
          const tabStore = useTabStore.getState();
          const tabGroup = tabStore.tabGroups.find((g) =>
            g.tabs.some((t) => t.id === existingTabId)
          );
          if (tabGroup) {
            // Ensure file is being watched (watchers aren't persisted, so they might be missing)
            try {
              await watchFile(path);
            } catch (error) {
              console.warn(`Failed to re-watch file ${path}:`, error);
              // Non-critical error, continue anyway
            }
            
            tabStore.setActiveTab(tabGroup.id, existingTabId);
            state.setActiveFile(normalizedPath);
          }
          return;
        }

        try {
          // Validate file before opening
          // Check if file is likely binary
          if (isLikelyBinaryFile(path)) {
            const toastStore = useToastStore.getState();
            toastStore.showToast(
              'Binary files cannot be opened in the editor. Please use a different application.',
              'warning',
              6000
            );
            return;
          }

          // Request permission for the path if needed
          try {
            const hasPermission = await requestPathPermission(path);
            if (hasPermission) {
              // Add to allowed paths for future access
              await addAllowedPath(path);
            }
          } catch (permissionError) {
            // If permission request fails, try to add path directly
            // (might already be allowed or in a directory that's allowed)
            try {
              await addAllowedPath(path);
            } catch (addError) {
              // If that also fails, continue anyway - the readFile will show the actual error
              console.warn(`Could not add path to allowed list: ${addError}`);
            }
          }

          // Read file
          const fileData: FileReadResult = await readFile(path);
          
          // Check file size (10MB limit for reading)
          const fileSizeBytes = new TextEncoder().encode(fileData.content).length;
          if (exceedsFileSizeLimit(fileSizeBytes, 10 * 1024 * 1024)) {
            const toastStore = useToastStore.getState();
            toastStore.showToast(
              `File is too large to open (${formatFileSize(fileSizeBytes)}). Maximum size is 10MB.`,
              'error',
              6000
            );
            return;
          }
          
          // Detect language
          const language = detectLanguage(path);
          
          // Extract file name from path
          const fileName = path.split(/[/\\]/).pop() || path;
          
          // Create file tab in tab system
          const tabStore = useTabStore.getState();
          const activeGroupId = tabStore.activeTabGroupId || tabStore.tabGroups[0]?.id;
          
          if (!activeGroupId) {
            // Create a tab group if none exists
            const newGroupId = tabStore.createTabGroup();
            const newTab = {
              id: crypto.randomUUID(),
              type: 'file' as const,
              label: fileName,
              filePath: normalizedPath,
              isModified: false,
              isPinned: false,
            };
            tabStore.addTab(newGroupId, newTab);
            
            // Store mappings (use normalized path)
            set((state) => {
              const newFileToTabMap = new Map(state.fileToTabMap);
              const newTabToFileMap = new Map(state.tabToFileMap);
              const newFileContent = new Map(state.fileContent);
              
              newFileToTabMap.set(normalizedPath, newTab.id);
              newTabToFileMap.set(newTab.id, normalizedPath);
              newFileContent.set(normalizedPath, fileData.content);
              
              return {
                fileToTabMap: newFileToTabMap,
                tabToFileMap: newTabToFileMap,
                fileContent: newFileContent,
                activeFileId: normalizedPath,
              };
            });
            
            // Start watching file
            try {
              await watchFile(path);
            } catch (error) {
              console.warn(`Failed to watch file ${path}:`, error);
              // Non-critical error, don't show toast
            }
            
            // Set as active
            tabStore.setActiveTab(newGroupId, newTab.id);
            
            // Show success toast
            const toastStore = useToastStore.getState();
            toastStore.showToast(`Opened ${fileName}`, 'success', 3000);
          } else {
            const newTab = {
              id: crypto.randomUUID(),
              type: 'file' as const,
              label: fileName,
              filePath: path,
              isModified: false,
              isPinned: false,
            };
            tabStore.addTab(activeGroupId, newTab);
            
            // Store mappings
            // IMPORTANT: Store with normalized path for consistent lookups
            // But keep original path in tab.filePath for Tauri compatibility
            set((state) => {
              const newFileToTabMap = new Map(state.fileToTabMap);
              const newTabToFileMap = new Map(state.tabToFileMap);
              const newFileContent = new Map(state.fileContent);
              
              // Use normalized path for internal Maps
              newFileToTabMap.set(normalizedPath, newTab.id);
              newTabToFileMap.set(newTab.id, normalizedPath);
              newFileContent.set(normalizedPath, fileData.content);
              
              return {
                fileToTabMap: newFileToTabMap,
                tabToFileMap: newTabToFileMap,
                fileContent: newFileContent,
                activeFileId: normalizedPath,
              };
            });
            
            // Start watching file
            try {
              await watchFile(path);
            } catch (error) {
              console.warn(`Failed to watch file ${path}:`, error);
              // Non-critical error, don't show toast
            }
            
            // Set as active
            tabStore.setActiveTab(activeGroupId, newTab.id);
            
            // Show success toast
            const toastStore = useToastStore.getState();
            toastStore.showToast(`Opened ${fileName}`, 'success', 3000);
          }
        } catch (error) {
          console.error(`Failed to open file ${path}:`, error);
          const toastStore = useToastStore.getState();
          toastStore.showToast(
            getUserFriendlyErrorMessage(error, 'open file'),
            'error',
            6000
          );
          throw error;
        }
      },

      /**
       * Close a file
       * Removes file tab and stops watching file
       */
      closeFile: async (filePath: string, force: boolean = false) => {
        const state = get();
        // Normalize path for lookup (fileToTabMap uses normalized paths as keys)
        const normalizedPath = normalizePath(filePath);
        const tabId = state.fileToTabMap.get(normalizedPath);
        
        if (!tabId) {
          console.warn(`File ${filePath} (normalized: ${normalizedPath}) is not open`);
          return;
        }

        // Check if file has unsaved changes (unless force is true)
        if (!force) {
          const tabStore = useTabStore.getState();
          const tabGroup = tabStore.tabGroups.find((g) =>
            g.tabs.some((t) => t.id === tabId)
          );
          
          if (tabGroup) {
            const tab = tabGroup.tabs.find((t) => t.id === tabId);
            if (tab?.isModified) {
              // File has unsaved changes - caller should show confirmation dialog first
              console.warn(`File ${filePath} has unsaved changes`);
              return;
            }
          }
        }

        // Get tab group for cleanup (needed even when force is true)
        const tabStore = useTabStore.getState();
        const tabGroup = tabStore.tabGroups.find((g) =>
          g.tabs.some((t) => t.id === tabId)
        );

        // Stop watching file
        try {
          await unwatch(filePath);
        } catch (error) {
          console.warn(`Failed to unwatch file ${filePath}:`, error);
        }

        // Remove file tab
        if (tabGroup) {
          tabStore.removeTab(tabGroup.id, tabId);
        }

        // Remove from mappings (use normalized path for deletion)
        set((state) => {
          const newFileToTabMap = new Map(ensureMap(state.fileToTabMap));
          const newTabToFileMap = new Map(ensureMap(state.tabToFileMap));
          const newFileContent = new Map(ensureMap(state.fileContent));
          const newFileViewState = new Map(ensureMap(state.fileViewState));
          
          newFileToTabMap.delete(normalizedPath);
          newTabToFileMap.delete(tabId);
          newFileContent.delete(normalizedPath);
          newFileViewState.delete(normalizedPath);
          
          return {
            fileToTabMap: newFileToTabMap,
            tabToFileMap: newTabToFileMap,
            fileContent: newFileContent,
            fileViewState: newFileViewState,
            activeFileId: state.activeFileId === normalizedPath ? null : state.activeFileId,
          };
        });
      },

      /**
       * Set the active file
       */
      setActiveFile: (filePath: string) => {
        const state = get();
        const tabId = state.fileToTabMap.get(filePath);
        
        if (!tabId) {
          console.warn(`File ${filePath} is not open`);
          return;
        }

        // Set active tab in tab system
        const tabStore = useTabStore.getState();
        const tabGroup = tabStore.tabGroups.find((g) =>
          g.tabs.some((t) => t.id === tabId)
        );
        
        if (tabGroup) {
          tabStore.setActiveTab(tabGroup.id, tabId);
        }

        set({ activeFileId: filePath });
      },

      /**
       * Update file content
       * Marks file as modified in tab system
       */
      updateFileContent: (filePath: string, content: string) => {
        const state = get();
        const normalizedPath = normalizePath(filePath);
        const tabId = state.fileToTabMap.get(normalizedPath);
        
        if (!tabId) {
          console.warn(`File ${normalizedPath} is not open (original: ${filePath})`);
          return;
        }

        // Update content
        set((state) => {
          const newFileContent = new Map(state.fileContent);
          newFileContent.set(normalizedPath, content);
          return { fileContent: newFileContent };
        });

        // Mark file as modified in tab system
        const tabStore = useTabStore.getState();
        const tabGroup = tabStore.tabGroups.find((g) =>
          g.tabs.some((t) => t.id === tabId)
        );
        
        if (tabGroup) {
          tabStore.updateTab(tabGroup.id, tabId, { isModified: true });
        }
      },

      /**
       * Save a file
       */
      saveFile: async (filePath: string) => {
        const state = get();
        const normalizedPath = normalizePath(filePath);
        const content = state.fileContent.get(normalizedPath);
        
        if (content === undefined) {
          console.warn(`File ${filePath} content not found`);
          return;
        }

        try {
          // Check file size before saving (50MB limit for writing)
          const fileSizeBytes = new TextEncoder().encode(content).length;
          if (exceedsFileSizeLimit(fileSizeBytes, 50 * 1024 * 1024)) {
            const toastStore = useToastStore.getState();
            toastStore.showToast(
              `File is too large to save (${formatFileSize(fileSizeBytes)}). Maximum size is 50MB.`,
              'error',
              6000
            );
            return;
          }

          // Write file (use original path for file system operations)
          await writeFile({
            path: filePath,
            content,
            createIfNotExists: true,
            backup: false,
          });

          // Update last modified timestamp (we'll update this when we reload metadata)
          // For now, just mark as not modified
          const tabId = state.fileToTabMap.get(normalizedPath);
          const fileName = filePath.split(/[/\\]/).pop() || filePath;
          if (tabId) {
            const tabStore = useTabStore.getState();
            const tabGroup = tabStore.tabGroups.find((g) =>
              g.tabs.some((t) => t.id === tabId)
            );
            
            if (tabGroup) {
              tabStore.updateTab(tabGroup.id, tabId, { isModified: false });
            }
          }
          
          // Show success toast
          const toastStore = useToastStore.getState();
          toastStore.showToast(`Saved ${fileName}`, 'success', 3000);
        } catch (error) {
          console.error(`Failed to save file ${filePath}:`, error);
          const toastStore = useToastStore.getState();
          toastStore.showToast(
            getUserFriendlyErrorMessage(error, 'save file'),
            'error',
            6000
          );
          throw error;
        }
      },

      /**
       * Save all modified files
       */
      saveAllFiles: async () => {
        const state = get();
        const tabStore = useTabStore.getState();
        
        // Get all open files
        const openFiles = Array.from(state.fileToTabMap.keys());
        
        // Filter to only modified files
        const modifiedFiles: string[] = [];
        for (const filePath of openFiles) {
          const tabId = state.fileToTabMap.get(filePath);
          if (tabId) {
            const tabGroup = tabStore.tabGroups.find((g) =>
              g.tabs.some((t) => t.id === tabId)
            );
            const tab = tabGroup?.tabs.find((t) => t.id === tabId);
            if (tab?.isModified) {
              modifiedFiles.push(filePath);
            }
          }
        }

        // Save each modified file
        const errors: string[] = [];
        for (const filePath of modifiedFiles) {
          try {
            await state.saveFile(filePath);
          } catch (error) {
            errors.push(filePath);
            console.error(`Failed to save file ${filePath}:`, error);
          }
        }

        if (errors.length > 0) {
          const toastStore = useToastStore.getState();
          toastStore.showToast(
            `Failed to save ${errors.length} file(s)`,
            'error',
            6000
          );
          throw new Error(`Failed to save ${errors.length} file(s): ${errors.join(', ')}`);
        } else if (modifiedFiles.length > 0) {
          const toastStore = useToastStore.getState();
          toastStore.showToast(
            `Saved ${modifiedFiles.length} file(s)`,
            'success',
            3000
          );
        }
      },

      /**
       * Reload a file from disk
       * Discards unsaved changes
       */
      reloadFile: async (filePath: string) => {
        try {
          // Normalize path for consistent storage
          const normalizedPath = normalizePath(filePath);
          
          // Request permission for the path if needed (required for Tauri security)
          try {
            const hasPermission = await requestPathPermission(filePath);
            if (hasPermission) {
              // Add to allowed paths for future access
              await addAllowedPath(filePath);
            }
          } catch (permissionError) {
            // If permission request fails, try to add path directly
            // (might already be allowed or in a directory that's allowed)
            try {
              await addAllowedPath(filePath);
            } catch (addError) {
              // If that also fails, continue anyway - the readFile will show the actual error
              console.warn(`Could not add path to allowed list: ${addError}`);
            }
          }
          
          // Read file (use original path for Tauri)
          const fileData: FileReadResult = await readFile(filePath);
          
          // Update content (use normalized path for storage)
          set((state) => {
            const newFileContent = new Map(state.fileContent);
            newFileContent.set(normalizedPath, fileData.content);
            return { fileContent: newFileContent };
          });

          // Mark as not modified
          const state = get();
          const tabId = state.fileToTabMap.get(normalizedPath);
          if (tabId) {
            const tabStore = useTabStore.getState();
            const tabGroup = tabStore.tabGroups.find((g) =>
              g.tabs.some((t) => t.id === tabId)
            );
            
            if (tabGroup) {
              tabStore.updateTab(tabGroup.id, tabId, { isModified: false });
            }
          }
        } catch (error) {
          console.error(`Failed to reload file ${filePath}:`, error);
          throw error;
        }
      },

      /**
       * Get file path from tab ID
       */
      getFileFromTab: (tabId: string) => {
        const state = get();
        // Returns normalized path from store
        // Caller should use tab.filePath for Tauri operations
        return state.tabToFileMap.get(tabId) || null;
      },

      /**
       * Get tab ID from file path
       */
      getTabFromFile: (filePath: string) => {
        const state = get();
        const normalizedPath = normalizePath(filePath);
        return state.fileToTabMap.get(normalizedPath) || null;
      },

      /**
       * Update view state for a file
       */
      updateViewState: (filePath: string, viewState: EditorViewState) => {
        set((state) => {
          const currentViewState = ensureMap(state.fileViewState);
          const newFileViewState = new Map(currentViewState);
          const normalizedPath = normalizePath(filePath);
          newFileViewState.set(normalizedPath, viewState);
          return { fileViewState: newFileViewState };
        });
      },

      /**
       * Get view state for a file
       */
      getViewState: (filePath: string) => {
        const state = get();
        const fileViewState = ensureMap(state.fileViewState);
        const normalizedPath = normalizePath(filePath);
        return fileViewState.get(normalizedPath) || null;
      },

      /**
       * Update editor settings
       */
      updateEditorSettings: (settings: Partial<EditorSettings>) => {
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...settings },
        }));
      },

      /**
       * Clear all open files
       * Forcefully removes all file tabs and clears all mappings
       */
      clearAllFiles: async () => {
        const state = get();
        const tabStore = useTabStore.getState();
        const fileToTabMap = ensureMap(state.fileToTabMap);
        const tabToFileMap = ensureMap(state.tabToFileMap);
        
        // Get all file paths and tab IDs
        const openFiles = Array.from(fileToTabMap.keys());
        const tabIds = Array.from(tabToFileMap.keys());
        
        // Stop watching all files
        for (const filePath of openFiles) {
          try {
            await unwatch(filePath);
          } catch (error) {
            // Ignore errors - file might not be watched
          }
        }
        
        // Forcefully remove all file tabs from tab store
        for (const tabGroup of tabStore.tabGroups) {
          // Get all file tabs in this group
          const fileTabs = tabGroup.tabs.filter((tab) => tab.type === 'file');
          for (const tab of fileTabs) {
            try {
              tabStore.removeTab(tabGroup.id, tab.id);
            } catch (error) {
              console.warn(`Failed to remove tab ${tab.id}:`, error);
            }
          }
        }
        
        // Clear all mappings and state
        set({
          fileToTabMap: new Map(),
          tabToFileMap: new Map(),
          fileContent: new Map(),
          fileViewState: new Map(),
          activeFileId: null,
        });
      },
    }),
    {
      name: 'editor-store',
      // Custom serialization for Maps
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            fileToTabMap: mapToArray(state.state.fileToTabMap),
            tabToFileMap: mapToArray(state.state.tabToFileMap),
            fileContent: mapToArray(state.state.fileContent),
            fileViewState: mapToArray(state.state.fileViewState),
          },
        });
      },
      // Custom deserialization for Maps
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            fileToTabMap: arrayToMap(parsed.state.fileToTabMap || []),
            tabToFileMap: arrayToMap(parsed.state.tabToFileMap || []),
            fileContent: arrayToMap(parsed.state.fileContent || []),
            fileViewState: arrayToMap(parsed.state.fileViewState || []),
          },
        };
      },
      // Ensure Maps are properly initialized after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure all Maps are actually Map instances
          if (!(state.fileToTabMap instanceof Map)) {
            state.fileToTabMap = ensureMap(state.fileToTabMap);
          }
          if (!(state.tabToFileMap instanceof Map)) {
            state.tabToFileMap = ensureMap(state.tabToFileMap);
          }
          if (!(state.fileContent instanceof Map)) {
            state.fileContent = ensureMap(state.fileContent);
          }
          if (!(state.fileViewState instanceof Map)) {
            state.fileViewState = ensureMap(state.fileViewState);
          }
          
          // Normalize all paths in Maps (fixes corrupted state from previous versions)
          const normalizedFileToTabMap = new Map<string, string>();
          const normalizedTabToFileMap = new Map<string, string>();
          const normalizedFileContent = new Map<string, string>();
          const normalizedFileViewState = new Map<string, EditorViewState>();
          
          // Normalize fileToTabMap
          for (const [filePath, tabId] of state.fileToTabMap.entries()) {
            const normalized = normalizePath(filePath);
            normalizedFileToTabMap.set(normalized, tabId);
          }
          
          // Normalize tabToFileMap
          for (const [tabId, filePath] of state.tabToFileMap.entries()) {
            const normalized = normalizePath(filePath);
            normalizedTabToFileMap.set(tabId, normalized);
          }
          
          // Normalize fileContent
          for (const [filePath, content] of state.fileContent.entries()) {
            const normalized = normalizePath(filePath);
            normalizedFileContent.set(normalized, content);
          }
          
          // Normalize fileViewState
          for (const [filePath, viewState] of state.fileViewState.entries()) {
            const normalized = normalizePath(filePath);
            normalizedFileViewState.set(normalized, viewState);
          }
          
          // Update state with normalized paths
          state.fileToTabMap = normalizedFileToTabMap;
          state.tabToFileMap = normalizedTabToFileMap;
          state.fileContent = normalizedFileContent;
          state.fileViewState = normalizedFileViewState;
          
          // Normalize activeFileId if it exists
          if (state.activeFileId) {
            state.activeFileId = normalizePath(state.activeFileId);
          }
          
          // IMPORTANT: Do NOT update tab filePaths to normalized versions
          // Tabs must keep Windows path format (with backslashes) for Tauri compatibility
          // Normalization is only for internal Map lookups, not for file system operations
          // The tab's filePath should remain in its original format
        }
      },
    }
  )
);

