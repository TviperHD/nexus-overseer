# Phase 5.2: Panel Drag and Drop

**Phase:** 5.2  
**Duration:** 2-3 weeks  
**Priority:** High  
**Goal:** Implement panel dragging with drop zones and dynamic panel splitting  
**Status:** Not Started  
**Created:** 2025-12-30  
**Last Updated:** 2025-12-30

---

## Overview

This phase implements panel drag-and-drop functionality, allowing users to drag tabs/panels to create new panel splits at any position (top, right, bottom, left). When a tab is dropped on an edge drop zone, a new panel is dynamically created and inserted into the layout using `react-resizable-panels`. This creates a VS Code/Cursor-like experience where users can customize their workspace layout by dragging.

**Deliverable:** Panel drag-and-drop with dynamic splitting working

**Dependencies:** 
- Phase 1.4 (Basic Resizable Panels) - ✅ Complete
- Phase 5.1 (Advanced Tab System) - ✅ Complete (recommended)

**Research Sources:**
- `../02-research/ui-resizable-panels-research.md` - Panel drag research
- `../04-design/ui-overall-layout.md` - Drop zone specifications
- `../03-planning/technical-specs-resizable-panels.md` - System architecture
- `DRAG_DROP_VISUAL_EXAMPLES.md` - Visual examples
- react-resizable-panels documentation: https://github.com/bvaughn/react-resizable-panels
- dnd-kit documentation: https://docs.dndkit.com/

---

## Prerequisites & Setup

### 1. Verify Dependencies
- [ ] Confirm Phase 5.1 (Advanced Tab System) is complete
- [ ] Confirm `@dnd-kit/core` is installed (v6.3.1+)
- [ ] Confirm `react-resizable-panels` is installed (v4.0.16+)
- [ ] Verify `zustand` is installed (v5.0.9+)

### 2. Review Existing Code
- [ ] **CRITICAL:** Verify `src/stores/panelStore.ts` exists (from Phase 1.4)
- [ ] **CRITICAL:** Verify `src/components/Panels/PanelGroup.tsx` exists (from Phase 1.4)
- [ ] **CRITICAL:** Verify `src/components/Panels/Panel.tsx` exists (from Phase 1.4)
- [ ] Review `src/stores/panelStore.ts` - Understand panel state structure
- [ ] Review `src/components/Panels/PanelGroup.tsx` - Understand panel group structure
- [ ] Review `src/stores/tabStore.ts` - Understand tab drag data
- [ ] Review Phase 5.1 drop zone system

### 3. Critical Notes
- [ ] **Note:** Panel drop zones are managed in panelStore
- [ ] Tab drop zones (for tab-bar) are managed in tabStore (Phase 5.1)
- [ ] When tab dropped on panel edge, tabStore triggers panelStore action

---

## 1. Panel Drag Data Structures

### 1.1 Panel Drag Types
- [ ] Create `src/types/panelDrag.ts`:
  - [ ] Define `PanelDragData` interface:
    ```typescript
    interface PanelDragData {
      type: 'tab' | 'panel';
      tabId?: string; // If dragging tab
      tabGroupId?: string; // If dragging tab
      panelId?: string; // If dragging entire panel
      sourcePanelId: string; // Panel where drag started
    }
    ```
  - [ ] Define `PanelDropZone` interface:
    ```typescript
    interface PanelDropZone {
      panelId: string; // Target panel
      edge: 'top' | 'right' | 'bottom' | 'left';
      position: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      splitDirection: 'horizontal' | 'vertical'; // Direction of new split
    }
    ```
  - [ ] Define `PanelSplitOperation` interface:
    ```typescript
    interface PanelSplitOperation {
      targetPanelId: string;
      direction: 'horizontal' | 'vertical';
      position: 'before' | 'after'; // Where to insert new panel
      newPanelId: string;
      newTabGroupId: string;
      size: number; // Percentage for new panel
    }
    ```

---

## 2. Panel Store Extensions

