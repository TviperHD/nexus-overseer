# Rebuild with Panel Test Pattern Checklist

**Feature:** Rebuild Application Using PanelGroupTest Pattern  
**Date Created:** 2025-12-30  
**Status:** Not Started  
**Priority:** High  
**Goal:** Start fresh with a blank canvas, using the working PanelGroupTest.tsx pattern as the foundation, then build tab spawning functionality on top

---

## Overview

This checklist covers rebuilding the application using the proven `PanelGroupTest.tsx` pattern as the foundation. The approach is to:

1. **Backup current work to GitHub** (preserve existing implementation)
2. **Start with blank canvas** using PanelGroupTest pattern
3. **Add tab spawning functionality** (spawn tabs into panels)
4. **Build incrementally** on top of the working foundation

**Key Principle:** Use the minimal, working test pattern (`PanelGroupTest.tsx`) as the base, then add features incrementally.

---

## Pre-Implementation: Backup to GitHub

**Goal:** Preserve current work before rebuilding

- [ ] **Verify Git status:**
  - [ ] Check current branch: `git branch`
  - [ ] Check uncommitted changes: `git status`
  - [ ] Review what will be committed: `git diff`

- [ ] **Stage all changes:**
  - [ ] Stage all files: `git add .`
  - [ ] Verify staged files: `git status`

- [ ] **Commit current work:**
  - [ ] Create commit with descriptive message: `git commit -m "Backup before rebuild: preserve tab-drag-integration work"`
  - [ ] Verify commit created: `git log -1`

- [ ] **Push to GitHub:**
  - [ ] Push to remote: `git push origin [branch-name]`
  - [ ] Verify push successful: Check GitHub repository

- [ ] **Optional: Create backup branch:**
  - [ ] Create backup branch: `git branch backup-before-rebuild`
  - [ ] Push backup branch: `git push origin backup-before-rebuild`
  - [ ] Switch back to main branch: `git checkout [main-branch]`

**Note:** This is a planning session - actual git commands should be run by the user during implementation.

---

## Phase 1: Setup Blank Canvas with PanelGroupTest Pattern

**Goal:** Create a minimal working app using PanelGroupTest.tsx pattern

**Research-Backed Requirements:**
- ✅ **Panel `id` prop is REQUIRED** - `onLayoutChange` won't work without it
- ✅ **CSS import is CRITICAL** - Separator is invisible without CSS
- ✅ **CSS path must be correct** - `src/components/Panels/PanelGroupTest.css`
- ✅ **Separator uses `[data-separator]` selector** - Library adds this attribute automatically
- ✅ **Group requires `orientation` prop** - `"horizontal"` or `"vertical"`
- ✅ **Panel requires `defaultSize`, `minSize` props** - Recommended: `minSize={10}`

### 1.1 Create New Minimal App Entry Point

- [ ] **Modify App.tsx to use PanelGroupTest pattern:**
  - [ ] Use `PanelGroupTest.tsx` as exact reference (located at `src/components/Panels/PanelGroupTest.tsx`)
  - [ ] Start with minimal structure: just `Group`, `Panel`, `Separator`, `Panel` (no wrappers)
  - [ ] **CRITICAL:** Import CSS with correct path: `import './components/Panels/PanelGroupTest.css'`
  - [ ] No state management yet - just static panels
  - [ ] **CRITICAL:** Each Panel MUST have `id` prop (required for library to track panels)
  - [ ] Verify resize works (drag separator to resize panels)

**Code Pattern (Exact from PanelGroupTest.tsx):**
```typescript
// Minimal starting point - EXACT pattern from PanelGroupTest.tsx
import React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import './components/Panels/PanelGroupTest.css'; // ✅ CRITICAL: Correct path

export const App: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
      <Group 
        orientation="horizontal" 
        style={{ width: '100%', height: '100%', display: 'flex' }}
      >
        <Panel 
          id="panel1"  // ✅ CRITICAL: id prop is REQUIRED
          defaultSize={50} 
          minSize={10} 
          style={{ backgroundColor: '#1e1e1e' }}
        >
          <div style={{ padding: '20px', color: 'white' }}>Panel 1</div>
        </Panel>
        <Separator />  // ✅ Separator between panels (not at start/end)
        <Panel 
          id="panel2"  // ✅ CRITICAL: id prop is REQUIRED
          defaultSize={50} 
          minSize={10} 
          style={{ backgroundColor: '#252526' }}
        >
          <div style={{ padding: '20px', color: 'white' }}>Panel 2</div>
        </Panel>
      </Group>
    </div>
  );
};
```

