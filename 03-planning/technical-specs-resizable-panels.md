# Technical Specification: Resizable Panels System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The Resizable Panels System provides an extremely flexible, customizable panel layout for Nexus Overseer using `react-resizable-panels` combined with a tab-based system similar to Cursor. All panels (including open files) exist as tabs in tab groups, which can be dragged, resized, nested, and customized. The system enables advanced customization including drag-and-drop panels, collapsible panels with toggle buttons, and panel embedding.

**Key Features:**
- **Tab-based panels:** All panels exist in tab groups (similar to Cursor)
- **Draggable tabs:** Tabs can be dragged between tab groups or to create new groups
- **Resizable panels:** Panels can be resized with drag handles
- **Drag and drop:** Panels can be dragged to any position (top, right, bottom, left, or center)
- **Collapsible panels:** Panels can be collapsed with toggle buttons that slide in/out
- **Panel embedding:** Panels can be embedded (slide behind adjacent panels)
- **Right-click divider options:** Extend dividers or embed panels
- **Horizontal and vertical panel groups:** Support for nested panel groups
- **Panel size persistence:** Saves and restores panel sizes
- **Smooth animations:** Animations for expand/collapse and resize
- **Visual feedback:** Drop zone indicators during drag operations

**Purpose:**
- Provide extremely flexible, customizable UI layout
- Allow users to create their ideal workspace
- Support tab-based organization (files and panels as tabs)
- Enable advanced customization (drag, drop, embed, collapse)
- Support efficient use of screen space

---

## System Architecture

### High-Level Design

The Resizable Panels System consists of:

1. **Tab System:** Manages tab groups and tab operations
2. **Tab Group Component:** Container for tabs (panels and files)
3. **Tab Component:** Individual tab (can be panel or file)
4. **Panel Group Component:** Container for resizable panels
5. **Panel Component:** Individual resizable panel
6. **Panel Resize Handle:** Drag handle for resizing
7. **Drag and Drop System:** Handles panel/tab dragging
8. **Collapsible Panel System:** Manages collapsed/expanded states
9. **Panel State Manager:** Manages panel sizes, layouts, and tab groups
10. **Panel Layout Persistence:** Saves and restores layouts

### Component Hierarchy

```
ResizablePanelsSystem
├── TabSystem (Tab Management)
│   ├── TabGroup (Container for tabs)
│   │   ├── Tab (Individual tab - panel or file)
│   │   ├── TabBar (Tab bar UI)
│   │   └── TabContent (Active tab content)
│   └── TabDragHandler (Handles tab dragging)
├── PanelGroup (Container for panels)
│   ├── Panel (Resizable Panel)
│   │   ├── PanelHeader (Panel title/header)
│   │   ├── PanelContent (Panel content)
│   │   └── ToggleButton (For collapsible panels)
│   ├── PanelResizeHandle (Drag handle)
│   └── Panel (Another panel)
├── DragAndDropSystem (Panel/Tab Dragging)
│   ├── DragHandler (Initiates drag)
│   ├── DropZoneIndicator (Visual feedback)
│   └── DropHandler (Handles drop)
├── CollapsiblePanelSystem (Collapse/Expand)
│   ├── ToggleButton (Expand/collapse button)
│   └── SlideAnimation (Slide in/out animation)
└── PanelStateManager (State)
    ├── TabGroupState (Tab group state)
    ├── SizeTracker (Tracks panel sizes)
    └── LayoutPersistence (Saves/loads layout)
```

### Layout Example

```
┌─────────────────────────────────────────┐
│         Main Panel Group (Horizontal)    │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │   Panel 1    │  │   Panel 2        │ │
│  │  (Editor)    │  │  (Vertical)      │ │
│  │              │  │  ┌────────────┐  │ │
│  │              │  │  │  Panel 2a  │  │ │
│  │              │  │  │  (Chat)    │  │ │
│  │              │  │  ├────────────┤  │ │
│  │              │  │  │  Panel 2b  │  │ │
│  │              │  │  │  (Tasks)   │  │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Data Structures

### Frontend (TypeScript)

**Tab Configuration:**
```typescript
interface Tab {
  id: string;                    // Tab ID
  type: 'panel' | 'file';        // Tab type
  label: string;                 // Tab label (panel name or file name)
  component?: string;            // Component type (for panels: 'editor', 'chat', etc.)
  filePath?: string;             // File path (for file tabs)
  isModified?: boolean;          // Has unsaved changes (for files)
  isPinned?: boolean;            // Tab is pinned
  icon?: string;                // Tab icon (optional)
}

