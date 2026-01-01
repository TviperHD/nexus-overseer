/**
 * Panel store for resizable panels system
 * Manages panel layout, sizes, and integration with TabStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTabStore } from './tabStore';
import { debounce } from '../utils/debounce';
import type { PanelConfig, PanelGroupConfig, PanelLayout } from '../types/panel';

/**
 * Main panel ID constant
 */
export const MAIN_PANEL_ID = 'main-panel';

/**
 * Panel store state interface
 */
interface PanelStore {
  // Layout
  currentLayout: PanelLayout | null;
  
  // Panel state (don't duplicate tabGroups - reference from tabStore)
  panelSizes: Record<string, number>;        // Panel ID -> size percentage
  collapsedPanels: Set<string>;              // Collapsed panel IDs
  embeddedPanels: Map<string, string>;       // Panel ID -> parent panel ID
  activePanel: string | null;                // Currently focused panel
  
  // Panel-to-tab-group mapping
  panelToTabGroupMap: Map<string, string>;   // Panel ID -> tab group ID
  
  // Actions - Panels
  setPanelSize: (panelId: string, size: number) => void;
  setPanelSizes: (sizes: Record<string, number>) => void;
  togglePanelCollapse: (panelId: string) => void;
  embedPanel: (panelId: string, parentPanelId: string) => void;
  unembedPanel: (panelId: string) => void;
  setActivePanel: (panelId: string) => void;
  
  // Actions - Layout
  saveLayout: (name?: string) => Promise<void>;
  loadLayout: (layoutId?: string) => Promise<void>;
  resetLayout: () => void;
  updateLayout: (layout: PanelLayout) => void;
  
  // Actions - Mapping
  setPanelTabGroupMapping: (panelId: string, tabGroupId: string) => void;
  getTabGroupForPanel: (panelId: string) => string | null;
  
  // Actions - Main Panel
  createMainPanel: () => PanelConfig;
  ensureMainPanelExists: () => void;
  getMainPanelId: () => string;
  
