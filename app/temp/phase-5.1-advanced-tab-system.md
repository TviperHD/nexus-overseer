# Phase 5.1: Advanced Tab System (Tab Dragging)

**Phase:** 5.1  
**Duration:** 1-2 weeks  
**Priority:** High  
**Goal:** Implement tab dragging with drop zones and tab group management  
**Status:** In Progress (Sections 0-6 Complete, 7 Partial, 8-20 Pending)  
**Created:** 2025-12-30  
**Last Updated:** 2025-12-30  
**Review Date:** 2025-12-30

**Implementation Status:**
- ✅ **Sections 0-6:** Complete (Empty Canvas, Top Bar, Data Structures, Store Extensions, DndContext, Draggable Tabs, Drop Zones)
- ⚠️ **Section 7:** Partial (Tab Bar made droppable, but missing insertion position calculation)
- ❌ **Section 8:** **CRITICAL - Not Implemented** (Tab Reordering - requires useSortable + SortableContext)
- ❌ **Sections 9-20:** Not Started

**Critical Issues Found:**
1. **Tab reordering not working** - Must use `useSortable` with `SortableContext` (Section 8)
2. **Missing insertion position** - No visual indicator for where tab will be inserted (Section 7.2)
3. **Missing import** - `PanelGroupConfig` not imported in `DndTabContext.tsx`
4. **Bug in Section 8.1** - Checklist says `verticalListSortingStrategy` but should be `horizontalListSortingStrategy` for horizontal tabs

**See:** `session-overviews/PHASE_5.1_REVIEW_2025-12-30.md` for detailed review

---

## Overview

This phase implements advanced tab system features including tab dragging, drag-and-drop between tab groups, tab reordering, tab pinning, and tab context menus. Tabs can be dragged to create new tab groups or moved between existing groups, with visual drop zone indicators showing exactly where tabs will be placed.

**Deliverable:** Advanced tab system with full drag-and-drop support

**Dependencies:** 
- Phase 1.2 (Basic Tab System) - ✅ Complete
- Phase 1.4 (Basic Resizable Panels) - ✅ Complete (recommended)

**Research Sources:**
- `../02-research/ui-resizable-panels-research.md` - Drag-and-drop research
- `../02-research/empty-canvas-workflow-research.md` - Empty canvas workflow research
- `../04-design/ui-overall-layout.md` - Tab drag behavior specifications
- `../03-planning/technical-specs-resizable-panels.md` - System architecture
- `DRAG_DROP_VISUAL_EXAMPLES.md` - Visual examples of drop zones
- dnd-kit documentation: https://docs.dndkit.com/
- VS Code/Cursor tab dragging patterns

---

## Prerequisites & Setup

### 1. Verify Dependencies
- [ ] Confirm `@dnd-kit/core` is installed (v6.3.1+)
- [ ] Confirm `@dnd-kit/sortable` is installed (v10.0.0+)
- [ ] Confirm `@dnd-kit/utilities` is installed (v3.2.2+)
- [ ] Verify `react-resizable-panels` is installed (v4.0.16+)
- [ ] Verify `zustand` is installed (v5.0.9+)

### 2. Review Existing Code
- [ ] Review `src/stores/tabStore.ts` - Understand tab state structure
- [ ] Review `src/components/Tab/TabGroup.tsx` - Understand tab group structure
- [ ] Review `src/components/Tab/Tab.tsx` - Understand tab component
- [ ] Review `src/stores/panelStore.ts` (if exists) - Understand panel integration
- [ ] Review `../02-research/empty-canvas-workflow-research.md` - Understand empty canvas workflow

### 3. Critical Notes
- [ ] **Note:** Tab drop zones are managed in tabStore
- [ ] Panel drop zones (for edge splits) are managed in panelStore (Phase 5.2)
- [ ] Coordinate between stores when tab is dropped on panel edge
- [ ] **Empty Canvas:** Application starts with empty canvas (no panels) unless saved layout exists
- [ ] **Main Panel:** Tabs open in main panel by default (created on-demand)
- [ ] **Top Bar:** Dropdown menu for opening tabs (must be implemented first)

---

## 0. Empty Canvas & Top Bar (Prerequisites) ✅ COMPLETE