interface TabGroup {
  id: string;                    // Tab group ID
  tabs: Tab[];                   // Tabs in this group
  activeTabId: string | null;    // Currently active tab
  direction?: 'horizontal' | 'vertical'; // For nested groups
}

interface PanelConfig {
  id: string;                    // Panel ID
  component: string;             // Component to render (editor, chat, etc.)
  defaultSize: number;          // Default size percentage (0-100)
  minSize: number;              // Minimum size percentage
  maxSize: number;              // Maximum size percentage
  collapsible: boolean;         // Can be collapsed
  collapsed: boolean;          // Is collapsed
  embeddedIn?: string;          // ID of panel this is embedded in
  toggleButtonPosition?: 'top' | 'bottom' | 'left' | 'right'; // Toggle button position
}

interface PanelGroupConfig {
  id: string;
  direction: 'horizontal' | 'vertical';
  panels: PanelConfig[];
  defaultSizes: number[];       // Default sizes for all panels
  tabGroupId?: string;         // Associated tab group ID
}

interface PanelLayout {
  id: string;                    // Layout ID
  name: string;                  // Layout name (optional)
  tabGroups: TabGroup[];        // Tab groups
  groups: PanelGroupConfig[];    // Panel groups
  createdAt: string;
  updatedAt: string;
}

interface PanelState {
  currentLayout: PanelLayout;
  tabGroups: TabGroup[];         // All tab groups
  panelSizes: Record<string, number>; // Panel ID -> size percentage
  collapsedPanels: Set<string>;       // Collapsed panel IDs
  embeddedPanels: Map<string, string>; // Panel ID -> parent panel ID
  activeTabGroups: Record<string, string>; // Tab group ID -> active tab ID
  activePanel: string | null;         // Currently focused panel
}
```

---

## Core Components

### Frontend Components

#### PanelGroup.tsx

**Purpose:** Container component for resizable panels.

**Props:**
- `direction: 'horizontal' | 'vertical'` - Panel group direction
- `panels: PanelConfig[]` - Panel configurations
- `onResize: (sizes: number[]) => void` - Resize handler
- `defaultSizes?: number[]` - Default panel sizes

**Features:**
- Manages panel group layout
- Handles resize operations
- Supports nested panel groups
- Persists panel sizes

**Implementation:**
```typescript
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

