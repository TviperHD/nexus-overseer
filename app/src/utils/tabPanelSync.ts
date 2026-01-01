/**
 * Tab-Panel Synchronization Utility
 * 
 * Provides atomic-like operations for synchronizing tab store and panel store
 * during drag operations and tab group lifecycle management.
 * 
 * This utility helps ensure tab groups and panels stay synchronized,
 * validates state before operations, and provides rollback on errors.
 */

import type { TabGroup } from '@/types/tab';
import type { PanelLayout } from '@/types/panel';

/**
 * Previous state snapshot for rollback
 */
interface StateSnapshot {
  tabGroups: TabGroup[];
  layout: PanelLayout | null;
  panelToTabGroupMap: Map<string, string>;
}

/**
 * Create a snapshot of current state for rollback
 */
export function createStateSnapshot(
  tabGroups: TabGroup[],
  layout: PanelLayout | null,
  panelToTabGroupMap: Map<string, string>
): StateSnapshot {
  return {
    tabGroups: JSON.parse(JSON.stringify(tabGroups)), // Deep clone
    layout: layout ? JSON.parse(JSON.stringify(layout)) : null, // Deep clone
    panelToTabGroupMap: new Map(panelToTabGroupMap), // Clone map
  };
}

/**
 * Validate tab group exists
 */
export function validateTabGroup(tabGroups: TabGroup[], tabGroupId: string): boolean {
  return tabGroups.some(g => g.id === tabGroupId);
}

/**
 * Validate panel exists in layout
 */
export function validatePanelInLayout(
  layout: PanelLayout | null,
  panelId: string
): boolean {
  if (!layout) return false;
  
  const checkPanel = (panel: any): boolean => {
    if ('id' in panel && panel.id === panelId) {
      return true;
    }
    if ('direction' in panel) {
      return panel.panels.some(checkPanel);
    }
    return false;
  };
  
  return layout.groups.some(group => 
    group.panels.some(checkPanel)
  );
}

/**
 * Validate tab group has no orphaned tabs
 * (All tabs should belong to a valid tab group)
 */
export function validateNoOrphanedTabs(
  tabGroups: TabGroup[],
  panelToTabGroupMap: Map<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check that all tab groups referenced in panel mapping exist
  for (const [panelId, tabGroupId] of panelToTabGroupMap.entries()) {
    if (!validateTabGroup(tabGroups, tabGroupId)) {
      errors.push(`Panel ${panelId} references non-existent tab group ${tabGroupId}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate no orphaned groups
 * (All tab groups should have an associated panel, except during transitions)
 */
export function validateNoOrphanedGroups(
  tabGroups: TabGroup[],
  panelToTabGroupMap: Map<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const mappedGroupIds = new Set(panelToTabGroupMap.values());
  
  // Check for tab groups without panels
  // Note: This is a warning, not an error, as groups can exist temporarily
  // during drag operations before panels are created
  for (const group of tabGroups) {
    if (!mappedGroupIds.has(group.id)) {
      // This is a warning, not an error - groups can exist temporarily
      // Only log in dev mode
      if (import.meta.env.DEV) {
        console.warn(`Tab group ${group.id} has no associated panel (may be temporary)`);
      }
    }
  }
  
  return {
    valid: true, // Always valid - orphaned groups are warnings, not errors
    errors,
  };
}

/**
 * Validate state consistency
 */
export function validateStateConsistency(
  tabGroups: TabGroup[],
  layout: PanelLayout | null,
  panelToTabGroupMap: Map<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate no orphaned tabs
  const orphanedTabsCheck = validateNoOrphanedTabs(tabGroups, panelToTabGroupMap);
  if (!orphanedTabsCheck.valid) {
    errors.push(...orphanedTabsCheck.errors);
  }
  
  // Validate no orphaned groups (warnings only)
  const orphanedGroupsCheck = validateNoOrphanedGroups(tabGroups, panelToTabGroupMap);
  if (orphanedGroupsCheck.errors.length > 0 && import.meta.env.DEV) {
    console.warn('Orphaned groups detected:', orphanedGroupsCheck.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Operation result
 */
export interface SyncOperationResult {
  success: boolean;
  error?: string;
  rollback?: () => void;
}

/**
 * Execute a synchronized operation with validation and rollback
 */
export function executeSynchronizedOperation(
  operation: () => void,
  getState: () => {
    tabGroups: TabGroup[];
    layout: PanelLayout | null;
    panelToTabGroupMap: Map<string, string>;
  },
  setState: (snapshot: StateSnapshot) => void
): SyncOperationResult {
  // Create snapshot before operation
  const state = getState();
  const snapshot = createStateSnapshot(
    state.tabGroups,
    state.layout,
    state.panelToTabGroupMap
  );
  
  // Create rollback function
  const rollback = () => {
    setState(snapshot);
  };
  
  try {
    // Execute operation
    operation();
    
    // Validate state after operation
    const newState = getState();
    const validation = validateStateConsistency(
      newState.tabGroups,
      newState.layout,
      newState.panelToTabGroupMap
    );
    
    if (!validation.valid) {
      // Rollback on validation failure
      rollback();
      return {
        success: false,
        error: `State validation failed: ${validation.errors.join(', ')}`,
        rollback,
      };
    }
    
    return {
      success: true,
      rollback,
    };
  } catch (error) {
    // Rollback on error
    rollback();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      rollback,
    };
  }
}