### 0.1 Top Bar Component
- [x] Create `src/components/TopBar/TopBar.tsx`:
  - [x] Fixed position at top of window (height: 30px - refined from 40-50px)
  - [x] Background: `#2d2d30` (darker than panels)
  - [x] Contains: App logo/name (left), Tab dropdown (center), Window controls (right)
  - [x] Style: Match design system (dark theme)
- [x] Create `src/components/TopBar/TabTypeDropdown.tsx`:
  - [x] Dropdown button: "Open Tab" or "New Tab"
  - [x] Dropdown menu with tab types:
    - [x] Code Editor
    - [x] Chat Interface
    - [x] File Tree
    - [x] Task Scheduler
  - [x] Handle selection: Opens tab in main panel
  - [x] Accessibility: Keyboard navigation support

### 0.2 Empty Canvas State
- [x] Update `src/App.tsx`:
  - [x] Check for saved layout on app start
  - [x] If no saved layout, render empty canvas:
    - [x] Show TopBar component
    - [x] Show empty state message: "Welcome to Nexus Overseer - Select a tab from the menu above to get started"
    - [x] No panels rendered initially
  - [x] If saved layout exists, restore it (existing behavior)

### 0.3 Main Panel Management
- [x] Update `src/stores/panelStore.ts`:
  - [x] Add `mainPanelId: string` constant: `'main-panel'` (as `MAIN_PANEL_ID`)
  - [x] Add `createMainPanel: () => PanelConfig` action:
    - [x] Creates main panel if it doesn't exist
    - [x] Sets default size: 100% (full width initially)
    - [x] Component type: `'editor'` (default)
    - [x] Adds to layout automatically
  - [x] Add `ensureMainPanelExists: () => void` action:
    - [x] Checks if main panel exists
    - [x] Creates it if it doesn't exist
  - [x] Add `getMainPanelId: () => string` action:
    - [x] Returns constant: `'main-panel'`

### 0.4 Tab Opening from Dropdown
- [x] Create `src/utils/tabTypeHelpers.ts`:
  - [x] Define `TabType` type: `'editor' | 'chat' | 'file-tree' | 'tasks'`
  - [x] Define `TabTypeConfig` interface
  - [x] Export `TAB_TYPES: TabTypeConfig[]` array with all tab types
  - [x] Export `createTabForType: (type: TabType) => Tab` function:
    - [x] Creates Tab object for given type
    - [x] Sets appropriate `type`, `label`, `component` properties
- [x] Implement tab opening handler:
  - [x] Get or create main panel
  - [x] Get or create tab group for main panel
  - [x] Create tab for selected type
  - [x] Add tab to tab group
  - [x] Set tab as active

### 0.5 Empty State Component
- [x] Create `src/components/EmptyCanvas/EmptyCanvas.tsx`:
  - [x] Renders TopBar at top
  - [x] Renders empty state message in center
  - [x] Message: "Welcome to Nexus Overseer"
  - [x] Subtitle: "Select a tab from the menu above to get started"
  - [x] Optional: Keyboard shortcut hints

---

## 1. Data Structures & Types ✅ COMPLETE

### 1.1 Tab Drag Types
- [x] Create `src/types/tabDrag.ts`:
  - [x] Define `TabDragData` interface (with `type: 'tab'` field)
  - [x] Define `DropZoneType` type
  - [x] Define `DropZoneData` interface

### 1.2 Tab Group Management Types
- [x] Extend `TabGroup` interface in `src/types/tab.ts`:
  - [x] Add `isDragging?: boolean` flag
  - [x] Add `dropZone?: DropZoneData` for active drop zone
  - [x] Verify `id`, `tabs`, `activeTabId` exist

---

## 2. Tab Store Extensions ✅ COMPLETE

### 2.1 Add Tab Drag Actions
- [x] Update `src/stores/tabStore.ts`:
  - [x] Add `draggingTab: TabDragData | null` to state
  - [x] Add `activeDropZone: DropZoneData | null` to state
  - [x] Add `setDraggingTab: (data: TabDragData | null) => void` action
  - [x] Add `setActiveDropZone: (zone: DropZoneData | null) => void` action
  - [x] Add `moveTabToGroup: (tabId: string, fromGroupId: string, toGroupId: string, insertIndex?: number) => void` action
  - [x] Add `createTabGroupWithTab: (tabId: string, fromGroupId: string, position: { x: number; y: number }) => string` action (returns new group ID)
  - [x] Add `reorderTabsInGroup: (tabGroupId: string, tabIds: string[]) => void` action
  - [x] Add `pinTab: (tabId: string, tabGroupId: string) => void` action
  - [x] Add `unpinTab: (tabId: string, tabGroupId: string) => void` action

