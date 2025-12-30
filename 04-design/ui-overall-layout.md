# UI Design: Overall Application Layout

**Created:** 2024-12-28  
**Updated:** 2024-12-28  
**Status:** Design Document

## Overview

This document describes the overall application layout with an extremely customizable panel system. Users can drag and drop panels to any position, nest panels inside each other, create collapsible panels with toggle buttons, and customize the workspace to their exact preferences. The layout uses resizable panels that can be detached to separate windows, similar to Cursor's interface but with advanced customization.

**Visual Design:** See `visual-design-system.md` for complete styling guidelines. The UI follows a slim, modern, sleek dark theme similar to Cursor IDE.

**Responsive Design:** The application must be fully responsive and adapt to any window size above the minimum. All panels, sidebars, and content areas must scale appropriately to fit the available space.

## Advanced Panel Customization System

### Core Features

1. **Tab-Based Panels:** All panels exist in tab groups, similar to Cursor
2. **Draggable Tabs:** Tabs can be dragged between tab groups or to create new groups
3. **Drag and Drop Panels:** Drag any panel to reposition it anywhere
4. **Drop Zone Indicators:** Visual preview showing where panel will be placed
5. **Right-Click Divider Options:** Expand divider or embed panel inside another
6. **Collapsible Panels:** Panels can be collapsed with toggle buttons
7. **Nested Panels:** Panels can be nested inside other panels (up to 5 levels deep)
8. **Visual Feedback:** Preview indicators during drag, animations on expand/collapse
9. **Layout Persistence:** All custom layouts saved and restored

## Tab System

### Tab-Based Panel Groups

**How Tabs Work:**
- All panels exist within tab groups
- Each tab group can contain multiple panels
- Tabs appear at the top of each tab group
- Click tab to switch between panels in that group
- Tabs can be dragged to move panels between groups

**Tab Group Structure:**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Code Editor] [Tasks]     │  ← Tab bar
├─────────────────────────────────────────┤
│                                         │
│  [Active Panel Content]                │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Dragging Tabs

**Tab Drag Behavior:**
- User clicks and holds on tab
- Tab becomes draggable
- User drags tab to:
  - Another tab group (adds to that group)
  - Empty space (creates new tab group)
  - Edge of panel (docks to that side)
  - Center of panel (embeds as collapsible)

**Tab Drop Zones:**
- **Tab Bar:** Drop on existing tab bar to add to that group
- **Empty Space:** Drop in empty area to create new tab group
- **Panel Edge:** Drop on edge to dock panel to that side
- **Panel Center:** Drop in center to embed panel

**Visual Feedback:**
- Tab follows cursor during drag
- Drop zones highlight when hovering
- Preview shows where tab will be placed
- Tab bar highlights when dropping on it

### Tab Group Management

**Creating Tab Groups:**
- Drag tab to empty space
- Drag tab to edge of existing panel
- Right-click panel → "New Tab Group"

**Merging Tab Groups:**
- Drag tab from one group to another
- Tab groups merge if only one tab remains

**Splitting Tab Groups:**
- Drag tab out of group
- Creates new tab group with that panel

### Tab Actions

**Right-Click Tab Menu:**
- Close Tab
- Close Other Tabs
- Close All Tabs
- Move to New Tab Group
- Pin Tab (keeps tab visible)

**Tab States:**
- **Active:** Currently visible panel
- **Inactive:** Hidden but in tab group
- **Pinned:** Always visible, can't be closed
- **Modified:** Indicator dot for unsaved changes

## Drag and Drop System

### Drag Behavior

**Initiating Drag:**
- User clicks and holds on panel tab
- Tab becomes draggable
- Cursor changes to indicate dragging mode
- Can also drag from panel header if not in tab group

**During Drag:**
- Panel follows cursor (semi-transparent preview)
- Drop zone indicators appear on all valid drop targets
- Valid drop zones highlight when cursor hovers over them

**Drop Zones:**
- **Tab Bar:** Drop on tab bar to add to that tab group
- **Top Edge:** Panel docks above target panel (creates new tab group or splits)
- **Right Edge:** Panel docks to the right of target panel
- **Bottom Edge:** Panel docks below target panel
- **Left Edge:** Panel docks to the left of target panel
- **Center:** (Not used for embedding - use right-click divider method instead)

### Drop Zone Indicators

