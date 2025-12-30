import { useEffect, useState } from 'react';
import { FileTreePlaceholder } from './components/FileTree/FileTreePlaceholder';
import { EditorPlaceholder } from './components/Editor/EditorPlaceholder';
import { ChatPlaceholder } from './components/Chat/ChatPlaceholder';
import { TaskSchedulerPlaceholder } from './components/TaskScheduler/TaskSchedulerPlaceholder';
import { FileSystemTest } from './components/FileSystemTest/FileSystemTest';
import { TabSystemTest } from './components/Tab/TabSystemTest';
import { ToastContainer } from './components/Toast';
import { FileConflictHandler } from './components/Editor/FileConflictHandler';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { setupEditorFileWatcher } from './utils/editorFileWatcher';
import { useEditorStore } from './stores/editorStore';
import { useTabStore } from './stores/tabStore';
import { normalizePath } from './utils/pathUtils';
import { requestPathPermission, addAllowedPath, watchFile } from './utils/fileSystem';

function App() {
  // Enable editor keyboard shortcuts
  useEditorShortcuts();
  const [hasRestoredFiles, setHasRestoredFiles] = useState(false);

  // Restore file content for open tabs after rehydration
  // This runs once after both stores have rehydrated
  // CRITICAL: This must check tabStore first to avoid creating duplicate tabs
  useEffect(() => {
    // Wait a bit for stores to fully rehydrate
    const timer = setTimeout(async () => {
      if (hasRestoredFiles) return;
      
      const editorStore = useEditorStore.getState();
      const tabStore = useTabStore.getState();
      
      // Restore file content for all open file tabs
      // This ensures content is loaded after rehydration
      for (const group of tabStore.tabGroups) {
        for (const tab of group.tabs) {
          if (tab.type === 'file' && tab.filePath) {
            const normalizedPath = normalizePath(tab.filePath);
            
            // Check if file is already in editor store (by normalized path)
            const existingTabId = editorStore.getTabFromFile(tab.filePath);
            
            if (existingTabId && existingTabId === tab.id) {
              // Mapping exists and matches - ensure watcher is set up and content exists
              // CRITICAL: File watchers are not persisted, so we must re-establish them
              try {
                await watchFile(tab.filePath);
              } catch (error) {
                console.warn(`Failed to set up watcher for ${tab.filePath}:`, error);
                // Non-critical, continue
              }
              
              const content = editorStore.fileContent.get(normalizedPath);
              if (!content) {
                // Content is missing - request permission and reload it (won't create new tab)
                try {
                  // Request permission first (required for Tauri security)
                  const hasPermission = await requestPathPermission(tab.filePath);
                  if (hasPermission) {
                    await addAllowedPath(tab.filePath);
                  }
                } catch (permissionError) {
                  // Try to add path directly (might already be allowed)
                  try {
                    await addAllowedPath(tab.filePath);
                  } catch (addError) {
                    console.warn(`Could not add path to allowed list: ${addError}`);
                  }
                }
                
                editorStore.reloadFile(tab.filePath).catch((error) => {
                  console.error(`Failed to reload file ${tab.filePath}:`, error);
                });
              }
            } else if (!existingTabId) {
              // File not in editor store - restore the mapping first, then reload content
              // This prevents openFile from creating a duplicate tab
              const state = useEditorStore.getState();
              const newFileToTabMap = new Map(state.fileToTabMap);
              const newTabToFileMap = new Map(state.tabToFileMap);
              
              // Restore the mapping
              newFileToTabMap.set(normalizedPath, tab.id);
              newTabToFileMap.set(tab.id, normalizedPath);
              
              useEditorStore.setState({
                fileToTabMap: newFileToTabMap,
                tabToFileMap: newTabToFileMap,
              });
              
              // Request permission before reloading (required for Tauri security)
              try {
                const hasPermission = await requestPathPermission(tab.filePath);
                if (hasPermission) {
                  await addAllowedPath(tab.filePath);
                }
              } catch (permissionError) {
                // Try to add path directly (might already be allowed)
                try {
                  await addAllowedPath(tab.filePath);
                } catch (addError) {
                  console.warn(`Could not add path to allowed list: ${addError}`);
                }
              }
              
              // CRITICAL: Set up file watcher (watchers are not persisted)
              try {
                await watchFile(tab.filePath);
              } catch (error) {
                console.warn(`Failed to set up watcher for ${tab.filePath}:`, error);
                // Non-critical, continue
              }
              
              // Now reload the content (this won't create a new tab since mapping exists)
              useEditorStore.getState().reloadFile(tab.filePath).catch((error) => {
                console.error(`Failed to reload file ${tab.filePath}:`, error);
              });
            }
            // If existingTabId exists but doesn't match tab.id, that's a data inconsistency
            // We'll skip it to avoid breaking things
          }
        }
      }
      
      setHasRestoredFiles(true);
    }, 100); // Small delay to ensure stores are rehydrated
    
    return () => clearTimeout(timer);
  }, [hasRestoredFiles]);

  // Set up file watcher for editor
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initWatcher = async () => {
      try {
        cleanup = await setupEditorFileWatcher();
      } catch (error) {
        console.error('Failed to set up editor file watcher:', error);
      }
    };

    initWatcher();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen flex bg-main-bg">
      {/* Left Sidebar - File Tree */}
      <div className="w-64 border-r border-divider">
        <FileTreePlaceholder />
      </div>

      {/* Main Area - Tab System Test (temporary for testing Phase 1.2) */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <TabSystemTest />
      </div>

      {/* Right Sidebar - Chat & Task Scheduler */}
      <div className="w-80 border-l border-divider flex flex-col">
        <div className="flex-1 border-b border-divider">
          <ChatPlaceholder />
        </div>
        <div className="flex-1">
          <TaskSchedulerPlaceholder />
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* File Conflict Handler */}
      <FileConflictHandler />
    </div>
  );
}

export default App;