### 2.2 Tab Group Management
- [x] Add `mergeTabGroups: (sourceGroupId: string, targetGroupId: string) => void` action
- [x] Add `splitTabGroup: (tabGroupId: string, tabId: string) => string` action (returns new group ID)
- [ ] Add validation: Prevent moving last tab from group (merge instead) - **TODO: Add validation**
- [ ] Add cleanup: Remove empty tab groups after tab removal - **TODO: Add cleanup**

---

## 3. DndContext Setup ✅ COMPLETE

### 3.1 Create DndContext Wrapper
- [x] Create `src/components/Tab/DndTabContext.tsx`:
  - [x] Import `DndContext`, `DragOverlay`, `useSensor`, `useSensors`, `PointerSensor`, `KeyboardSensor` from `@dnd-kit/core`
  - [x] Import `sortableKeyboardCoordinates` from `@dnd-kit/sortable`
  - [x] Create component that wraps tab system
  - [x] Configure sensors:
    - [x] PointerSensor with `activationConstraint: { distance: 5 }` (5px drag threshold - reduced for responsiveness)
    - [x] KeyboardSensor with `coordinateGetter: sortableKeyboardCoordinates`
  - [x] Set up `DndContext` with all handlers
  - [x] Add `DragOverlay` for drag preview
  - [x] Edge detection via mousemove listener (continuous detection)

**⚠️ ISSUE:** Missing import `PanelGroupConfig` from `@/types/panel` - **TODO: Fix import**

### 3.2 Drag Event Handlers
- [x] Implement `onDragStart`:
  - [x] Extract `TabDragData` from event
  - [x] Call `setDraggingTab` with drag data
  - [x] Update tab appearance (opacity, cursor)
  - [x] Prevent text selection during drag
- [x] Implement `onDragOver`:
  - [x] Get `over` object from event (contains collision data)
  - [x] Get mouse coordinates via mousemove listener (ref-based for synchronous updates)
  - [x] Get target element using `document.elementFromPoint` and panel queries
  - [x] Get element bounding rect: `element.getBoundingClientRect()`
  - [x] Calculate drop zone using mouse position and element rect
  - [x] Detect which drop zone is active (top/right/bottom/left/tab-bar/empty-canvas)
  - [x] Calculate drop zone dimensions
  - [x] Call `setActiveDropZone` with zone data
  - [ ] Throttle updates (use `requestAnimationFrame` - 60fps = 16ms) - **TODO: Add throttling for performance**
- [x] Implement `onDragEnd`:
  - [x] Get active drop zone from state
  - [x] Handle drop based on zone type:
    - [x] `'tab-bar'`: Move tab to existing group
    - [x] `'top'/'bottom'/'left'/'right'`: Create new tab group and panel split
    - [x] `'empty-canvas'`: Create main panel and move tab
  - [x] Reset drag state (`setDraggingTab(null)`, `setActiveDropZone(null)`)
  - [x] Update tab positions in store
- [x] Implement `onDragCancel`:
  - [x] Reset drag state
  - [x] Restore tab appearance

---

## 4. Draggable Tab Component ✅ COMPLETE

### 4.1 Make Tab Draggable
- [x] Update `src/components/Tab/Tab.tsx`:
  - [x] Import `useDraggable` from `@dnd-kit/core`
  - [x] Import `CSS` from `@dnd-kit/utilities`
  - [x] Add `useDraggable` hook:
    ```typescript
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `tab-${tab.id}`,
      data: {
        type: 'tab',
        tabId: tab.id,
        tabGroupId: tabGroupId,
        tabLabel: tab.label,
        tabType: tab.type,
        filePath: tab.filePath,
      },
    });
    ```
  - [x] Apply transform styles: `style={{ transform: CSS.Translate.toString(transform) }}`
  - [x] Add drag handle attributes to tab element:
    - [x] `{...listeners}` on tab
    - [x] `{...attributes}` for accessibility
    - [x] `ref={setNodeRef}`
  - [x] Add visual feedback when dragging:
    - [x] Opacity: `isDragging ? 0.5 : 1`
    - [x] Cursor: `cursor: grab` when not dragging, `cursor: grabbing` when dragging
    - [x] Z-index: Higher when dragging

