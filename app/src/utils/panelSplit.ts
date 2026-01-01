/**
 * Panel Split Utility
 * 
 * Handles panel splitting logic when tabs are dragged to panel edges.
 * Extracted from DndTabContext for better maintainability and testability.
 */

import type { PanelConfig, PanelGroupConfig, PanelLayout } from '@/types/panel';
import { MAIN_PANEL_ID } from '@/stores/panelStore';

/**
 * Split edge type
 */
export type SplitEdge = 'top' | 'right' | 'bottom' | 'left';

/**
 * Split operation result
 */
export interface SplitResult {
  success: boolean;
  error?: string;
  updatedLayout?: PanelLayout;
  newPanelId?: string;
  newPanelIndex?: number;
}

/**
 * Find panel in layout recursively
 */
function findPanelInLayout(
  layout: PanelLayout,
  panelId: string
): {
  groupIndex: number;
  panelIndex: number;
  group: PanelGroupConfig;
  panel: PanelConfig;
} | null {
  for (let groupIndex = 0; groupIndex < layout.groups.length; groupIndex++) {
    const group = layout.groups[groupIndex];
    
    // Check if panel is directly in this group
    for (let panelIndex = 0; panelIndex < group.panels.length; panelIndex++) {
      const panel = group.panels[panelIndex];
      
      if ('id' in panel && panel.id === panelId) {
        return {
          groupIndex,
          panelIndex,
          group,
          panel,
        };
      }
      
      // Check nested groups
      if ('direction' in panel) {
        const nestedResult = findPanelInNestedGroup(panel, panelId);
        if (nestedResult) {
          return {
            groupIndex,
            panelIndex,
            group,
            panel: nestedResult.panel,
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Find panel in nested group
 */
function findPanelInNestedGroup(
  group: PanelGroupConfig,
  panelId: string
): { panel: PanelConfig } | null {
  for (const panel of group.panels) {
    if ('id' in panel && panel.id === panelId) {
      return { panel };
    }
    if ('direction' in panel) {
      const result = findPanelInNestedGroup(panel, panelId);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

/**
 * Check if main panel exists in layout
 */
function checkMainPanelExists(layout: PanelLayout): boolean {
  const checkGroup = (group: PanelGroupConfig): boolean => {
    for (const panel of group.panels) {
      if ('id' in panel && panel.id === MAIN_PANEL_ID) {
        return true;
      }
      if ('direction' in panel) {
        if (checkGroup(panel)) {
          return true;
        }
      }
    }
    return false;
  };
  
  return layout.groups.some(checkGroup);
}

/**
 * Split a panel by creating a new panel adjacent to it
 * 
 * @param layout - Current panel layout
 * @param targetPanelId - ID of panel to split
 * @param edge - Edge where new panel should be created (top/right/bottom/left)
 * @param newPanel - New panel configuration to insert
 * @param newTabGroupId - Tab group ID for the new panel
 * @returns Split operation result
 */
export function splitPanel(
  layout: PanelLayout,
  targetPanelId: string,
  edge: SplitEdge,
  newPanel: PanelConfig,
  newTabGroupId: string
): SplitResult {
  try {
    // Validate inputs
    if (!layout || !layout.groups || layout.groups.length === 0) {
      return {
        success: false,
        error: 'Layout is empty or invalid',
      };
    }
    
    if (!targetPanelId || !newPanel || !newTabGroupId) {
      return {
        success: false,
        error: 'Missing required parameters',
      };
    }
    
    // Find target panel in layout
    const location = findPanelInLayout(layout, targetPanelId);
    if (!location) {
      return {
        success: false,
        error: `Target panel ${targetPanelId} not found in layout`,
      };
    }
    
    const { group, groupIndex, panelIndex } = location;
    
    // Determine split direction and position
    // In react-resizable-panels:
    // - 'horizontal' = side-by-side (left/right)
    // - 'vertical' = stacked top-to-bottom
    const splitDirection = (edge === 'top' || edge === 'bottom') 
      ? 'vertical'  // Top/bottom = vertical stacking
      : 'horizontal'; // Left/right = horizontal side-by-side
    
    const insertPosition = (edge === 'top' || edge === 'left') 
      ? 'before' 
      : 'after';
    
    // Check if main panel exists (for new panel ID assignment)
    const mainPanelExists = checkMainPanelExists(layout);
    if (!mainPanelExists && newPanel.id !== MAIN_PANEL_ID) {
      // If no main panel exists, use MAIN_PANEL_ID for the new panel
      newPanel.id = MAIN_PANEL_ID;
    }
    
    // Set tab group ID on new panel
    newPanel.tabGroupId = newTabGroupId;
    
    // Create updated groups array
    const updatedGroups = [...layout.groups];
    
    // Handle split based on group direction
    if (group.direction === splitDirection) {
      // Same direction - insert panel directly into existing group
      const newPanels = [...group.panels];
      const newSizes = [...group.defaultSizes];
      
      // Calculate new sizes (50/50 split of existing panel's space)
      const existingSize = newSizes[panelIndex];
      const newSize = existingSize / 2;
      const remainingSize = existingSize / 2;
      
      // Update existing panel size
      newSizes[panelIndex] = remainingSize;
      
      // Insert new panel and size
      const insertIndex = insertPosition === 'before' ? panelIndex : panelIndex + 1;
      newPanels.splice(insertIndex, 0, newPanel);
      newSizes.splice(insertIndex, 0, newSize);
      
      // Update the group
      updatedGroups[groupIndex] = {
        ...group,
        panels: newPanels,
        defaultSizes: newSizes,
      };
    } else {
      // Different direction - create nested group structure
      // Strategy: Create a nested group containing the target panel and new panel
      // Then replace the target panel in the original group with this nested group
      const targetPanel = group.panels[panelIndex];
      
      // Validate target panel is a PanelConfig (not a nested group)
      if (!('id' in targetPanel)) {
        return {
          success: false,
          error: 'Cannot split a nested group - target must be a leaf panel',
        };
      }
      
      // Create nested group with split direction
      const nestedGroup: PanelGroupConfig = {
        id: crypto.randomUUID(),
        direction: splitDirection,
        panels: insertPosition === 'before' 
          ? [newPanel, targetPanel]  // New panel first (top/left)
          : [targetPanel, newPanel], // Target panel first, then new panel (bottom/right)
        defaultSizes: [50, 50], // 50/50 split within nested group
      };
      
      // Replace target panel with nested group
      const newPanels = [...group.panels];
      newPanels[panelIndex] = nestedGroup;
      
      // Keep original sizes (nested group will handle its own internal sizing)
      const newSizes = [...group.defaultSizes];
      
      // Update the group
      updatedGroups[groupIndex] = {
        ...group,
        panels: newPanels,
        defaultSizes: newSizes,
      };
    }
    
    // Create updated layout
    const updatedLayout: PanelLayout = {
      ...layout,
      groups: updatedGroups,
      updatedAt: new Date().toISOString(),
    };
    
    // Find new panel index for return value
    const newLocation = findPanelInLayout(updatedLayout, newPanel.id);
    const newPanelIndex = newLocation ? newLocation.panelIndex : undefined;
    
    return {
      success: true,
      updatedLayout,
      newPanelId: newPanel.id,
      newPanelIndex,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during panel split',
    };
  }
}

/**
 * Validate split operation before execution
 */
export function validateSplitOperation(
  layout: PanelLayout | null,
  targetPanelId: string,
  edge: SplitEdge
): { valid: boolean; error?: string } {
  if (!layout) {
    return {
      valid: false,
      error: 'Layout does not exist',
    };
  }
  
  if (!targetPanelId) {
    return {
      valid: false,
      error: 'Target panel ID is required',
    };
  }
  
  if (!['top', 'right', 'bottom', 'left'].includes(edge)) {
    return {
      valid: false,
      error: 'Invalid edge type',
    };
  }
  
  const location = findPanelInLayout(layout, targetPanelId);
  if (!location) {
    return {
      valid: false,
      error: `Target panel ${targetPanelId} not found`,
    };
  }
  
  // Check if target panel is a leaf (not a nested group)
  const targetPanel = location.panel;
  if (!('id' in targetPanel)) {
    return {
      valid: false,
      error: 'Cannot split a nested group - target must be a leaf panel',
    };
  }
  
  return {
    valid: true,
  };
}

