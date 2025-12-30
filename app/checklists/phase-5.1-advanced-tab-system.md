# Phase 5.1: Advanced Tab System (Tab Dragging)

**Phase:** 5.1  
**Duration:** 1-2 weeks  
**Priority:** High  
**Goal:** Implement tab dragging with drop zones and tab group management  
**Status:** Not Started  
**Created:** 2025-12-30  
**Last Updated:** 2025-12-30

---

## Overview

This phase implements advanced tab system features including tab dragging, drag-and-drop between tab groups, tab reordering, tab pinning, and tab context menus. Tabs can be dragged to create new tab groups or moved between existing groups, with visual drop zone indicators showing exactly where tabs will be placed.

**Deliverable:** Advanced tab system with full drag-and-drop support

**Dependencies:** 
- Phase 1.2 (Basic Tab System) - ✅ Complete
- Phase 1.4 (Basic Resizable Panels) - ✅ Complete (recommended)

**Research Sources:**
- `../02-research/ui-resizable-panels-research.md` - Drag-and-drop research
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

### 3. Critical Notes
- [ ] **Note:** Tab drop zones are managed in tabStore
- [ ] Panel drop zones (for edge splits) are managed in panelStore (Phase 5.2)
- [ ] Coordinate between stores when tab is dropped on panel edge

---

## 1. Data Structures & Types

### 1.1 Tab Drag Types
- [ ] Create `src/types/tabDrag.ts`:
  - [ ] Define `TabDragData` interface:
    ```typescript
    interface TabDragData {
      tabId: string;
      tabGroupId: string;
      tabLabel: string;
      tabType: 'file' | 'panel';
      filePath?: string;
    }
    ```
  - [ ] Define `DropZoneType` type:
    ```typescript
    type DropZoneType = 'tab-bar' | 'top' | 'right' | 'bottom' | 'left';
    ```
  - [ ] Define `DropZoneData` interface:
    ```typescript
    interface DropZoneData {
      type: DropZoneType;
      targetTabGroupId?: string; // For 'tab-bar' type
      targetPanelId?: string; // For edge types
      position: { x: number; y: number; width: number; height: number };
    }
    ```

### 1.2 Tab Group Management Types
- [ ] Extend `TabGroup` interface in `src/types/tab.ts`:
  - [ ] Add `isDragging?: boolean` flag
  - [ ] Add `dropZone?: DropZoneData` for active drop zone
  - [ ] Verify `id`, `tabs`, `activeTabId` exist

---

## 2. Tab Store Extensions

### 2.1 Add Tab Drag Actions
- [ ] Update `src/stores/tabStore.ts`:
  - [ ] Add `draggingTab: TabDragData | null` to state
  - [ ] Add `activeDropZone: DropZoneData | null` to state
  - [ ] Add `setDraggingTab: (data: TabDragData | null) => void` action
  - [ ] Add `setActiveDropZone: (zone: DropZoneData | null) => void` action
  - [ ] Add `moveTabToGroup: (tabId: string, fromGroupId: string, toGroupId: string, insertIndex?: number) => void` action
  - [ ] Add `createTabGroupWithTab: (tabId: string, fromGroupId: string, position: { x: number; y: number }) => string` action (returns new group ID)
  - [ ] Add `reorderTabsInGroup: (tabGroupId: string, tabIds: string[]) => void` action
  - [ ] Add `pinTab: (tabId: string, tabGroupId: string) => void` action
  - [ ] Add `unpinTab: (tabId: string, tabGroupId: string) => void` action

### 2.2 Tab Group Management
- [ ] Add `mergeTabGroups: (sourceGroupId: string, targetGroupId: string) => void` action
- [ ] Add `splitTabGroup: (tabGroupId: string, tabId: string) => string` action (returns new group ID)
- [ ] Add validation: Prevent moving last tab from group (merge instead)
- [ ] Add cleanup: Remove empty tab groups after tab removal

---

## 3. DndContext Setup

