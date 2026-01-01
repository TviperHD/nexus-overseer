# Phase 5: Combined Drag and Drop System (Tabs + Panels)

**Phase:** 5 (Combined 5.1 + 5.2)  
**Duration:** 2-3 weeks  
**Priority:** High  
**Goal:** Implement complete drag-and-drop system for tabs and panels with drop zones, tab reordering, panel splitting, and tab group management  
**Status:** In Progress (Foundation Complete, Panel Management Complete, Critical Features Pending)  
**Created:** 2025-12-30  
**Last Updated:** 2025-12-30  
**Review Date:** 2025-12-30  
**Recent Updates (2025-12-30):**
- ✅ Panel removal system complete (automatic removal, main panel transfer, empty layout handling)
- ✅ State persistence implemented (Zustand persist with custom Map/Set serialization)
- ✅ Visual feedback for main panel (orange highlight when Ctrl/Cmd held)
- ✅ Code cleanup (removed debug logs from DndTabContext, TabTypeDropdown, App.tsx)

**Implementation Status:**
- ✅ **Foundation (Sections 0-6):** Complete (Empty Canvas, Top Bar, Data Structures, Store Extensions, DndContext, Draggable Tabs, Drop Zones)
- ✅ **Tab Bar Drop Zones (Section 7):** Complete (droppable with insertion position indicator)
- ✅ **Tab Reordering (Section 8):** **COMPLETE** - Implemented with useSortable + SortableContext
- ⚠️ **Panel Splitting (Section 9):** Partial (basic implementation exists, needs refinement)
- ✅ **Panel Management (Section 2.2, 15.2):** Complete (2025-12-30: Automatic panel removal, main panel transfer, empty layout handling, state persistence)
- ❌ **Remaining Features (Sections 10-20):** Not Started

**Critical Issues Fixed:**
1. ✅ **Tab reordering** - Now working with `useSortable` + `SortableContext` (Section 8) - COMPLETE
2. ✅ **Type mismatch** - `TabDragData` interface now has `type: 'tab'` field - COMPLETE
3. ✅ **Missing type field** - `insertIndex?: number` added to `DropZoneData` interface - COMPLETE
4. ✅ **Missing import** - `PanelGroupConfig` imported in `DndTabContext.tsx` - COMPLETE

**Remaining Issues:**
- None - all critical issues resolved! ✅

**See:** `session-overviews/PHASE_5.1_REVIEW_2025-12-30.md` for detailed review

---

## Overview

This combined phase implements a complete drag-and-drop system for both tabs and panels. Users can:
- Drag tabs between tab groups
- Reorder tabs within a group
- Drag tabs to panel edges to create new panels dynamically
- See visual drop zone indicators for all drop targets
- Create complex panel layouts by dragging

**Deliverable:** Complete drag-and-drop system with tab reordering, panel splitting, and visual feedback

**Dependencies:** 
- Phase 1.2 (Basic Tab System) - ✅ Complete
- Phase 1.4 (Basic Resizable Panels) - ✅ Complete

**Research Sources:**
- `../02-research/ui-resizable-panels-research.md` - Drag-and-drop research
- `../02-research/empty-canvas-workflow-research.md` - Empty canvas workflow research
- `../04-design/ui-overall-layout.md` - Tab drag behavior specifications
- `../03-planning/technical-specs-resizable-panels.md` - System architecture
- dnd-kit documentation: https://docs.dndkit.com/
- react-resizable-panels: https://github.com/bvaughn/react-resizable-panels
- VS Code/Cursor tab dragging patterns

---

## Prerequisites & Setup

### 1. Verify Dependencies
- [x] Confirm `@dnd-kit/core` is installed (v6.3.1+)
- [x] Confirm `@dnd-kit/sortable` is installed (v10.0.0+)
- [x] Confirm `@dnd-kit/utilities` is installed (v3.2.2+)
- [x] Verify `react-resizable-panels` is installed (v4.0.16+)
- [x] Verify `zustand` is installed (v5.0.9+)

### 2. Review Existing Code
- [x] Review `src/stores/tabStore.ts` - Understand tab state structure
- [x] Review `src/stores/panelStore.ts` - Understand panel state structure
- [x] Review `src/components/Tab/TabGroup.tsx` - Understand tab group structure
- [x] Review `src/components/Tab/Tab.tsx` - Understand tab component
- [x] Review `src/components/Tab/TabBar.tsx` - Understand tab bar
- [x] Review `src/components/Panels/PanelGroup.tsx` - Understand panel group structure
- [x] Review `src/components/Panels/Panel.tsx` - Understand panel component
- [x] Review `../02-research/empty-canvas-workflow-research.md` - Understand empty canvas workflow

### 3. Critical Notes
- [x] **Note:** Tab drop zones (tab-bar) are managed in tabStore
- [x] **Note:** Panel drop zones (edges) are detected in DndTabContext but managed in panelStore
- [x] **Note:** When tab dropped on panel edge, tabStore triggers panelStore action
- [x] **Empty Canvas:** Application starts with empty canvas (no panels) unless saved layout exists
- [x] **Main Panel:** Tabs open in main panel by default (created on-demand)
- [x] **Top Bar:** Dropdown menu for opening tabs (implemented)

---

## 0. Empty Canvas & Top Bar (Prerequisites) ✅ COMPLETE

### 0.1 Top Bar Component
- [x] Create `src/components/TopBar/TopBar.tsx` - ✅ Complete
- [x] Create `src/components/TopBar/TabTypeDropdown.tsx` - ✅ Complete
- [x] Create `src/components/TopBar/WindowControls.tsx` - ✅ Complete

### 0.2 Empty Canvas State
- [x] Update `src/App.tsx` - ✅ Complete

### 0.3 Main Panel Management
- [x] Update `src/stores/panelStore.ts` - ✅ Complete (MAIN_PANEL_ID, createMainPanel, ensureMainPanelExists, getMainPanelId)

### 0.4 Tab Opening from Dropdown
- [x] Create `src/utils/tabTypeHelpers.ts` - ✅ Complete

### 0.5 Empty State Component
- [x] Create `src/components/EmptyCanvas/EmptyCanvas.tsx` - ✅ Complete

---

## 1. Data Structures & Types ✅ COMPLETE

### 1.1 Tab Drag Types ✅ COMPLETE
- [x] Create `src/types/tabDrag.ts` - ✅ Complete
  - [x] `TabDragData` interface - ✅ Complete (added `type: 'tab'` field)
  - [x] `DropZoneType` type - ✅ Complete
  - [x] `DropZoneData` interface - ✅ Complete (added `insertIndex?: number` field)

**✅ TYPE FIXES COMPLETED:**

1. **Updated `TabDragData` interface** in `src/types/tabDrag.ts` - ✅ Complete
   - Added `type: 'tab'` field

2. **Updated `DropZoneData` interface** in `src/types/tabDrag.ts` - ✅ Complete
   - Added `insertIndex?: number` field

### 1.2 Tab Group Management Types
- [x] Extend `TabGroup` interface in `src/types/tab.ts` - ✅ Complete
  - [x] `isDragging?: boolean` flag
  - [x] `dropZone?: DropZoneData` for active drop zone

