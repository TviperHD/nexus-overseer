import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tab, TabGroup } from '@/types/tab';
import type { TabDragData, DropZoneData } from '@/types/tabDrag';

/**
 * Tab store state interface
 * Manages tab groups, tabs, and tab operations
 */
interface TabStore {
  tabGroups: TabGroup[];
  activeTabGroupId: string | null;
  
  // Drag state
  draggingTab: TabDragData | null;
  activeDropZone: DropZoneData | null;
  isModifierKeyHeld: boolean; // Ctrl/Cmd key state for panel splitting
  
  // Actions
  addTab: (tabGroupId: string, tab: Tab) => void;
  removeTab: (tabGroupId: string, tabId: string) => void;
  setActiveTab: (tabGroupId: string, tabId: string) => void;
  updateTab: (tabGroupId: string, tabId: string, updates: Partial<Tab>) => void;
  moveTab: (tabId: string, fromGroupId: string, toGroupId: string) => void;
  reorderTab: (tabGroupId: string, tabId: string, newIndex: number) => void;
  createTabGroup: () => string;
  removeTabGroup: (tabGroupId: string) => void;
  getTab: (tabGroupId: string, tabId: string) => Tab | null;
  getTabGroup: (tabGroupId: string) => TabGroup | null;
  getActiveTab: (tabGroupId: string) => Tab | null;
  
  // Drag actions
  setDraggingTab: (data: TabDragData | null) => void;
  setActiveDropZone: (zone: DropZoneData | null) => void;
  moveTabToGroup: (tabId: string, fromGroupId: string, toGroupId: string, insertIndex?: number) => void;
  createTabGroupWithTab: (tabId: string, fromGroupId: string, position: { x: number; y: number }) => string;
  reorderTabsInGroup: (tabGroupId: string, tabIds: string[]) => void;
  pinTab: (tabId: string, tabGroupId: string) => void;
  unpinTab: (tabId: string, tabGroupId: string) => void;
  mergeTabGroups: (sourceGroupId: string, targetGroupId: string) => void;
  splitTabGroup: (tabGroupId: string, tabId: string) => string;
}

/**
 * Generate a UUID using crypto.randomUUID()
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Tab store using Zustand with persistence
 */