**Visual Feedback:**
- Highlighted border on target panel showing drop zone
- Arrow indicators pointing to drop location
- Color coding:
  - Blue: Will create new split (dock to edge)
  - Yellow: Will replace/swap

**Snap Behavior:**
- Panels snap to edges when near (within 20px)
- Can also be placed at any position for custom splits
- Visual guide lines show alignment

## Right-Click Divider Options

### Divider Context Menu

When user right-clicks on a panel divider (the resize handle between two panels):

**Menu Options:**
1. **Extend Divider**
   - Makes the divider extend to match the full length of the adjacent panel's edge
   - Aligns panels perfectly
   - Example: If divider is between left and right panels, extends to match full height

2. **Embed Panel**
   - Embeds one panel inside the other
   - Creates a collapsible panel system
   - Adds a toggle button to the containing panel
   - Embedded panel can be opened/closed

3. **Split Panel**
   - Creates a new split at this position
   - Adds another panel in the split

4. **Remove Divider**
   - Removes the divider, merging panels
   - (Only if both panels are the same type or compatible)

### Extend Divider Behavior

**What it does:**
- Extends the divider to match the full length of the adjacent panel's edge
- Aligns panels for a cleaner look
- Example: Vertical divider extends to full height, horizontal divider extends to full width

**Visual Result:**
```
Before:
┌─────┬─────┐
│  A  │  B  │
│     ├─────┤
│     │  C  │
└─────┴─────┘

After (Extend Divider):
┌─────┬─────┐
│  A  │  B  │
│     │     │
│     │  C  │
└─────┴─────┘
```

## Collapsible Panels

### Collapse Behavior

**How Panels Collapse:**
1. User clicks collapse button (on panel header or embedded button)
2. Panel collapses to minimum size or hides completely
3. If embedded, toggle button appears in containing panel
4. Panel state is saved (collapsed/expanded)

**Toggle Button:**
- Appears inside the panel that contains the collapsed panel
- Button shows panel name/icon
- Click to expand/collapse
- Button position: Top, bottom, left, or right edge (depending on panel position)

**Toggle Button Examples:**

**Vertical Split (Panel on Right, collapsed):**
```
┌──────────┐
│          │
│  Panel A │
│          │
│  [>]     │  ← Toggle button (Panel B slides out from right)
└──────────┘
```

**Vertical Split (Panel on Right, expanded):**
```
┌──────────┬──────────┐
│          │          │
│  Panel A │  Panel B │  ← Slides out from behind
│          │          │
│  [<]     │          │  ← Toggle button (click to collapse)
└──────────┴──────────┘
```

**Horizontal Split (Panel on Bottom, collapsed):**
```
┌──────────────┐
│              │
│  Panel A     │
│              │
│     [v]      │  ← Toggle button (Panel B slides out from bottom)
└──────────────┘
```

**Horizontal Split (Panel on Bottom, expanded):**
```
┌──────────────┐
│              │
│  Panel A     │
│              │
│     [^]      │  ← Toggle button (click to collapse)
├──────────────┤
│  Panel B     │  ← Slides out from behind
└──────────────┘
```

### Expand Behavior

**When Panel is Opened:**
1. User clicks toggle button
2. Panel expands to its previous size (or default size if first time)
3. Smooth animation (200-300ms)
4. Panel becomes active/focused

**Size Restoration:**
- Remembers last size before collapse
- If never expanded before, uses default size (20-25% of container)
- Can be resized after expansion

## Nested Panels

### Nesting System

**How Panels Nest:**
- Panels can be embedded inside other panels
- Creates a hierarchical structure
- Maximum nesting depth: **5 levels**

**Nesting Example:**
```
Main Window
└── Panel A (File Tree)
    └── Panel B (Code Editor)
        └── Panel C (Task Scheduler)
            └── Panel D (Chat Interface)
                └── Panel E (Settings)  ← Max depth
```

**Nesting Limit:**
- Maximum 5 levels deep
- Prevents UI from becoming too complex
- Warning shown if user tries to nest deeper
- Suggestion: Detach panel to separate window instead

### Embedded Panel Structure

**When Panel is Embedded:**
- Panel stays in its position relative to the divider
- Toggle button appears inside the adjacent panel (the one that was right-clicked)
- Panel slides in/out from behind the adjacent panel
- Creates a drawer/sliding panel effect
- Panel maintains its own content and state

