# Technical Specification: State Management System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The State Management System provides global state management for Nexus Overseer using Zustand. It manages application state, UI state, project state, and synchronization between frontend and backend. The system ensures consistent state across components and windows.

**Key Features:**
- Global state management with Zustand
- State persistence
- State synchronization (frontend-backend)
- Window state management
- Panel state management
- Real-time state updates

**Purpose:**
- Provide centralized state management
- Enable state sharing between components
- Persist state across sessions
- Synchronize state between frontend and backend

---

## System Architecture

### High-Level Design

The State Management System consists of:

1. **Zustand Stores:** Individual stores for different state domains
2. **State Persistence:** Saves and loads state
3. **State Synchronization:** Syncs state between frontend and backend
4. **State Middleware:** Middleware for persistence, logging, etc.

### Store Structure

```
StateManagement
├── projectStore (Project state)
├── editorStore (Editor state)
├── chatStore (Chat state)
├── taskStore (Task state)
├── panelStore (Panel state)
├── windowStore (Window state)
└── uiStore (UI state)
```

---

## Data Structures

### Frontend (TypeScript)

**Store Structure:**
```typescript
// Each store follows this pattern:
interface StoreState {
  // State properties
  data: DataType;
  loading: boolean;
  error: Error | null;
  
  // Actions
  setData: (data: DataType) => void;
  updateData: (updates: Partial<DataType>) => void;
  reset: () => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
}
```

**State Persistence:**
```typescript
interface PersistedState {
  version: string;
  timestamp: string;
  stores: {
    [storeName: string]: any;
  };
}
```

---

## Core Stores

### projectStore.ts

**Purpose:** Manages project state.

**State:**
```typescript
interface ProjectStore {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
  createProject: (name: string, path: string) => Promise<Project>;
  openProject: (projectId: string) => Promise<void>;
}
```

### editorStore.ts

**Purpose:** Manages code editor state (files tracked via tab system).

**State:**
```typescript
interface EditorStore {
  // File state (tracked via tab system)
  fileToTabMap: Map<string, string>; // File path -> Tab ID
  tabToFileMap: Map<string, string>; // Tab ID -> File path
  fileContent: Map<string, string>; // File path -> content
  fileViewState: Map<string, EditorViewState>; // File path -> view state (cursor, scroll, etc.)
  
  // Editor state
  activeFileId: string | null; // Currently active file (from active tab)
  editorSettings: EditorSettings;
  
  // Actions
  openFile: (path: string) => Promise<void>; // Creates tab in main tab system
  closeFile: (fileId: string) => void; // Removes tab from main tab system
  setActiveFile: (fileId: string) => void; // Sets active tab in tab system
  updateFileContent: (fileId: string, content: string) => void; // Updates content, marks tab as modified
  saveFile: (fileId: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;
  reloadFile: (fileId: string) => Promise<void>;
  getFileFromTab: (tabId: string) => string | null; // Get file path from tab ID
  getTabFromFile: (filePath: string) => string | null; // Get tab ID from file path
}
```

### chatStore.ts

**Purpose:** Manages chat state.

**State:**
```typescript
interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  inputValue: string;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateStreamingMessage: (messageId: string, content: string) => void;
  clearChat: () => void;
}
```

### taskStore.ts

**Purpose:** Manages task scheduler state.

**State:**
```typescript
interface TaskStore {
  taskSets: TaskSet[];
  activeTaskSetId: string | null;
  currentTaskId: string | null;
  
  // Actions
  loadTaskSets: () => Promise<void>;
  createTaskSet: (title: string) => Promise<TaskSet>;
  startTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
}
```

### panelStore.ts

**Purpose:** Manages panel layout state, tab groups, and panel customization.

**State:**
```typescript
interface PanelStore {
  // Layout
  currentLayout: PanelLayout;
  tabGroups: TabGroup[];
  
  // Panel state
  panelSizes: Record<string, number>;
  collapsedPanels: Set<string>;
  embeddedPanels: Map<string, string>; // Panel ID -> parent panel ID
  activePanel: string | null;
  
  // Tab state
  activeTabGroups: Record<string, string>; // Tab group ID -> active tab ID
  tabOrder: Record<string, string[]>; // Tab group ID -> tab IDs in order
  
  // Actions - Panels
  setPanelSize: (panelId: string, size: number) => void;
  setPanelSizes: (sizes: Record<string, number>) => void;
  togglePanelCollapse: (panelId: string) => void;
  embedPanel: (panelId: string, parentPanelId: string) => void;
  unembedPanel: (panelId: string) => void;
  setActivePanel: (panelId: string) => void;
  
  // Actions - Tabs
  addTab: (tabGroupId: string, tab: Tab) => void;
  removeTab: (tabGroupId: string, tabId: string) => void;
  moveTab: (tabId: string, fromGroupId: string, toGroupId: string) => void;
  setActiveTab: (tabGroupId: string, tabId: string) => void;
  reorderTabs: (tabGroupId: string, tabIds: string[]) => void;
  
  // Actions - Layout
  saveLayout: (name?: string) => Promise<void>;
  loadLayout: (layoutId: string) => Promise<void>;
  resetLayout: () => void;
  createTabGroup: () => string; // Returns new tab group ID
  removeTabGroup: (tabGroupId: string) => void;
}
```