### 3.1 Create DndContext Wrapper
- [ ] Create `src/components/Tab/DndTabContext.tsx`:
  - [ ] Import `DndContext`, `DragOverlay`, `useSensor`, `useSensors`, `PointerSensor`, `KeyboardSensor` from `@dnd-kit/core`
  - [ ] Import `sortableKeyboardCoordinates` from `@dnd-kit/sortable`
  - [ ] Import `useDndMonitor` from `@dnd-kit/core`
  - [ ] Create component that wraps tab system:
    ```typescript
    interface DndTabContextProps {
      children: React.ReactNode;
    }
    ```
  - [ ] Configure sensors:
    - [ ] PointerSensor with `activationConstraint: { distance: 8 }` (8px drag threshold)
    - [ ] KeyboardSensor with `coordinateGetter: sortableKeyboardCoordinates`
  - [ ] Set up `DndContext` with:
    - [ ] `sensors={sensors}`
    - [ ] `onDragStart` handler
    - [ ] `onDragOver` handler
    - [ ] `onDragEnd` handler
    - [ ] `onDragCancel` handler
  - [ ] Add `DragOverlay` for drag preview
  - [ ] Use `useDndMonitor` to track drag state

### 3.2 Drag Event Handlers
- [ ] Implement `onDragStart`:
  - [ ] Extract `TabDragData` from event
  - [ ] Call `setDraggingTab` with drag data
  - [ ] Update tab appearance (opacity, cursor)
  - [ ] Prevent text selection during drag
- [ ] Implement `onDragOver`:
  - [ ] Get `over` object from event (contains collision data)
  - [ ] Get `activatorEvent` from event for mouse coordinates:
    ```typescript
    const mouseX = event.activatorEvent?.clientX || 0;
    const mouseY = event.activatorEvent?.clientY || 0;
    ```
  - [ ] Get target element using `over?.id` or `document.elementFromPoint(mouseX, mouseY)`
  - [ ] Get element bounding rect: `element.getBoundingClientRect()`
  - [ ] Calculate drop zone using mouse position and element rect
  - [ ] Detect which drop zone is active (top/right/bottom/left/tab-bar)
  - [ ] Calculate drop zone dimensions
  - [ ] Call `setActiveDropZone` with zone data
  - [ ] Throttle updates (use `requestAnimationFrame` - 60fps = 16ms)
- [ ] Implement `onDragEnd`:
  - [ ] Get active drop zone from state
  - [ ] Handle drop based on zone type:
    - [ ] `'tab-bar'`: Move tab to existing group
    - [ ] `'top'/'bottom'/'left'/'right'`: Create new tab group (handled in Phase 5.2)
  - [ ] Reset drag state (`setDraggingTab(null)`, `setActiveDropZone(null)`)
  - [ ] Update tab positions in store
- [ ] Implement `onDragCancel`:
  - [ ] Reset drag state
  - [ ] Restore tab appearance

---

## 4. Draggable Tab Component

### 4.1 Make Tab Draggable
- [ ] Update `src/components/Tab/Tab.tsx`:
  - [ ] Import `useDraggable` from `@dnd-kit/core`
  - [ ] Import `useSortable` from `@dnd-kit/sortable`
  - [ ] Import `CSS` from `@dnd-kit/utilities`
  - [ ] Add `useDraggable` hook:
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
  - [ ] Apply transform styles: `style={{ transform: CSS.Translate.toString(transform) }}`
  - [ ] Add drag handle attributes to tab element:
    - [ ] `{...listeners}` on tab (or specific drag handle area)
    - [ ] `{...attributes}` for accessibility
    - [ ] `ref={setNodeRef}`
  - [ ] Add visual feedback when dragging:
    - [ ] Opacity: `isDragging ? 0.5 : 1`
    - [ ] Cursor: `cursor: grab` when not dragging, `cursor: grabbing` when dragging
    - [ ] Z-index: Higher when dragging

### 4.2 Tab Drag Handle
- [ ] Add drag handle area (optional - can drag from entire tab):
  - [ ] Create drag handle icon/area
  - [ ] Apply `{...listeners}` only to handle (not entire tab)
  - [ ] Style handle: `cursor: grab`, hover effect
  - [ ] Add tooltip: "Drag to move tab"

