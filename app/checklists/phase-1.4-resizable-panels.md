# Phase 1.4: Basic Resizable Panels

**Phase:** 1.4  
**Duration:** 1 week  
**Priority:** High  
**Goal:** Resizable panels working  
**Status:** Not Started  
**Created:** 2025-12-28  
**Last Updated:** 2025-12-28

---

## Overview

This phase implements basic resizable panels for Nexus Overseer. We'll build panel data structures, panel store, panel components, default layout, and layout persistence. This enables users to customize their workspace layout.

**Deliverable:** Resizable panels working

**Dependencies:** Phase 1.2 (Tab System) must be complete

**Research Sources:**
- `../03-planning/technical-specs-resizable-panels.md` - Resizable Panels specification
- [react-resizable-panels Documentation](https://github.com/bvaughn/react-resizable-panels)

---

## 0. Prerequisites & Setup

- [ ] Verify Phase 1.2 (Tab System) is complete
- [ ] Verify `react-resizable-panels` is installed (already installed: v4.0.16)
- [ ] Review technical specification: `../03-planning/technical-specs-resizable-panels.md`
- [ ] Review UI design: `../04-design/ui-overall-layout.md`
- [ ] Review research: `../02-research/ui-resizable-panels-research.md`
- [ ] Create `src/components/Panels/` directory structure
- [ ] Create `src/types/panel.ts` file
- [ ] Create `src/stores/panelStore.ts` file

---

## 1. Panel Data Structures

- [ ] Create `src/types/panel.ts`:
  - [ ] Define `PanelConfig` interface (match technical spec):
    ```typescript
    interface PanelConfig {
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
    ```
  - [ ] Define `PanelGroupConfig` interface (match technical spec):
    ```typescript
    interface PanelGroupConfig {
      id: string;                    // Panel group ID (required for react-resizable-panels)
      direction: 'horizontal' | 'vertical';
      panels: PanelConfig[];
      defaultSizes: number[];       // Default sizes for all panels
      tabGroupId?: string;         // Associated tab group ID
    }
    ```
  - [ ] Define `PanelLayout` interface (match technical spec):
    ```typescript
    interface PanelLayout {
      id: string;                    // Layout ID
      name: string;                  // Layout name (optional)
      // Note: tabGroups are NOT stored here - reference from tabStore via panelToTabGroupMap
      groups: PanelGroupConfig[];    // Panel groups
      createdAt: string;
      updatedAt: string;
    }
    ```
  - [ ] **Important:** PanelLayout does NOT include tabGroups to avoid duplication
  - [ ] Tab groups are managed by tabStore and referenced via panelToTabGroupMap
  - [ ] Define panel size constants:
    ```typescript
    // Minimum panel sizes in pixels (from technical spec)
    export const MIN_PANEL_SIZES = {
      FILE_TREE: 180,      // File Tree minimum width
      CHAT: 300,           // Chat Interface minimum width
      EDITOR: 400,         // Code Editor minimum width
    } as const;
    ```
  - [ ] Export all types from `src/types/index.ts`
  - [ ] Add JSDoc comments to all interfaces

---

## 2. Panel Store (Zustand)

- [ ] Create `src/stores/panelStore.ts`:
  - [ ] Import dependencies:
    - [ ] `zustand` and `persist` middleware
    - [ ] `useTabStore` from tab store (reference existing, don't duplicate)
    - [ ] `debounce` utility from `src/utils/debounce.ts`
    - [ ] Types: `PanelConfig`, `PanelGroupConfig`, `PanelLayout`
  - [ ] Define panel store state (match technical spec):
    ```typescript
    interface PanelStore {
      // Layout
      currentLayout: PanelLayout | null;
      
      // Panel state (don't duplicate tabGroups - reference from tabStore)
      panelSizes: Record<string, number>;        // Panel ID -> size percentage
      collapsedPanels: Set<string>;              // Collapsed panel IDs
      embeddedPanels: Map<string, string>;       // Panel ID -> parent panel ID
      activePanel: string | null;                // Currently focused panel
      
      // Panel-to-tab-group mapping
      panelToTabGroupMap: Map<string, string>;   // Panel ID -> tab group ID
      
      // Actions - Panels
      setPanelSize: (panelId: string, size: number) => void;
      setPanelSizes: (sizes: Record<string, number>) => void;
      togglePanelCollapse: (panelId: string) => void;
      embedPanel: (panelId: string, parentPanelId: string) => void;
      unembedPanel: (panelId: string) => void;
      setActivePanel: (panelId: string) => void;
      
      // Actions - Layout
      saveLayout: (name?: string) => Promise<void>;
      loadLayout: (layoutId?: string) => Promise<void>;
      resetLayout: () => void;
      
      // Actions - Mapping
      setPanelTabGroupMapping: (panelId: string, tabGroupId: string) => void;
      getTabGroupForPanel: (panelId: string) => string | null;
    }
    ```
  - [ ] Implement all actions:
    - [ ] `setPanelSize`: Update single panel size
    - [ ] `setPanelSizes`: Update multiple panel sizes (for onResize callback)
    - [ ] `togglePanelCollapse`: Toggle panel collapsed state
    - [ ] `embedPanel`: Embed panel inside another
    - [ ] `unembedPanel`: Remove panel embedding
    - [ ] `setActivePanel`: Set active panel
    - [ ] `saveLayout`: Save current layout (debounced, to localStorage)
    - [ ] `loadLayout`: Load saved layout (with validation)
    - [ ] `resetLayout`: Reset to default layout
    - [ ] `setPanelTabGroupMapping`: Map panel to tab group
    - [ ] `getTabGroupForPanel`: Get tab group for panel
  - [ ] Add layout persistence:
    - [ ] Use Zustand persist middleware
    - [ ] Custom serialize/deserialize for Map and Set (like editorStore)
    - [ ] Debounce save operations (300ms)
    - [ ] Validate loaded layouts
    - [ ] Fallback to default on invalid data
  - [ ] Add error handling:
    - [ ] Try/catch for persistence operations
    - [ ] Validate panel sizes (0-100)
    - [ ] Validate panel IDs exist
    - [ ] User-friendly error messages
  - [ ] Add JSDoc comments to all functions
  - [ ] Export store hook: `export const usePanelStore = create<PanelStore>(...)`

---

## 3. Panel Group Component

- [ ] Create `src/components/Panels/PanelGroup.tsx`:
  - [ ] Import dependencies:
    - [ ] `PanelGroup`, `Panel`, `PanelResizeHandle` from `react-resizable-panels`
    - [ ] `usePanelStore` from panel store
    - [ ] `useDebouncedCallback` from `src/utils/debounce.ts`
    - [ ] Types: `PanelGroupConfig`, `PanelConfig`
  - [ ] Define component props interface:
    ```typescript
    interface PanelGroupProps {
      config: PanelGroupConfig;
      onResize?: (sizes: number[]) => void;
    }
    ```
  - [ ] Configure PanelGroup:
    - [ ] Set `id` prop (required for react-resizable-panels state management)
    - [ ] Set `direction` prop (horizontal or vertical)
    - [ ] Set `onResize` callback (debounced, updates store)
  - [ ] Render panels:
    - [ ] Map over `config.panels`
    - [ ] Render `Panel` for each panel config
    - [ ] Set `key` prop on Panel (use `panel.id` for React reconciliation)
    - [ ] Set `defaultSize`, `minSize`, `maxSize` props
    - [ ] Set `collapsible` prop if needed
    - [ ] Render `PanelResizeHandle` between panels (not after last)
  - [ ] Handle resize events:
    - [ ] Use `onResize` callback from PanelGroup
    - [ ] Debounce resize handler (300ms) for persistence
    - [ ] Update store immediately for UI responsiveness
    - [ ] Call debounced save function
  - [ ] Support nested panel groups:
    - [ ] Check if panel contains another PanelGroup
    - [ ] Render nested PanelGroup component recursively
  - [ ] Add error handling:
    - [ ] Validate panel config
    - [ ] Handle missing panel IDs
    - [ ] Fallback to defaults on error
  - [ ] Style with design system colors
  - [ ] Add TypeScript types (no `any` types)
  - [ ] Add JSDoc comments
- [ ] Create `src/components/Panels/index.ts`:
  - [ ] Export PanelGroup component
- [ ] Test panel group component:
  - [ ] Test horizontal layout
  - [ ] Test vertical layout
  - [ ] Test resize functionality
  - [ ] Test nested groups

---

## 4. Panel Component

- [ ] Create `src/components/Panels/Panel.tsx`:
  - [ ] Import dependencies:
    - [ ] `Panel` from `react-resizable-panels`
    - [ ] `PanelContent` component (created in step 5)
    - [ ] `usePanelStore` from panel store
    - [ ] Types: `PanelConfig`
  - [ ] Define component props interface:
    ```typescript
    interface PanelProps {
      config: PanelConfig;
      children?: React.ReactNode;
    }
    ```
  - [ ] Configure Panel:
    - [ ] Use `config.id` for tracking in store (Panel component doesn't have id prop)
    - [ ] Set `defaultSize`, `minSize`, `maxSize` props
    - [ ] Set `collapsible` prop if config.collapsible is true
  - [ ] Render panel content:
    - [ ] Use `PanelContent` component for content
    - [ ] Pass `component` type and `panelId` to PanelContent
    - [ ] Or render `children` if provided
  - [ ] Handle panel activation:
    - [ ] Call `setActivePanel` on click/focus
    - [ ] Update active panel in store
  - [ ] Style with design system colors:
    - [ ] Background: `bg-panel` or `bg-[#252526]`
    - [ ] Border: `border-color` or `border-[#3e3e42]`
    - [ ] Text: `text-primary` or `text-[#cccccc]`
  - [ ] Add TypeScript types (no `any` types)
  - [ ] Add JSDoc comments
- [ ] Test panel component:
  - [ ] Test panel rendering
  - [ ] Test panel activation
  - [ ] Test collapsible panels

---

## 5. Panel Content Component

- [ ] Create `src/components/Panels/PanelContent.tsx`:
  - [ ] Import dependencies:
    - [ ] `TabGroup` component from tab system
    - [ ] `FileTreePlaceholder`, `ChatPlaceholder`, `TaskSchedulerPlaceholder` (for now)
    - [ ] `useTabStore` from tab store
    - [ ] `usePanelStore` from panel store
  - [ ] Define component props interface:
    ```typescript
    interface PanelContentProps {
      component: string;  // Component type: 'editor', 'chat', 'file-tree', 'tasks', etc.
      panelId: string;    // Panel ID
    }
    ```
  - [ ] Render content based on component type:
    - [ ] `'editor'` or `'file'`: Render TabGroup with editor tabs
    - [ ] `'chat'`: Render ChatPlaceholder (or Chat component when ready)
    - [ ] `'file-tree'`: Render FileTreePlaceholder (or FileTree when ready)
    - [ ] `'tasks'`: Render TaskSchedulerPlaceholder (or TaskScheduler when ready)
    - [ ] Default: Render placeholder or error message
  - [ ] Integrate with TabGroup:
    - [ ] Get tab group ID for this panel (from panel store mapping)
    - [ ] Get tab group from tab store
    - [ ] Render TabGroup component with tabs
    - [ ] Handle tab selection/activation
  - [ ] Style with design system colors
  - [ ] Add TypeScript types (no `any` types)
  - [ ] Add JSDoc comments
- [ ] Test panel content component:
  - [ ] Test each component type
  - [ ] Test TabGroup integration
  - [ ] Test error handling

---

## 6. Panel Resize Handle

- [ ] Use `PanelResizeHandle` from `react-resizable-panels`:
  - [ ] Import `PanelResizeHandle` component
  - [ ] Render between panels (not after last panel)
  - [ ] No props needed (works automatically)
- [ ] Create custom resize handle styling (optional):
  - [ ] Create `src/components/Panels/PanelResizeHandle.tsx` wrapper (optional)
  - [ ] Style with design system colors:
    - [ ] Default: `bg-transparent` or `bg-[#3e3e42]` (invisible)
    - [ ] Hover: `bg-[#505050]` (visible on hover)
    - [ ] Active: `bg-[#007acc]` (blue accent when dragging)
  - [ ] Add hover effects:
    - [ ] `hover:bg-[#505050]` transition
    - [ ] Cursor: `cursor-col-resize` (horizontal) or `cursor-row-resize` (vertical)
  - [ ] Add width/height:
    - [ ] Horizontal: `w-1` (4px width)
    - [ ] Vertical: `h-1` (4px height)
- [ ] Test resize handle:
  - [ ] Test drag functionality
  - [ ] Test hover effects
  - [ ] Test visual feedback

---

## 7. Default Layout

- [ ] Create default layout configuration:
  - [ ] Define default panel sizes (percentages):
    - [ ] File Tree panel: 20% (minimum 180px)
    - [ ] Main panel group (editor): 50% (minimum 400px)
    - [ ] Chat panel: 30% (minimum 300px)
  - [ ] Define panel IDs:
    - [ ] `'file-tree-panel'`
    - [ ] `'editor-panel'`
    - [ ] `'chat-panel'`
  - [ ] Define panel group ID:
    - [ ] `'main-panel-group'`
  - [ ] Create default PanelLayout object:
    - [ ] Set panel configurations
    - [ ] Set panel group configurations
    - [ ] Map panels to tab groups
- [ ] Implement layout in `App.tsx`:
  - [ ] Import PanelGroup component
  - [ ] Import usePanelStore hook
  - [ ] Load default layout on mount (if no saved layout)
  - [ ] Render PanelGroup with default configuration
  - [ ] Replace placeholder components with Panel components
  - [ ] Integrate TabGroup components inside panels
- [ ] Replace placeholder components:
  - [ ] Replace FileTreePlaceholder with Panel containing FileTree
  - [ ] Replace EditorPlaceholder with Panel containing TabGroup with editor
  - [ ] Replace ChatPlaceholder with Panel containing Chat
- [ ] Test default layout:
  - [ ] All panels visible
  - [ ] Panels have correct sizes
  - [ ] Content renders correctly
  - [ ] Tab groups work inside panels
  - [ ] Minimum sizes enforced

---

## 8. Layout Persistence

- [ ] Save panel sizes on resize (debounced):
  - [ ] Use debounced callback in PanelGroup onResize handler
  - [ ] Debounce delay: 300ms (recommended)
  - [ ] Call `saveLayout()` from panel store
  - [ ] Save to localStorage via Zustand persist middleware
- [ ] Load saved layout on app start:
  - [ ] Add useEffect in App.tsx
  - [ ] Wait for store rehydration (check if persisted state exists)
  - [ ] Call `loadLayout()` from panel store
  - [ ] Apply saved panel sizes to Panel components
  - [ ] Restore panel-to-tab-group mappings
- [ ] Fall back to default layout if no saved layout:
  - [ ] Check if saved layout exists
  - [ ] Validate saved layout data
  - [ ] If invalid or missing, call `resetLayout()`
  - [ ] Apply default layout
- [ ] Handle persistence errors:
  - [ ] Try/catch for localStorage operations
  - [ ] Log errors for debugging
  - [ ] Fallback to default on error
  - [ ] Show user-friendly error message (optional)
- [ ] Test layout persistence:
  - [ ] Resize panels
  - [ ] Restart app
  - [ ] Verify layout restored
  - [ ] Test with invalid saved data
  - [ ] Test with missing saved data

---

## 9. Integration with Tab System

- [ ] Integrate panels with existing TabStore:
  - [ ] Don't duplicate tab groups in panel store
  - [ ] Reference tab groups from tabStore
  - [ ] Map panel IDs to tab group IDs
  - [ ] Use existing tab group operations
- [ ] Integrate TabGroup component in panels:
  - [ ] Render TabGroup inside PanelContent
  - [ ] Get tab group ID from panel-to-tab-group mapping
  - [ ] Pass tab group to TabGroup component
  - [ ] Handle tab selection/activation
- [ ] Handle panel activation:
  - [ ] Set active panel in panel store
  - [ ] Update active tab in tab store
  - [ ] Sync panel and tab states
- [ ] Test integration:
  - [ ] Test tab switching in panels
  - [ ] Test panel activation
  - [ ] Test tab group operations
  - [ ] Verify no state duplication

---

## 10. Error Handling

- [ ] Handle invalid layout data:
  - [ ] Validate panel IDs exist
  - [ ] Validate panel sizes (0-100)
  - [ ] Validate panel group configurations
  - [ ] Fallback to default on invalid data
- [ ] Handle size validation:
  - [ ] Enforce minimum sizes
  - [ ] Enforce maximum sizes
  - [ ] Clamp sizes to valid range
  - [ ] Show warning if size out of bounds
- [ ] Handle persistence errors:
  - [ ] Try/catch for localStorage operations
  - [ ] Handle quota exceeded errors
  - [ ] Handle JSON parse errors
  - [ ] Fallback to default on error
- [ ] Add user-friendly error messages:
  - [ ] Use toast notifications for errors
  - [ ] Log technical details to console
  - [ ] Don't expose technical errors to users

---

## 11. Testing Resizable Panels

- [ ] Test panel resizing:
  - [ ] Drag resize handle horizontally
  - [ ] Drag resize handle vertically
  - [ ] Panels resize smoothly (no lag)
  - [ ] Sizes updated in store immediately
  - [ ] Sizes persisted (debounced)
  - [ ] Minimum sizes enforced
  - [ ] Maximum sizes enforced
- [ ] Test layout persistence:
  - [ ] Resize panels to custom sizes
  - [ ] Restart app
  - [ ] Layout restored correctly
  - [ ] Panel sizes match saved values
  - [ ] Test with invalid saved data (fallback works)
  - [ ] Test with missing saved data (default works)
- [ ] Test default layout:
  - [ ] All panels visible on first load
  - [ ] Panels have correct default sizes
  - [ ] Content renders correctly
  - [ ] Tab groups work inside panels
  - [ ] Minimum sizes respected
- [ ] Test error handling:
  - [ ] Test invalid panel IDs
  - [ ] Test invalid panel sizes
  - [ ] Test persistence failures
  - [ ] Verify fallback to defaults
- [ ] Test integration:
  - [ ] Test tab switching in panels
  - [ ] Test panel activation
  - [ ] Test tab group operations
  - [ ] Verify no state duplication

---

## Verification Checklist

Before marking Phase 1.4 complete, verify all of the following:

- [ ] Panels can be resized
- [ ] Default layout works
- [ ] Layout persistence works
- [ ] All panels visible and functional
- [ ] Resize handles work smoothly
- [ ] Panel sizes respect minimums (180px File Tree, 300px Chat, 400px Editor)
- [ ] Layout restored on app start
- [ ] Panel content renders correctly
- [ ] Tab groups integrated correctly
- [ ] Error handling works (invalid data, persistence failures)
- [ ] No state duplication between panel store and tab store
- [ ] Debouncing works (no excessive saves)
- [ ] Performance is smooth (no lag during resize)

---

## Progress Tracking

**Started:** [Date]  
**Completed:** [Date]  
**Total Tasks:** 15+  
**Completed Tasks:** 0  
**Completion:** 0%

### Task Breakdown
- **Prerequisites & Setup:** 7 tasks
- **Panel Data Structures:** 6 tasks (types, constants, exports)
- **Panel Store:** 8+ tasks (state, actions, persistence, error handling)
- **Panel Group Component:** 6+ tasks (component, resize handling, nested groups)
- **Panel Component:** 4 tasks (component, activation, styling)
- **Panel Content Component:** 5 tasks (content routing, TabGroup integration)
- **Panel Resize Handle:** 3 tasks (styling, hover effects)
- **Default Layout:** 5 tasks (configuration, implementation, integration)
- **Layout Persistence:** 5 tasks (save, load, fallback, error handling)
- **Integration with Tab System:** 4 tasks (TabStore integration, TabGroup rendering)
- **Error Handling:** 4 tasks (validation, persistence, user messages)
- **Testing:** 5+ tasks (resizing, persistence, layout, errors, integration)

---

## Next Steps

After completing Phase 1.4:
- All Phase 1 systems can now work together
- Can proceed to Phase 2 or continue with Phase 1.5

---

**Last Updated:** 2025-12-30  
**Status:** ✅ Ready for Implementation (Enhanced with Best Practices)

## Important Notes

**Integration with TabStore:**
- Panel store should **reference** existing tab groups from TabStore, not duplicate them
- Use `panelToTabGroupMap` to map panel IDs to tab group IDs
- Tab groups are already managed by `tabStore.ts` (Phase 1.2)

**react-resizable-panels Best Practices:**
- Always provide `id` prop to PanelGroup (required for state management)
- Use stable IDs (don't regenerate on re-render)
- Debounce `onResize` callbacks (300ms recommended)
- Save sizes as percentages (0-100), not pixels
- Validate loaded sizes before applying

**Minimum Panel Sizes (from technical spec):**
- File Tree: 180px minimum width
- Chat Interface: 300px minimum width
- Code Editor: 400px minimum width
- Convert pixel minimums to percentages based on container size

**Performance:**
- Debounce resize handlers to avoid excessive updates
- Update store immediately for UI responsiveness
- Debounce persistence saves separately
- Use React.memo for Panel components if needed

**Error Handling:**
- Validate all loaded layout data
- Fallback to default layout on error
- Show user-friendly error messages
- Log technical details for debugging