  // Actions - Panel Removal
  findAllPanels: () => PanelConfig[];
  removePanel: (panelId: string) => void;
  findPanelInLayout: (panelId: string) => {
    groupIndex: number;
    panelIndex: number;
    group: PanelGroupConfig;
    isNested: boolean;
    parentGroup?: PanelGroupConfig;
    parentGroupIndex?: number;
    nestedPanelIndex?: number;
  } | null;
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
 * Convert Set to array for persistence
 */
function setToArray<T>(set: Set<T>): T[] {
  return Array.from(set);
}

/**
 * Convert array to Set for hydration
 */
function arrayToSet<T>(array: T[] | undefined | null): Set<T> {
  if (!array || !Array.isArray(array)) {
    return new Set();
  }
  return new Set(array);
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
 * Ensure a value is a Set instance
 */
function ensureSet<T>(value: unknown): Set<T> {
  if (value instanceof Set) {
    return value;
  }
  if (Array.isArray(value)) {
    return arrayToSet(value);
  }
  return new Set();
}

/**
 * Debounced save layout function (will be set after store creation)
 */
let debouncedSaveLayout: (() => void) | null = null;

/**
 * Panel store using Zustand with persistence
 */
export const usePanelStore = create<PanelStore>()(
  persist(
    (set, get) => {
      // Initialize debounced save function
      debouncedSaveLayout = debounce(() => {
        const state = get();
        if (state.currentLayout) {
          // Update timestamp
          const updatedLayout: PanelLayout = {
            ...state.currentLayout,
            updatedAt: new Date().toISOString(),
          };
          set({ currentLayout: updatedLayout });
        }
      }, 300);

      return {
        currentLayout: null,
        panelSizes: {},
        collapsedPanels: new Set<string>(),
        embeddedPanels: new Map<string, string>(),
        activePanel: null,
        panelToTabGroupMap: new Map<string, string>(),

        /**
         * Set size for a single panel
         */
        setPanelSize: (panelId: string, size: number) => {
          // Validate size (0-100)
          const clampedSize = Math.max(0, Math.min(100, size));
          
          set((state) => ({
            panelSizes: {
              ...state.panelSizes,
              [panelId]: clampedSize,
            },
          }));

          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },

        /**
         * Set sizes for multiple panels (for onResize callback)
         */
        setPanelSizes: (sizes: Record<string, number>) => {
          // Validate all sizes
          const validatedSizes: Record<string, number> = {};
          for (const [panelId, size] of Object.entries(sizes)) {
            validatedSizes[panelId] = Math.max(0, Math.min(100, size));
          }

          set((state) => ({
            panelSizes: {
              ...state.panelSizes,
              ...validatedSizes,
            },
          }));

          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },

        /**
         * Toggle panel collapsed state
         */
        togglePanelCollapse: (panelId: string) => {
          set((state) => {
            const newCollapsed = new Set(state.collapsedPanels);
            if (newCollapsed.has(panelId)) {
              newCollapsed.delete(panelId);
            } else {
              newCollapsed.add(panelId);
            }
            return { collapsedPanels: newCollapsed };
          });

          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },

        /**
         * Embed a panel inside another panel
         */
        embedPanel: (panelId: string, parentPanelId: string) => {
          set((state) => {
            const newEmbedded = new Map(state.embeddedPanels);
            newEmbedded.set(panelId, parentPanelId);
            return { embeddedPanels: newEmbedded };
          });

          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },

        /**
         * Remove panel embedding
         */
        unembedPanel: (panelId: string) => {
          set((state) => {
            const newEmbedded = new Map(state.embeddedPanels);
            newEmbedded.delete(panelId);
            return { embeddedPanels: newEmbedded };
          });

          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },

        /**
         * Set the currently active panel
         */
        setActivePanel: (panelId: string | null) => {
          set({ activePanel: panelId });
        },

        /**
         * Save current layout
         */
        saveLayout: async (name?: string) => {
          const state = get();
          const tabStore = useTabStore.getState();
          
          // Create layout from current state
          const layout: PanelLayout = {
            id: state.currentLayout?.id || crypto.randomUUID(),
            name: name || state.currentLayout?.name || 'Default Layout',
            groups: state.currentLayout?.groups || [],
            createdAt: state.currentLayout?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({ currentLayout: layout });
        },

        /**
         * Load a saved layout
         */
        loadLayout: async (layoutId?: string) => {
          const state = get();
          
          // If no layoutId provided, use current layout
          if (!layoutId && state.currentLayout) {
            // Apply current layout
            // This is mainly for restoration after app restart
            return;
          }

          // For now, we only support one layout (currentLayout)
          // Future: support multiple named layouts
          if (state.currentLayout) {
            // Validate layout
            if (!state.currentLayout.groups || !Array.isArray(state.currentLayout.groups)) {
              console.error('Invalid layout: groups missing or invalid');
              get().resetLayout();
              return;
            }

            // Layout is already loaded (from persistence)
            // Just ensure it's valid
          } else {
            // No saved layout, reset to default
            get().resetLayout();
          }
        },

        /**
         * Update layout directly (for dynamic panel creation)
         */
        updateLayout: (layout: PanelLayout) => {
          set({ currentLayout: layout });
          
          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },

        /**
         * Reset to default layout
         */
        resetLayout: () => {
          // Default layout will be created in App.tsx
          // For now, just clear current layout
          set({
            currentLayout: null,
            panelSizes: {},
            collapsedPanels: new Set(),
            embeddedPanels: new Map(),
            activePanel: null,
          });
        },

        /**
         * Map a panel to a tab group
         */
        setPanelTabGroupMapping: (panelId: string, tabGroupId: string) => {
          set((state) => {
            const newMap = new Map(state.panelToTabGroupMap);
            newMap.set(panelId, tabGroupId);
            return { panelToTabGroupMap: newMap };
          });
        },

        /**
         * Get tab group ID for a panel
         * Verifies the tab group exists in the tab store
         * For main panel, ensures a tab group exists (creates one if needed)
         */
        getTabGroupForPanel: (panelId: string) => {
          // Disable verbose debug logging - only log warnings/errors
          const DEBUG = false; // Set to true for debugging
          
          const state = get();
          const tabGroupId = state.panelToTabGroupMap.get(panelId);
          
          if (!tabGroupId) {
            // No mapping found
            if (DEBUG && import.meta.env.DEV) {
              console.log('[DEBUG getTabGroupForPanel] No mapping found for panel:', panelId);
            }
            
            // For main panel, check if it exists in layout first
            // If it exists but has no mapping, ensureMainPanelExists should have set it
            // But if it doesn't exist, we should create it
            if (panelId === MAIN_PANEL_ID) {
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG getTabGroupForPanel] Main panel has no mapping - ensuring main panel exists first');
              }
              // Ensure main panel exists (this will create it and set the mapping if needed)
              get().ensureMainPanelExists();
              
              // Try again after ensuring main panel exists
              const stateAfter = get();
              const tabGroupIdAfter = stateAfter.panelToTabGroupMap.get(MAIN_PANEL_ID);
              if (tabGroupIdAfter) {
                // Verify it exists in store
                const tabStore = useTabStore.getState();
                const tabGroup = tabStore.getTabGroup(tabGroupIdAfter);
                if (tabGroup) {
                  if (DEBUG && import.meta.env.DEV) {
                    console.log('[DEBUG getTabGroupForPanel] Main panel mapping created by ensureMainPanelExists:', tabGroupIdAfter);
                  }
                  return tabGroupIdAfter;
                }
              }
              
              // If still no mapping, create one (shouldn't happen, but safety net)
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG getTabGroupForPanel] Main panel still has no mapping after ensureMainPanelExists - creating new tab group');
              }
              const tabStore = useTabStore.getState();
              const newTabGroupId = tabStore.createTabGroup();
              set((state) => {
                const newMap = new Map(state.panelToTabGroupMap);
                newMap.set(MAIN_PANEL_ID, newTabGroupId);
                return { panelToTabGroupMap: newMap };
              });
              if (DEBUG && import.meta.env.DEV) {
                console.log(`[DEBUG getTabGroupForPanel] Created new tab group for main panel: ${newTabGroupId}`);
              }
              return newTabGroupId;
            }
            
            return null;
          }
          
          // Verify tab group exists in tab store
          const tabStore = useTabStore.getState();
          const tabGroup = tabStore.getTabGroup(tabGroupId);
          
          if (!tabGroup) {
            // Tab group doesn't exist - remove stale mapping
            console.warn('[PanelStore] Tab group', tabGroupId, 'does not exist in store, removing stale mapping for panel', panelId);
            set((state) => {
              const newMap = new Map(state.panelToTabGroupMap);
              newMap.delete(panelId);
              return { panelToTabGroupMap: newMap };
            });
            
            // For main panel, create a new tab group immediately
            if (panelId === MAIN_PANEL_ID) {
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG getTabGroupForPanel] Main panel - creating new tab group to replace stale one');
              }
              const newTabGroupId = tabStore.createTabGroup();
              set((state) => {
                const newMap = new Map(state.panelToTabGroupMap);
                newMap.set(MAIN_PANEL_ID, newTabGroupId);
                return { panelToTabGroupMap: newMap };
              });
              if (DEBUG && import.meta.env.DEV) {
                console.log(`[DEBUG getTabGroupForPanel] Main panel tab group was stale, created new one: ${newTabGroupId}`);
              }
              return newTabGroupId;
            }
            
            return null;
          }
          
          return tabGroupId;
        },