function PanelGroup({ direction, panels, onResize, defaultSizes }) {
  return (
    <PanelGroup direction={direction} onResize={onResize}>
      {panels.map((panel, index) => (
        <>
          <Panel
            key={panel.id}
            defaultSize={defaultSizes?.[index] || panel.defaultSize}
            minSize={panel.minSize}
            maxSize={panel.maxSize}
            collapsible={panel.collapsible}
          >
            <PanelContent component={panel.component} />
          </Panel>
          {index < panels.length - 1 && <PanelResizeHandle />}
        </>
      ))}
    </PanelGroup>
  );
}
```

#### PanelContent.tsx

**Purpose:** Renders content for each panel based on component type.

**Props:**
- `component: string` - Component type (editor, chat, tasks, etc.)
- `panelId: string` - Panel ID

**Features:**
- Renders appropriate component based on type
- Handles component-specific props
- Manages component lifecycle

#### PanelResizeHandle.tsx

**Purpose:** Drag handle for resizing panels (from react-resizable-panels).

**Features:**
- Visual drag handle
- Smooth resizing
- Keyboard navigation support
- Hover effects

#### PanelLayoutManager.tsx

**Purpose:** Manages panel layouts and persistence.

**Features:**
- Save current layout
- Load saved layout
- Reset to default layout
- Manage multiple layouts

### State Management

#### TabGroup.tsx

**Purpose:** Container component for tabs.

**Props:**
- `tabs: Tab[]` - Tabs in this group
- `activeTabId: string | null` - Currently active tab
- `onTabSelect: (tabId: string) => void` - Tab selection handler
- `onTabClose: (tabId: string) => void` - Tab close handler
- `onTabDrag: (tabId: string, position: DropPosition) => void` - Tab drag handler

**Features:**
- Displays tab bar with all tabs
- Handles tab selection
- Supports tab dragging
- Shows active tab
- Displays modified indicators

#### Tab.tsx

**Purpose:** Individual tab component.

**Props:**
- `tab: Tab` - Tab data
- `isActive: boolean` - Is this tab active?
- `onClick: () => void` - Click handler
- `onClose: () => void` - Close handler
- `onDragStart: () => void` - Drag start handler

**Features:**
- Displays tab label and icon
- Shows modified indicator (*)
- Shows pinned indicator
- Handles click to activate
- Handles drag to move

#### DragAndDropSystem.ts

**Purpose:** Handles panel and tab dragging.

**Features:**
- Detects drag start (tab or panel)
- Shows drop zone indicators
- Handles drop operations
- Manages drag preview
- Updates layout on drop

#### CollapsiblePanelSystem.ts

**Purpose:** Manages collapsible panels.

**Features:**
- Toggle button management
- Slide in/out animations
- State tracking (collapsed/expanded)
- Button positioning

### State Management

#### panelStore.ts (Zustand)

**Purpose:** Global state management for panels and tabs.

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

---

## Algorithms

### Panel Resize Flow

1. User drags resize handle
2. PanelGroup detects drag
3. Calculate new sizes for affected panels
4. Update panel sizes in state
5. Trigger onResize callback
6. Save sizes to persistence (debounced)
7. Update UI with new sizes

### Panel Collapse Flow

1. User clicks collapse button or double-clicks resize handle
2. Panel collapses to minimum size
3. Update collapsedPanels set
4. Save state to persistence
5. Update UI

### Layout Persistence Flow

1. User resizes panels
2. Sizes tracked in state
3. On layout change (debounced):
   - Serialize current layout
   - Save to localStorage or config file
4. On app load:
   - Load saved layout
   - Apply to panels
   - Fall back to default if no saved layout

### Nested Panel Groups Flow

1. Panel contains another PanelGroup
2. Inner group manages its own panels
3. Outer group manages inner group as single panel
4. Resize operations work at each level
5. State managed hierarchically

---

## Integration Points

### With UI Components

**Panel Content:**
- Code Editor component in editor panel
- Chat Interface component in chat panel
- Task Scheduler component in tasks panel
- Project Dashboard component in dashboard panel

### With State Management

**Layout Persistence:**
- Panel sizes saved to state store
- Layout persisted across sessions
- User preferences stored

### With Multi-Window System

**Detachable Panels:**
- Panels can be detached to separate windows
- Detached panels removed from main layout
- Re-attached panels restored to layout

---

## Configuration

### Responsive Design

**Minimum Window Size:**
- **Width:** `800px` (absolute minimum)
- **Height:** `600px` (absolute minimum)

**Responsive Behavior:**
- Application must fit and function at any size above minimum
- Panels scale proportionally when window resizes
- Minimum panel sizes enforced to prevent unusable UI
- Collapsible sidebars can auto-collapse if space is limited
- Smooth transitions during window resize

**Panel Minimum Sizes:**
- **File Tree:** `180px` width minimum
- **Chat History Sidebar:** `200px` width minimum (when expanded)
- **Chat Interface:** `300px` width minimum
- **Code Editor:** `400px` width minimum
- **Tab Bar:** `35px` height (fixed)
- **Status Bar:** `22px` height (fixed)

**Responsive Strategies:**
- Use flexbox/grid for flexible layouts
- Collapsible sidebars when space is limited
- Horizontal scrolling for content that can't shrink
- Vertical scrolling for overflow content
- Enforce minimum sizes to maintain usability

### Default Layout

**Initial Layout:**
```
Horizontal Panel Group:
  - Panel 1: File Tree (20-25%, minimum 180px)
  - Panel 2: Chat Interface (30-35%, minimum 300px)
    - Toggle button [>] Overseer on left edge
    - Overseer/Task Scheduler tab group (collapsed, slides behind)
  - Panel 3: Tab Group (40-45%, minimum 400px)
    - Tabs: Open files (main.ts, utils.ts, etc.)
    - Active tab: Code Editor showing active file