**Key Differences from Current PanelGroup.tsx:**
- ✅ **No wrapper components** - Use `Panel` directly from `react-resizable-panels`
- ✅ **No config objects** - Just direct props on Panel
- ✅ **No state management** - Static panels for now
- ✅ **Simpler structure** - Build complexity incrementally

- [ ] **Test basic functionality:**
  - [ ] Verify app renders without errors
  - [ ] Verify panels are visible (dark backgrounds)
  - [ ] **CRITICAL:** Verify separator is visible (4px width, dark gray `#3e3e42`)
  - [ ] Verify dragging separator resizes panels smoothly
  - [ ] Verify hover states work on separator (background changes to `#505050`, blue border appears)
  - [ ] Verify active/dragging states work (background changes to `#007acc`)
  - [ ] Verify cursor changes to `col-resize` when hovering separator
  - [ ] Check browser console for any errors from react-resizable-panels

### 1.2 Add TopBar Component

**Research Finding:** TopBar component already exists at `src/components/TopBar/TopBar.tsx` with TabTypeDropdown integrated.

- [ ] **Verify TopBar component exists:**
  - [ ] Check file: `src/components/TopBar/TopBar.tsx`
  - [ ] Verify it includes TabTypeDropdown (already integrated)
  - [ ] Verify height: 30px (from existing code)
  - [ ] Verify background: `#2d2d30` (from existing code)
  - [ ] Verify fixed position at top

- [ ] **Integrate TopBar into App:**
  - [ ] Import TopBar: `import { TopBar } from './components/TopBar';`
  - [ ] Add TopBar above panel group
  - [ ] Adjust panel group height to account for TopBar (30px)
  - [ ] Use Tailwind classes for layout (matches existing App.tsx pattern)
  - [ ] Verify layout: TopBar at top, panels below

**Code Pattern (Based on Existing App.tsx):**
```typescript
import { TopBar } from './components/TopBar';

export const App: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e]">
      {/* TopBar - fixed at top (30px height) */}
      <TopBar />
      
      {/* Content area - panels below TopBar */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden pt-[30px]">
        {/* Panel group here */}
        <div style={{ width: '100%', height: '100%', display: 'flex' }}>
          <Group orientation="horizontal" style={{ width: '100%', height: '100%', display: 'flex' }}>
            {/* Panels */}
          </Group>
        </div>
      </div>
    </div>
  );
};
```

**Note:** TopBar already has TabTypeDropdown integrated - we'll use this for tab spawning in Phase 2.

### 1.3 Verify CSS Import

**Research Finding:** CSS file exists at `src/components/Panels/PanelGroupTest.css` with complete styling for separators.

- [ ] **Ensure PanelGroupTest.css is imported:**
  - [ ] Verify CSS file exists: `src/components/Panels/PanelGroupTest.css`
  - [ ] **CRITICAL:** Import in App component with correct path: `import './components/Panels/PanelGroupTest.css'`
  - [ ] Verify import path is relative to App.tsx location
  - [ ] Verify separator is visible (4px width, dark background `#3e3e42`)
  - [ ] Verify hover states work (background `#505050`, blue border `#007acc`)
  - [ ] Verify active/dragging states work (background `#007acc`, brighter blue border)
  - [ ] Verify cursor changes (`col-resize` for horizontal, `row-resize` for vertical)
  - [ ] Verify extended hover area works (separator responds to hover 6px before/after)

**Critical Requirements (Research-Backed):**
- ✅ **CSS import is REQUIRED** - Separator is invisible without CSS
- ✅ **CSS uses `[data-separator]` selector** - Library adds this attribute automatically
- ✅ **CSS path must be correct** - Relative to App.tsx location
- ✅ **Separator styling includes:** width (4px), background color, cursor, hover states, active states

**Troubleshooting:**
- If separator is invisible: Check CSS import path is correct
- If hover doesn't work: Verify CSS file is loaded (check browser DevTools)
- If cursor doesn't change: Verify CSS cursor property is set correctly

---

## Phase 2: Add Tab Spawning Functionality

**Goal:** Add ability to spawn tabs into panels, starting with blank canvas