### 2.1 Add Panel Drag Actions
- [ ] Update `src/stores/panelStore.ts`:
  - [ ] Add `draggingPanel: PanelDragData | null` to state
  - [ ] Add `activePanelDropZone: PanelDropZone | null` to state
  - [ ] Add `setDraggingPanel: (data: PanelDragData | null) => void` action
  - [ ] Add `setActivePanelDropZone: (zone: PanelDropZone | null) => void` action
  - [ ] Add `createPanelSplit: (operation: PanelSplitOperation) => void` action
  - [ ] Add `removePanel: (panelId: string) => void` action
  - [ ] Add `movePanel: (panelId: string, targetPanelId: string, edge: 'top' | 'right' | 'bottom' | 'left') => void` action

### 2.2 Panel Layout Management
- [ ] Add `insertPanelIntoGroup: (panelGroupId: string, panelId: string, direction: 'horizontal' | 'vertical', position: number) => void` action
- [ ] Add `updatePanelLayout: (layout: PanelLayout) => void` action
- [ ] Add `getPanelPath: (panelId: string) => string[]` helper (returns path to panel in tree)
- [ ] Add `findPanelGroup: (panelId: string) => PanelGroupConfig | null` helper

---

## 3. Panel Drop Zone Detection

### 3.1 Panel Drop Zone Calculator
- [ ] Create `src/utils/panelDropZoneCalculator.ts`:
  - [ ] Export `calculatePanelDropZone` function:
    ```typescript
    function calculatePanelDropZone(
      mouseX: number,
      mouseY: number,
      panelElement: HTMLElement,
      snapThreshold: number = 20
    ): PanelDropZone | null
    ```
  - [ ] Get panel bounding rect
  - [ ] Calculate which edge is closest:
    - [ ] **Top edge:** `mouseY < rect.top + snapThreshold`
    - [ ] **Bottom edge:** `mouseY > rect.bottom - snapThreshold`
    - [ ] **Left edge:** `mouseX < rect.left + snapThreshold`
    - [ ] **Right edge:** `mouseX > rect.right - snapThreshold`
  - [ ] Calculate drop zone dimensions:
    - [ ] Top/Bottom: Horizontal rectangle (full width, 30% height)
    - [ ] Left/Right: Vertical rectangle (30% width, full height)
  - [ ] Determine split direction:
    - [ ] Top/Bottom → `'horizontal'` split
    - [ ] Left/Right → `'vertical'` split
  - [ ] Return `PanelDropZone` or `null`

### 3.2 Drop Zone Position Calculation
- [ ] Export `calculateDropZonePosition` function:
    ```typescript
    function calculateDropZonePosition(
      edge: 'top' | 'right' | 'bottom' | 'left',
      panelRect: DOMRect,
      defaultSize: number = 50
    ): { x: number; y: number; width: number; height: number }
    ```
  - [ ] Calculate exact pixel position and size:
    - [ ] **Top:** `{ x: rect.left, y: rect.top, width: rect.width, height: rect.height * (defaultSize / 100) }`
    - [ ] **Bottom:** `{ x: rect.left, y: rect.bottom - (rect.height * defaultSize / 100), width: rect.width, height: rect.height * (defaultSize / 100) }`
    - [ ] **Left:** `{ x: rect.left, y: rect.top, width: rect.width * (defaultSize / 100), height: rect.height }`
    - [ ] **Right:** `{ x: rect.right - (rect.width * defaultSize / 100), y: rect.top, width: rect.width * (defaultSize / 100), height: rect.height }`
  - [ ] Ensure dimensions fit within panel bounds
  - [ ] Return position object