### 4.3 Tab States
- [ ] Handle pinned tab state:
  - [ ] Show pin icon for pinned tabs
  - [ ] Prevent dragging pinned tabs (or allow with special handling)
  - [ ] Style pinned tabs differently
- [ ] Handle modified tab state:
  - [ ] Show modified indicator (dot) during drag
  - [ ] Maintain indicator in drag preview

---

## 5. Drop Zone Detection System

### 5.1 Drop Zone Calculator
- [ ] Create `src/utils/dropZoneCalculator.ts`:
  - [ ] Export `calculateDropZone` function:
    ```typescript
    function calculateDropZone(
      mouseX: number,
      mouseY: number,
      elementRect: DOMRect,
      snapThreshold: number = 20
    ): DropZoneType | null
    ```
  - [ ] Calculate zones:
    - [ ] **Top zone:** `mouseY < elementRect.top + snapThreshold`
    - [ ] **Bottom zone:** `mouseY > elementRect.bottom - snapThreshold`
    - [ ] **Left zone:** `mouseX < elementRect.left + snapThreshold`
    - [ ] **Right zone:** `mouseX > elementRect.right - snapThreshold`
    - [ ] **Tab bar zone:** Mouse over tab bar area
    - [ ] **Center:** Return `null` (not used for tab dragging)
  - [ ] Return zone type or `null` if not in any zone
  - [ ] Handle edge cases (element too small, mouse outside bounds)

### 5.2 Drop Zone Dimensions Calculator
- [ ] Export `calculateDropZoneDimensions` function:
    ```typescript
    function calculateDropZoneDimensions(
      zoneType: DropZoneType,
      targetRect: DOMRect,
      defaultSize: number = 50 // percentage
    ): { x: number; y: number; width: number; height: number }
    ```
  - [ ] Calculate dimensions for each zone type:
    - [ ] **Top:** Rectangle at top of target, height = `defaultSize%` of target height
    - [ ] **Bottom:** Rectangle at bottom of target, height = `defaultSize%` of target height
    - [ ] **Left:** Rectangle at left of target, width = `defaultSize%` of target width
    - [ ] **Right:** Rectangle at right of target, width = `defaultSize%` of target width
    - [ ] **Tab bar:** Rectangle matching tab bar dimensions
  - [ ] Return position and size in pixels
  - [ ] Ensure dimensions fit within target element bounds

### 5.3 Integration with DndContext
- [ ] In `DndTabContext.tsx`, use drop zone calculator:
  - [ ] Get mouse position from drag event
  - [ ] Get target element rect (tab group or panel)
  - [ ] Call `calculateDropZone` to determine zone type
  - [ ] Call `calculateDropZoneDimensions` to get zone dimensions
  - [ ] Update `activeDropZone` state

---

## 6. Drop Zone Visual Indicators

### 6.1 Drop Zone Overlay Component
- [ ] Create `src/components/Tab/DropZoneIndicator.tsx`:
  - [ ] Accept `dropZone: DropZoneData | null` prop
  - [ ] Render blue rectangle overlay when `dropZone` is not null
  - [ ] Position overlay using `dropZone.position`:
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
  - [ ] Add arrow indicator pointing to drop location:
    - [ ] Top zone: Arrow pointing up
    - [ ] Bottom zone: Arrow pointing down
    - [ ] Left zone: Arrow pointing left
    - [ ] Right zone: Arrow pointing right
    - [ ] Tab bar: No arrow (or small indicator)
  - [ ] Add smooth fade-in animation (CSS transition)
  - [ ] Ensure overlay doesn't interfere with drag operations (`pointerEvents: 'none'`)

### 6.2 Drop Zone Styling
- [ ] Use design system colors:
  - [ ] Border: `#007acc` (blue accent)
  - [ ] Background: `rgba(0, 122, 204, 0.1)` (10% opacity blue)
  - [ ] Arrow: `#007acc` (blue accent)
- [ ] Add hover effect (if applicable):
  - [ ] Slightly brighter border on hover
  - [ ] Smooth transition
- [ ] Ensure visibility:
  - [ ] High z-index (1000+)
  - [ ] Contrasts with background
  - [ ] Visible on all panel backgrounds

