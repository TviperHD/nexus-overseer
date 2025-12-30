/**
 * Tab interface for tab system
 * Supports both file tabs and panel tabs
 */
export interface Tab {
  id: string;                    // Tab ID (UUID)
  type: 'panel' | 'file';        // Tab type
  label: string;                 // Tab label (panel name or file name)
  component?: string;            // Component type (for panels: 'editor', 'chat', etc.)
  filePath?: string;             // File path (for file tabs)
  isModified?: boolean;          // Has unsaved changes (for files)
  isPinned?: boolean;            // Tab is pinned
  icon?: string;                 // Tab icon (optional)
}

/**
 * Tab group interface
 * Contains multiple tabs and tracks active tab
 */
export interface TabGroup {
  id: string;                    // Tab group ID (UUID)
  tabs: Tab[];                   // Tabs in this group
  activeTabId: string | null;    // Currently active tab
  direction?: 'horizontal' | 'vertical'; // For nested groups (future use)
}