### 3.3 Integration with Drag System
- [ ] In `DndTabContext.tsx` (or new `DndPanelContext.tsx`):
  - [ ] In `onDragOver` handler:
    - [ ] Get `over` object from event (contains collision data)
    - [ ] Get `activatorEvent` from event for mouse coordinates:
      ```typescript
      const mouseX = event.activatorEvent?.clientX || 0;
      const mouseY = event.activatorEvent?.clientY || 0;
      ```
    - [ ] Get target panel element using `over?.id` or `document.elementFromPoint(mouseX, mouseY)`
    - [ ] Get element bounding rect: `element.getBoundingClientRect()`
    - [ ] Call `calculatePanelDropZone(mouseX, mouseY, element, 20)` on drag move
    - [ ] Update `activePanelDropZone` in panel store
    - [ ] Throttle calculations (use `requestAnimationFrame` - 60fps = 16ms)

---

## 4. Panel Drop Zone Visual Indicators

### 4.1 Panel Drop Zone Component
- [ ] Create `src/components/Panels/PanelDropZoneIndicator.tsx`:
  - [ ] Accept `dropZone: PanelDropZone | null` prop
  - [ ] Render blue rectangle overlay when `dropZone` is not null
  - [ ] Position overlay using `dropZone.position`:
    ```typescript
    style={{
      position: 'absolute',
      left: `${dropZone.position.x}px`,
      top: `${dropZone.position.y}px`,
      width: `${dropZone.position.width}px`,
      height: `${dropZone.position.height}px`,
      border: '2px solid #007acc', // Blue accent
      backgroundColor: 'rgba(0, 122, 204, 0.1)', // 10% opacity
      pointerEvents: 'none',
      zIndex: 1000,
      borderRadius: '2px',
    }}
    ```
  - [ ] Add arrow indicator:
    - [ ] Top: Arrow pointing up (↑)
    - [ ] Bottom: Arrow pointing down (↓)
    - [ ] Left: Arrow pointing left (←)
    - [ ] Right: Arrow pointing right (→)
  - [ ] Add smooth fade-in animation
  - [ ] Ensure overlay doesn't block interactions

### 4.2 Drop Zone Styling
- [ ] Use design system colors:
  - [ ] Border: `#007acc` (blue accent)
  - [ ] Background: `rgba(0, 122, 204, 0.1)`
  - [ ] Arrow: `#007acc`
- [ ] Add hover effect:
  - [ ] Slightly brighter on hover
  - [ ] Smooth transition
- [ ] Ensure high visibility:
  - [ ] Z-index: 1000+
  - [ ] Contrasts with all backgrounds
  - [ ] Visible during drag

### 4.3 Integration
- [ ] Add `PanelDropZoneIndicator` to panel layout:
  - [ ] Render in panel container
  - [ ] Position relative to panel group
  - [ ] Update on drag move
  - [ ] Remove on drag end/cancel

---

## 5. Dynamic Panel Creation

### 5.1 Panel Split Algorithm
- [ ] Create `src/utils/panelSplitAlgorithm.ts`:
  - [ ] Export `calculatePanelSplit` function:
    ```typescript
    function calculatePanelSplit(
      targetPanelId: string,
      edge: 'top' | 'right' | 'bottom' | 'left',
      currentLayout: PanelLayout
    ): PanelSplitOperation
    ```
  - [ ] Find target panel in layout tree
  - [ ] Determine split direction:
    - [ ] Top/Bottom → `'horizontal'`
    - [ ] Left/Right → `'vertical'`
  - [ ] Determine insertion position:
    - [ ] Top/Left → `'before'`
    - [ ] Bottom/Right → `'after'`
  - [ ] Calculate new panel size (default 50%)
  - [ ] Generate new panel ID and tab group ID
  - [ ] Return `PanelSplitOperation`

### 5.2 Layout Tree Manipulation
- [ ] Create `src/utils/panelLayoutTree.ts`:
  - [ ] Export `insertPanelIntoLayout` function:
    ```typescript
    function insertPanelIntoLayout(
      layout: PanelLayout,
      operation: PanelSplitOperation
    ): PanelLayout
    ```
  - [ ] Find target panel in tree
  - [ ] Determine if target is in a group or standalone
  - [ ] Create new panel group if needed:
    - [ ] If target is standalone, wrap in group
    - [ ] If target is in group, create sibling group
  - [ ] Insert new panel at correct position
  - [ ] Update panel sizes (split existing panel size)
  - [ ] Return updated layout