### 6.3 Integration
- [ ] Add `DropZoneIndicator` to `DndTabContext`:
  - [ ] Render conditionally when `activeDropZone` is not null
  - [ ] Position relative to appropriate container (tab group or panel)
  - [ ] Update position on drag move

---

## 7. Tab Bar Drop Zones

### 7.1 Tab Bar Droppable
- [ ] Update `src/components/Tab/TabGroup.tsx`:
  - [ ] Import `useDroppable` from `@dnd-kit/core`
  - [ ] Make tab bar area droppable:
    ```typescript
    const { setNodeRef, isOver } = useDroppable({
      id: `tab-bar-${tabGroup.id}`,
      data: {
        type: 'tab-bar',
        tabGroupId: tabGroup.id,
      },
    });
    ```
  - [ ] Apply `ref={setNodeRef}` to tab bar container
  - [ ] Add visual feedback when `isOver`:
    - [ ] Highlight tab bar border
    - [ ] Show drop indicator line
    - [ ] Change background color slightly

### 7.2 Tab Insertion Position
- [ ] Calculate insertion index:
  - [ ] Get mouse X position relative to tab bar
  - [ ] Calculate which tab position mouse is over
  - [ ] Show insertion indicator (vertical line between tabs)
  - [ ] Store insertion index in drop zone data
- [ ] Handle edge cases:
  - [ ] Drop at start (index 0)
  - [ ] Drop at end (append)
  - [ ] Drop between tabs (calculate midpoint)

---

## 8. Tab Reordering Within Group

### 8.1 Sortable Tab List
- [ ] Update `TabGroup.tsx`:
  - [ ] Import `SortableContext`, `verticalListSortingStrategy` from `@dnd-kit/sortable`
  - [ ] Wrap tab list with `SortableContext`:
    ```typescript
    <SortableContext
      items={tabGroup.tabs.map(t => `tab-${t.id}`)}
      strategy={verticalListSortingStrategy}
    >
      {/* Tab components */}
    </SortableContext>
    ```
  - [ ] Use `useSortable` in `Tab.tsx` (instead of just `useDraggable`)
  - [ ] Handle reorder on drag end:
    - [ ] Get new order from sortable context
    - [ ] Call `reorderTabsInGroup` action

### 8.2 Visual Feedback
- [ ] Show placeholder during reorder:
  - [ ] Empty space where tab will be inserted
  - [ ] Smooth animation
  - [ ] Match tab height
- [ ] Animate tab movement:
  - [ ] Use CSS transitions
  - [ ] Smooth position updates
  - [ ] No janky movements

---

## 9. Tab Group Creation

### 9.1 Create New Tab Group on Drop
- [ ] In `onDragEnd` handler:
  - [ ] Check if drop zone type is edge type (`'top'/'right'/'bottom'/'left'`)
  - [ ] Call `createTabGroupWithTab` action:
    - [ ] Create new tab group
    - [ ] Move tab to new group
    - [ ] Return new group ID
  - [ ] Trigger panel split creation (Phase 5.2 will handle this)
  - [ ] Update layout state

### 9.2 Tab Group Positioning
- [ ] Store position data:
  - [ ] X, Y coordinates of drop
  - [ ] Target panel ID
  - [ ] Drop zone type
- [ ] Pass to panel system for split creation

---

## 10. Tab Pinning

### 10.1 Pin/Unpin Actions
- [ ] Implement `pinTab` action:
  - [ ] Add `isPinned: true` to tab
  - [ ] Move pinned tab to start of tab list
  - [ ] Update tab order
  - [ ] Persist pin state
- [ ] Implement `unpinTab` action:
  - [ ] Remove `isPinned` flag
  - [ ] Restore tab to original position (if remembered)
  - [ ] Update tab order

### 10.2 Pinned Tab UI
- [ ] Update `Tab.tsx`:
  - [ ] Show pin icon for pinned tabs
  - [ ] Style pinned tabs differently (subtle background)
  - [ ] Prevent closing pinned tabs (or show warning)
  - [ ] Add context menu option: "Unpin Tab"

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

