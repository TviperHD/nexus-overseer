/**
 * Panel configuration interface
 * Defines a single resizable panel
 */
export interface PanelConfig {
  id: string;                    // Panel ID
  component: string;             // Component to render (editor, chat, etc.)
  defaultSize: number;          // Default size percentage (0-100)
  minSize: number;              // Minimum size percentage
  maxSize: number;              // Maximum size percentage
  collapsible: boolean;         // Can be collapsed
  collapsed: boolean;          // Is collapsed
  embeddedIn?: string;          // ID of panel this is embedded in
  toggleButtonPosition?: 'top' | 'bottom' | 'left' | 'right';
  tabGroupId?: string;         // Associated tab group ID
}

/**
 * Panel group configuration interface
 * Defines a group of resizable panels (horizontal or vertical)
 * Supports nested groups for mixed orientations
 */
export interface PanelGroupConfig {
  id: string;                    // Panel group ID (required for react-resizable-panels)
  direction: 'horizontal' | 'vertical';
  panels: (PanelConfig | PanelGroupConfig)[];  // Can contain panels or nested groups
  defaultSizes: number[];       // Default sizes for all panels/groups
  tabGroupId?: string;         // Associated tab group ID
}

/**
 * Panel layout interface
 * Defines the complete panel layout structure
 * Note: tabGroups are NOT stored here - reference from tabStore via panelToTabGroupMap
 */
export interface PanelLayout {
  id: string;                    // Layout ID
  name: string;                  // Layout name (optional)
  // Note: tabGroups are NOT stored here - reference from tabStore via panelToTabGroupMap
  groups: PanelGroupConfig[];    // Panel groups
  createdAt: string;
  updatedAt: string;
}

/**
 * Minimum panel sizes in pixels (from technical spec)
 */
export const MIN_PANEL_SIZES = {
  FILE_TREE: 180,      // File Tree minimum width
  CHAT: 300,           // Chat Interface minimum width
  EDITOR: 400,         // Code Editor minimum width
} as const;