### 5.3 Panel Group Creation
- [ ] Handle nested panel groups:
  - [ ] If target is in horizontal group and splitting vertically:
    - [ ] Create new vertical group containing both panels
  - [ ] If target is in vertical group and splitting horizontally:
    - [ ] Create new horizontal group containing both panels
  - [ ] Maintain proper nesting structure
  - [ ] Update all panel IDs and references

---

## 6. React-Resizable-Panels Integration

### 6.1 Dynamic Panel Rendering
- [ ] Update `src/components/Panels/PanelGroup.tsx`:
  - [ ] Get `currentLayout` from `panelStore`
  - [ ] Render panels from `currentLayout.panels` (dynamic array)
  - [ ] **CRITICAL:** Use `panel.id` as `key` prop on each Panel component:
    ```typescript
    {currentLayout.panels.map(panelConfig => (
      <Panel key={panelConfig.id} id={panelConfig.id} {...panelConfig} />
    ))}
    ```
  - [ ] Use `useMemo` to prevent unnecessary re-renders:
    ```typescript
    const panels = useMemo(() => {
      return currentLayout?.panels.map(panelConfig => (
        <Panel key={panelConfig.id} id={panelConfig.id} {...panelConfig} />
      )) || [];
    }, [currentLayout]);
    ```
  - [ ] Handle panel addition: React will automatically add new Panel when layout updates
  - [ ] Handle panel removal: React will automatically remove Panel when layout updates
  - [ ] Update `PanelGroup` when layout changes (React will re-render automatically)

### 6.2 Panel Component Updates
- [ ] Update `src/components/Panels/Panel.tsx`:
  - [ ] Accept dynamic `id` prop
  - [ ] Support being added/removed dynamically
  - [ ] Handle size updates from store
  - [ ] Integrate with tab group system

### 6.3 Panel Group Direction
- [ ] Determine group direction from layout:
  - [ ] Check if group should be horizontal or vertical
  - [ ] Set `direction` prop on `PanelGroup` from `react-resizable-panels`
  - [ ] Support nested groups with different directions

---

## 7. Drop Handler Implementation

### 7.1 Handle Panel Drop
- [ ] In `DndTabContext.tsx` or `DndPanelContext.tsx`:
  - [ ] Extend `onDragEnd` handler:
    - [ ] Check if drop zone is panel edge type
    - [ ] Get `PanelDropZone` from state
    - [ ] Call `createPanelSplit` action
    - [ ] Update layout in store
    - [ ] Trigger panel re-render
  - [ ] Handle tab drop:
    - [ ] Extract tab data from drag event
    - [ ] Create new tab group for new panel
    - [ ] Move tab to new group
    - [ ] Link tab group to new panel

### 7.2 Panel Split Execution
- [ ] Implement `createPanelSplit` action:
  - [ ] Calculate split operation using algorithm
  - [ ] Update layout tree
  - [ ] Create new panel in store
  - [ ] Create new tab group
  - [ ] Link tab group to panel
  - [ ] Update panel sizes
  - [ ] Persist layout (if persistence enabled)

### 7.3 Size Distribution
- [ ] When creating split:
  - [ ] Default: 50/50 split
  - [ ] Or use drop zone position to determine size
  - [ ] Ensure minimum sizes are respected
  - [ ] Update all panel sizes in group proportionally

---

## 8. Panel Removal

### 8.1 Remove Panel Action
- [ ] Implement `removePanel` action:
  - [ ] Find panel in layout tree
  - [ ] Remove panel from group
  - [ ] If group has only one panel left:
    - [ ] Remove group, keep remaining panel
  - [ ] Update panel sizes (redistribute space)
  - [ ] Clean up tab groups
  - [ ] Update layout state

