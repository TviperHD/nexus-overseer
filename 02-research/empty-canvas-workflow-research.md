# Empty Canvas Workflow Research

**Date:** 2025-12-30  
**Status:** Research Complete  
**Purpose:** Research and design empty canvas workflow with top bar dropdown for opening tabs

---

## Overview

This document researches the implementation approach for starting with an empty canvas, allowing users to open tabs via a top bar dropdown, and then enabling drag-and-drop to create new panels. This is a different workflow from the default layout approach currently in Phase 1.4.

---

## User Workflow Requirements

### Initial State
- **Empty Canvas:** Application starts with no panels visible (or just one empty main panel)
- **Top Bar:** Contains dropdown menu with available tab types
- **Main Panel:** Designated panel where tabs open by default
- **Tab Opening:** Selecting from dropdown opens tab in main panel

### Tab Opening Flow
1. User clicks dropdown in top bar
2. User selects a tab type (e.g., "Code Editor", "Chat", "File Tree", "Task Scheduler")
3. Tab opens in the main panel
4. If main panel doesn't exist, it's created automatically
5. Tab becomes active in the main panel's tab group

### Panel Creation Flow
1. User drags a tab from main panel
2. User drags to empty space or edge of existing panel
3. New panel is created dynamically
4. Tab is moved to new panel
5. Layout updates with new panel

---

## Research Findings

### 1. Empty Canvas Pattern

**Best Practices:**
- Start with minimal UI - just top bar and empty canvas
- Show helpful empty state message: "Select a tab from the menu to get started"
- Main panel created on-demand when first tab is opened
- No pre-configured panels unless user has saved layout

**Implementation Approach:**
- Check if saved layout exists on app start
- If no saved layout, start with empty canvas
- Create main panel when first tab is opened
- Main panel ID: `'main-panel'` (constant)

### 2. Top Bar Dropdown Menu

**Design Pattern:**
- Top bar fixed at top of window (height: 40-50px)
- Dropdown button on left or center: "Open Tab" or "New Tab"
- Dropdown menu shows available tab types:
  - Code Editor
  - Chat Interface
  - File Tree
  - Task Scheduler
  - Settings (optional)
- Each option opens corresponding tab in main panel

**Implementation:**
- Use standard HTML `<select>` or custom dropdown component
- Position: Top-left or top-center of window
- Style: Match design system (dark theme)
- Accessibility: Keyboard navigation support

### 3. Main Panel Concept

**Definition:**
- **Main Panel:** The primary panel where tabs open by default
- **Panel ID:** `'main-panel'` (constant, never changes)
- **Tab Group:** Each panel has one tab group
- **Default Behavior:** All new tabs open in main panel unless user drags them

**Panel State:**
- Created automatically when first tab is opened
- Persists across app sessions
- Can be removed if all tabs are closed (optional)
- Can be renamed or customized (future feature)

### 4. Dynamic Panel Creation

**When Panels Are Created:**
1. **First Tab Opened:** Creates main panel automatically
2. **Tab Dragged to Edge:** Creates new panel at that edge
3. **Tab Dragged to Empty Space:** Creates new panel in that location
4. **User Action:** Right-click → "New Panel" (future feature)

**Panel Creation Process:**
1. User drags tab to target location
2. Drop zone indicator appears (blue box)
3. User releases mouse
4. New panel created with:
   - New panel ID (UUID)
   - New tab group ID (UUID)
   - Tab moved to new tab group
   - Panel linked to tab group
   - Layout updated

### 5. Integration with react-resizable-panels

**Dynamic Panel Rendering:**
- `react-resizable-panels` supports dynamic panel creation
- Use `PanelGroup` with dynamic `panels` array
- React will automatically add/remove panels when array changes
- Key requirement: Use stable `id` props on each `Panel`

**Layout Updates:**
- Update `currentLayout` in `panelStore`
- Add new panel to appropriate `PanelGroupConfig`
- React re-renders with new panel
- Panel sizes auto-adjust (default 50/50 split)

---

## Implementation Strategy

### Phase 1: Empty Canvas Setup

**Steps:**
1. Modify `App.tsx` to check for saved layout
2. If no saved layout, start with empty canvas
3. Show empty state message
4. Render top bar with dropdown

**Empty State Component:**
```typescript
// EmptyCanvas.tsx
<div className="h-screen w-screen flex flex-col">
  <TopBar />
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <p className="text-lg mb-2">Welcome to Nexus Overseer</p>
      <p className="text-sm text-gray-500">
        Select a tab from the menu above to get started
      </p>
    </div>
  </div>
</div>
```

### Phase 2: Top Bar Dropdown

**Component:**
- `TopBar.tsx` - Fixed top bar component
- `TabTypeDropdown.tsx` - Dropdown for selecting tab types

**Tab Types:**
- `'editor'` - Code Editor
- `'chat'` - Chat Interface
- `'file-tree'` - File Tree
- `'tasks'` - Task Scheduler

