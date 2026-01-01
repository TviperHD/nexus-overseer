/**
 * Default layout configuration utility
 * Creates the default panel layout for Nexus Overseer
 */

import type { PanelLayout, PanelGroupConfig, PanelConfig } from '../types/panel';
import { MIN_PANEL_SIZES } from '../types/panel';

/**
 * Calculate minimum size percentage based on container width
 * @param minPixels - Minimum size in pixels
 * @param containerWidth - Container width in pixels (default: 1920px for typical screen)
 * @returns Minimum size as percentage (0-100)
 */
function calculateMinSizePercent(minPixels: number, containerWidth: number = 1920): number {
  return Math.min((minPixels / containerWidth) * 100, 10); // Cap at 10% to avoid issues
}

/**
 * Create default panel layout
 * @returns Default PanelLayout configuration
 */
export function createDefaultLayout(): PanelLayout {
  // Panel IDs
  const FILE_TREE_PANEL_ID = 'file-tree-panel';
  const CHAT_PANEL_ID = 'chat-panel';
  const EDITOR_PANEL_ID = 'editor-panel';
  const MAIN_PANEL_GROUP_ID = 'main-panel-group';

  // Tab group IDs (will be created by tabStore)
  const EDITOR_TAB_GROUP_ID = 'editor-tab-group';

  // Calculate minimum sizes as percentages (assuming 1920px width)
  const fileTreeMinSize = calculateMinSizePercent(MIN_PANEL_SIZES.FILE_TREE);
  const chatMinSize = calculateMinSizePercent(MIN_PANEL_SIZES.CHAT);
  const editorMinSize = calculateMinSizePercent(MIN_PANEL_SIZES.EDITOR);

  // Panel configurations
  const panels: PanelConfig[] = [
    {
      id: FILE_TREE_PANEL_ID,
      component: 'file-tree',
      defaultSize: 20, // 20% of window width
      minSize: fileTreeMinSize,
      maxSize: 40, // Max 40% to prevent takeover
      collapsible: true,
      collapsed: false,
    },
    {
      id: CHAT_PANEL_ID,
      component: 'chat',
      defaultSize: 30, // 30% of window width
      minSize: chatMinSize,
      maxSize: 50, // Max 50%
      collapsible: true,
      collapsed: false,
    },
    {
      id: EDITOR_PANEL_ID,
      component: 'editor',
      defaultSize: 50, // 50% of window width
      minSize: editorMinSize,
      maxSize: 90, // Max 90%
      collapsible: false,
      collapsed: false,
      tabGroupId: EDITOR_TAB_GROUP_ID,
    },
  ];

  // Panel group configuration
  const panelGroup: PanelGroupConfig = {
    id: MAIN_PANEL_GROUP_ID,
    direction: 'horizontal',
    panels,
    defaultSizes: [20, 30, 50], // File Tree: 20%, Chat: 30%, Editor: 50%
  };

  // Create layout
  const layout: PanelLayout = {
    id: 'default-layout',
    name: 'Default Layout',
    groups: [panelGroup],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return layout;
}

/**
 * Get panel-to-tab-group mappings for default layout
 * @returns Map of panel ID to tab group ID
 */
export function getDefaultPanelTabGroupMappings(): Map<string, string> {
  const FILE_TREE_PANEL_ID = 'file-tree-panel';
  const CHAT_PANEL_ID = 'chat-panel';
  const EDITOR_PANEL_ID = 'editor-panel';
  const EDITOR_TAB_GROUP_ID = 'editor-tab-group';

  const mappings = new Map<string, string>();
  // Only editor panel has a tab group
  mappings.set(EDITOR_PANEL_ID, EDITOR_TAB_GROUP_ID);
  
  return mappings;
}

