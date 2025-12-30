import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tab, TabGroup } from '@/types/tab';

/**
 * Tab store state interface
 * Manages tab groups, tabs, and tab operations
 */
interface TabStore {
  tabGroups: TabGroup[];
  activeTabGroupId: string | null;
  
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
        const newGroup: TabGroup = {
          id: newGroupId,
          tabs: [],
          activeTabId: null,
        };

        set((state) => ({
          ...state,
          tabGroups: [...state.tabGroups, newGroup],
          activeTabGroupId: state.activeTabGroupId || newGroupId,
        }));

        return newGroupId;
      },

      /**
       * Remove a tab group
       */
      removeTabGroup: (tabGroupId: string) => {
        set((state) => {
          const updatedGroups = state.tabGroups.filter((g) => g.id !== tabGroupId);
          
          let newActiveTabGroupId = state.activeTabGroupId;
          if (state.activeTabGroupId === tabGroupId) {
            newActiveTabGroupId = updatedGroups.length > 0 ? updatedGroups[0].id : null;
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
    }),
    {
      name: 'tab-store', // localStorage key
      version: 1,
    }
  )
);