```

**Tab Groups:**
- **Main Tab Group:** Contains open files and Code Editor
- **Overseer/Task Scheduler Tab Group:** Collapsed by default, contains Overseer Panel and Task Scheduler tabs

**Panel Sizes (Proportional, with Minimums):**
- File Tree: 20-25% of window width (minimum `180px`)
- Chat Interface: 30-35% of window width (minimum `300px`)
- Code Editor Tab Group: 40-45% of window width (minimum `400px`)
- Overseer/Task Scheduler: 25-30% when expanded (slides out from left of Chat, minimum `250px`)

**Size Constraints:**
- **Minimum Panel Size:** Enforced per panel type (see above)
- **Maximum Panel Size:** 90% (to prevent complete takeover)
- **Window Resize:** Panels maintain proportional sizes when possible, but respect minimums

---

## Performance Considerations

### Resize Performance

1. **Debouncing:** Debounce resize events to avoid excessive updates
2. **Throttling:** Throttle resize calculations
3. **Efficient Updates:** Only update changed panels
4. **Virtual Rendering:** Use virtual rendering for large panel content

### State Management

1. **Selective Updates:** Only update changed panel sizes
2. **Batch Updates:** Batch multiple resize operations
3. **Lazy Persistence:** Persist layout on debounced changes

---

## Security Considerations

1. **Layout Validation:** Validate loaded layouts
2. **Size Limits:** Enforce min/max size constraints
3. **Component Validation:** Validate panel component types

---

## Error Handling

### Error Types

1. **Invalid Layout:** Layout configuration is invalid
2. **Panel Not Found:** Panel ID doesn't exist
3. **Size Out of Bounds:** Panel size exceeds limits
4. **Persistence Error:** Failed to save/load layout

### Error Handling Strategy

1. **Validation:** Validate layouts before applying
2. **Fallback:** Fall back to default layout on error
3. **User Feedback:** Show user-friendly error messages
4. **Logging:** Log technical details for debugging

---

## Testing Checklist

### Unit Tests

- [ ] Panel resize operations
- [ ] Panel collapse/expand
- [ ] Layout persistence
- [ ] State management
- [ ] Nested panel groups
- [ ] Error handling

### Integration Tests

- [ ] Panel content rendering
- [ ] Layout save/load
- [ ] Multi-window integration
- [ ] State synchronization

### User Acceptance Tests

- [ ] User can resize panels
- [ ] Panels remember sizes
- [ ] Layout persists across sessions
- [ ] Nested panels work correctly
- [ ] Performance is smooth
- [ ] Keyboard shortcuts work

---

## Research Notes

### react-resizable-panels Library

**Research Findings:**
- Modern, performant library for resizable panels
- Supports horizontal and vertical groups
- Supports nested groups
- Smooth animations
- Keyboard navigation
- Active development and maintenance

**Sources:**
- [react-resizable-panels GitHub](https://github.com/bvaughn/react-resizable-panels)
- Library documentation

**Implementation Approach:**
- Use react-resizable-panels for panel system
- Manage panel state with Zustand
- Persist layout to localStorage or config
- Support nested panel groups

**Why This Approach:**
- Modern, well-maintained library
- Good performance
- Flexible and extensible
- Standard React patterns

### Panel Layout Persistence

**Research Findings:**
- Layout persistence improves UX
- Users expect layouts to be remembered
- localStorage is simple for layout data
- Config file is better for complex layouts

**Sources:**
- General UI/UX patterns
- Code editor layout persistence

**Implementation Approach:**
- Store layout in localStorage (simple)
- Or store in config file (more robust)
- Save on layout changes (debounced)
- Load on app start

**Why This Approach:**
- Improves user experience
- Users don't have to reconfigure
- Simple to implement
- Standard pattern

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Install react-resizable-panels
3. ⏳ Implement PanelGroup component
4. ⏳ Implement Panel component
5. ⏳ Implement panel state management
6. ⏳ Implement layout persistence
7. ⏳ Integrate with UI components
8. ⏳ Testing and refinement

---

## Notes

- Resizable panels are important for user experience
- Keep it simple - start with basic layout, add complexity as needed
- Performance is important for smooth resizing
- Layout persistence is critical for UX
- Nested panels enable complex layouts
- Integration with multi-window system is important