**⚠️ CRITICAL:** Currently uses `useDraggable` only. For reordering within groups, must also use `useSortable` (see Section 8)

### 4.2 Tab Drag Handle
- [x] Add drag handle area (optional - can drag from entire tab):
  - [x] Entire tab is draggable (no separate handle)
  - [x] Style: `cursor: grab`, hover effect
  - [ ] Add tooltip: "Drag to move tab" - **TODO: Add tooltip**

### 4.3 Tab States
- [x] Handle pinned tab state:
  - [x] Show pin icon for pinned tabs (emoji 📌)
  - [ ] Prevent dragging pinned tabs (or allow with special handling) - **TODO: Decide behavior**
  - [x] Style pinned tabs differently
- [x] Handle modified tab state:
  - [x] Show modified indicator (dot) during drag
  - [x] Maintain indicator in drag preview

---

## 5. Drop Zone Detection System ✅ COMPLETE

### 5.1 Drop Zone Calculator
- [x] Create `src/utils/dropZoneCalculator.ts`:
  - [x] Export `calculateDropZone` function (implemented in `DndTabContext.tsx` as `detectDropZone`)
  - [x] Calculate zones (all zone types supported):
    - [x] **Top zone:** Edge detection with threshold
    - [x] **Bottom zone:** Edge detection with threshold
    - [x] **Left zone:** Edge detection with threshold
    - [x] **Right zone:** Edge detection with threshold
    - [x] **Tab bar zone:** Mouse over tab bar area
    - [x] **Empty canvas zone:** Mouse over empty canvas (creates new panel)
  - [x] Return zone type or `null` if not in any zone
  - [x] Handle edge cases (element too small, mouse outside bounds, window edges)
  - [x] **Empty Canvas Detection:** If no panels exist, detect empty canvas drop zone

### 5.2 Drop Zone Dimensions Calculator
- [x] Export `calculateDropZoneDimensions` function:
  - [x] Export `calculateDropZoneDimensions` function
  - [x] Export `calculateEdgeLineDimensions` function (for initial edge highlight)
  - [x] Calculate dimensions for each zone type:
    - [x] **Top:** Rectangle at top of target
    - [x] **Bottom:** Rectangle at bottom of target
    - [x] **Left:** Rectangle at left of target
    - [x] **Right:** Rectangle at right of target
    - [x] **Tab bar:** Rectangle matching tab bar dimensions
    - [x] **Empty canvas:** Full viewport
  - [x] Return position and size in pixels
  - [x] Ensure dimensions fit within target element bounds

### 5.3 Integration with DndContext
- [x] In `DndTabContext.tsx`, use drop zone calculator:
  - [x] Get mouse position from mousemove listener (ref-based)
  - [x] Get target element rect (tab group or panel)
  - [x] Call `detectDropZone` to determine zone type
  - [x] Call `calculateDropZoneDimensions` / `calculateEdgeLineDimensions` to get zone dimensions
  - [x] Update `activeDropZone` state

---

## 6. Drop Zone Visual Indicators ✅ COMPLETE

### 6.1 Drop Zone Overlay Component
- [x] Create `src/components/Tab/DropZoneIndicator.tsx`:
  - [x] Read `dropZone` from tabStore (no prop needed)
  - [x] Render blue rectangle overlay when `dropZone` is not null
  - [x] Position overlay using `dropZone.position`:
    ```typescript
    style={{
      position: 'absolute',
      left: `${dropZone.position.x}px`,
      top: `${dropZone.position.y}px`,
      width: `${dropZone.position.width}px`,
      height: `${dropZone.position.height}px`,
      border: '2px solid #007acc', // Blue accent color
      backgroundColor: 'rgba(0, 122, 204, 0.1)', // Light blue fill
      pointerEvents: 'none',
      zIndex: 1000,
      borderRadius: '2px',
    }}
    ```
  - [ ] Add arrow indicator pointing to drop location - **TODO: Add arrow indicators**
    - [ ] Top zone: Arrow pointing up
    - [ ] Bottom zone: Arrow pointing down
    - [ ] Left zone: Arrow pointing left
    - [ ] Right zone: Arrow pointing right
    - [ ] Tab bar: No arrow (or small indicator)
  - [x] Add smooth fade-in animation (CSS transition)
  - [x] Ensure overlay doesn't interfere with drag operations (`pointerEvents: 'none'`)
  - [x] Progressive reveal: Edge line initially, full preview after 1 second