**Visual Example:**

**Expanded State:**
```
┌─────────────────────┬──────────────────┐
│  Code Editor        │  Task Scheduler  │
│                     │                  │
│  [Code content...]  │  ▶ Task 1       │
│                     │  ▶ Task 2       │
│  [<] Tasks          │                  │  ← Toggle button
└─────────────────────┴──────────────────┘
```

**Collapsed State (Task Scheduler slides behind Code Editor):**
```
┌─────────────────────┐
│  Code Editor        │
│                     │
│  [Code content...]  │
│                     │
│  [>] Tasks          │  ← Toggle button (click to expand)
└─────────────────────┘
```

**When Expanded (slides out from behind):**
```
┌─────────────────────┬──────────────────┐
│  Code Editor        │  Task Scheduler  │  ← Slides out
│                     │                  │
│  [Code content...]  │  ▶ Task 1       │
│                     │  ▶ Task 2       │
│  [<] Tasks          │                  │  ← Toggle button
└─────────────────────┴──────────────────┘
```

## Visual Feedback

### Drag Preview

**During Drag:**
- Panel becomes semi-transparent (50% opacity)
- Follows cursor smoothly
- Drop zones highlight with colored borders
- Arrow indicators show drop direction
- Preview of final layout shown

**Drop Zone Colors:**
- **Blue:** Will create new split (dock to edge)
- **Yellow:** Will swap/replace panel

### Animation

**Expand/Collapse Animation:**
- Smooth slide transition (200-300ms)
- Easing function: ease-in-out
- Panel slides in/out from behind adjacent panel
- Creates drawer/sliding panel effect
- Toggle button remains visible

**Resize Animation:**
- Smooth resize when panels adjust
- No animation on manual resize (immediate)
- Animation only on auto-resize (expand/collapse)

## Panel States

### Available States

1. **Expanded:** Panel at normal size, fully visible
2. **Collapsed:** Panel minimized, toggle button visible
3. **Detached:** Panel in separate window
4. **Embedded:** Panel nested inside another panel
5. **Hidden:** Panel completely hidden (different from collapsed)

### State Transitions

```
Expanded ←→ Collapsed
    ↕
Detached
    ↕
Embedded
```

## Layout Persistence

### Saved State

**What Gets Saved:**
- Tab group structure
- Which panels are in which tab groups
- Active tab in each tab group
- Panel positions and sizes
- Panel nesting structure
- Collapsed/expanded state of each panel
- Detached window positions
- Panel visibility
- Custom splits and arrangements
- Tab order within groups

### Restore on Startup

1. Load saved layout configuration
2. Restore main window size and position
3. Recreate tab group structure
4. Restore panels to their tab groups
5. Restore active tab in each group
6. Restore panel sizes
7. Restore collapsed/expanded states
8. Restore detached windows
9. Restore toggle button positions

## Default Layout

### Initial Layout

```
┌──────────┬──────────────┬────────────────────────────┐
│          │              │  [main.ts] [utils.ts]     │  ← File tabs
│  File    │  [Chat]      │  ├────────────────────────┤ │
│  Tree    │              │  │                        │ │
│          │  [Messages]  │  │  [Code Editor]         │ │
│  src/    │  [Type...]   │  │                        │ │
│  docs/   │              │  │  [Code content...]     │ │
│          │  [>] Overseer│  │                        │ │
│  [Search]│              │  │                        │ │
│          │              │  │                        │ │
│          │              │  │                        │ │
│          │              │  │                        │ │
└──────────┴──────────────┴────────────────────────────┘
```

**Panel Structure:**
- **Left Panel:** File Tree (single panel, no tabs)
  - Minimum width: `180px`
  - Can be collapsed if window is too small
- **Middle Panel:** Chat Interface
  - Minimum width: `300px`
  - Toggle button `[>] Overseer` on left edge (Overseer/Task Scheduler tab group slides out from behind)
  - Chat history sidebar can be collapsed
- **Right Panel:** Tab group containing:
  - Minimum width: `400px`
  - Open files (each file is its own tab, e.g., `main.ts`, `utils.ts`)
  - Code Editor shows the active file