**Research Finding:** Tab system already exists with full infrastructure:
- ✅ `tabStore.ts` exists with complete tab management
- ✅ `TabTypeDropdown` already integrated in TopBar
- ✅ `createTabForType()` helper exists in `utils/tabTypeHelpers.ts`
- ✅ Tab types: `'editor'`, `'chat'`, `'file-tree'`, `'tasks'`
- ✅ Main panel concept exists: `MAIN_PANEL_ID = 'main-panel'` constant

### 2.1 Integrate Existing Tab Spawning System

- [ ] **Verify TabTypeDropdown is working:**
  - [ ] Check `src/components/TopBar/TabTypeDropdown.tsx` exists
  - [ ] Verify it's already integrated in TopBar (from Phase 1.2)
  - [ ] Verify dropdown shows tab types: Editor, Chat, File Tree, Tasks
  - [ ] Test clicking dropdown - should show menu

- [ ] **Verify tab store exists and works:**
  - [ ] Check `src/stores/tabStore.ts` exists
  - [ ] Review tab store structure:
    - [ ] `tabGroups: TabGroup[]` - Array of tab groups
    - [ ] `addTab(tabGroupId, tab)` - Add tab to group
    - [ ] `createTabGroup()` - Create new tab group
    - [ ] `setActiveTab(tabGroupId, tabId)` - Set active tab
  - [ ] Verify store is using Zustand with persistence

- [ ] **Verify tab type helpers exist:**
  - [ ] Check `src/utils/tabTypeHelpers.ts` exists
  - [ ] Verify `createTabForType(type: TabType): Tab` function exists
  - [ ] Verify tab types are defined correctly

- [ ] **Create tab spawning handler:**
  - [ ] Handler in App or TopBar: `handleTabTypeSelect(tabType: string)`
  - [ ] Use existing `createTabForType()` helper
  - [ ] Create or get main panel (use `MAIN_PANEL_ID = 'main-panel'`)
  - [ ] Create or get tab group for main panel
  - [ ] Add tab to tab group using `tabStore.addTab()`
  - [ ] Set tab as active using `tabStore.setActiveTab()`

**Code Pattern (Using Existing Infrastructure):**
```typescript
import { useTabStore } from './stores/tabStore';
import { usePanelStore, MAIN_PANEL_ID } from './stores/panelStore';
import { createTabForType } from './utils/tabTypeHelpers';

const handleTabTypeSelect = (tabType: string) => {
  const tabStore = useTabStore.getState();
  const panelStore = usePanelStore.getState();
  
  // Get or create main panel
  const mainPanelId = MAIN_PANEL_ID;
  let tabGroupId = panelStore.getTabGroupForPanel(mainPanelId);
  
  if (!tabGroupId) {
    // Create tab group for main panel
    tabGroupId = tabStore.createTabGroup();
    panelStore.setPanelTabGroupMapping(mainPanelId, tabGroupId);
  }
  
  // Create tab using existing helper
  const newTab = createTabForType(tabType as TabType);
  
  // Add tab to group
  tabStore.addTab(tabGroupId, newTab);
  tabStore.setActiveTab(tabGroupId, newTab.id);
};
```

**Integration Point:** Connect TabTypeDropdown's `onSelect` to this handler.

### 2.2 Display Tabs in Panel

**Research Finding:** Tab rendering components already exist:
- ✅ `TabGroup` component exists at `src/components/Tab/TabGroup.tsx`
- ✅ `TabBar` component exists at `src/components/Tab/TabBar.tsx`
- ✅ `TabContent` component exists at `src/components/Tab/TabContent.tsx`
- ✅ `PanelContent` component exists at `src/components/Panels/PanelContent.tsx` - handles rendering TabGroup for panels

- [ ] **Verify TabGroup component exists:**
  - [ ] Check `src/components/Tab/TabGroup.tsx` exists
  - [ ] Review component structure:
    - [ ] Takes `tabGroupId` prop
    - [ ] Renders TabBar with tabs
    - [ ] Renders TabContent for active tab
    - [ ] Handles tab selection and closing
  - [ ] Verify it uses `useTabStore` to get tab group data

- [ ] **Verify PanelContent component exists:**
  - [ ] Check `src/components/Panels/PanelContent.tsx` exists
  - [ ] Review how it renders TabGroup for editor panels:
    - [ ] Gets `tabGroupId` from `panelStore.getTabGroupForPanel(panelId)`
    - [ ] Renders `<TabGroup tabGroupId={tabGroupId} />` for editor panels
  - [ ] Understand integration pattern