        /**
         * Create main panel configuration
         * Creates main panel if it doesn't exist in layout
         * ALWAYS ensures a tab group mapping exists for the main panel
         */
        createMainPanel: () => {
          const state = get();
          const tabStore = useTabStore.getState();

          // Check if main panel already exists in layout (recursively)
          const checkForMainPanel = (panelOrGroup: PanelConfig | PanelGroupConfig): boolean => {
            if ('id' in panelOrGroup && panelOrGroup.id === MAIN_PANEL_ID) {
              return true;
            }
            if ('direction' in panelOrGroup) {
              for (const panel of panelOrGroup.panels) {
                if (checkForMainPanel(panel)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          const mainPanelExists = state.currentLayout?.groups.some((group) =>
            group.panels.some((panel) => checkForMainPanel(panel))
          );

          if (mainPanelExists) {
            // Find and return existing main panel
            const findMainPanel = (panelOrGroup: PanelConfig | PanelGroupConfig): PanelConfig | null => {
              if ('id' in panelOrGroup && panelOrGroup.id === MAIN_PANEL_ID) {
                return panelOrGroup;
              }
              if ('direction' in panelOrGroup) {
                for (const panel of panelOrGroup.panels) {
                  const found = findMainPanel(panel);
                  if (found) return found;
                }
              }
              return null;
            };
            
            for (const group of state.currentLayout?.groups || []) {
              for (const panel of group.panels) {
                const found = findMainPanel(panel);
                if (found) {
                  // Ensure mapping exists even if panel exists
                  const existingMapping = state.panelToTabGroupMap.get(MAIN_PANEL_ID);
                  if (!existingMapping) {
                    // Create tab group and set mapping atomically
                    const tabGroupId = tabStore.createTabGroup();
                    set((state) => {
                      const newMap = new Map(state.panelToTabGroupMap);
                      newMap.set(MAIN_PANEL_ID, tabGroupId);
                      return { panelToTabGroupMap: newMap };
                    });
                    console.log('[DEBUG createMainPanel] Main panel exists but no mapping - created tab group:', tabGroupId);
                  }
                  return found;
                }
              }
            }
          }

          // Create new main panel config
          const mainPanel: PanelConfig = {
            id: MAIN_PANEL_ID,
            component: 'editor',
            defaultSize: 100,
            minSize: 20,
            maxSize: 100,
            collapsible: false,
            collapsed: false,
          };

          // ALWAYS create or get tab group for main panel
          // Check if mapping exists and tab group is valid
          let tabGroupId = state.panelToTabGroupMap.get(MAIN_PANEL_ID);
          if (tabGroupId) {
            // Verify tab group exists in store
            const tabGroup = tabStore.getTabGroup(tabGroupId);
            if (!tabGroup) {
              // Stale mapping - create new tab group
              console.log('[DEBUG createMainPanel] Stale mapping detected, creating new tab group');
              tabGroupId = tabStore.createTabGroup();
            }
          } else {
            // No mapping - create new tab group
            console.log('[DEBUG createMainPanel] No mapping exists, creating new tab group');
            tabGroupId = tabStore.createTabGroup();
          }
          
          // Set mapping atomically with layout update
          mainPanel.tabGroupId = tabGroupId;

          // Check if layout exists and has any panels
          const hasAnyPanels = state.currentLayout?.groups.some(group => 
            group.panels && group.panels.length > 0
          );

          // If no layout exists OR layout exists but has no panels (all closed), create/recreate layout
          if (!state.currentLayout || !hasAnyPanels) {
            const newGroup: PanelGroupConfig = {
              id: crypto.randomUUID(),
              direction: 'horizontal',
              panels: [mainPanel],
              defaultSizes: [100],
            };

            const newLayout: PanelLayout = {
              id: state.currentLayout?.id || crypto.randomUUID(),
              name: state.currentLayout?.name || 'Default Layout',
              groups: [newGroup],
              createdAt: state.currentLayout?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Update layout and mapping atomically
            set((state) => {
              const newMap = new Map(state.panelToTabGroupMap);
              newMap.set(MAIN_PANEL_ID, tabGroupId);
              return { 
                currentLayout: newLayout,
                panelToTabGroupMap: newMap,
              };
            });
            console.log('[DEBUG createMainPanel] Created/recreated layout with main panel, tab group:', tabGroupId);
          } else {
            // Layout exists and has panels - add main panel to first group if it doesn't exist
            const updatedGroups = state.currentLayout.groups.map((group, index) => {
              if (index === 0 && !group.panels.some((p) => checkForMainPanel(p))) {
                return {
                  ...group,
                  panels: [...group.panels, mainPanel],
                  defaultSizes: [...group.defaultSizes, 100],
                };
              }
              return group;
            });

            // Update layout and mapping atomically
            set((state) => {
              const newMap = new Map(state.panelToTabGroupMap);
              newMap.set(MAIN_PANEL_ID, tabGroupId);
              return {
                currentLayout: {
                  ...state.currentLayout,
                  groups: updatedGroups,
                  updatedAt: new Date().toISOString(),
                },
                panelToTabGroupMap: newMap,
              };
            });
            console.log('[DEBUG createMainPanel] Added main panel to existing layout, tab group:', tabGroupId);
          }

          return mainPanel;
        },

        /**
         * Ensure main panel exists
         * Creates main panel if it doesn't exist
         */
        ensureMainPanelExists: () => {
          const DEBUG = false; // Set to true for debugging
          const state = get();
          if (DEBUG && import.meta.env.DEV) {
            console.log('[DEBUG ensureMainPanelExists] Called');
            console.log('[DEBUG ensureMainPanelExists] Current layout exists?', !!state.currentLayout);
          }
          
          // Check if main panel exists (including nested groups) - fully recursive
          const checkForMainPanel = (panelOrGroup: PanelConfig | PanelGroupConfig): boolean => {
            if ('id' in panelOrGroup && panelOrGroup.id === MAIN_PANEL_ID) {
              return true;
            }
            if ('direction' in panelOrGroup) {
              // It's a group - check all panels recursively
              for (const panel of panelOrGroup.panels) {
                if (checkForMainPanel(panel)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          const checkGroupsForMainPanel = (groups: PanelGroupConfig[]): boolean => {
            for (const group of groups) {
              for (const panel of group.panels) {
                if (checkForMainPanel(panel)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          // Check if layout exists and has any panels at all
          const hasAnyPanels = state.currentLayout?.groups.some(group => 
            group.panels && group.panels.length > 0
          );
          
          // Main panel exists only if layout exists, has panels, and main panel is found
          const mainPanelExists = state.currentLayout && hasAnyPanels
            ? checkGroupsForMainPanel(state.currentLayout.groups)
            : false;

          if (DEBUG && import.meta.env.DEV) {
            console.log('[DEBUG ensureMainPanelExists] Main panel exists?', mainPanelExists);
          }

          if (!mainPanelExists) {
            if (DEBUG && import.meta.env.DEV) {
              console.log('[DEBUG ensureMainPanelExists] Main panel does not exist, creating...');
            }
            get().createMainPanel();
            if (DEBUG && import.meta.env.DEV) {
              console.log('[DEBUG ensureMainPanelExists] Main panel created');
            }
          } else {
            if (DEBUG && import.meta.env.DEV) {
              console.log('[DEBUG ensureMainPanelExists] Main panel already exists, no action needed');
            }
          }
        },

        /**
         * Get main panel ID constant
         */
        getMainPanelId: () => {
          return MAIN_PANEL_ID;
        },

        /**
         * Find a panel in the layout tree
         * Returns the panel's location including nested groups
         */
        findPanelInLayout: (panelId: string) => {
          const state = get();
          if (!state.currentLayout) return null;

          // Search through all groups
          for (let groupIndex = 0; groupIndex < state.currentLayout.groups.length; groupIndex++) {
            const group = state.currentLayout.groups[groupIndex];
            
            // Search in this group's panels
            for (let panelIndex = 0; panelIndex < group.panels.length; panelIndex++) {
              const panel = group.panels[panelIndex];
              
              // Check if it's the panel we're looking for
              if ('id' in panel && panel.id === panelId) {
                return {
                  groupIndex,
                  panelIndex,
                  group,
                  isNested: false,
                };
              }
              
              // Check if it's a nested group
              if ('direction' in panel) {
                const nestedGroup = panel as PanelGroupConfig;
                const nestedPanelIndex = nestedGroup.panels.findIndex(
                  p => 'id' in p && p.id === panelId
                );
                
                if (nestedPanelIndex !== -1) {
                  return {
                    groupIndex,
                    panelIndex, // Index of nested group within parent
                    group: nestedGroup, // The nested group containing the panel
                    isNested: true,
                    parentGroup: group, // The parent group containing the nested group
                    parentGroupIndex: groupIndex,
                    nestedPanelIndex, // Index of panel within nested group
                  };
                }
              }
            }
          }
          
          return null;
        },

        /**
         * Find all panels in the layout (recursively)
         * Returns array of panel configs
         */
        findAllPanels: (): PanelConfig[] => {
          const state = get();
          if (!state.currentLayout) return [];

          const panels: PanelConfig[] = [];

          const traverseGroup = (group: PanelGroupConfig) => {
            for (const panel of group.panels) {
              if ('id' in panel) {
                // It's a PanelConfig
                panels.push(panel);
              } else if ('direction' in panel) {
                // It's a nested PanelGroupConfig
                traverseGroup(panel);
              }
            }
          };

          for (const group of state.currentLayout.groups) {
            traverseGroup(group);
          }

          return panels;
        },

        /**
         * Remove a panel from the layout
         * Handles nested groups and cleans up empty groups
         * If removing main panel, transfers main panel status to another panel
         */
        removePanel: (panelId: string) => {
          const state = get();
          if (!state.currentLayout) return;

          const location = get().findPanelInLayout(panelId);
          if (!location) {
            console.warn(`Panel ${panelId} not found in layout`);
            return;
          }

          const isMainPanel = panelId === MAIN_PANEL_ID;
          
          // BEST PRACTICE: Prevent deletion of main panel if it's the only panel
          // This ensures there's always a main panel available for opening tabs
          // Similar to VS Code's behavior where you can't delete the last editor group
          if (isMainPanel) {
            // Find all panels in the layout (before removal)
            const findAllPanels = (groups: PanelGroupConfig[]): PanelConfig[] => {
              const panels: PanelConfig[] = [];
              const traverseGroup = (group: PanelGroupConfig) => {
                for (const panel of group.panels) {
                  if ('id' in panel) {
                    panels.push(panel);
                  } else if ('direction' in panel) {
                    traverseGroup(panel);
                  }
                }
              };
              for (const group of groups) {
                traverseGroup(group);
              }
              return panels;
            };
            
            const allPanels = findAllPanels(state.currentLayout.groups);
            const mainPanelOnly = allPanels.length === 1 && allPanels[0].id === MAIN_PANEL_ID;
            
            const DEBUG = false; // Set to true for debugging
            if (mainPanelOnly) {
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG removePanel] Cannot delete main panel - it is the only panel remaining');
                console.log('[DEBUG removePanel] This ensures users can always open tabs');
              }
              return; // Prevent deletion
            }
          }
          
          let tabGroupIdToTransfer: string | undefined;
          
          if (isMainPanel) {
            // Get the tab group ID from main panel to transfer
            tabGroupIdToTransfer = state.panelToTabGroupMap.get(MAIN_PANEL_ID);
          }
          
          // Find the panel being removed to get its tab group ID (for transfer if it's main panel)
          const panelToRemove = location.isNested && location.nestedPanelIndex !== undefined
            ? location.group.panels[location.nestedPanelIndex]
            : location.group.panels[location.panelIndex];
          
          const panelTabGroupId = ('id' in panelToRemove && panelToRemove.tabGroupId) 
            ? panelToRemove.tabGroupId 
            : undefined;

          // Remove from mapping
          set((state) => {
            const newMap = new Map(state.panelToTabGroupMap);
            newMap.delete(panelId);
            return { panelToTabGroupMap: newMap };
          });

          // Remove panel from layout
          const updatedGroups = [...state.currentLayout.groups];
          
          if (location.isNested && location.parentGroup && location.nestedPanelIndex !== undefined) {
            // Panel is in a nested group - need to update the nested group, then update parent
            const parentGroup = location.parentGroup;
            const nestedGroup = location.group;
            
            // Remove panel from nested group (use nestedPanelIndex, not panelIndex)
            const updatedNestedPanels = nestedGroup.panels.filter(
              (p, index) => index !== location.nestedPanelIndex
            );
            const updatedNestedSizes = [...nestedGroup.defaultSizes];
            updatedNestedSizes.splice(location.nestedPanelIndex, 1);
            
            // If nested group becomes empty, remove the entire nested group from parent
            if (updatedNestedPanels.length === 0) {
              const updatedParentPanels = parentGroup.panels.filter(
                (p, index) => index !== location.panelIndex
              );
              const updatedParentSizes = [...parentGroup.defaultSizes];
              updatedParentSizes.splice(location.panelIndex, 1);
              
              if (updatedParentPanels.length === 0) {
                // Parent group is now empty - remove it
                updatedGroups.splice(location.groupIndex, 1);
              } else {
                // Redistribute parent sizes
                const totalSize = updatedParentSizes.reduce((sum, size) => sum + size, 0);
                const normalizedSizes = updatedParentSizes.map(size => (size / totalSize) * 100);
                
                updatedGroups[location.groupIndex] = {
                  ...parentGroup,
                  panels: updatedParentPanels,
                  defaultSizes: normalizedSizes,
                };
              }
            } else if (updatedNestedPanels.length === 1) {
              // Nested group has only one panel - flatten it (replace nested group with the panel)
              const singlePanel = updatedNestedPanels[0];
              const updatedParentPanels = [...parentGroup.panels];
              updatedParentPanels[location.panelIndex] = singlePanel;
              
              // Keep parent sizes the same
              updatedGroups[location.groupIndex] = {
                ...parentGroup,
                panels: updatedParentPanels,
                defaultSizes: parentGroup.defaultSizes,
              };
            } else {
              // Keep nested group, just update it
              const totalSize = updatedNestedSizes.reduce((sum, size) => sum + size, 0);
              const normalizedSizes = updatedNestedSizes.map(size => (size / totalSize) * 100);
              
              const updatedNestedGroup: PanelGroupConfig = {
                ...nestedGroup,
                panels: updatedNestedPanels,
                defaultSizes: normalizedSizes,
              };
              
              // Update parent group with modified nested group
              const updatedParentPanels = [...parentGroup.panels];
              updatedParentPanels[location.panelIndex] = updatedNestedGroup;
              
              updatedGroups[location.groupIndex] = {
                ...parentGroup,
                panels: updatedParentPanels,
                defaultSizes: parentGroup.defaultSizes,
              };
            }
          } else {
            // Panel is in a top-level group
            const group = location.group;
            const updatedPanels = group.panels.filter(
              (p, index) => index !== location.panelIndex
            );
            
            // If group becomes empty, remove it
            if (updatedPanels.length === 0) {
              updatedGroups.splice(location.groupIndex, 1);
            } else {
              // Remove panel and adjust sizes
              const updatedSizes = [...group.defaultSizes];
              updatedSizes.splice(location.panelIndex, 1);
              
              // Redistribute sizes proportionally
              const totalSize = updatedSizes.reduce((sum, size) => sum + size, 0);
              const normalizedSizes = updatedSizes.map(size => (size / totalSize) * 100);
              
              updatedGroups[location.groupIndex] = {
                ...group,
                panels: updatedPanels,
                defaultSizes: normalizedSizes,
              };
            }
          }

          // Update layout
          let updatedLayout: PanelLayout = {
            ...state.currentLayout,
            groups: updatedGroups,
            updatedAt: new Date().toISOString(),
          };
          
          const DEBUG = false; // Set to true for debugging
          if (DEBUG && import.meta.env.DEV) {
            console.log('[DEBUG removePanel] After panel removal - updatedGroups length:', updatedGroups.length);
            console.log('[DEBUG removePanel] Updated groups:', updatedGroups.map(g => ({ id: g.id, panelCount: g.panels.length })));
          }

          // If removing main panel, transfer main panel status to another panel
          if (isMainPanel) {
            // Find all panels in the updated layout (after removal)
            const findPanelsInGroups = (groups: PanelGroupConfig[]): PanelConfig[] => {
              const panels: PanelConfig[] = [];
              const traverseGroup = (group: PanelGroupConfig) => {
                for (const panel of group.panels) {
                  if ('id' in panel) {
                    // It's a PanelConfig - exclude the one being removed
                    if (panel.id !== panelId) {
                      panels.push(panel);
                    }
                  } else if ('direction' in panel) {
                    // It's a nested PanelGroupConfig
                    traverseGroup(panel);
                  }
                }
              };
              for (const group of groups) {
                traverseGroup(group);
              }
              return panels;
            };
            
            const allPanels = findPanelsInGroups(updatedGroups);
            
            if (DEBUG && import.meta.env.DEV) {
              console.log('[DEBUG removePanel] Main panel removal - remaining panels:', allPanels.length);
              console.log('[DEBUG removePanel] Remaining panel IDs:', allPanels.map(p => p.id));
            }
            
            if (allPanels.length > 0) {
              // Find first available panel to become the new main panel
              const newMainPanel = allPanels[0];
              const newMainPanelId = newMainPanel.id;
              
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG removePanel] Transferring main panel status to:', newMainPanelId);
              }
              
              // Get the new main panel's existing tab group ID (if any)
              const newMainPanelTabGroupId = state.panelToTabGroupMap.get(newMainPanelId);
              
              // Get tab store to check if tab groups exist
              const tabStore = useTabStore.getState();
              
              // ALWAYS ensure main panel has a valid tab group
              // Priority: 1) New panel's existing tab group (if exists in store)
              //           2) Old main panel's tab group (if exists in store)
              //           3) Create new tab group
              let finalTabGroupId: string | undefined;
              
              // Try new panel's tab group first
              if (newMainPanelTabGroupId) {
                const tabGroup = tabStore.getTabGroup(newMainPanelTabGroupId);
                if (tabGroup) {
                  finalTabGroupId = newMainPanelTabGroupId;
                }
              }
              
              // Try old main panel's tab group if new panel doesn't have one
              if (!finalTabGroupId && tabGroupIdToTransfer) {
                const tabGroup = tabStore.getTabGroup(tabGroupIdToTransfer);
                if (tabGroup) {
                  finalTabGroupId = tabGroupIdToTransfer;
                }
              }
              
              // Create new tab group if neither exists
              if (!finalTabGroupId) {
                finalTabGroupId = tabStore.createTabGroup();
                console.log(`Created new tab group ${finalTabGroupId} for transferred main panel`);
              } else {
                console.log(`Using existing tab group ${finalTabGroupId} for transferred main panel`);
              }
              
              // Double-check: ensure tab group exists (should always be true at this point)
              const verifiedTabGroup = tabStore.getTabGroup(finalTabGroupId);
              if (!verifiedTabGroup) {
                // This shouldn't happen, but create a new one just in case
                console.error(`Tab group ${finalTabGroupId} doesn't exist after creation, creating new one`);
                finalTabGroupId = tabStore.createTabGroup();
              }
              
              // Update the panel ID in the layout (fully recursive)
              const updatePanelId = (groups: PanelGroupConfig[]): PanelGroupConfig[] => {
                return groups.map(group => ({
                  ...group,
                  panels: group.panels.map(panel => {
                    if ('id' in panel && panel.id === newMainPanelId) {
                      // Replace this panel's ID with MAIN_PANEL_ID
                      if (DEBUG && import.meta.env.DEV) {
                        console.log(`[DEBUG removePanel] Found panel ${newMainPanelId} at top level, updating to MAIN_PANEL_ID`);
                      }
                      return {
                        ...panel,
                        id: MAIN_PANEL_ID,
                        tabGroupId: finalTabGroupId, // Update tab group ID
                      };
                    } else if ('direction' in panel) {
                      // Recursively search nested groups (fully recursive)
                      const updateNestedPanel = (p: PanelConfig | PanelGroupConfig): PanelConfig | PanelGroupConfig => {
                        if ('id' in p && p.id === newMainPanelId) {
                          if (DEBUG && import.meta.env.DEV) {
                            console.log(`[DEBUG removePanel] Found panel ${newMainPanelId} in nested group, updating to MAIN_PANEL_ID`);
                          }
                          return {
                            ...p,
                            id: MAIN_PANEL_ID,
                            tabGroupId: finalTabGroupId,
                          };
                        } else if ('direction' in p) {
                          // Recursively process nested groups
                          return {
                            ...p,
                            panels: p.panels.map(updateNestedPanel),
                          };
                        }
                        return p;
                      };
                      return {
                        ...panel,
                        panels: panel.panels.map(updateNestedPanel),
                      };
                    }
                    return panel;
                  }),
                }));
              };
              
              updatedLayout = {
                ...updatedLayout,
                groups: updatePanelId(updatedGroups),
              };
              
              // ALWAYS update tab group mapping - main panel MUST have a tab group
              // (Tab group verification already done above at line 777)
              // Update both layout and mapping atomically to avoid race conditions
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG removePanel] Updating tab group mapping and layout atomically...');
                console.log('[DEBUG removePanel] Setting MAIN_PANEL_ID ->', finalTabGroupId);
                console.log('[DEBUG removePanel] Removing old mapping for:', newMainPanelId);
              }
              set((state) => {
                const newMap = new Map(state.panelToTabGroupMap);
                newMap.set(MAIN_PANEL_ID, finalTabGroupId);
                // Remove old mapping if it exists (only if different from final)
                if (newMainPanelId !== MAIN_PANEL_ID) {
                  newMap.delete(newMainPanelId);
                }
                if (DEBUG && import.meta.env.DEV) {
                  console.log('[DEBUG removePanel] New mapping state:', Array.from(newMap.entries()));
                }
                return { 
                  panelToTabGroupMap: newMap,
                  currentLayout: updatedLayout, // Update layout atomically with mapping
                };
              });
              
              // Verify the mapping was set correctly
              const verifyState = get();
              const verifyMapping = verifyState.panelToTabGroupMap.get(MAIN_PANEL_ID);
              const verifyLayout = verifyState.currentLayout;
              const mainPanelInLayout = verifyLayout?.groups.some(g => 
                g.panels.some(p => 'id' in p && p.id === MAIN_PANEL_ID)
              );
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG removePanel] Verification - MAIN_PANEL_ID mapping:', verifyMapping);
                console.log('[DEBUG removePanel] Verification - Main panel in layout?', mainPanelInLayout);
                console.log(`[DEBUG removePanel] Transferred main panel status from ${panelId} to ${newMainPanelId} with tab group ${finalTabGroupId}`);
              }
            } else {
              // No panels left - create a new main panel immediately
              // This ensures users can always open tabs
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG removePanel] No panels remaining - creating new main panel');
              }
              
              // Create a new main panel with a new tab group
              const tabStore = useTabStore.getState();
              const newTabGroupId = tabStore.createTabGroup();
              
              const newMainPanel: PanelConfig = {
                id: MAIN_PANEL_ID,
                component: 'editor',
                defaultSize: 100,
                minSize: 20,
                maxSize: 100,
                collapsible: false,
                collapsed: false,
                tabGroupId: newTabGroupId,
              };
              
              const newGroup: PanelGroupConfig = {
                id: crypto.randomUUID(),
                direction: 'horizontal',
                panels: [newMainPanel],
                defaultSizes: [100],
              };
              
              const newLayout: PanelLayout = {
                id: state.currentLayout?.id || crypto.randomUUID(),
                name: state.currentLayout?.name || 'Default Layout',
                groups: [newGroup],
                createdAt: state.currentLayout?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              
              // Update both layout and mapping atomically
              set((state) => {
                const newMap = new Map(state.panelToTabGroupMap);
                newMap.set(MAIN_PANEL_ID, newTabGroupId);
                if (DEBUG && import.meta.env.DEV) {
                  console.log('[DEBUG removePanel] Created new main panel with tab group:', newTabGroupId);
                }
                return { 
                  panelToTabGroupMap: newMap,
                  currentLayout: newLayout,
                };
              });
              if (DEBUG && import.meta.env.DEV) {
                console.log('[DEBUG removePanel] New main panel created - users can now open tabs');
              }
            }
          } else {
            // Not main panel - just update layout
            if (DEBUG && import.meta.env.DEV) {
              console.log('[DEBUG removePanel] Regular panel removal - updating layout');
            }
            set({ currentLayout: updatedLayout });
          }

          // Debounced save
          if (debouncedSaveLayout) {
            debouncedSaveLayout();
          }
        },
      };
    },
    {
      name: 'panel-store',
      version: 1,
      // Use custom storage to properly handle Maps and Sets
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          try {
            const parsed = JSON.parse(str);
            const parsedState = parsed.state || parsed;
            
            // Debug: Log what's being loaded
            console.log('[PanelStore] Loading from storage - panelToTabGroupMap array:', parsedState?.panelToTabGroupMap);
            
            // Convert arrays back to Maps and Sets
            const restored = {
              ...parsed,
              state: {
                ...parsedState,
                collapsedPanels: arrayToSet<string>(parsedState?.collapsedPanels || []),
                embeddedPanels: arrayToMap<string, string>(parsedState?.embeddedPanels || []),
                panelToTabGroupMap: arrayToMap<string, string>(parsedState?.panelToTabGroupMap || []),
              },
            };
            
            console.log('[PanelStore] Loaded - panelToTabGroupMap size:', restored.state.panelToTabGroupMap.size);
            console.log('[PanelStore] Loaded - panelToTabGroupMap entries:', Array.from(restored.state.panelToTabGroupMap.entries()));
            
            return restored;
          } catch (error) {
            console.error('[PanelStore] Error loading from storage:', error);
            return null;
          }
        },
        setItem: (name: string, value: any) => {
          try {
            const actualState = value.state || value;
            const panelToTabGroupMap = actualState.panelToTabGroupMap || new Map();
            const panelToTabGroupArray = mapToArray(panelToTabGroupMap);
            
            // Debug: Log what's being saved (only in dev mode and with DEBUG flag)
            const DEBUG_STORAGE = false; // Set to true for debugging storage saves
            if (DEBUG_STORAGE && import.meta.env.DEV) {
              console.log('[PanelStore] Saving to storage - panelToTabGroupMap size:', panelToTabGroupMap.size);
              console.log('[PanelStore] Saving to storage - panelToTabGroupMap array:', panelToTabGroupArray);
            }
            
            const serialized = {
              ...value,
              state: {
                ...actualState,
                collapsedPanels: setToArray(actualState.collapsedPanels || new Set()),
                embeddedPanels: mapToArray(actualState.embeddedPanels || new Map()),
                panelToTabGroupMap: panelToTabGroupArray,
              },
            };
            
            localStorage.setItem(name, JSON.stringify(serialized));
          } catch (error) {
            console.error('[PanelStore] Error saving to storage:', error);
          }
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[PanelStore] Error rehydrating from storage:', error);
            return;
          }
          
          // Ensure Maps and Sets are properly initialized after rehydration
          if (state) {
            // Double-check that Maps and Sets are actually Map/Set instances
            // (deserialize should have already converted them, but be safe)
            if (!(state.collapsedPanels instanceof Set)) {
              state.collapsedPanels = arrayToSet<string>(state.collapsedPanels);
            }
            if (!(state.embeddedPanels instanceof Map)) {
              state.embeddedPanels = arrayToMap<string, string>(state.embeddedPanels);
            }
            if (!(state.panelToTabGroupMap instanceof Map)) {
              state.panelToTabGroupMap = arrayToMap<string, string>(state.panelToTabGroupMap);
            }
            
            // Log what was restored for debugging
            console.log('[PanelStore] Rehydrated - Layout exists:', !!state.currentLayout);
            console.log('[PanelStore] Rehydrated - Panel mappings:', state.panelToTabGroupMap.size);
            console.log('[PanelStore] Rehydrated - Panel mappings entries:', Array.from(state.panelToTabGroupMap.entries()));
            
            // Don't call ensureMainPanelExists here - let App.tsx handle initialization
            // to avoid race conditions with state rehydration
          }
        };
      },
    }
  )
);