**Action Handler:**
```typescript
const handleTabTypeSelect = (tabType: string) => {
  // Get or create main panel
  const mainPanelId = 'main-panel';
  let mainPanel = panelStore.getPanel(mainPanelId);
  
  if (!mainPanel) {
    // Create main panel
    mainPanel = panelStore.createMainPanel();
  }
  
  // Get or create tab group for main panel
  let tabGroupId = panelStore.getTabGroupForPanel(mainPanelId);
  if (!tabGroupId) {
    tabGroupId = tabStore.createTabGroup();
    panelStore.setPanelTabGroupMapping(mainPanelId, tabGroupId);
  }
  
  // Create and add tab
  const newTab = createTabForType(tabType);
  tabStore.addTab(tabGroupId, newTab);
};
```

### Phase 3: Main Panel Management

**Store Actions Needed:**
- `createMainPanel(): PanelConfig` - Creates main panel if it doesn't exist
- `getMainPanelId(): string` - Returns main panel ID (constant: 'main-panel')
- `ensureMainPanelExists(): void` - Ensures main panel exists, creates if needed

**Panel Creation:**
```typescript
createMainPanel: () => {
  const mainPanelId = 'main-panel';
  const mainPanel: PanelConfig = {
    id: mainPanelId,
    component: 'editor', // Default component
    defaultSize: 100, // Full width initially
    minSize: 10,
    maxSize: 100,
    collapsible: false,
    collapsed: false,
  };
  
  // Add to layout
  const layout = get().currentLayout || createEmptyLayout();
  layout.groups[0].panels.push(mainPanel);
  set({ currentLayout: layout });
  
  return mainPanel;
}
```

### Phase 4: Integration with Phase 5.1 and 5.2

**Phase 5.1 Modifications:**
- Support empty canvas initial state
- Tab dragging works from main panel
- Drop zones work on empty canvas (creates new panel)

**Phase 5.2 Modifications:**
- Panel creation from empty canvas
- Main panel handling
- Dynamic panel addition to layout

---

## Data Structure Updates

### Panel Store Extensions

```typescript
interface PanelStore {
  // ... existing state
  
  // Main panel management
  mainPanelId: string; // Constant: 'main-panel'
  createMainPanel: () => PanelConfig;
  ensureMainPanelExists: () => void;
  getMainPanelId: () => string;
}
```

### Tab Type Definitions

```typescript
type TabType = 'editor' | 'chat' | 'file-tree' | 'tasks';

interface TabTypeConfig {
  type: TabType;
  label: string;
  icon?: string;
  component: string;
}

const TAB_TYPES: TabTypeConfig[] = [
  { type: 'editor', label: 'Code Editor', component: 'editor' },
  { type: 'chat', label: 'Chat Interface', component: 'chat' },
  { type: 'file-tree', label: 'File Tree', component: 'file-tree' },
  { type: 'tasks', label: 'Task Scheduler', component: 'tasks' },
];
```

---

## Empty State UI Design

### Top Bar
- **Height:** 40px
- **Background:** `#2d2d30` (darker than panels)
- **Content:** 
  - Left: App logo/name
  - Center: "Open Tab" dropdown
  - Right: Settings icon (optional)

### Empty Canvas
- **Background:** `#1e1e1e` (main background)
- **Content:** Centered welcome message
- **Message:**
  - Title: "Welcome to Nexus Overseer"
  - Subtitle: "Select a tab from the menu above to get started"
  - Optional: Keyboard shortcut hint

---

## Integration Points

### With Phase 5.1 (Advanced Tab System)
- Tab dragging works from main panel
- Drop zones detect empty canvas
- Tab creation via dropdown integrates with tab store

### With Phase 5.2 (Panel Drag and Drop)
- Panel creation from tab drag
- Main panel handling in layout
- Dynamic panel addition

### With Phase 1.4 (Resizable Panels)
- Main panel uses resizable panels system
- Panel creation uses same system
- Layout persistence includes main panel

---

## Testing Considerations

### Empty Canvas Tests
- [ ] App starts with empty canvas when no saved layout
- [ ] Empty state message displays correctly
- [ ] Top bar renders with dropdown
- [ ] Dropdown opens and shows tab types

### Tab Opening Tests
- [ ] Selecting tab type from dropdown opens tab
- [ ] Main panel created automatically if doesn't exist
- [ ] Tab appears in main panel
- [ ] Tab becomes active
- [ ] Multiple tabs can be opened

### Panel Creation Tests
- [ ] Dragging tab to empty space creates new panel
- [ ] Dragging tab to edge creates new panel at edge
- [ ] New panel has correct size and position
- [ ] Tab moved to new panel correctly

---

## References

- VS Code Empty Editor State
- Cursor IDE Initial State
- react-resizable-panels Dynamic Panels
- dnd-kit Empty State Handling

---

## Next Steps

1. Update Phase 5.1 checklist to include empty canvas workflow
2. Update Phase 5.2 checklist to include main panel handling
3. Create TopBar component
4. Create TabTypeDropdown component
5. Implement main panel management in panelStore
6. Update App.tsx to support empty canvas

---

**Last Updated:** 2025-12-30