### 6.2 Drop Zone Styling
- [x] Use design system colors:
  - [x] Border: `#007acc` (blue accent)
  - [x] Background: `rgba(0, 122, 204, 0.1)` (10% opacity blue) for preview, solid for edge line
  - [ ] Arrow: `#007acc` (blue accent) - **TODO: Add arrows**
- [x] Add smooth transitions
- [x] Ensure visibility:
  - [x] High z-index (9999)
  - [x] Contrasts with background
  - [x] Visible on all panel backgrounds

### 6.3 Integration
- [x] Add `DropZoneIndicator` to `DndTabContext`:
  - [x] Render conditionally when `activeDropZone` is not null
  - [x] Position relative to viewport (fixed positioning)
  - [x] Update position on drag move

---

## 7. Tab Bar Drop Zones ⚠️ PARTIAL

### 7.1 Tab Bar Droppable
- [x] Update `src/components/Tab/TabBar.tsx` (not TabGroup.tsx):
  - [x] Import `useDroppable` from `@dnd-kit/core`
  - [x] Make tab bar area droppable:
    ```typescript
    const { setNodeRef, isOver } = useDroppable({
      id: `tab-bar-${tabGroupId}`,
      data: {
        type: 'tab-bar',
        tabGroupId: tabGroupId,
      },
    });
    ```
  - [x] Apply `ref={setNodeRef}` to tab bar container (combined with existing ref)
  - [x] Add visual feedback when `isOver`:
    - [x] Highlight tab bar border (`border-t-2 border-[#007acc]`)
    - [ ] Show drop indicator line - **TODO: Add insertion line indicator**
    - [ ] Change background color slightly - **TODO: Add background color change**

### 7.2 Tab Insertion Position ⚠️ CRITICAL - NOT IMPLEMENTED
- [ ] Calculate insertion index:
  - [ ] Get mouse X position relative to tab bar
  - [ ] Calculate which tab position mouse is over
  - [ ] Show insertion indicator (vertical line between tabs)
  - [ ] Store insertion index in drop zone data
- [ ] Handle edge cases:
  - [ ] Drop at start (index 0)
  - [ ] Drop at end (append)
  - [ ] Drop between tabs (calculate midpoint)

**Implementation Notes:**
- Calculate insertion index in `detectDropZone` or `handleDragOver` in `DndTabContext.tsx`
- Show vertical line indicator in `TabBar.tsx` when dragging over tab bar
- Pass `insertIndex` to `moveTabToGroup` action

---

## 8. Tab Reordering Within Group ❌ CRITICAL - NOT IMPLEMENTED

**This is the most critical missing feature. Tabs cannot be reordered within a group without this.**

### 8.1 Sortable Tab List
- [ ] Update `TabBar.tsx` (not TabGroup.tsx):
  - [ ] Import `SortableContext`, `horizontalListSortingStrategy` from `@dnd-kit/sortable`
  - [ ] **BUG FIX:** Checklist says `verticalListSortingStrategy` but tabs are horizontal - must use `horizontalListSortingStrategy`
  - [ ] Wrap tab list with `SortableContext`:
    ```typescript
    <SortableContext
      items={tabs.map(t => `tab-${t.id}`)}
      strategy={horizontalListSortingStrategy}
    >
      <div ref={combinedRef} ...>
        {tabs.map((tab) => (
          <TabComponent key={tab.id} ... />
        ))}
      </div>
    </SortableContext>
    ```
  - [ ] Update `Tab.tsx` to use `useSortable` (instead of or in addition to `useDraggable`):
    ```typescript
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: `tab-${tab.id}`,
      data: { ... }
    });
    ```
  - [ ] Handle reorder on drag end in `DndTabContext.tsx`:
    - [ ] Check if dropped on same tab bar (same group)
    - [ ] Get old and new indices from `active` and `over` IDs
    - [ ] Call `reorderTab` or `reorderTabsInGroup` action