- [ ] **Render tabs in panel using existing components:**
  - [ ] Replace static "Panel 1" content with PanelContent-like component
  - [ ] For now, create simple wrapper that:
    - [ ] Gets tab group ID for panel (from panel store)
    - [ ] Renders TabGroup if tab group exists
    - [ ] Shows empty state if no tab group
  - [ ] Verify tabs appear when spawned

**Code Pattern (Using Existing Components):**
```typescript
// Simple panel content wrapper (temporary, will use PanelContent later)
import { TabGroup } from './components/Tab/TabGroup';
import { usePanelStore } from './stores/panelStore';

const SimplePanelContent: React.FC<{ panelId: string }> = ({ panelId }) => {
  const tabGroupId = usePanelStore(state => 
    state.panelToTabGroupMap.get(panelId) || null
  );
  
  if (!tabGroupId) {
    return (
      <div style={{ padding: '20px', color: 'white' }}>
        No tabs yet - spawn a tab from TopBar
      </div>
    );
  }
  
  return <TabGroup tabGroupId={tabGroupId} />;
};

// Use in Panel:
<Panel id="panel1" defaultSize={50} minSize={10}>
  <SimplePanelContent panelId="panel1" />
</Panel>
```

**Note:** This is a temporary simple version. We'll integrate with PanelContent properly in Phase 3.

### 2.3 Test Tab Spawning

- [ ] **Verify tab spawning works:**
  - [ ] Click "New Tab" button in TopBar
  - [ ] Verify tab appears in panel
  - [ ] Spawn multiple tabs
  - [ ] Verify all tabs display
  - [ ] Verify panel still resizes correctly

---

## Phase 3: Integrate Panel System with Tabs

**Goal:** Connect tabs to panels properly, using existing panel store infrastructure

**Research Finding:** Panel store already has complete infrastructure:
- ✅ `panelStore.ts` exists with full panel management
- ✅ `panelToTabGroupMap: Map<string, string>` - Panel ID -> Tab Group ID mapping
- ✅ `setPanelTabGroupMapping(panelId, tabGroupId)` - Set mapping
- ✅ `getTabGroupForPanel(panelId)` - Get tab group for panel
- ✅ `MAIN_PANEL_ID = 'main-panel'` constant
- ✅ `createMainPanel()` and `ensureMainPanelExists()` functions

### 3.1 Integrate Existing Panel Store

- [ ] **Verify panel store exists and understand structure:**
  - [ ] Check `src/stores/panelStore.ts` exists
  - [ ] Review panel store structure:
    - [ ] `panelToTabGroupMap: Map<string, string>` - Panel-to-tab-group mapping
    - [ ] `setPanelTabGroupMapping(panelId, tabGroupId)` - Set mapping
    - [ ] `getTabGroupForPanel(panelId)` - Get tab group for panel (creates if missing)
    - [ ] `MAIN_PANEL_ID = 'main-panel'` - Main panel constant
    - [ ] `createMainPanel()` - Creates main panel config
    - [ ] `ensureMainPanelExists()` - Ensures main panel exists in layout
  - [ ] Understand how mapping works (panel ID -> tab group ID)

- [ ] **Update tab spawning to use panel store:**
  - [ ] When spawning tab, ensure main panel exists: `panelStore.ensureMainPanelExists()`
  - [ ] Get or create tab group for main panel: `panelStore.getTabGroupForPanel(MAIN_PANEL_ID)`
  - [ ] This function automatically creates tab group if missing
  - [ ] Add tab to the returned tab group
  - [ ] Panel content will automatically show tabs (via PanelContent component)

**Code Pattern (Using Existing Panel Store):**
```typescript
import { usePanelStore, MAIN_PANEL_ID } from './stores/panelStore';
import { useTabStore } from './stores/tabStore';
import { createTabForType } from './utils/tabTypeHelpers';

const handleTabTypeSelect = (tabType: string) => {
  const panelStore = usePanelStore.getState();
  const tabStore = useTabStore.getState();
  
  // Ensure main panel exists in layout
  panelStore.ensureMainPanelExists();
  
  // Get or create tab group for main panel (auto-creates if missing)
  const tabGroupId = panelStore.getTabGroupForPanel(MAIN_PANEL_ID);
  
  // Create tab
  const newTab = createTabForType(tabType as TabType);
  
  // Add tab to group
  tabStore.addTab(tabGroupId, newTab);
  tabStore.setActiveTab(tabGroupId, newTab.id);
};
```