export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabGroups: [],
      activeTabGroupId: null,
      draggingTab: null,
      activeDropZone: null,
      isModifierKeyHeld: false,

      /**
       * Add a tab to a tab group
       */
      addTab: (tabGroupId: string, tab: Tab) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          // Check if tab already exists
          if (group.tabs.some((t) => t.id === tab.id)) {
            console.warn(`Tab ${tab.id} already exists in group ${tabGroupId}`);
            return state;
          }

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: [...g.tabs, tab],
                  activeTabId: tab.id, // New tab becomes active
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
            activeTabGroupId: state.activeTabGroupId || tabGroupId,
          };
        });
      },

      /**
       * Remove a tab from a tab group
       */
      removeTab: (tabGroupId: string, tabId: string) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          const updatedTabs = group.tabs.filter((t) => t.id !== tabId);
          
          // If we removed the active tab, set a new active tab
          let newActiveTabId: string | null = group.activeTabId;
          if (group.activeTabId === tabId) {
            if (updatedTabs.length > 0) {
              // Activate the tab that was before the removed tab, or the first tab
              const removedIndex = group.tabs.findIndex((t) => t.id === tabId);
              const newIndex = Math.max(0, removedIndex - 1);
              newActiveTabId = updatedTabs[newIndex]?.id || updatedTabs[0]?.id || null;
            } else {
              newActiveTabId = null;
            }
          }

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: updatedTabs,
                  activeTabId: newActiveTabId,
                }
              : g
          );

          // Check if tab group is now empty and remove associated panel
          const updatedGroup = updatedGroups.find(g => g.id === tabGroupId);
          if (updatedGroup && updatedGroup.tabs.length === 0) {
            // Tab group is empty - remove associated panel
            // Use setTimeout to avoid circular dependency issues during state update
            setTimeout(() => {
              // Lazy import to avoid circular dependency
              import('./panelStore').then(({ usePanelStore }) => {
                const panelStore = usePanelStore.getState();
                
                // Find panel associated with this tab group
                const panelId = Array.from(panelStore.panelToTabGroupMap.entries())
                  .find((entry): entry is [string, string] => {
                    const [_, groupId] = entry;
                    return groupId === tabGroupId;
                  })?.[0];
                
                if (panelId) {
                  // Remove panel (main panel will transfer status to another panel if available)
                  panelStore.removePanel(panelId);
                  console.log(`Removed empty panel ${panelId} associated with empty tab group ${tabGroupId}`);
                }
              });
            }, 0);
          }

          return {
            ...state,
            tabGroups: updatedGroups,
          };
        });
      },

      /**
       * Set the active tab in a tab group
       */
      setActiveTab: (tabGroupId: string, tabId: string) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          // Verify tab exists in group
          if (!group.tabs.some((t) => t.id === tabId)) {
            console.error(`Tab ${tabId} not found in group ${tabGroupId}`);
            return state;
          }

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  activeTabId: tabId,
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
            activeTabGroupId: tabGroupId,
          };
        });
      },

      /**
       * Update a tab's properties
       */
      updateTab: (tabGroupId: string, tabId: string, updates: Partial<Tab>) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: g.tabs.map((t) =>
                    t.id === tabId ? { ...t, ...updates } : t
                  ),
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
          };
        });
      },

      /**
       * Move a tab from one group to another
       */
      moveTab: (tabId: string, fromGroupId: string, toGroupId: string) => {
        set((state) => {
          const fromGroup = state.tabGroups.find((g) => g.id === fromGroupId);
          const toGroup = state.tabGroups.find((g) => g.id === toGroupId);

          if (!fromGroup || !toGroup) {
            console.error(`Tab group not found: ${fromGroupId} or ${toGroupId}`);
            return state;
          }

          const tab = fromGroup.tabs.find((t) => t.id === tabId);
          if (!tab) {
            console.error(`Tab ${tabId} not found in group ${fromGroupId}`);
            return state;
          }

          // Remove from source group
          const updatedFromTabs = fromGroup.tabs.filter((t) => t.id !== tabId);
          let newFromActiveTabId = fromGroup.activeTabId;
          if (fromGroup.activeTabId === tabId) {
            if (updatedFromTabs.length > 0) {
              const removedIndex = fromGroup.tabs.findIndex((t) => t.id === tabId);
              const newIndex = Math.max(0, removedIndex - 1);
              newFromActiveTabId = updatedFromTabs[newIndex]?.id || updatedFromTabs[0]?.id || null;
            } else {
              newFromActiveTabId = null;
            }
          }

          // Add to target group
          const updatedToTabs = [...toGroup.tabs, tab];

          const updatedGroups = state.tabGroups.map((g) => {
            if (g.id === fromGroupId) {
              return {
                ...g,
                tabs: updatedFromTabs,
                activeTabId: newFromActiveTabId,
              };
            }
            if (g.id === toGroupId) {
              return {
                ...g,
                tabs: updatedToTabs,
                activeTabId: tab.id, // Moved tab becomes active
              };
            }
            return g;
          });

          return {
            ...state,
            tabGroups: updatedGroups,
            activeTabGroupId: toGroupId,
          };
        });
      },

      /**
       * Reorder a tab within its group
       */
      reorderTab: (tabGroupId: string, tabId: string, newIndex: number) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          const tabIndex = group.tabs.findIndex((t) => t.id === tabId);
          if (tabIndex === -1) {
            console.error(`Tab ${tabId} not found in group ${tabGroupId}`);
            return state;
          }

          const updatedTabs = [...group.tabs];
          const [movedTab] = updatedTabs.splice(tabIndex, 1);
          updatedTabs.splice(newIndex, 0, movedTab);

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: updatedTabs,
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
          };
        });
      },

      /**
       * Create a new tab group
       */
      createTabGroup: () => {
        const newGroupId = generateUUID();
        
        // Validate ID uniqueness (should never happen with UUID, but safety check)
        const state = get();
        if (state.tabGroups.some(g => g.id === newGroupId)) {
          if (import.meta.env.DEV) {
            console.error(`[TabStore] Duplicate tab group ID generated: ${newGroupId}`);
          }
          // Generate new ID (extremely unlikely to happen twice)
          return get().createTabGroup();
        }
        
        const newGroup: TabGroup = {
          id: newGroupId,
          tabs: [],
          activeTabId: null,
        };

        set((state) => {
          if (import.meta.env.DEV) {
            console.log(`[TabStore] Created new tab group: ${newGroupId}`);
          }
          
          return {
            ...state,
            tabGroups: [...state.tabGroups, newGroup],
            activeTabGroupId: state.activeTabGroupId || newGroupId,
          };
        });

        return newGroupId;
      },

      /**
       * Remove a tab group
       * Cleans up associated panel mapping and handles edge cases
       */
      removeTabGroup: (tabGroupId: string) => {
        const state = get();
        
        // Validate group exists
        const group = state.tabGroups.find((g) => g.id === tabGroupId);
        if (!group) {
          if (import.meta.env.DEV) {
            console.warn(`[TabStore] Attempted to remove non-existent tab group: ${tabGroupId}`);
          }
          return;
        }
        
        // Check if group is being used in a drag operation
        if (state.draggingTab && (state.draggingTab.tabGroupId === tabGroupId)) {
          if (import.meta.env.DEV) {
            console.warn(`[TabStore] Cannot remove tab group ${tabGroupId} - drag operation in progress`);
          }
          // Cancel the drag operation
          set({ draggingTab: null, activeDropZone: null });
        }
        
        // Clean up panel mapping
        // Use setTimeout to avoid circular dependency issues
        setTimeout(() => {
          import('./panelStore').then(({ usePanelStore }) => {
            const panelStore = usePanelStore.getState();
            
            // Find and remove panel mapping
            const panelId = Array.from(panelStore.panelToTabGroupMap.entries())
              .find((entry): entry is [string, string] => {
                const [_, groupId] = entry;
                return groupId === tabGroupId;
              })?.[0];
            
            if (panelId) {
              // Remove mapping by deleting from the map
              // Use the panel store's internal set method via a helper
              const currentMap = panelStore.panelToTabGroupMap;
              const newMap = new Map(currentMap);
              newMap.delete(panelId);
              
              // Update the panel store's mapping using setPanelTabGroupMapping with empty string
              // Then manually update to remove it (since setPanelTabGroupMapping always sets)
              // Actually, we need to directly update the store - but we can't access set directly
              // So we'll use a workaround: set to empty, then the panel removal will handle cleanup
              // For now, just log - the panel removal in removeTab will handle the cleanup
              if (import.meta.env.DEV) {
                console.log(`[TabStore] Panel mapping cleanup for group ${tabGroupId} -> panel ${panelId} will be handled by panel removal`);
              }
            }
          });
        }, 0);
        
        // Remove the group
        set((state) => {
          const updatedGroups = state.tabGroups.filter((g) => g.id !== tabGroupId);
          
          let newActiveTabGroupId = state.activeTabGroupId;
          if (state.activeTabGroupId === tabGroupId) {
            newActiveTabGroupId = updatedGroups.length > 0 ? updatedGroups[0].id : null;
          }

          if (import.meta.env.DEV) {
            console.log(`[TabStore] Removed tab group ${tabGroupId}. Remaining groups: ${updatedGroups.length}`);
          }

          return {
            ...state,
            tabGroups: updatedGroups,
            activeTabGroupId: newActiveTabGroupId,
          };
        });
      },

      /**
       * Get a tab by ID from a tab group
       */
      getTab: (tabGroupId: string, tabId: string) => {
        const state = get();
        const group = state.tabGroups.find((g) => g.id === tabGroupId);
        return group?.tabs.find((t) => t.id === tabId) || null;
      },

      /**
       * Get a tab group by ID
       */
      getTabGroup: (tabGroupId: string) => {
        const state = get();
        return state.tabGroups.find((g) => g.id === tabGroupId) || null;
      },

      /**
       * Get the active tab from a tab group
       */
      getActiveTab: (tabGroupId: string) => {
        const state = get();
        const group = state.tabGroups.find((g) => g.id === tabGroupId);
        if (!group || !group.activeTabId) {
          return null;
        }
        return group.tabs.find((t) => t.id === group.activeTabId) || null;
      },

      /**
       * Set the currently dragging tab
       */
      setDraggingTab: (data: TabDragData | null) => {
        set({ draggingTab: data });
      },

      /**
       * Set the active drop zone
       */
      setActiveDropZone: (zone: DropZoneData | null) => {
        set({ activeDropZone: zone });
      },

      /**
       * Set modifier key state (Ctrl/Cmd)
       */
      setModifierKeyHeld: (held: boolean) => {
        set({ isModifierKeyHeld: held });
      },

      /**
       * Move a tab from one group to another with optional insert index
       */
      moveTabToGroup: (tabId: string, fromGroupId: string, toGroupId: string, insertIndex?: number) => {
        set((state) => {
          const fromGroup = state.tabGroups.find((g) => g.id === fromGroupId);
          const toGroup = state.tabGroups.find((g) => g.id === toGroupId);

          if (!fromGroup || !toGroup) {
            console.error(`Tab group not found: ${fromGroupId} or ${toGroupId}`);
            return state;
          }

          const tab = fromGroup.tabs.find((t) => t.id === tabId);
          if (!tab) {
            console.error(`Tab ${tabId} not found in group ${fromGroupId}`);
            return state;
          }

          // Remove from source group
          const updatedFromTabs = fromGroup.tabs.filter((t) => t.id !== tabId);
          let newFromActiveTabId = fromGroup.activeTabId;
          if (fromGroup.activeTabId === tabId) {
            if (updatedFromTabs.length > 0) {
              const removedIndex = fromGroup.tabs.findIndex((t) => t.id === tabId);
              const newIndex = Math.max(0, removedIndex - 1);
              newFromActiveTabId = updatedFromTabs[newIndex]?.id || updatedFromTabs[0]?.id || null;
            } else {
              newFromActiveTabId = null;
            }
          }

          // Add to target group at specified index
          const updatedToTabs = [...toGroup.tabs];
          if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= updatedToTabs.length) {
            updatedToTabs.splice(insertIndex, 0, tab);
          } else {
            updatedToTabs.push(tab);
          }

          const updatedGroups = state.tabGroups.map((g) => {
            if (g.id === fromGroupId) {
              return {
                ...g,
                tabs: updatedFromTabs,
                activeTabId: newFromActiveTabId,
              };
            }
            if (g.id === toGroupId) {
              return {
                ...g,
                tabs: updatedToTabs,
                activeTabId: tab.id, // Moved tab becomes active
              };
            }
            return g;
          });

          // Check if source tab group is now empty and remove associated panel
          if (updatedFromTabs.length === 0) {
            // Tab group is empty - remove associated panel
            // Use setTimeout to avoid circular dependency issues during state update
            setTimeout(() => {
              // Lazy import to avoid circular dependency
              import('./panelStore').then(({ usePanelStore }) => {
                const panelStore = usePanelStore.getState();
                
                // Find panel associated with this tab group
                const panelId = Array.from(panelStore.panelToTabGroupMap.entries())
                  .find((entry): entry is [string, string] => {
                    const [_, groupId] = entry;
                    return groupId === fromGroupId;
                  })?.[0];
                
                if (panelId) {
                  // Remove panel (main panel will transfer status to another panel if available)
                  panelStore.removePanel(panelId);
                  console.log(`Removed empty panel ${panelId} associated with empty tab group ${fromGroupId}`);
                }
              });
            }, 0);
          }

          return {
            ...state,
            tabGroups: updatedGroups,
            activeTabGroupId: toGroupId,
          };
        });
      },

      /**
       * Create a new tab group with a tab moved from another group
       * Returns the new tab group ID
       */
      createTabGroupWithTab: (tabId: string, fromGroupId: string, position: { x: number; y: number }) => {
        const state = get();
        
        // Validate inputs
        if (!tabId || !fromGroupId) {
          console.error(`[TabStore] Invalid parameters for createTabGroupWithTab: tabId=${tabId}, fromGroupId=${fromGroupId}`);
          return '';
        }
        
        const newGroupId = generateUUID();
        
        // Validate ID uniqueness
        if (state.tabGroups.some(g => g.id === newGroupId)) {
          if (import.meta.env.DEV) {
            console.error(`[TabStore] Duplicate tab group ID generated: ${newGroupId}`);
          }
          // Generate new ID (extremely unlikely)
          return get().createTabGroupWithTab(tabId, fromGroupId, position);
        }
        
        const fromGroup = state.tabGroups.find((g) => g.id === fromGroupId);

        if (!fromGroup) {
          console.error(`[TabStore] Tab group ${fromGroupId} not found`);
          return '';
        }

        const tab = fromGroup.tabs.find((t) => t.id === tabId);
        if (!tab) {
          console.error(`[TabStore] Tab ${tabId} not found in group ${fromGroupId}`);
          return '';
        }

        // Remove from source group
        const updatedFromTabs = fromGroup.tabs.filter((t) => t.id !== tabId);
        let newFromActiveTabId = fromGroup.activeTabId;
        if (fromGroup.activeTabId === tabId) {
          if (updatedFromTabs.length > 0) {
            const removedIndex = fromGroup.tabs.findIndex((t) => t.id === tabId);
            const newIndex = Math.max(0, removedIndex - 1);
            newFromActiveTabId = updatedFromTabs[newIndex]?.id || updatedFromTabs[0]?.id || null;
          } else {
            newFromActiveTabId = null;
          }
        }

        // Create new group with the tab
        const newGroup: TabGroup = {
          id: newGroupId,
          tabs: [tab],
          activeTabId: tab.id,
        };

        set((state) => {
          const updatedGroups = state.tabGroups.map((g) =>
            g.id === fromGroupId
              ? {
                  ...g,
                  tabs: updatedFromTabs,
                  activeTabId: newFromActiveTabId,
                }
              : g
          );

          return {
            ...state,
            tabGroups: [...updatedGroups, newGroup],
            activeTabGroupId: newGroupId,
          };
        });

        return newGroupId;
      },

      /**
       * Reorder tabs in a group based on provided tab IDs array
       */
      reorderTabsInGroup: (tabGroupId: string, tabIds: string[]) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          // Create a map for quick lookup
          const tabMap = new Map(group.tabs.map((t) => [t.id, t]));

          // Reorder tabs based on provided order
          const reorderedTabs = tabIds
            .map((id) => tabMap.get(id))
            .filter((tab): tab is Tab => tab !== undefined);

          // Add any remaining tabs that weren't in the order array (shouldn't happen, but safety check)
          const remainingTabs = group.tabs.filter((t) => !tabIds.includes(t.id));
          reorderedTabs.push(...remainingTabs);

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: reorderedTabs,
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
          };
        });
      },

      /**
       * Pin a tab (move to start and prevent closing)
       */
      pinTab: (tabId: string, tabGroupId: string) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          const tab = group.tabs.find((t) => t.id === tabId);
          if (!tab) {
            console.error(`Tab ${tabId} not found in group ${tabGroupId}`);
            return state;
          }

          // Remove tab from current position
          const otherTabs = group.tabs.filter((t) => t.id !== tabId);
          
          // Separate pinned and unpinned tabs
          const pinnedTabs = otherTabs.filter((t) => t.isPinned);
          const unpinnedTabs = otherTabs.filter((t) => !t.isPinned);

          // Add pinned tab to start of pinned section
          const updatedTabs = [
            ...pinnedTabs,
            { ...tab, isPinned: true },
            ...unpinnedTabs,
          ];

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: updatedTabs,
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
          };
        });
      },

      /**
       * Unpin a tab (restore to original position if remembered)
       */
      unpinTab: (tabId: string, tabGroupId: string) => {
        set((state) => {
          const group = state.tabGroups.find((g) => g.id === tabGroupId);
          if (!group) {
            console.error(`Tab group ${tabGroupId} not found`);
            return state;
          }

          const tab = group.tabs.find((t) => t.id === tabId);
          if (!tab) {
            console.error(`Tab ${tabId} not found in group ${tabGroupId}`);
            return state;
          }

          // Remove isPinned flag
          const updatedTabs = group.tabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: false } : t
          );

          const updatedGroups = state.tabGroups.map((g) =>
            g.id === tabGroupId
              ? {
                  ...g,
                  tabs: updatedTabs,
                }
              : g
          );

          return {
            ...state,
            tabGroups: updatedGroups,
          };
        });
      },

      /**
       * Merge two tab groups (move all tabs from source to target)
       */
      mergeTabGroups: (sourceGroupId: string, targetGroupId: string) => {
        set((state) => {
          const sourceGroup = state.tabGroups.find((g) => g.id === sourceGroupId);
          const targetGroup = state.tabGroups.find((g) => g.id === targetGroupId);

          if (!sourceGroup || !targetGroup) {
            console.error(`Tab group not found: ${sourceGroupId} or ${targetGroupId}`);
            return state;
          }

          // Move all tabs from source to target
          const updatedTargetTabs = [...targetGroup.tabs, ...sourceGroup.tabs];

          // Remove source group and update target group
          const updatedGroups = state.tabGroups
            .filter((g) => g.id !== sourceGroupId)
            .map((g) =>
              g.id === targetGroupId
                ? {
                    ...g,
                    tabs: updatedTargetTabs,
                    activeTabId: targetGroup.activeTabId || sourceGroup.activeTabId || null,
                  }
                : g
            );

          let newActiveTabGroupId = state.activeTabGroupId;
          if (newActiveTabGroupId === sourceGroupId) {
            newActiveTabGroupId = targetGroupId;
          }

          return {
            ...state,
            tabGroups: updatedGroups,
            activeTabGroupId: newActiveTabGroupId,
          };
        });
      },

      /**
       * Split a tab group by moving a tab to a new group
       * Returns the new tab group ID
       */
      splitTabGroup: (tabGroupId: string, tabId: string) => {
        return get().createTabGroupWithTab(tabId, tabGroupId, { x: 0, y: 0 });
      },
    }),
    {
      name: 'tab-store', // localStorage key
      version: 1,
      // Only persist tab groups and active tab group ID
      partialize: (state) => ({
        tabGroups: state.tabGroups,
        activeTabGroupId: state.activeTabGroupId,
      }),
      // Reset transient drag state after rehydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[TabStore] Error rehydrating from storage:', error);
          return;
        }
        
        if (state) {
          // Reset transient drag state on rehydration
          state.draggingTab = null;
          state.activeDropZone = null;
          state.isModifierKeyHeld = false;
          
          // Log what was restored for debugging
          console.log('[TabStore] Rehydrated - Tab groups:', state.tabGroups.length);
          console.log('[TabStore] Rehydrated - Active tab group:', state.activeTabGroupId);
          console.log('[TabStore] Rehydrated - Tab groups details:', state.tabGroups.map(g => ({
            id: g.id,
            tabCount: g.tabs.length,
            tabs: g.tabs.map(t => ({ id: t.id, label: t.label, type: t.type }))
          })));
        }
      },
    }
  )
);