### 8.2 Panel Cleanup
- [ ] Handle panel removal:
  - [ ] Close associated tab groups
  - [ ] Move tabs to other panels (or close)
  - [ ] Update panel-to-tab-group mappings
  - [ ] Persist updated layout

---

## 9. Panel Movement

### 9.1 Move Panel to New Position
- [ ] Implement `movePanel` action:
  - [ ] Remove panel from current position
  - [ ] Insert panel at new position
  - [ ] Update layout tree
  - [ ] Maintain panel state (size, content)
  - [ ] Update tab group mappings

### 9.2 Drag Entire Panel
- [ ] Support dragging entire panel (not just tab):
  - [ ] Make panel header draggable
  - [ ] Use same drop zone system
  - [ ] Move panel and all its tab groups
  - [ ] Maintain panel content

---

## 10. Layout Persistence

### 10.1 Save Layout After Split
- [ ] After creating split:
  - [ ] Save updated layout to store
  - [ ] Persist to localStorage (if enabled)
  - [ ] Update layout version/timestamp
- [ ] Debounce persistence (don't save on every drag)

### 10.2 Restore Layout with Splits
- [ ] When loading layout:
  - [ ] Recreate all panel groups
  - [ ] Recreate all panels
  - [ ] Restore panel sizes
  - [ ] Link tab groups to panels
  - [ ] Validate layout structure

---

## 11. Visual Feedback During Drag

### 11.1 Drag Preview
- [ ] Show panel preview during drag:
  - [ ] Semi-transparent panel preview
  - [ ] Follows cursor
  - [ ] Shows panel content (tab group, etc.)
  - [ ] Matches design system

### 11.2 Panel Highlighting
- [ ] Highlight target panel during drag:
  - [ ] Subtle border highlight
  - [ ] Slight background change
  - [ ] Smooth transition
  - [ ] Remove on drag end

### 11.3 Drop Zone Animation
- [ ] Animate drop zone appearance:
  - [ ] Fade in smoothly
  - [ ] Scale animation (optional)
  - [ ] Remove smoothly on drag end
  - [ ] No janky animations

---

## 12. Performance Optimization

### 12.1 Throttle Layout Updates
- [ ] Throttle layout calculations:
  - [ ] Use `requestAnimationFrame` for position updates
  - [ ] Debounce drop zone calculations (50ms)
  - [ ] Batch layout updates
- [ ] Optimize tree traversal:
  - [ ] Cache panel paths
  - [ ] Use efficient tree algorithms
  - [ ] Minimize deep cloning

### 12.2 Minimize Re-renders
- [ ] Use `React.memo` for panel components:
  - [ ] Memoize `Panel.tsx`
  - [ ] Memoize `PanelGroup.tsx`
  - [ ] Only re-render changed panels
- [ ] Use `useCallback` for handlers:
  - [ ] Memoize drag handlers
  - [ ] Memoize drop handlers
  - [ ] Prevent unnecessary re-renders

### 12.3 Virtualization (if needed)
- [ ] For many panels:
  - [ ] Consider virtual rendering
  - [ ] Only render visible panels
  - [ ] Lazy load panel content

---

## 13. Error Handling

### 13.1 Validation
- [ ] Validate split operations:
  - [ ] Check panel exists
  - [ ] Check edge is valid
  - [ ] Check minimum sizes
  - [ ] Check maximum nesting depth
- [ ] Handle errors gracefully:
  - [ ] Show error message
  - [ ] Revert to previous state
  - [ ] Log errors for debugging

### 13.2 Edge Cases
- [ ] Handle invalid drop zones:
  - [ ] Ignore invalid zones
  - [ ] Show feedback to user
- [ ] Handle panel removal errors:
  - [ ] Prevent removing last panel
  - [ ] Handle orphaned tab groups
- [ ] Handle layout corruption:
  - [ ] Validate layout structure
  - [ ] Reset to default if corrupted

---

## 14. Integration with Tab System

### 14.1 Tab Group to Panel Linking
- [ ] When creating new panel:
  - [ ] Create new tab group
  - [ ] Link tab group to panel
  - [ ] Update tab group store
  - [ ] Update panel store
- [ ] Maintain mapping:
  - [ ] Panel ID → Tab Group ID
  - [ ] Update when panels moved/removed

### 14.2 Tab Drop Integration
- [ ] When tab dropped on panel edge:
  - [ ] Get tab data from Phase 5.1
  - [ ] Create new panel
  - [ ] Create new tab group
  - [ ] Move tab to new group
  - [ ] Link group to panel

---

## 15. Testing

### 15.1 Unit Tests
- [ ] Test `calculatePanelDropZone`:
  - [ ] Test edge detection
  - [ ] Test snap threshold
  - [ ] Test position calculation
- [ ] Test `calculatePanelSplit`:
  - [ ] Test split direction calculation
  - [ ] Test insertion position
  - [ ] Test size calculation
- [ ] Test `insertPanelIntoLayout`:
  - [ ] Test tree insertion
  - [ ] Test nested groups
  - [ ] Test size distribution

### 15.2 Integration Tests
- [ ] Test drag-and-drop flow:
  - [ ] Drag tab to panel edge
  - [ ] Verify new panel created
  - [ ] Verify tab moved to new panel
  - [ ] Verify layout updated
- [ ] Test drop zone indicators:
  - [ ] Verify drop zones appear
  - [ ] Verify drop zones update
  - [ ] Verify drop zones disappear

### 15.3 Manual Testing
- [ ] Test with various layouts:
  - [ ] Single panel
  - [ ] Two panels (horizontal)
  - [ ] Two panels (vertical)
  - [ ] Complex nested layout
- [ ] Test all edges:
  - [ ] Top edge
  - [ ] Right edge
  - [ ] Bottom edge
  - [ ] Left edge
- [ ] Test edge cases:
  - [ ] Drag to same panel edge
  - [ ] Rapid drag operations
  - [ ] Drag during resize
  - [ ] Drag with many panels

### 15.4 Performance Testing
- [ ] Test with many panels:
  - [ ] 5+ panels
  - [ ] 10+ panels
  - [ ] Nested groups
- [ ] Verify smooth animations
- [ ] Verify no lag during drag
- [ ] Verify memory usage

---

## 16. Documentation

### 16.1 Code Documentation
- [ ] Add JSDoc comments:
  - [ ] `calculatePanelDropZone`
  - [ ] `calculatePanelSplit`
  - [ ] `insertPanelIntoLayout`
  - [ ] Store actions
- [ ] Document algorithms:
  - [ ] Panel split algorithm
  - [ ] Layout tree manipulation
  - [ ] Size distribution logic

### 16.2 Architecture Documentation
- [ ] Document panel creation flow
- [ ] Document layout tree structure
- [ ] Document integration with tab system

---

## 17. Completion Criteria

Before marking this phase complete, verify:

- [ ] Tabs can be dragged to panel edges to create new panels
- [ ] Drop zone indicators appear correctly (blue boxes)
- [ ] New panels are created dynamically
- [ ] Panel splits work in all directions (top/right/bottom/left)
- [ ] Layout is updated correctly
- [ ] Panel sizes are distributed properly
- [ ] Tab groups are linked to panels
- [ ] Layout persistence works
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Cross-browser compatible

---

## Notes

- **Drop Zone Visuals:** Blue boxes that fit within target panel, showing exact size where new panel will be placed
- **Default Split Size:** 50/50 split (configurable)
- **Snap Threshold:** 20px from edges (configurable)
- **Minimum Panel Size:** Respect minimum sizes from panel config
- **Integration:** This phase integrates with Phase 5.1 tab dragging to create panels when tabs are dropped on edges

---

## References

- react-resizable-panels: https://github.com/bvaughn/react-resizable-panels
- dnd-kit: https://docs.dndkit.com/
- VS Code Panel Splitting (reference implementation)
- Cursor IDE Panel Splitting (reference implementation)