**Key Insight:** `getTabGroupForPanel()` automatically creates tab group and mapping if missing - this simplifies our code!

### 3.2 Use Existing PanelContent Component

**Research Finding:** PanelContent component already handles rendering TabGroup for panels.

- [ ] **Verify PanelContent component integration:**
  - [ ] Check `src/components/Panels/PanelContent.tsx` exists
  - [ ] Review how it works:
    - [ ] Takes `component` and `panelId` props
    - [ ] Gets `tabGroupId` from `panelStore.getTabGroupForPanel(panelId)`
    - [ ] Renders `<TabGroup tabGroupId={tabGroupId} />` for editor panels
    - [ ] Handles other component types (chat, file-tree, tasks)
  - [ ] Understand the integration pattern

- [ ] **Update panel rendering to use PanelContent:**
  - [ ] Replace SimplePanelContent with PanelContent component
  - [ ] Pass `component="editor"` and `panelId` props
  - [ ] PanelContent will automatically:
    - [ ] Get tab group for panel
    - [ ] Render TabGroup with tabs
    - [ ] Handle empty state if no tab group
  - [ ] Verify tabs appear when spawned

**Code Pattern (Using Existing PanelContent):**
```typescript
import { PanelContent } from './components/Panels/PanelContent';

// In Panel:
<Panel id="panel1" defaultSize={50} minSize={10}>
  <PanelContent component="editor" panelId="panel1" />
</Panel>
```

**Note:** PanelContent already handles all the complexity - we just need to use it!

- [ ] **Test tab spawning and rendering:**
  - [ ] Spawn tab from TopBar dropdown
  - [ ] Verify tab appears in main panel
  - [ ] Verify TabBar shows the tab
  - [ ] Verify TabContent shows tab content
  - [ ] Spawn multiple tabs
  - [ ] Verify all tabs appear in TabBar
  - [ ] Verify clicking tab switches active tab
  - [ ] Verify panel still resizes correctly with tabs

### 3.3 Verify Tab Bar UI Integration

**Research Finding:** TabBar is already integrated in TabGroup component.

- [ ] **Verify TabBar is working:**
  - [ ] TabBar is already part of TabGroup component
  - [ ] TabBar shows list of tabs for the tab group
  - [ ] Tab titles are clickable
  - [ ] Active tab is highlighted
  - [ ] Tab closing works (X button on tabs)
  - [ ] Tab switching works (click tab to switch)

- [ ] **Test TabBar functionality:**
  - [ ] Verify TabBar appears at top of panel
  - [ ] Verify tabs are displayed horizontally
  - [ ] Verify active tab is highlighted
  - [ ] Verify clicking tab switches active tab
  - [ ] Verify TabContent updates when switching tabs
  - [ ] Verify closing tab removes it from TabBar
  - [ ] Verify closing last tab shows empty state

**No additional work needed** - TabBar is already fully integrated in TabGroup component!

---

## Phase 4: Build on Top - Add Features Incrementally

**Goal:** Add features one at a time, testing each step

### 4.1 Add Tab Closing

- [ ] **Add close button to tabs:**
  - [ ] X button on each tab
  - [ ] Click to remove tab
  - [ ] Update store to remove tab
  - [ ] Handle closing last tab (show empty state)

### 4.2 Add Tab Types

- [ ] **Extend tab system with types:**
  - [ ] Tab types: `'editor'`, `'chat'`, `'file-tree'`, `'tasks'`
  - [ ] Update TopBar dropdown with types
  - [ ] Spawn different tab types
  - [ ] Render different content per type

### 4.3 Add Tab Drag-Drop (Basic)

- [ ] **Add basic drag-drop:**
  - [ ] Make tabs draggable
  - [ ] Allow dropping tabs in same panel (reorder)
  - [ ] Use dnd-kit or HTML5 drag-drop
  - [ ] Keep it simple - no panel splitting yet

### 4.4 Add Panel Splitting via Drag-Drop

- [ ] **Add drop zones for panel splitting:**
  - [ ] Drop zones on panel edges
  - [ ] Drop tab on edge to split panel
  - [ ] Create new panel with dropped tab
  - [ ] Update layout with new panel

### 4.5 Add More Features

- [ ] **Continue building incrementally:**
  - [ ] Add tab context menu
  - [ ] Add pinned tabs
  - [ ] Add panel collapse/expand
  - [ ] Add double-click separator to expand
  - [ ] Add any other features from previous implementation

