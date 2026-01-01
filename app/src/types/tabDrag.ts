/**
 * Tab drag and drop types
 * Used for tab dragging functionality with dnd-kit
 */

/**
 * Drop zone type
 * Defines where a tab can be dropped
 */
export type DropZoneType = 'tab-bar' | 'top' | 'right' | 'bottom' | 'left' | 'empty-canvas';

/**
 * Tab drag data
 * Information about the tab being dragged
 */
export interface TabDragData {
  type: 'tab';
  tabId: string;
  tabGroupId: string;
  tabLabel: string;
  tabType: 'file' | 'panel';
  filePath?: string;
}

/**
 * Drop zone data
 * Information about an active drop zone
 */
export interface DropZoneData {
  type: DropZoneType;
  targetTabGroupId?: string; // For 'tab-bar' type
  targetPanelId?: string; // For edge types (top/right/bottom/left)
  insertIndex?: number; // For 'tab-bar' type - insertion position
  position: { x: number; y: number; width: number; height: number };
}