### 8.2 Visual Feedback
- [ ] Show placeholder during reorder:
  - [ ] Empty space where tab will be inserted (handled by `useSortable` automatically)
  - [ ] Smooth animation (handled by `transition` from `useSortable`)
  - [ ] Match tab height
- [ ] Animate tab movement:
  - [x] Use CSS transitions (via `transition` from `useSortable`)
  - [ ] Smooth position updates (will work once `useSortable` is implemented)
  - [ ] No janky movements

**Research Finding:** `useSortable` automatically provides placeholder and smooth animations via the `transition` property. Just need to apply it to the style.

---

## 9. Tab Group Creation ⚠️ PARTIAL

### 9.1 Create New Tab Group on Drop
- [x] In `onDragEnd` handler:
  - [x] Check if drop zone type is edge type (`'top'/'right'/'bottom'/'left'`) or empty canvas
  - [x] If empty canvas:
    - [x] Create main panel if it doesn't exist
    - [x] Create new tab group for main panel
    - [x] Move tab to new group
  - [x] If edge type:
    - [x] Call `createTabGroupWithTab` action:
      - [x] Create new tab group
      - [x] Move tab to new group
      - [x] Return new group ID
    - [x] Trigger panel split creation (implemented in `DndTabContext.tsx`)
  - [x] Update layout state

**Note:** Panel split creation is implemented in `DndTabContext.tsx` (handles both same-direction and different-direction splits)

### 9.2 Tab Group Positioning
- [x] Store position data:
  - [x] X, Y coordinates of drop (in drop zone data)
  - [x] Target panel ID (in drop zone data)
  - [x] Drop zone type (in drop zone data)
- [x] Pass to panel system for split creation

---

## 10. Tab Pinning ⚠️ PARTIAL (Actions exist, UI missing)

### 10.1 Pin/Unpin Actions
- [x] Implement `pinTab` action:
  - [x] Add `isPinned: true` to tab
  - [x] Move pinned tab to start of tab list (after other pinned tabs)
  - [x] Update tab order
  - [x] Persist pin state (via Zustand persist middleware)
- [x] Implement `unpinTab` action:
  - [x] Remove `isPinned` flag
  - [ ] Restore tab to original position (if remembered) - **TODO: Remember original position**
  - [x] Update tab order

### 10.2 Pinned Tab UI
- [x] Update `Tab.tsx`:
  - [x] Show pin icon for pinned tabs (emoji 📌)
  - [x] Style pinned tabs differently (subtle background)
  - [ ] Prevent closing pinned tabs (or show warning) - **TODO: Add protection**
  - [ ] Add context menu option: "Unpin Tab" - **TODO: Requires context menu (Section 11)**

---

## 11. Tab Context Menu

### 11.1 Context Menu Component
- [ ] Create `src/components/Tab/TabContextMenu.tsx`:
  - [ ] Use right-click to show menu
  - [ ] Position menu at cursor
  - [ ] Menu options:
    - [ ] "Close Tab"
    - [ ] "Close Other Tabs"
    - [ ] "Close All Tabs"
    - [ ] "Pin Tab" / "Unpin Tab"
    - [ ] "Move to New Tab Group"
    - [ ] Separator
    - [ ] "Copy File Path" (for file tabs)
  - [ ] Handle menu item clicks
  - [ ] Close menu on outside click or selection

### 11.2 Context Menu Integration
- [ ] Add to `Tab.tsx`:
  - [ ] Listen for `onContextMenu` event
  - [ ] Prevent default browser menu
  - [ ] Show `TabContextMenu` at cursor position
  - [ ] Pass tab data to menu

---

## 12. Drag Preview (DragOverlay)

### 12.1 Custom Drag Preview
- [ ] In `DndTabContext.tsx`:
  - [ ] Use `DragOverlay` component
  - [ ] Render tab preview in overlay:
    - [ ] Match tab appearance
    - [ ] Show tab label
    - [ ] Show modified indicator if applicable
    - [ ] Semi-transparent (opacity: 0.8)
    - [ ] Follow cursor smoothly
  - [ ] Style preview:
    - [ ] Shadow for depth
    - [ ] Rounded corners
    - [ ] Match design system

### 12.2 Preview Content
- [ ] Show full tab content in preview:
  - [ ] Tab label
  - [ ] Tab icon (if applicable)
  - [ ] Modified indicator
  - [ ] Close button (non-functional in preview)

