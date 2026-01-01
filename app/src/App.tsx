import { useEffect, useState } from 'react';
import { ToastContainer } from './components/Toast';
import { FileConflictHandler } from './components/Editor/FileConflictHandler';
import { PanelGroup } from './components/Panels';
import { EmptyCanvas } from './components/EmptyCanvas';
import { TopBar } from './components/TopBar';
import { DndTabContext } from './components/Tab';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { setupEditorFileWatcher } from './utils/editorFileWatcher';
import { useEditorStore } from './stores/editorStore';
import { useTabStore } from './stores/tabStore';
import { usePanelStore } from './stores/panelStore';
import { normalizePath } from './utils/pathUtils';
import { requestPathPermission, addAllowedPath, watchFile } from './utils/fileSystem';
import { createDefaultLayout, getDefaultPanelTabGroupMappings } from './utils/defaultLayout';

function App() {
  // Enable editor keyboard shortcuts
  useEditorShortcuts();
  const [hasRestoredFiles, setHasRestoredFiles] = useState(false);
  const [hasInitializedLayout, setHasInitializedLayout] = useState(false);
  
  const { currentLayout, loadLayout, resetLayout, setPanelTabGroupMapping } = usePanelStore();
  const { createTabGroup, tabGroups } = useTabStore();

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

  // Initialize panel layout on mount - wait for stores to rehydrate
  useEffect(() => {
    if (hasInitializedLayout) return;

    // Wait for Zustand stores to fully rehydrate from localStorage
    // Zustand persist middleware rehydrates asynchronously
    const timer = setTimeout(() => {
      const panelStore = usePanelStore.getState();
      const tabStore = useTabStore.getState();

      console.log('[App Init] Starting initialization...');
      console.log('[App Init] Tab groups in store:', tabStore.tabGroups.length);
      console.log('[App Init] Layout exists:', !!panelStore.currentLayout);
      console.log('[App Init] Layout groups:', panelStore.currentLayout?.groups?.length || 0);

      // If we have a saved layout, validate and restore it
      if (panelStore.currentLayout && panelStore.currentLayout.groups && panelStore.currentLayout.groups.length > 0) {
        console.log('[App Init] Found saved layout, validating...');
        
        try {
          // Find all panels in the saved layout (recursively)
          const findAllPanels = (groups: any[]): any[] => {
            const panels: any[] = [];
            const traverse = (item: any) => {
              if (item.id && !item.direction) {
                // It's a PanelConfig
                panels.push(item);
              } else if (item.panels) {
                // It's a PanelGroupConfig - traverse its panels
                item.panels.forEach(traverse);
              }
            };
            groups.forEach(group => {
              if (group.panels) {
                group.panels.forEach(traverse);
              }
            });
            return panels;
          };

          const allPanels = findAllPanels(panelStore.currentLayout.groups);
          console.log('[App Init] Found panels in layout:', allPanels.length);
          
          // Verify each panel has a valid tab group mapping
          for (const panel of allPanels) {
            if (panel.id) {
              const tabGroupId = panelStore.getTabGroupForPanel(panel.id);
              if (tabGroupId) {
                // Verify the tab group exists in tab store
                const tabGroup = tabStore.getTabGroup(tabGroupId);
                if (!tabGroup) {
                  // Stale mapping - create a new tab group
                  console.log(`[App Init] Stale mapping for panel ${panel.id}, creating new tab group`);
                  const newTabGroupId = tabStore.createTabGroup();
                  panelStore.setPanelTabGroupMapping(panel.id, newTabGroupId);
                }
              }
            }
          }
          
          // Check if main panel exists in the saved layout
          const hasMainPanel = allPanels.some(p => p.id === 'main-panel');
          if (!hasMainPanel) {
            console.log('[App Init] Main panel missing from saved layout, adding it');
            // Add main panel to existing layout without overwriting it
            panelStore.ensureMainPanelExists();
          } else {
            console.log('[App Init] Main panel found in saved layout');
          }
        } catch (error) {
          console.error('[App Init] Error validating saved layout:', error);
          // Don't clear the layout on error - just log it
        }
      } else {
        // No saved layout - ensure main panel exists
        console.log('[App Init] No saved layout found, creating main panel');
        panelStore.ensureMainPanelExists();
      }

      console.log('[App Init] Initialization complete');
      console.log('[App Init] Final tab groups:', tabStore.tabGroups.length);
      console.log('[App Init] Final layout exists:', !!panelStore.currentLayout);

      setHasInitializedLayout(true);
    }, 300); // Wait 300ms to ensure Zustand stores are fully rehydrated

    return () => clearTimeout(timer);
  }, [hasInitializedLayout]);

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

  // Render panel layout
  if (!hasInitializedLayout) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
        <p className="text-sm">Initializing layout...</p>
      </div>
    );
  }

  // Check if we have a saved layout
  // If no layout exists, show empty canvas
  const hasLayout = currentLayout && currentLayout.groups && currentLayout.groups.length > 0;

  return (
    <DndTabContext>
      <div className="h-screen w-screen flex flex-col bg-[#1e1e1e]">
        {/* TopBar - always at the top (fixed position) */}
        <TopBar />
        
        {/* Content area - either empty canvas or panels */}
        {/* Add top padding to account for fixed TopBar (30px height) */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden pt-[30px]">
          {!hasLayout ? (
            <EmptyCanvas />
          ) : (
            <>
              {/* Render all panel groups from layout */}
              {currentLayout.groups.map((group) => (
                <div key={group.id} className="h-full w-full">
                  <PanelGroup config={group} />
                </div>
              ))}
            </>
          )}
        </div>
        
        {/* Toast Notifications */}
        <ToastContainer />

        {/* File Conflict Handler */}
        <FileConflictHandler />
      </div>
    </DndTabContext>
  );
}

export default App;