### windowStore.ts

**Purpose:** Manages window state.

**State:**
```typescript
interface WindowStore {
  windows: WindowConfig[];
  mainWindowId: string;
  activeWindowId: string | null;
  
  // Actions
  createWindow: (config: WindowConfig) => Promise<string>;
  closeWindow: (windowId: string) => Promise<void>;
  setActiveWindow: (windowId: string) => void;
}
```

### uiStore.ts

**Purpose:** Manages UI state.

**State:**
```typescript
interface UIStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

---

## Algorithms

### State Persistence Flow

1. State changes in store
2. Middleware intercepts change
3. Serialize state
4. Save to localStorage or file (debounced)
5. On app load:
   - Load persisted state
   - Restore to stores
   - Validate state
   - Fall back to defaults if invalid

### State Synchronization Flow

1. Frontend state changes
2. Store action called
3. If needs backend sync:
   - Call Tauri command
   - Backend updates state
   - Backend returns updated state
   - Frontend updates store
4. Or: Backend state changes
5. Backend emits Tauri event
6. Frontend listens to event
7. Frontend updates store

### State Update Flow

1. Component calls store action
2. Store updates state
3. Subscribed components re-render
4. Middleware processes update (persistence, logging)
5. If needed, sync with backend

---

## Integration Points

### With All Components

**State Access:**
- All components can access stores
- Components subscribe to store changes
- Components update state via actions

### With Backend

**State Synchronization:**
- Frontend state synced with backend via Tauri commands
- Backend state synced with frontend via Tauri events
- Critical state persisted on backend

### With Persistence

**State Persistence:**
- State persisted to localStorage or files
- State restored on app load
- State validated on load

---

## Performance Considerations

### State Updates

1. **Selective Updates:** Only update changed parts
2. **Batching:** Batch multiple updates
3. **Memoization:** Memoize derived state
4. **Lazy Loading:** Load state on demand

### Persistence

1. **Debouncing:** Debounce persistence writes
2. **Selective Persistence:** Only persist necessary state
3. **Compression:** Compress large state if needed

---

## Security Considerations

1. **State Validation:** Validate all state updates
2. **Sanitization:** Sanitize state before persistence
3. **Access Control:** Control who can modify state
4. **State Encryption:** Encrypt sensitive state if needed

---

## Error Handling

### Error Types

1. **State Corruption:** State is corrupted
2. **Persistence Error:** Failed to save/load
3. **Sync Error:** Failed to sync with backend
4. **Validation Error:** State validation failed

### Error Handling Strategy

1. **Validation:** Validate state before applying
2. **Recovery:** Attempt to recover from errors
3. **Fallback:** Fall back to defaults on error
4. **Logging:** Log errors for debugging

---

## Testing Checklist

### Unit Tests

- [ ] Store actions
- [ ] State updates
- [ ] State persistence
- [ ] State synchronization
- [ ] Error handling

### Integration Tests

- [ ] Store integration with components
- [ ] Backend synchronization
- [ ] State persistence
- [ ] Multi-window state sync

### User Acceptance Tests

- [ ] State persists across sessions
- [ ] State syncs correctly
- [ ] Performance is acceptable
- [ ] Errors handled gracefully

---

## Research Notes

### Zustand State Management

**Research Findings:**
- Zustand is lightweight and performant
- Simple API, easy to use
- Good TypeScript support
- Supports middleware (persistence, etc.)
- Active development

**Sources:**
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- Zustand documentation

**Implementation Approach:**
- Use Zustand for all state management
- Create separate stores for different domains
- Use middleware for persistence
- Use TypeScript for type safety

**Why This Approach:**
- Lightweight and performant
- Simple API
- Good TypeScript support
- Standard React pattern
- Easy to use and maintain

### State Persistence Patterns

**Research Findings:**
- State persistence improves UX
- localStorage is simple for small state
- Files are better for large or complex state
- Validation is important

**Sources:**
- General state management patterns
- React state persistence patterns

**Implementation Approach:**
- Use Zustand persist middleware
- Store in localStorage for simple state
- Store in files for complex state
- Validate on load

**Why This Approach:**
- Improves user experience
- Simple to implement
- Standard pattern
- Reliable

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Install Zustand
3. ⏳ Create store structure
4. ⏳ Implement individual stores
5. ⏳ Implement persistence middleware
6. ⏳ Implement state synchronization
7. ⏳ Integrate with components
8. ⏳ Testing and refinement

---

## Notes

- State management is foundational for the application
- Zustand provides simple, performant solution
- State persistence is important for UX
- State synchronization ensures consistency
- Keep stores focused and modular
- Performance is important for smooth experience