---

## 13. Performance Optimization

### 13.1 Throttle Drag Events
- [ ] Throttle `onDragOver` handler:
  - [ ] Use `requestAnimationFrame` for position updates
  - [ ] Debounce drop zone calculations (50ms)
  - [ ] Prevent excessive re-renders
- [ ] Optimize drop zone calculations:
  - [ ] Cache element rects
  - [ ] Only recalculate when mouse moves significantly
  - [ ] Use `useMemo` for expensive calculations

### 13.2 Minimize Re-renders
- [ ] Use `React.memo` for tab components:
  - [ ] Memoize `Tab.tsx`
  - [ ] Memoize `TabGroup.tsx`
  - [ ] Only re-render when props change
- [ ] Use `useCallback` for event handlers:
  - [ ] Memoize drag handlers
  - [ ] Memoize drop handlers
  - [ ] Prevent unnecessary re-renders

### 13.3 Virtualization (if needed)
- [ ] For large numbers of tabs:
  - [ ] Consider virtual scrolling
  - [ ] Only render visible tabs
  - [ ] Use `react-window` or similar (if needed)

---

## 14. Accessibility

### 14.1 Keyboard Support
- [ ] Implement keyboard dragging:
  - [ ] Space/Enter to start drag
  - [ ] Arrow keys to move
  - [ ] Enter to drop
  - [ ] Escape to cancel
- [ ] Use `KeyboardSensor` from dnd-kit
- [ ] Provide keyboard shortcuts:
  - [ ] `Ctrl+Shift+PgUp/PgDn`: Move tab left/right
  - [ ] `Ctrl+K Ctrl+W`: Close tab
  - [ ] `Ctrl+K Ctrl+Shift+W`: Close other tabs

### 14.2 Screen Reader Support
- [ ] Add ARIA attributes:
  - [ ] `role="button"` on draggable tabs
  - [ ] `aria-label` for drag actions
  - [ ] `aria-describedby` for drop zones
  - [ ] Live region announcements for drag operations
- [ ] Announce drag state:
  - [ ] "Dragging [tab name]"
  - [ ] "Drop zone: [location]"
  - [ ] "Tab moved to [group name]"

### 14.3 Focus Management
- [ ] Maintain focus during drag:
  - [ ] Keep focus on dragged tab
  - [ ] Restore focus after drop
  - [ ] Handle focus for keyboard navigation

---

## 15. Error Handling

### 15.1 Validation
- [ ] Validate drag operations:
  - [ ] Prevent dragging tab to its own group (unless reordering)
  - [ ] Prevent invalid drop zones
  - [ ] Validate tab group IDs
- [ ] Handle errors gracefully:
  - [ ] Show error message if drop fails
  - [ ] Revert to previous state on error
  - [ ] Log errors for debugging

### 15.2 Edge Cases
- [ ] Handle last tab in group:
  - [ ] Prevent removing last tab (merge groups instead)
  - [ ] Or allow but show warning
- [ ] Handle rapid drag operations:
  - [ ] Debounce rapid drops
  - [ ] Queue operations if needed
- [ ] Handle tab group removal:
  - [ ] Clean up drag state
  - [ ] Handle orphaned tabs

---

## 16. Integration with Panel System

### 16.1 Panel Split Creation (Phase 5.2 Integration)
- [ ] When tab dropped on edge zone (top/right/bottom/left):
  - [ ] Get `activeDropZone` from tabStore
  - [ ] Check if `dropZone.type` is edge type:
    ```typescript
    if (dropZone.type === 'top' || dropZone.type === 'right' || 
        dropZone.type === 'bottom' || dropZone.type === 'left') {
      // Trigger panel split creation
    }
    ```
  - [ ] Create new tab group first (if needed)
  - [ ] Call `panelStore.createPanelSplit()` action with:
    ```typescript
    const splitOperation: PanelSplitOperation = {
      targetPanelId: dropZone.targetPanelId!,
      direction: dropZone.type === 'top' || dropZone.type === 'bottom' 
        ? 'horizontal' 
        : 'vertical',
      position: dropZone.type === 'top' || dropZone.type === 'left' 
        ? 'before' 
        : 'after',
      newPanelId: generateUUID(),
      newTabGroupId: newTabGroupId,
      size: 50, // Default 50/50 split
    };
    panelStore.createPanelSplit(splitOperation);
    ```
  - [ ] Move tab to new tab group
  - [ ] Reset tab drag state after panel creation