### 1.3 Panel Drag Types (NEW - from Phase 5.2)
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
      splitDirection: 'horizontal' | 'vertical';
    }
    ```
  - [ ] Define `PanelSplitOperation` interface:
    ```typescript
    interface PanelSplitOperation {
      targetPanelId: string | null; // null if empty canvas
      direction: 'horizontal' | 'vertical';
      position: 'before' | 'after';
      newPanelId: string;
      newTabGroupId: string;
      size: number; // Percentage
      isEmptyCanvas?: boolean;
    }
    ```

**Note:** Currently panel splitting is handled inline in `DndTabContext.tsx`. Consider extracting to separate types file.

---

## 2. Store Extensions ✅ COMPLETE (Tab Store), ⚠️ PARTIAL (Panel Store)

### 2.1 Tab Store Extensions ✅ COMPLETE
- [x] Update `src/stores/tabStore.ts` - ✅ Complete
  - [x] `draggingTab: TabDragData | null`
  - [x] `activeDropZone: DropZoneData | null`
  - [x] `setDraggingTab`, `setActiveDropZone`
  - [x] `moveTabToGroup` (with insertIndex support)
  - [x] `createTabGroupWithTab`
  - [x] `reorderTabsInGroup`
  - [x] `pinTab`, `unpinTab`
  - [x] `mergeTabGroups`, `splitTabGroup`

### 2.2 Panel Store Extensions ⚠️ PARTIAL
- [x] Main panel management - ✅ Complete
- [x] Panel-to-tab-group mapping - ✅ Complete
- [ ] Add `draggingPanel: PanelDragData | null` to state - **TODO**
- [ ] Add `activePanelDropZone: PanelDropZone | null` to state - **TODO**
- [ ] Add `setDraggingPanel: (data: PanelDragData | null) => void` action - **TODO**
- [ ] Add `setActivePanelDropZone: (zone: PanelDropZone | null) => void` action - **TODO**
- [x] Panel split creation (implemented inline in DndTabContext) - ✅ Partial (works but not in store)
- [ ] Add `createPanelSplit: (operation: PanelSplitOperation) => void` action - **TODO: Extract from DndTabContext**
- [x] Add `removePanel: (panelId: string) => void` action - ✅ Complete (2025-12-30: Implemented with main panel transfer logic, atomic state updates, recursive panel removal)
- [ ] Add `movePanel: (panelId: string, targetPanelId: string, edge: 'top' | 'right' | 'bottom' | 'left') => void` action - **TODO**

### 2.3 Panel Layout Management
- [ ] Add `insertPanelIntoGroup` helper - **TODO**
- [x] Add `updateLayout` action - ✅ Complete
- [x] Add `findPanelInLayout: (panelId: string) => {...}` helper - ✅ Complete (2025-12-30: Returns panel location including nested groups)
- [x] Add `findAllPanels: () => PanelConfig[]` helper - ✅ Complete (2025-12-30: Recursively finds all panels in layout)
- [ ] Add `getPanelPath: (panelId: string) => string[]` helper - **TODO**
- [ ] Add `findPanelGroup: (panelId: string) => PanelGroupConfig | null` helper - **TODO** (Note: `findPanelInLayout` provides similar functionality)

---

## 3. DndContext Setup ✅ COMPLETE

### 3.1 Create DndContext Wrapper ✅ COMPLETE
- [x] Create `src/components/Tab/DndTabContext.tsx` - ✅ Complete
  - [x] All imports
  - [x] Sensors configured (PointerSensor 5px, KeyboardSensor)
  - [x] All event handlers
  - [x] DragOverlay
  - [x] Edge detection via mousemove listener

**✅ FIXED:** Missing import `PanelGroupConfig` from `@/types/panel` - ✅ Complete

**Fix Applied:**
```typescript
// In DndTabContext.tsx, added to imports:
import type { PanelGroupConfig } from '@/types/panel';
```

### 3.2 Drag Event Handlers ✅ COMPLETE
- [x] `onDragStart` - ✅ Complete
- [x] `onDragOver` - ✅ Complete (with edge detection)
- [x] `onDragEnd` - ✅ Complete (handles tab-bar, edges, empty-canvas)
- [x] `onDragCancel` - ✅ Complete

**Note:** Panel edge detection is already implemented in `DndTabContext.tsx`. Panel splitting logic is also implemented there.

---

## 4. Draggable Tab Component ✅ COMPLETE

### 4.1 Make Tab Draggable ✅ COMPLETE
- [x] Update `src/components/Tab/Tab.tsx` - ✅ Complete
  - [x] Uses `useDraggable` hook
  - [x] Drag data includes all required fields
  - [x] Visual feedback (opacity, cursor)
  - [x] Close button prevents drag

**✅ COMPLETE:** Now uses `useSortable` which supports both reordering within groups and dragging between groups

### 4.2 Tab Drag Handle ✅ COMPLETE
- [x] Entire tab is draggable - ✅ Complete
- [ ] Add tooltip: "Drag to move tab" - **TODO**

### 4.3 Tab States ✅ COMPLETE
- [x] Handle pinned tab state - ✅ Complete (shows pin icon)
- [ ] Prevent dragging pinned tabs (or allow with special handling) - **TODO: Decide behavior**
- [x] Handle modified tab state - ✅ Complete

---

## 5. Drop Zone Detection System ✅ COMPLETE

### 5.1 Drop Zone Calculator ✅ COMPLETE
- [x] Create `src/utils/dropZoneCalculator.ts` - ✅ Complete
  - [x] `calculateDropZone` function (implemented as `detectDropZone` in DndTabContext)
  - [x] `calculateDropZoneDimensions` function
  - [x] `calculateEdgeLineDimensions` function
  - [x] All zone types supported (top, right, bottom, left, tab-bar, empty-canvas)

### 5.2 Drop Zone Dimensions Calculator ✅ COMPLETE
- [x] All zone types calculated correctly - ✅ Complete

### 5.3 Integration with DndContext ✅ COMPLETE
- [x] Integrated in `DndTabContext.tsx` - ✅ Complete

---

## 6. Drop Zone Visual Indicators ✅ COMPLETE

### 6.1 Drop Zone Overlay Component ✅ COMPLETE
- [x] Create `src/components/Tab/DropZoneIndicator.tsx` - ✅ Complete
  - [x] Progressive reveal (edge line → full preview after 1s)
  - [x] Proper styling
  - [x] Fixed positioning

### 6.2 Drop Zone Styling ✅ COMPLETE
- [x] Design system colors - ✅ Complete
- [ ] Add arrow indicators - **TODO: Nice to have**

### 6.3 Integration ✅ COMPLETE
- [x] Added to `DndTabContext` - ✅ Complete

---

## 7. Tab Bar Drop Zones ✅ COMPLETE

### 7.1 Tab Bar Droppable ✅ COMPLETE
- [x] Update `src/components/Tab/TabBar.tsx` - ✅ Complete
  - [x] Made droppable with `useDroppable`
  - [x] Visual feedback when `isOver` (border highlight)

### 7.2 Tab Insertion Position ✅ COMPLETE

**Research-Backed Implementation Approach:**
- Calculate insertion index based on mouse X position relative to tab bar
- Find midpoint between tabs to determine insertion point
- Show visual indicator (vertical line) at insertion position
- Store insertion index in drop zone data for use in `handleDragEnd`

- [x] Create insertion position calculator in `DndTabContext.tsx` - ✅ Complete
  ```typescript
  /**
   * Calculate insertion index for tab in tab bar
   * @param mouseX - Mouse X coordinate (clientX)
   * @param tabBarElement - Tab bar DOM element
   * @param tabs - Array of tabs in the group
   * @returns Insertion index (0 to tabs.length)
   */
  function calculateTabInsertionIndex(
    mouseX: number,
    tabBarElement: HTMLElement,
    tabs: Tab[]
  ): number {
    const tabBarRect = tabBarElement.getBoundingClientRect();
    const relativeX = mouseX - tabBarRect.left;
    
    // If mouse is before first tab, insert at start
    if (relativeX < 0) return 0;
    
    // If mouse is after last tab, append at end
    if (relativeX > tabBarRect.width) return tabs.length;
    
    // Find which tab the mouse is over
    for (let i = 0; i < tabs.length; i++) {
      const tabElement = document.getElementById(`tab-${tabs[i].id}`);
      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect();
        const tabMidpoint = tabRect.left + tabRect.width / 2 - tabBarRect.left;
        
        if (relativeX < tabMidpoint) {
          return i; // Insert before this tab
        }
      }
    }
    
    // Default: append at end
    return tabs.length;
  }
  ```

- [x] Update `detectDropZone` in `DndTabContext.tsx` - ✅ Complete
  - [x] When detecting tab-bar drop zone, calculate insertion index - ✅ Complete
    ```typescript
    // In detectDropZone function, when detecting tab-bar:
    if (tabBarElement) {
      const tabBarRect = tabBarElement.getBoundingClientRect();
      const tabGroup = tabStore.getTabGroup(tabGroupId);
      
      if (tabGroup) {
        const insertIndex = calculateTabInsertionIndex(mouseX, tabBarElement, tabGroup.tabs);
        
        tabStore.setActiveDropZone({
          type: 'tab-bar',
          targetTabGroupId: tabGroupId,
          insertIndex, // Add this to DropZoneData interface
          position: calculateDropZoneDimensions('tab-bar', tabBarRect, 50, TAB_BAR_HEIGHT),
        });
      }
    }
    ```

- [x] Update `DropZoneData` interface in `src/types/tabDrag.ts` - ✅ Complete (already done in Section 1.1)
  ```typescript
  export interface DropZoneData {
    type: DropZoneType;
    targetTabGroupId?: string;
    targetPanelId?: string;
    insertIndex?: number; // Add this field
    position: { x: number; y: number; width: number; height: number };
  }
  ```

- [x] Show insertion indicator in `TabBar.tsx` - ✅ Complete
  - [x] Get `activeDropZone` from tabStore - ✅ Complete
  - [x] If drop zone is for this tab bar and has `insertIndex` - ✅ Complete
    - [x] Calculate position of insertion line - ✅ Complete
    - [x] Render vertical line at insertion position - ✅ Complete
    ```typescript
    // In TabBar component:
    const activeDropZone = useTabStore(state => state.activeDropZone);
    const showInsertionLine = activeDropZone?.type === 'tab-bar' && 
                              activeDropZone.targetTabGroupId === tabGroupId &&
                              activeDropZone.insertIndex !== undefined;
    
    // Calculate insertion line position
    const insertionLineStyle = showInsertionLine && activeDropZone.insertIndex !== undefined
      ? (() => {
          const insertIndex = activeDropZone.insertIndex!;
          if (insertIndex === 0) {
            // Before first tab
            const firstTab = tabs[0];
            const firstTabEl = document.getElementById(`tab-${firstTab.id}`);
            return firstTabEl 
              ? { left: `${firstTabEl.getBoundingClientRect().left - tabBarRef.current!.getBoundingClientRect().left}px` }
              : null;
          } else if (insertIndex >= tabs.length) {
            // After last tab
            const lastTab = tabs[tabs.length - 1];
            const lastTabEl = document.getElementById(`tab-${lastTab.id}`);
            return lastTabEl
              ? { left: `${lastTabEl.getBoundingClientRect().right - tabBarRef.current!.getBoundingClientRect().left}px` }
              : null;
          } else {
            // Between tabs
            const beforeTab = tabs[insertIndex - 1];
            const beforeTabEl = document.getElementById(`tab-${beforeTab.id}`);
            return beforeTabEl
              ? { left: `${beforeTabEl.getBoundingClientRect().right - tabBarRef.current!.getBoundingClientRect().left}px` }
              : null;
          }
        })()
      : null;
    
    // Render insertion line:
    {showInsertionLine && insertionLineStyle && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: insertionLineStyle.left,
          width: '2px',
          height: '100%',
          backgroundColor: '#007acc',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    )}
    ```

- [x] Update `handleDragEnd` to use insertion index - ✅ Complete (already done in Section 8)
  - [x] Pass `insertIndex` to `moveTabToGroup` action - ✅ Complete
    ```typescript
    if (targetTabGroupId !== fromGroupId) {
      const insertIndex = activeDropZone?.insertIndex;
      tabStore.moveTabToGroup(tabId, fromGroupId, targetTabGroupId, insertIndex);
    }
    ```

- [ ] Handle edge cases:
  - [x] Drop at start (index 0) - ✅ Handled by calculator
  - [x] Drop at end (append) - ✅ Handled by calculator
  - [x] Drop between tabs (calculate midpoint) - ✅ Handled by calculator

---

## 8. Tab Reordering Within Group ✅ COMPLETE

**✅ IMPLEMENTED:** Tab reordering is now working using `useSortable` + `SortableContext`.

**Research-Backed Implementation Approach:**
- `useSortable` combines draggable + droppable functionality - perfect for reordering
- `SortableContext` provides sorting strategy and manages sortable items
- `horizontalListSortingStrategy` for horizontal tab bars
- `arrayMove` utility from `@dnd-kit/sortable` for reordering arrays
- `useSortable` automatically provides placeholder and `transition` for smooth animations

### 8.1 Sortable Tab List ✅ COMPLETE
- [x] Update `TabBar.tsx` - ✅ Complete
  - [x] Import `SortableContext`, `horizontalListSortingStrategy` from `@dnd-kit/sortable` - ✅ Complete
  - [x] Wrap tab list with `SortableContext` - ✅ Complete
    ```typescript
    import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
    
    // In TabBar component:
    <SortableContext
      items={tabs.map(t => `tab-${t.id}`)}
      strategy={horizontalListSortingStrategy}
    >
      <div
        ref={combinedRef}
        id={`tab-bar-${tabGroupId}`}
        data-droppable-id={`tab-bar-${tabGroupId}`}
        className={...}
      >
        {tabs.map((tab) => (
          <TabComponent
            key={tab.id}
            tab={tab}
            tabGroupId={tabGroupId}
            isActive={tab.id === activeTabId}
            onSelect={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
      </div>
    </SortableContext>
    ```
  - [ ] **Note:** `useDroppable` can still be used on the same element - they work together

- [x] Update `Tab.tsx` to use `useSortable` (replaces `useDraggable`) - ✅ Complete
  - [x] Import `useSortable` from `@dnd-kit/sortable` - ✅ Complete
  - [x] Import `CSS` from `@dnd-kit/utilities` - ✅ Complete
  - [x] Replace `useDraggable` with `useSortable` - ✅ Complete
    ```typescript
    import { useSortable } from '@dnd-kit/sortable';
    import { CSS } from '@dnd-kit/utilities';
    
    // Replace useDraggable with useSortable:
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: `tab-${tab.id}`,
      data: {
        type: 'tab' as const,
        tabId: tab.id,
        tabGroupId: tabGroupId,
        tabLabel: tab.label,
        tabType: tab.type,
        filePath: tab.filePath,
      } satisfies TabDragData,
    });
    
    // Update style to include transition:
    const style = {
      transform: CSS.Translate.toString(transform),
      transition, // Smooth animation during reorder
      opacity: isDragging ? 0.5 : 1,
    };
    ```
  - [ ] **Important:** `useSortable` works for BOTH reordering within group AND dragging between groups (when dropped outside SortableContext)

- [x] Handle reorder on drag end in `DndTabContext.tsx` - ✅ Complete
  - [x] Import `arrayMove` from `@dnd-kit/sortable` - ✅ Complete (Note: arrayMove is exported from @dnd-kit/sortable)
  - [x] In `handleDragEnd`, check if dropped on same tab bar - ✅ Complete
    ```typescript
    import { arrayMove } from '@dnd-kit/utilities';
    
    // In handleDragEnd, after checking for edge/empty-canvas drops:
    
    // Check if dropped on same tab bar (reorder within group)
    if (overData && typeof overData === 'object' && 'type' in overData) {
      if (overData.type === 'tab-bar') {
        const targetTabGroupId = overData.tabGroupId as string | undefined;
        
        if (targetTabGroupId === fromGroupId) {
          // Same group - handle reorder
          if (over && active.id !== over.id) {
            const tabGroup = tabStore.getTabGroup(fromGroupId);
            if (tabGroup) {
              const oldIndex = tabGroup.tabs.findIndex(t => `tab-${t.id}` === active.id);
              const newIndex = tabGroup.tabs.findIndex(t => `tab-${t.id}` === over.id);
              
              if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                // Reorder tabs using arrayMove
                const reorderedTabs = arrayMove(tabGroup.tabs, oldIndex, newIndex);
                const reorderedTabIds = reorderedTabs.map(t => t.id);
                tabStore.reorderTabsInGroup(fromGroupId, reorderedTabIds);
              }
            }
          }
          tabStore.setActiveDropZone(null);
          return;
        }
        
        // Different group - move tab (existing logic)
        // ...
      }
    }
    ```

### 8.2 Visual Feedback ✅ AUTOMATIC
- [x] Show placeholder during reorder - ✅ Automatic with `useSortable` (dnd-kit provides placeholder)
- [x] Animate tab movement - ✅ Automatic with `transition` from `useSortable`
- [x] Smooth position updates - ✅ Automatic via CSS transforms

**Research Finding:** `useSortable` automatically provides:
- Placeholder element showing where item will be inserted
- `transition` property for smooth animations
- CSS transforms for efficient movement (no layout thrashing)
- All handled by dnd-kit internally - just apply `transition` to style

---

## 9. Panel Splitting & Creation ⚠️ PARTIAL

### 9.1 Panel Split Creation ✅ PARTIAL (Works but needs refinement)
- [x] In `onDragEnd` handler in `DndTabContext.tsx`:
  - [x] Check if drop zone type is edge type (`'top'/'right'/'bottom'/'left'`) or empty canvas
  - [x] If empty canvas: Create main panel and move tab - ✅ Complete
  - [x] If edge type: Create new tab group and panel split - ✅ Complete
  - [x] Handle same-direction and different-direction splits - ✅ Complete

**Note:** Panel splitting is currently implemented inline in `DndTabContext.tsx`. Consider extracting to panelStore action.

### 9.2 Panel Split Algorithm ⚠️ PARTIAL
- [x] Basic split logic implemented - ✅ Complete
- [ ] Extract to `src/utils/panelSplitAlgorithm.ts` - **TODO: Refactor**
- [ ] Create `calculatePanelSplit` function - **TODO: Extract**
- [ ] Handle nested panel groups more elegantly - **TODO: Improve**

### 9.3 Layout Tree Manipulation ⚠️ PARTIAL

**Research-Backed Approach:**
- react-resizable-panels works with dynamic panels via React state updates
- When layout state changes, React re-renders and panels are added/removed automatically
- No need for imperative panel creation - declarative approach via state
- Panel keys must be stable (use panel.id) for React to track correctly

- [x] Basic layout updates work - ✅ Complete
- [ ] Extract to `src/utils/panelLayoutTree.ts` - **TODO: Refactor**
  - [ ] Create `insertPanelIntoLayout` function:
    ```typescript
    /**
     * Insert a new panel into the layout tree
     * Handles both same-direction and different-direction splits
     * @param layout - Current panel layout
     * @param operation - Split operation details
     * @returns Updated layout
     */
    export function insertPanelIntoLayout(
      layout: PanelLayout,
      operation: PanelSplitOperation
    ): PanelLayout {
      // Implementation from DndTabContext.tsx (lines 374-470)
      // Extract and improve with better error handling
    }
    ```
  - [ ] Create `findPanelInLayout` helper:
    ```typescript
    /**
     * Find a panel in the layout tree and return its path
     * @param layout - Panel layout to search
     * @param panelId - Panel ID to find
     * @returns Path to panel: [groupIndex, panelIndex] or null if not found
     */
    export function findPanelInLayout(
      layout: PanelLayout,
      panelId: string
    ): { groupIndex: number; panelIndex: number; group: PanelGroupConfig } | null {
      // Search through layout.groups and their panels
    }
    ```
  - [ ] Improve size distribution logic:
    ```typescript
    /**
     * Calculate new panel sizes when splitting
     * Ensures minimum sizes are respected
     * @param existingSize - Size of panel being split
     * @param newPanelSize - Desired size for new panel (percentage)
     * @param minSize - Minimum panel size (percentage)
     * @returns [existingPanelSize, newPanelSize]
     */
    export function calculateSplitSizes(
      existingSize: number,
      newPanelSize: number = 50,
      minSize: number = 20
    ): [number, number] {
      // Ensure both panels meet minimum size
      const adjustedNewSize = Math.max(minSize, Math.min(newPanelSize, existingSize - minSize));
      const adjustedExistingSize = existingSize - adjustedNewSize;
      return [adjustedExistingSize, adjustedNewSize];
    }
    ```

### 9.4 React-Resizable-Panels Integration ✅ COMPLETE
- [x] Dynamic panel rendering - ✅ Complete (panels render from layout)
- [x] Panel keys use `panel.id` - ✅ Complete
- [x] Layout updates trigger re-render - ✅ Complete

---

## 10. Tab Pinning ⚠️ PARTIAL (Actions exist, UI missing)

### 10.1 Pin/Unpin Actions ✅ COMPLETE
- [x] Implement `pinTab` action - ✅ Complete
- [x] Implement `unpinTab` action - ✅ Complete

### 10.2 Pinned Tab UI ⚠️ PARTIAL
- [x] Show pin icon for pinned tabs - ✅ Complete (emoji 📌)
- [x] Style pinned tabs differently - ✅ Complete
- [ ] Prevent closing pinned tabs (or show warning) - **TODO**
- [ ] Add context menu option: "Unpin Tab" - **TODO: Requires context menu (Section 11)**

---

## 11. Tab Context Menu ❌ NOT IMPLEMENTED

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

## 12. Drag Preview (DragOverlay) ⚠️ PARTIAL

### 12.1 Custom Drag Preview ✅ COMPLETE
- [x] In `DndTabContext.tsx`:
  - [x] Use `DragOverlay` component - ✅ Complete
  - [x] Render tab preview in overlay - ✅ Complete
  - [x] Show tab label - ✅ Complete
  - [x] Semi-transparent (opacity: 0.9) - ✅ Complete
  - [x] Follows cursor smoothly - ✅ Complete

### 12.2 Preview Content ⚠️ PARTIAL
- [x] Show tab label - ✅ Complete
- [ ] Show tab icon (if applicable) - **TODO**
- [ ] Show modified indicator - **TODO**
- [ ] Show close button (non-functional in preview) - **TODO**

---

## 13. Performance Optimization ❌ NOT IMPLEMENTED

### 13.1 Throttle Drag Events

**Research-Backed Optimization:**
- Use `requestAnimationFrame` for smooth 60fps updates
- Debounce expensive calculations (drop zone detection)
- Cache DOM measurements (getBoundingClientRect is expensive)
- Only recalculate when mouse moves significantly (threshold)

- [ ] Throttle `onDragOver` handler in `DndTabContext.tsx`:
  - [ ] Use `requestAnimationFrame` for position updates:
    ```typescript
    // Use ref to track if animation frame is scheduled
    const rafRef = React.useRef<number | null>(null);
    const lastMousePosRef = React.useRef<{ x: number; y: number } | null>(null);
    const MOUSE_MOVE_THRESHOLD = 5; // Only recalculate if mouse moved 5px
    
    // In handleDragOver or mousemove handler:
    if (mousePositionRef.current) {
      const { x, y } = mousePositionRef.current;
      const lastPos = lastMousePosRef.current;
      
      // Only recalculate if mouse moved significantly
      if (!lastPos || 
          Math.abs(x - lastPos.x) > MOUSE_MOVE_THRESHOLD || 
          Math.abs(y - lastPos.y) > MOUSE_MOVE_THRESHOLD) {
        
        // Cancel previous frame if scheduled
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        
        // Schedule new calculation
        rafRef.current = requestAnimationFrame(() => {
          detectDropZone(x, y);
          lastMousePosRef.current = { x, y };
          rafRef.current = null;
        });
      }
    }
    ```
  - [ ] Debounce drop zone calculations (50ms) for expensive operations:
    ```typescript
    // Use useMemo or useCallback with debounce
    const debouncedDetectDropZone = useMemo(
      () => debounce((x: number, y: number) => {
        detectDropZone(x, y);
      }, 50),
      [detectDropZone]
    );
    ```

- [ ] Optimize drop zone calculations:
  - [ ] Cache element rects (getBoundingClientRect is expensive):
    ```typescript
    // Cache rects in ref, only update when needed
    const panelRectsCache = React.useRef<Map<string, DOMRect>>(new Map());
    const CACHE_DURATION = 100; // ms
    
    // In detectDropZone:
    const now = Date.now();
    const cacheKey = `${panelId}-${now - (now % CACHE_DURATION)}`;
    
    let rect = panelRectsCache.current.get(cacheKey);
    if (!rect) {
      rect = panelElement.getBoundingClientRect();
      panelRectsCache.current.set(cacheKey, rect);
      // Clean old cache entries
      if (panelRectsCache.current.size > 50) {
        panelRectsCache.current.clear();
      }
    }
    ```
  - [ ] Only recalculate when mouse moves significantly (already handled above)
  - [ ] Use `useMemo` for expensive calculations:
    ```typescript
    // Memoize drop zone dimensions calculation
    const dropZoneDimensions = useMemo(() => {
      if (!activeDropZone || !targetElement) return null;
      return calculateDropZoneDimensions(
        activeDropZone.type,
        targetElement.getBoundingClientRect(),
        50,
        35
      );
    }, [activeDropZone, targetElement]);
    ```

### 13.2 Minimize Re-renders

**Research-Backed Optimization:**
- `React.memo` prevents re-renders when props haven't changed
- `useCallback` memoizes functions to prevent child re-renders
- Use Zustand selectors to subscribe only to needed state slices
- Avoid creating new objects/arrays in render

- [ ] Use `React.memo` for tab components:
  - [ ] Memoize `Tab.tsx`:
    ```typescript
    export const Tab = React.memo<TabProps>(({ tab, tabGroupId, isActive, onSelect, onClose }) => {
      // ... component code
    }, (prevProps, nextProps) => {
      // Custom comparison function
      return (
        prevProps.tab.id === nextProps.tab.id &&
        prevProps.tabGroupId === nextProps.tabGroupId &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.tab.label === nextProps.tab.label &&
        prevProps.tab.isModified === nextProps.tab.isModified &&
        prevProps.tab.isPinned === nextProps.tab.isPinned
      );
    });
    ```
  - [ ] Memoize `TabBar.tsx`:
    ```typescript
    export const TabBar = React.memo<TabBarProps>(({ ... }) => {
      // ... component code
    });
    ```
  - [ ] Memoize `TabGroup.tsx`:
    ```typescript
    export const TabGroup = React.memo<TabGroupProps>(({ tabGroupId }) => {
      // ... component code
    });
    ```

- [ ] Use `useCallback` for event handlers:
  - [ ] Memoize drag handlers in `DndTabContext.tsx`:
    ```typescript
    const handleDragStart = useCallback((event: DragStartEvent) => {
      // ... handler code
    }, [setDraggingTab]); // Only recreate if dependencies change
    
    const handleDragEnd = useCallback((event: DragEndEvent) => {
      // ... handler code
    }, [setDraggingTab, currentLayout, ensureMainPanelExists, getMainPanelId, setPanelTabGroupMapping]);
    ```
  - [ ] Memoize drop handlers in `TabBar.tsx`:
    ```typescript
    const handleTabSelect = useCallback((tabId: string) => {
      onTabSelect(tabId);
    }, [onTabSelect]);
    
    const handleTabClose = useCallback((tabId: string) => {
      onTabClose(tabId);
    }, [onTabClose]);
    ```

- [ ] Use Zustand selectors to minimize re-renders:
  - [ ] In components, subscribe only to needed state:
    ```typescript
    // Bad: Subscribes to entire store
    const { activeDropZone } = useTabStore();
    
    // Good: Subscribes only to activeDropZone
    const activeDropZone = useTabStore(state => state.activeDropZone);
    ```
  - [ ] Use shallow equality for object selectors:
    ```typescript
    import { shallow } from 'zustand/shallow';
    
    const { draggingTab, activeDropZone } = useTabStore(
      state => ({ 
        draggingTab: state.draggingTab, 
        activeDropZone: state.activeDropZone 
      }),
      shallow
    );
    ```

### 13.3 Virtualization (if needed)
- [ ] For large numbers of tabs:
  - [ ] Consider virtual scrolling
  - [ ] Only render visible tabs
  - [ ] Use `react-window` or similar (if needed)

---

## 14. Accessibility ❌ NOT IMPLEMENTED

### 14.1 Keyboard Support
- [ ] Implement keyboard dragging:
  - [ ] Space/Enter to start drag
  - [ ] Arrow keys to move
  - [ ] Enter to drop
  - [ ] Escape to cancel
- [x] Use `KeyboardSensor` from dnd-kit - ✅ Complete (sensor configured)
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

## 15. Error Handling ⚠️ PARTIAL

### 15.1 Validation
- [x] Basic validation in store actions - ✅ Complete
- [ ] Validate drag operations:
  - [ ] Prevent dragging tab to its own group (unless reordering)
  - [ ] Prevent invalid drop zones
  - [ ] Validate tab group IDs
- [ ] Handle errors gracefully:
  - [ ] Show error message if drop fails
  - [ ] Revert to previous state on error
  - [ ] Log errors for debugging

### 15.2 Edge Cases
- [x] Handle last tab in group: ✅ Complete (2025-12-30: Automatic panel removal when tab group becomes empty)
  - [x] Automatic panel removal when tab group becomes empty - ✅ Complete
  - [x] Main panel transfer when main panel is removed - ✅ Complete
  - [x] Empty layout handling (all panels closed) - ✅ Complete
- [ ] Handle rapid drag operations:
  - [ ] Debounce rapid drops
  - [ ] Queue operations if needed
- [x] Handle tab group removal: ✅ Complete (2025-12-30: Automatic panel cleanup)
  - [x] Clean up associated panel when tab group becomes empty - ✅ Complete
  - [x] Handle orphaned tabs - ✅ Complete (prevented by automatic cleanup)
- [x] Handle panel removal: ✅ Complete (2025-12-30: Full implementation with edge cases)
  - [x] Main panel can be removed (status transfers to another panel) - ✅ Complete
  - [x] Handle orphaned tab groups (stale mapping cleanup) - ✅ Complete
  - [x] Validate layout structure (recursive panel removal, empty group cleanup) - ✅ Complete
  - [x] Handle nested panel groups - ✅ Complete

---

## 16. Integration Points ✅ MOSTLY COMPLETE

### 16.1 Tab Group to Panel Mapping ✅ COMPLETE
- [x] Maintain mapping - ✅ Complete
- [x] Update mapping when groups created/moved - ✅ Complete
- [x] Sync with panel store - ✅ Complete

### 16.2 Panel Split Creation ✅ COMPLETE
- [x] When tab dropped on edge zone - ✅ Complete
- [x] Create new tab group first - ✅ Complete
- [x] Create new panel - ✅ Complete
- [x] Update layout state - ✅ Complete
- [x] Map panel to tab group - ✅ Complete

**Note:** Currently implemented inline in `DndTabContext.tsx`. Consider extracting to panelStore action for better separation of concerns.

---

## 17. Testing ❌ NOT IMPLEMENTED

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
- [ ] Test panel store actions:
  - [ ] Test `createPanelSplit`
  - [ ] Test `removePanel`
  - [ ] Test layout updates

### 17.2 Integration Tests
- [ ] Test drag-and-drop flow:
  - [ ] Drag tab to tab bar
  - [ ] Drag tab to create new group
  - [ ] Reorder tabs within group
  - [ ] Drag between groups
  - [ ] Drag tab to panel edge
  - [ ] Verify new panel created
- [ ] Test drop zone indicators:
  - [ ] Verify drop zones appear correctly
  - [ ] Verify drop zones update on mouse move
  - [ ] Verify drop zones disappear on cancel

### 17.3 Manual Testing
- [ ] Test with multiple tab groups
- [ ] Test with many tabs (10+, 20+)
- [ ] Test with various panel layouts
- [ ] Test all edges (top/right/bottom/left)
- [ ] Test edge cases (last tab, rapid drags, etc.)

---

## 18. Documentation ⚠️ PARTIAL

### 18.1 Code Documentation
- [x] Basic JSDoc comments - ✅ Complete
- [ ] Add comprehensive JSDoc comments to all functions:
  - [ ] `calculateDropZone`
  - [ ] `calculateDropZoneDimensions`
  - [ ] Store actions
  - [ ] Event handlers
  - [ ] Panel split algorithm
- [ ] Document complex logic:
  - [ ] Drop zone detection algorithm
  - [ ] Tab group creation flow
  - [ ] Panel split algorithm
  - [ ] Integration with panel system

### 18.2 User Documentation (if needed)
- [ ] Document keyboard shortcuts
- [ ] Document drag-and-drop gestures
- [ ] Document tab pinning feature

---

## 19. Performance Checklist ❌ NOT VERIFIED

- [ ] Drag operations are smooth (60fps)
- [ ] Drop zone calculations don't lag
- [ ] No excessive re-renders during drag
- [ ] Memory usage is reasonable
- [ ] No memory leaks (test extended drag sessions)

---

## 20. Completion Criteria

Before marking this phase complete, verify:

- [x] Tabs can be dragged between tab groups - ✅ Complete
- [x] Tabs can be dragged to create new tab groups (triggers panel split) - ✅ Complete
- [x] **Tabs can be reordered within groups** - ✅ Complete (2025-12-30: Implemented with useSortable + SortableContext)
- [x] Drop zone indicators appear correctly (blue boxes) - ✅ Complete
- [x] Drop zones show exact placement location - ✅ Complete (2025-12-30: Insertion position indicator implemented)
- [x] Panels are automatically removed when tab groups become empty - ✅ Complete (2025-12-30)
- [x] Main panel can be removed (status transfers to another panel) - ✅ Complete (2025-12-30)
- [x] State persists across reloads - ✅ Complete (2025-12-30: Zustand persist with custom Map/Set serialization)
- [ ] Tab context menu works - ❌ Not implemented
- [ ] Tab pinning works (UI) - ⚠️ Partial (actions work, no UI to pin)
- [ ] Keyboard navigation works - ❌ Not implemented
- [ ] Performance is acceptable - ❓ Not verified
- [ ] No console errors - ❓ Not verified
- [ ] Cross-browser compatible - ❓ Not verified

---

## Priority Implementation Order

### 🔴 Critical (Must Have - Blocking Core Functionality)
1. **Fix Type Issues** - Add `type: 'tab'` to `TabDragData` and `insertIndex` to `DropZoneData` (10 minutes) ✅ COMPLETE
2. **Fix Missing Import** - `PanelGroupConfig` in `DndTabContext.tsx` (2 minutes) ✅ COMPLETE
3. **Section 8: Tab Reordering** - Core functionality missing (2-3 hours) ✅ COMPLETE
   - Add `SortableContext` to `TabBar.tsx` ✅
   - Replace `useDraggable` with `useSortable` in `Tab.tsx` ✅
   - Handle reorder in `handleDragEnd` using `arrayMove` from `@dnd-kit/sortable` ✅
4. **Section 7.2: Insertion Position** - Poor UX without it (1-2 hours) ✅ COMPLETE
   - Calculate insertion index ✅
   - Show visual indicator ✅
   - Pass to `moveTabToGroup` ✅

### 🟡 High Priority (Should Have)
4. **Section 11: Tab Context Menu** - Important UX feature
5. **Section 10.2: Pinned Tab UI** - Make pinning usable
6. **Section 13: Performance Optimization** - Ensure smooth experience

### 🟢 Medium Priority (Nice to Have)
7. **Section 14: Accessibility** - Important for all users
8. **Section 12.2: Enhanced Drag Preview** - Better visual feedback
9. **Section 15: Enhanced Error Handling** - Better robustness

### 🔵 Low Priority (Future)
10. **Section 17: Testing** - Important but not blocking
11. **Section 18: Enhanced Documentation** - Good to have
12. **Section 19: Performance Verification** - Validate performance

---

## Notes

- **Drop Zone Visuals:** Blue boxes that fit within target panel, showing exact size
- **Snap Threshold:** 20px from edges (configurable, currently 30px in code)
- **Drag Threshold:** 5px movement to start drag (reduced from 8px for better responsiveness)
- **Integration:** Tab dragging and panel splitting are tightly integrated - tabs dropped on edges create panels
- **Current Implementation:** Panel splitting logic is in `DndTabContext.tsx`. Consider extracting to panelStore for better separation.

---

## Research Summary & Verification

### ✅ Research Completed

**dnd-kit Best Practices:**
- ✅ `useSortable` is the correct approach for tab reordering (combines draggable + droppable)
- ✅ `SortableContext` with `horizontalListSortingStrategy` for horizontal tab bars
- ✅ `arrayMove` utility from `@dnd-kit/sortable` for reordering arrays efficiently
- ✅ `useSortable` automatically provides placeholder and `transition` for animations
- ✅ Can use `useSortable` for both reordering AND cross-group dragging (works automatically)
- ✅ `TabDragData` must include `type: 'tab'` field for type checking

**Performance Optimization:**
- ✅ Use `requestAnimationFrame` for smooth 60fps updates
- ✅ Cache DOM measurements (getBoundingClientRect is expensive)
- ✅ Use `React.memo` with custom comparison functions
- ✅ Use Zustand selectors to minimize subscriptions
- ✅ Debounce expensive calculations (50ms threshold)

**Insertion Position Calculation:**
- ✅ Calculate based on mouse X position relative to tab bar
- ✅ Find tab midpoints to determine insertion point
- ✅ Show visual indicator (vertical line) at insertion position
- ✅ Store insertion index in drop zone data

**Panel Splitting:**
- ✅ react-resizable-panels works declaratively via state updates
- ✅ React automatically re-renders when layout state changes
- ✅ No imperative panel creation needed
- ✅ Use stable keys (panel.id) for React tracking

### ✅ Implementation Readiness Verified

**Code Structure:**
- ✅ All required files exist and are properly structured
- ✅ Store actions are implemented and working
- ✅ Components are set up correctly
- ✅ Type definitions are complete (except `insertIndex` field)

**Dependencies:**
- ✅ All required packages are installed
- ✅ Versions are correct
- ✅ No missing dependencies

**Integration Points:**
- ✅ Tab store and panel store are properly integrated
- ✅ Drop zone detection is working
- ✅ Panel splitting logic exists (needs refinement)

### ⚠️ Known Issues to Fix

1. **Type Mismatch:** `TabDragData` interface missing `type: 'tab'` field (code uses it but interface doesn't have it)
2. **Missing Type Field:** `insertIndex?: number` not in `DropZoneData` interface
3. **Missing Import:** `PanelGroupConfig` not imported in `DndTabContext.tsx` (line 375, 447, 451, 452)
4. **Tab Reordering:** Not implemented - must use `useSortable` + `SortableContext`
5. **Insertion Position:** Not implemented - needs calculator and visual indicator
6. **arrayMove Import:** Should be from `@dnd-kit/sortable` (not `@dnd-kit/utilities`)

### ✅ Ready to Implement

**The checklist is 100% ready to work on with:**
- ✅ Research-backed implementation patterns
- ✅ Complete code examples for all critical features
- ✅ Step-by-step instructions
- ✅ Performance optimization strategies
- ✅ Common pitfalls documented
- ✅ Testing strategy outlined
- ✅ Priority order established

**Estimated Time:**
- Critical fixes: 3-4 hours
- High priority features: 4-6 hours
- Medium priority: 6-8 hours
- Total: ~13-18 hours for complete implementation

---

## Final Verification Checklist

### ✅ Code Review Complete
- [x] All existing code reviewed and understood
- [x] All files verified to exist
- [x] All store actions verified
- [x] All components verified
- [x] Integration points identified

### ✅ Research Complete
- [x] dnd-kit best practices researched
- [x] Tab reordering patterns researched
- [x] Insertion position calculation researched
- [x] Performance optimization researched
- [x] Panel splitting patterns researched
- [x] All research findings documented in checklist

### ✅ Implementation Patterns Documented
- [x] Tab reordering pattern with code examples
- [x] Insertion position pattern with code examples
- [x] Performance optimization patterns with code examples
- [x] Panel splitting patterns documented
- [x] Common pitfalls identified and documented

### ✅ Ready to Implement
- [x] All critical issues identified
- [x] All fixes documented with code examples
- [x] Step-by-step instructions provided
- [x] Priority order established
- [x] Testing strategy outlined
- [x] Time estimates provided

### ⚠️ Pre-Implementation Tasks (5 minutes)
- [ ] **Fix Type Issues:**
  - [ ] Add `type: 'tab'` to `TabDragData` interface in `src/types/tabDrag.ts`
  - [ ] Add `insertIndex?: number` to `DropZoneData` interface in `src/types/tabDrag.ts`
- [ ] **Fix Missing Import:**
  - [ ] Add `import type { PanelGroupConfig } from '@/types/panel';` to `DndTabContext.tsx` (line 18, after PanelConfig import)

**The checklist is 100% ready for implementation. All research is complete, all patterns are documented, and all code examples are provided.**

---

## Final Verification Checklist ✅

### ✅ Code Review Complete
- [x] All existing code reviewed and understood
- [x] All files verified to exist
- [x] All store actions verified
- [x] All components verified
- [x] Integration points identified
- [x] Type mismatches identified and documented

### ✅ Research Complete
- [x] dnd-kit best practices researched
- [x] Tab reordering patterns researched
- [x] Insertion position calculation researched
- [x] Performance optimization researched
- [x] Panel splitting patterns researched
- [x] arrayMove import verified (from `@dnd-kit/sortable`)
- [x] All research findings documented in checklist

### ✅ Implementation Patterns Documented
- [x] Tab reordering pattern with code examples
- [x] Insertion position pattern with code examples
- [x] Performance optimization patterns with code examples
- [x] Panel splitting patterns documented
- [x] Common pitfalls identified and documented
- [x] Type fixes documented with code examples

### ✅ Critical Issues Identified & Documented
- [x] Type mismatch: `TabDragData` missing `type: 'tab'` field
- [x] Missing type field: `insertIndex?: number` in `DropZoneData`
- [x] Missing import: `PanelGroupConfig` in `DndTabContext.tsx`
- [x] Tab reordering: Not implemented (needs `useSortable`)
- [x] Insertion position: Not implemented
- [x] arrayMove import: Corrected to `@dnd-kit/sortable`

### ✅ Ready to Implement
- [x] All critical issues identified with fixes documented
- [x] All fixes documented with code examples
- [x] Step-by-step instructions provided
- [x] Priority order established
- [x] Testing strategy outlined
- [x] Time estimates provided
- [x] Pre-implementation tasks clearly listed

### ✅ Dependencies Verified
- [x] `@dnd-kit/core` v6.3.1+ installed
- [x] `@dnd-kit/sortable` v10.0.0+ installed
- [x] `@dnd-kit/utilities` v3.2.2+ installed (contains `arrayMove`)
- [x] `react-resizable-panels` v4.0.16+ installed
- [x] `zustand` v5.0.9+ installed

### ✅ Implementation Approach Verified
- [x] `useSortable` + `SortableContext` approach verified as correct
- [x] `horizontalListSortingStrategy` verified for horizontal tabs
- [x] `arrayMove` from `@dnd-kit/sortable` verified
- [x] Insertion position calculation approach verified
- [x] Performance optimization strategies verified
- [x] Panel splitting approach verified

**STATUS: ✅ 100% READY FOR IMPLEMENTATION**

All research is complete, all issues are identified, all fixes are documented with code examples, and all implementation patterns are verified. The checklist is ready to use immediately.

---

## Implementation Quick Start Guide

### Step 1: Fix Critical Issues (30 minutes)
1. **Fix Type Issues** (10 min):
   ```typescript
   // In src/types/tabDrag.ts:
   
   // Fix TabDragData:
   export interface TabDragData {
     type: 'tab'; // ADD THIS - code uses it but interface missing
     tabId: string;
     tabGroupId: string;
     tabLabel: string;
     tabType: 'file' | 'panel';
     filePath?: string;
   }
   
   // Fix DropZoneData:
   export interface DropZoneData {
     type: DropZoneType;
     targetTabGroupId?: string;
     targetPanelId?: string;
     insertIndex?: number; // ADD THIS
     position: { x: number; y: number; width: number; height: number };
   }
   ```

2. **Fix Missing Import** (2 min):
   ```typescript
   // In DndTabContext.tsx, line 18, add:
   import type { PanelGroupConfig } from '@/types/panel';
   ```

3. **Implement Tab Reordering** (18 min):
   - Add `SortableContext` to `TabBar.tsx`
   - Replace `useDraggable` with `useSortable` in `Tab.tsx`
   - Handle reorder in `handleDragEnd` using `arrayMove` from `@dnd-kit/sortable`

### Step 2: Implement Insertion Position (1-2 hours)
- Add insertion index calculator
- Show visual indicator in `TabBar.tsx`
- Pass `insertIndex` to `moveTabToGroup`

### Step 3: Performance Optimization (1 hour)
- Add `React.memo` to components
- Add `useCallback` to handlers
- Optimize Zustand selectors

### Step 4: Remaining Features (as needed)
- Tab context menu
- Enhanced drag preview
- Accessibility features
- Testing

---

## Research-Backed Implementation Patterns

### Pattern 1: Tab Reordering (Section 8)
**Best Practice:** Use `useSortable` + `SortableContext` for reordering
- `useSortable` provides both draggable and droppable functionality
- Works for both reordering within group AND dragging between groups
- Automatically provides placeholder and smooth animations
- Use `arrayMove` utility for reordering arrays

**Code Pattern:**
```typescript
// TabBar.tsx
<SortableContext items={tabs.map(t => `tab-${t.id}`)} strategy={horizontalListSortingStrategy}>
  {/* tabs */}
</SortableContext>

// Tab.tsx
const { transform, transition, isDragging } = useSortable({ id: `tab-${tab.id}`, data: {...} });
const style = { transform: CSS.Translate.toString(transform), transition };

// DndTabContext.tsx
import { arrayMove } from '@dnd-kit/sortable'; // NOTE: arrayMove is exported from @dnd-kit/sortable
const reorderedTabs = arrayMove(tabGroup.tabs, oldIndex, newIndex);
```

### Pattern 2: Insertion Position (Section 7.2)
**Best Practice:** Calculate based on mouse position relative to tab midpoints
- Get mouse X relative to tab bar
- Find which tab's midpoint the mouse is closest to
- Show visual indicator at insertion point
- Store index in drop zone data

**Code Pattern:**
```typescript
function calculateTabInsertionIndex(mouseX: number, tabBarElement: HTMLElement, tabs: Tab[]): number {
  const tabBarRect = tabBarElement.getBoundingClientRect();
  const relativeX = mouseX - tabBarRect.left;
  
  for (let i = 0; i < tabs.length; i++) {
    const tabElement = document.getElementById(`tab-${tabs[i].id}`);
    if (tabElement) {
      const tabRect = tabElement.getBoundingClientRect();
      const tabMidpoint = tabRect.left + tabRect.width / 2 - tabBarRect.left;
      if (relativeX < tabMidpoint) return i;
    }
  }
  return tabs.length; // Append at end
}
```

### Pattern 3: Performance Optimization (Section 13)
**Best Practice:** Use `requestAnimationFrame` + caching + memoization
- Throttle expensive calculations with `requestAnimationFrame`
- Cache DOM measurements (getBoundingClientRect)
- Use `React.memo` with custom comparison
- Use Zustand selectors to minimize subscriptions

**Code Pattern:**
```typescript
// Throttle with requestAnimationFrame
const rafRef = useRef<number | null>(null);
rafRef.current = requestAnimationFrame(() => {
  detectDropZone(x, y);
  rafRef.current = null;
});

// Memoize components
export const Tab = React.memo<TabProps>(Component, customCompare);

// Zustand selectors
const activeDropZone = useTabStore(state => state.activeDropZone);
```

### Pattern 4: Panel Splitting (Section 9)
**Best Practice:** Declarative approach via state updates
- Update layout state in store
- React automatically re-renders panels
- react-resizable-panels handles the rest
- Use stable keys (panel.id) for React tracking

**Code Pattern:**
```typescript
// Update layout state
updateLayout({
  ...layout,
  groups: updatedGroups,
  updatedAt: new Date().toISOString(),
});

// React automatically re-renders PanelGroup with new panels
// react-resizable-panels handles resizing automatically
```

---

## Verification Checklist Before Starting

Before implementing, verify:
- [x] All dependencies installed (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- [x] Existing code reviewed and understood
- [x] Foundation components working (DndContext, Tab, TabBar, PanelGroup)
- [x] Store actions exist (moveTabToGroup, reorderTabsInGroup, createTabGroupWithTab)
- [ ] Type definitions complete (DropZoneData needs `insertIndex?` field)

---

## Common Pitfalls to Avoid

1. **Don't use `useDraggable` for reordering** - Use `useSortable` instead
2. **Don't forget `transition` in style** - Needed for smooth animations
3. **Don't use `verticalListSortingStrategy` for horizontal tabs** - Use `horizontalListSortingStrategy`
4. **Don't create new objects in render** - Causes unnecessary re-renders
5. **Don't import `arrayMove` from wrong package** - It's from `@dnd-kit/sortable`, NOT `@dnd-kit/utilities`
6. **Don't skip memoization** - Performance will suffer with many tabs
7. **Don't forget `insertIndex` in DropZoneData** - Needed for insertion position
8. **Don't forget `type: 'tab'` in TabDragData** - Code uses it but interface is missing it

---

## Testing Strategy

### Manual Testing Checklist
1. **Tab Reordering:**
   - [ ] Drag tab within same group - should reorder
   - [ ] Drag tab to different group - should move
   - [ ] Drag tab to panel edge - should create new panel
   - [ ] Drag tab to empty canvas - should create main panel

2. **Insertion Position:**
   - [ ] Drag over tab bar - should show insertion line
   - [ ] Drop at start - should insert at index 0
   - [ ] Drop at end - should append
   - [ ] Drop between tabs - should insert at correct position

3. **Panel Splitting:**
   - [ ] Drag to top edge - should create vertical split
   - [ ] Drag to right edge - should create horizontal split
   - [ ] Drag to bottom edge - should create vertical split
   - [ ] Drag to left edge - should create horizontal split

4. **Performance:**
   - [ ] Test with 10+ tabs - should be smooth
   - [ ] Test with 20+ tabs - should be smooth
   - [ ] Test rapid drag operations - should not lag

---

## References

- dnd-kit Documentation: https://docs.dndkit.com/
- dnd-kit Sortable Preset: https://docs.dndkit.com/presets/sortable
- dnd-kit GitHub: https://github.com/clauderic/dnd-kit
- react-resizable-panels: https://github.com/bvaughn/react-resizable-panels
- VS Code Tab Dragging (reference implementation)
- Cursor IDE Tab Dragging (reference implementation)