**Overseer/Task Scheduler Tab Group:**
- Collapsed by default (slides behind Chat)
- Toggle button `[>] Overseer` appears on left edge of Chat
- When expanded, slides out from left side of Chat
- Contains tabs: Overseer Panel, Task Scheduler
- Users can switch between Overseer and Task Scheduler tabs

**Expanded State (Overseer/Task Scheduler visible):**
```
┌──────────┬──────────┬──────────────┬─────────────────┐
│          │          │              │  [main.ts]      │
│  File    │[Overseer]│  [Chat]      │  ├──────────────┤
│  Tree    │[Tasks]   │              │  │              │
│          │          │  [Messages]  │  │  [Code]       │
│  src/    │[Overseer]│  [Type...]   │  │              │
│  docs/   │Content   │              │  │              │
│          │          │  [<] Overseer│  │              │
│  [Search]│          │              │  │              │
│          │          │              │  │              │
└──────────┴──────────┴──────────────┴─────────────────┘
```

**Switching Between Panels:**
- Click file tabs to switch between open files in Code Editor
- Click `[>] Overseer` button to expand Overseer/Task Scheduler tab group
- Click tabs in Overseer/Task Scheduler group to switch between Overseer and Task Scheduler
- Click `[<] Overseer` button to collapse the tab group (slides back behind Chat)
- File tabs show modified indicator (*) if unsaved
- All tabs can be dragged to reorganize or move to different tab groups

## User Interactions

### Dragging a Panel

1. User clicks and holds panel header
2. Panel becomes draggable
3. Drop zone indicators appear
4. User drags to desired location
5. Drop zone highlights on hover
6. User releases mouse button
7. Panel is placed in new location
8. Layout updates with animation

### Right-Clicking a Divider

1. User right-clicks on panel divider
2. Context menu appears
3. User selects option:
   - Extend Divider
   - Embed Panel
   - Split Panel
   - Remove Divider
4. Action is applied
5. Layout updates

### Collapsing a Panel

1. User clicks collapse button (on panel header) OR clicks toggle button in adjacent panel
2. Panel slides behind adjacent panel with animation
3. Toggle button remains visible in adjacent panel
4. Panel state saved (collapsed)

### Expanding a Panel

1. User clicks toggle button in adjacent panel
2. Panel slides out from behind adjacent panel with animation
3. Panel becomes visible and active/focused
4. Panel state saved (expanded)

### Embedding a Panel (Right-Click Method)

1. User right-clicks on divider between two panels
2. Selects "Embed Panel" from context menu
3. Chooses which panel to make collapsible
4. Toggle button appears in the other panel (the one that was right-clicked on)
5. Selected panel can now slide in/out from behind the other panel
6. Panel maintains its position relative to divider when expanded

## Keyboard Shortcuts

### Panel Management

- `Ctrl+Shift+D`: Detach selected panel
- `Ctrl+Shift+C`: Collapse/expand selected panel
- `Ctrl+Shift+H`: Hide/show panel
- `Ctrl+1-9`: Focus panel by number
- `Ctrl+Alt+Arrow`: Move panel in direction

### Layout

- `Ctrl+Shift+R`: Reset layout to default
- `Ctrl+Shift+S`: Save current layout
- `Ctrl+Shift+L`: Load saved layout

## Questions for Discussion

1. **Tab Style:** What should tabs look like? (Similar to VS Code/Cursor style?)
2. **Tab Icons:** Should tabs have icons to identify panel types?
3. **Tab Close Button:** Should tabs have close buttons (×) on hover or always visible?
4. **Tab Pinning:** Should users be able to pin tabs to prevent closing?
5. **Tab Groups:** Maximum number of tabs per group?
6. **Toggle Button Style:** What should toggle buttons look like? (Icon, text, both?)
7. **Nesting Depth Limit:** Is 5 levels enough, or should it be different?
8. **Default Panel Sizes:** What should be the default sizes when panels are first embedded?
9. **Panel Swapping:** Should users be able to swap two panels' positions?
10. **Layout Templates:** Should we provide preset layout templates?
11. **Undo/Redo:** Should layout changes support undo/redo?
12. **Panel Locking:** Should users be able to lock panels to prevent accidental moves?
13. **Multi-Monitor:** How should detached windows work across multiple monitors?
14. **Visual Indicators:** Any other visual feedback needed during customization?

What are your thoughts on this advanced customization system? Any changes or additions you'd like?