- [ ] Coordinate with `panelStore`:
  - [ ] Create new panel for new tab group
  - [ ] Update panel-to-tab-group mapping
  - [ ] Update layout state

### 16.2 Tab Group to Panel Mapping
- [ ] Maintain mapping:
  - [ ] Each tab group belongs to a panel
  - [ ] Update mapping when groups created/moved
  - [ ] Sync with panel store

---

## 17. Testing

### 17.1 Unit Tests
- [ ] Test `dropZoneCalculator`:
  - [ ] Test zone detection (top/bottom/left/right)
  - [ ] Test snap threshold
  - [ ] Test edge cases
- [ ] Test tab store actions:
  - [ ] Test `moveTabToGroup`
  - [ ] Test `createTabGroupWithTab`
  - [ ] Test `reorderTabsInGroup`
  - [ ] Test `pinTab` / `unpinTab`

### 17.2 Integration Tests
- [ ] Test drag-and-drop flow:
  - [ ] Drag tab to tab bar
  - [ ] Drag tab to create new group
  - [ ] Reorder tabs within group
  - [ ] Drag between groups
- [ ] Test drop zone indicators:
  - [ ] Verify drop zones appear correctly
  - [ ] Verify drop zones update on mouse move
  - [ ] Verify drop zones disappear on cancel

### 17.3 Manual Testing
- [ ] Test with multiple tab groups:
  - [ ] Drag tab between groups
  - [ ] Create new groups
  - [ ] Merge groups
- [ ] Test with many tabs:
  - [ ] Performance with 10+ tabs
  - [ ] Performance with 20+ tabs
  - [ ] Smooth animations
- [ ] Test edge cases:
  - [ ] Drag last tab from group
  - [ ] Rapid drag operations
  - [ ] Drag during panel resize
  - [ ] Drag with multiple windows (if applicable)

### 17.4 Cross-Browser Testing
- [ ] Test in Chrome/Edge
- [ ] Test in Firefox
- [ ] Test in Safari (if on Mac)
- [ ] Verify consistent behavior

---

## 18. Documentation

### 18.1 Code Documentation
- [ ] Add JSDoc comments to all functions:
  - [ ] `calculateDropZone`
  - [ ] `calculateDropZoneDimensions`
  - [ ] Store actions
  - [ ] Event handlers
- [ ] Document complex logic:
  - [ ] Drop zone detection algorithm
  - [ ] Tab group creation flow
  - [ ] Integration with panel system

### 18.2 User Documentation (if needed)
- [ ] Document keyboard shortcuts
- [ ] Document drag-and-drop gestures
- [ ] Document tab pinning feature

---

## 19. Performance Checklist

- [ ] Drag operations are smooth (60fps)
- [ ] Drop zone calculations don't lag
- [ ] No excessive re-renders during drag
- [ ] Memory usage is reasonable
- [ ] No memory leaks (test extended drag sessions)

---

## 20. Completion Criteria

Before marking this phase complete, verify:

- [ ] Tabs can be dragged between tab groups
- [ ] Tabs can be dragged to create new tab groups (triggers panel split - Phase 5.2)
- [ ] Tabs can be reordered within groups
- [ ] Drop zone indicators appear correctly (blue boxes)
- [ ] Drop zones show exact placement location
- [ ] Tab context menu works
- [ ] Tab pinning works
- [ ] Keyboard navigation works
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Cross-browser compatible

---

## Notes

- **Drop Zone Visuals:** Blue boxes that fit within target panel, showing exact size
- **Snap Threshold:** 20px from edges (configurable)
- **Drag Threshold:** 8px movement to start drag (prevents accidental drags)
- **Integration:** This phase focuses on tab dragging. Panel splitting (Phase 5.2) will handle creating new panels when tabs are dropped on edges.

---

## References

- dnd-kit Documentation: https://docs.dndkit.com/
- dnd-kit GitHub: https://github.com/clauderic/dnd-kit
- react-resizable-panels: https://github.com/bvaughn/react-resizable-panels
- VS Code Tab Dragging (reference implementation)
- Cursor IDE Tab Dragging (reference implementation)