---

## Verification Checklist

**Before marking complete, verify:**

- [ ] **Basic functionality:**
  - [ ] App renders without errors
  - [ ] Panels are visible
  - [ ] Separator is visible and draggable
  - [ ] Dragging separator resizes panels smoothly
  - [ ] Hover states work on separator

- [ ] **Tab spawning:**
  - [ ] Can spawn tabs from TopBar
  - [ ] Tabs appear in panels
  - [ ] Multiple tabs can exist
  - [ ] Tabs are panel-specific

- [ ] **Tab display:**
  - [ ] TabBar shows tabs
  - [ ] Can switch between tabs
  - [ ] Active tab is highlighted
  - [ ] Tab content displays correctly

- [ ] **Integration:**
  - [ ] Panel system works with tabs
  - [ ] Resizing panels works with tabs
  - [ ] No performance issues
  - [ ] No console errors

---

## Notes

### Key Principles

1. **Start Simple:** Use PanelGroupTest pattern - it works, keep it simple
2. **Build Incrementally:** Add one feature at a time, test each step
3. **Test Frequently:** Verify everything works after each addition
4. **Preserve Working Code:** Don't break what works - build on top

### Reference Files

**Working Test Pattern:**
- **PanelGroupTest.tsx:** `src/components/Panels/PanelGroupTest.tsx` - Working minimal pattern (EXACT reference)
- **PanelGroupTest.css:** `src/components/Panels/PanelGroupTest.css` - Required CSS (must import)

**Existing Infrastructure (Use These):**
- **tabStore.ts:** `src/stores/tabStore.ts` - Complete tab management system
- **panelStore.ts:** `src/stores/panelStore.ts` - Complete panel management system
- **TopBar.tsx:** `src/components/TopBar/TopBar.tsx` - TopBar with TabTypeDropdown integrated
- **TabTypeDropdown.tsx:** `src/components/TopBar/TabTypeDropdown.tsx` - Tab type selection dropdown
- **TabGroup.tsx:** `src/components/Tab/TabGroup.tsx` - Tab group rendering (includes TabBar)
- **PanelContent.tsx:** `src/components/Panels/PanelContent.tsx` - Panel content rendering
- **tabTypeHelpers.ts:** `src/utils/tabTypeHelpers.ts` - Tab creation helpers

**Reference (Don't Use Yet - Too Complex):**
- **Current App.tsx:** `src/App.tsx` - Reference for structure (but we're rebuilding simpler)
- **Current PanelGroup.tsx:** `src/components/Panels/PanelGroup.tsx` - Reference (but we're starting simpler)

### What We're NOT Doing Yet

- Complex PanelGroup wrapper (use Panel directly from library)
- Dynamic panel creation (start with static panels)
- Drag-drop between panels (add later)
- Panel splitting via drag-drop (add later)
- Layout persistence (add later)
- Nested panel groups (add later)
- All the advanced features (build incrementally)

### What We ARE Doing

- Starting with working PanelGroupTest pattern (EXACT pattern)
- Using existing tab store and panel store (don't recreate)
- Using existing TopBar and TabTypeDropdown (already integrated)
- Using existing TabGroup and PanelContent components
- Adding tab spawning to main panel
- Building incrementally
- Testing each step
- Keeping it simple

### Research-Backed Best Practices

**From react-resizable-panels:**
- ✅ Panel `id` prop is REQUIRED for `onLayoutChange` to work
- ✅ CSS import is CRITICAL - separator invisible without it
- ✅ Separator uses `[data-separator]` attribute selector
- ✅ Group requires `orientation` prop
- ✅ Panel requires `defaultSize` and `minSize` props
- ✅ Separator must be between panels (not at start/end)

**From Existing Codebase:**
- ✅ Use existing stores (tabStore, panelStore) - don't recreate
- ✅ Use existing components (TopBar, TabGroup, PanelContent) - don't recreate
- ✅ Use `MAIN_PANEL_ID` constant for main panel
- ✅ Use `getTabGroupForPanel()` - it auto-creates if missing
- ✅ Use `createTabForType()` helper for tab creation

---

## Next Steps After This Checklist

Once this checklist is complete:

1. **Review what was built**
2. **Test thoroughly**
3. **Create next checklist** for additional features
4. **Continue building incrementally**

---

**Last Updated:** 2025-12-30

