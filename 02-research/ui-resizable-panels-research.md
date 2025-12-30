# UI Resizable Panels and Multi-Window Research

**Created:** 2024-12-28  
**Status:** Research Complete

## Overview

Researching how to implement resizable panels and detachable windows (like Cursor) in Nexus Overseer using Tauri + React.

## Requirements

1. **Resizable Panels:** Users can resize panels/panes within the main window
2. **Detachable Windows:** Users can drag panels/tabs out into separate windows
3. **Window Management:** Manage multiple windows, restore positions/sizes
4. **Smooth UX:** Similar to Cursor/VS Code experience

## Tauri Multi-Window Support

### ✅ Confirmed: Tauri Supports This

**Resizable Windows:**
- Built-in support via `resizable: true` in window config
- Can be set in `tauri.conf.json` or programmatically via `WindowBuilder`
- Works on Windows, macOS, Linux

**Multiple Windows:**
- Can create new windows dynamically using `WindowBuilder`
- Each window has unique label
- Can load different content into each window
- Windows are managed by Tauri core process

**Window State Management:**
- Tauri Window State Plugin available
- Automatically saves/restores window positions and sizes
- Persists across application sessions

### Implementation Example

```rust
use tauri::WindowBuilder;

// Create a new detached window
fn create_detached_window(app: &tauri::AppHandle, label: &str, url: &str) {
    WindowBuilder::new(
        app,
        label, // unique label
        tauri::WindowUrl::App(url.into())
    )
    .title("Detached Panel")
    .resizable(true)
    .build()
    .expect("Failed to create window");
}
```

### Tauri IPC for Window Management

Frontend can call Tauri commands to:
- Create new windows
- Close windows
- Get window list
- Manage window state

---

## React Resizable Panel Libraries

### 1. react-resizable-panels

**Description:** Modern, performant library for resizable panels. Used by many modern apps.

**Pros:**
- ✅ Modern and actively maintained
- ✅ TypeScript support
- ✅ Good performance
- ✅ Flexible API
- ✅ Supports horizontal and vertical splits
- ✅ Nested panels supported
- ✅ Smooth resizing

**Cons:**
- ⚠️ Need to implement docking/undocking yourself

**Bundle Size:** Small (~10-20KB)

**Usage Example:**
```tsx
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

<PanelGroup direction="horizontal">
  <Panel defaultSize={50}>
    <CodeEditor />
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={50}>
    <ChatInterface />
  </Panel>
</PanelGroup>
```

**Sources:**
- [react-resizable-panels GitHub](https://github.com/bvaughn/react-resizable-panels)

**Verdict:** ⭐⭐⭐⭐⭐ **Top Choice** - Modern, performant, perfect for resizable panels

---

### 2. Allotment

**Description:** Split pane library, similar to VS Code's split view.

**Pros:**
- ✅ VS Code-like experience
- ✅ TypeScript support
- ✅ Good documentation
- ✅ Smooth animations
- ✅ Nested splits

**Cons:**
- ⚠️ Less flexible than react-resizable-panels
- ⚠️ Still need to implement docking yourself

**Bundle Size:** Small

**Sources:**
- [Allotment GitHub](https://github.com/johnwalley/allotment)

**Verdict:** ⭐⭐⭐⭐ **Good Alternative** - VS Code-like, but react-resizable-panels is more modern

---

### 3. react-split-pane (Legacy)

**Description:** Older library for split panes.

**Pros:**
- ✅ Simple API
- ✅ Well-known

**Cons:**
- ❌ Less maintained
- ❌ Older architecture
- ❌ Not recommended for new projects

**Verdict:** ❌ **Not Recommended** - Use react-resizable-panels instead

---

## Detachable Windows Implementation Strategy

### Approach: Custom Implementation

Since there's no ready-made library for "drag panel to new window" in React, we'll implement it ourselves using:

1. **React Resizable Panels:** For the resizable panel system
2. **Tauri Window API:** For creating new windows
3. **Custom Drag Handler:** Detect when user wants to detach a panel
4. **State Management:** Track which panels are in which windows

### Implementation Flow

```
User drags panel/tab
  ↓
Detect drag gesture (onMouseDown + movement)
  ↓
Show visual indicator (ghost/preview)
  ↓
User drags outside main window
  ↓
Call Tauri command to create new window
  ↓
Transfer panel content to new window
  ↓
Remove panel from main window
  ↓
New window displays panel content
```

### Key Components Needed

1. **Panel Component:**
   - Wraps content in resizable panel
   - Handles drag detection
   - Manages panel state (attached/detached)

2. **Window Manager:**
   - Tracks all windows
   - Manages window creation/destruction
   - Handles content transfer between windows

3. **Drag Handler:**
   - Detects drag gestures
   - Shows visual feedback
   - Triggers window creation

4. **State Store:**
   - Stores panel layout
   - Tracks which panels are in which windows
   - Persists layout preferences

---

## Recommended Stack

### For Resizable Panels
**Library:** `react-resizable-panels`
- Modern, performant
- TypeScript support
- Active development
- Used by many modern apps

### For Window Management
**Tauri API:** Built-in window management
- `WindowBuilder` for creating windows
- Window State Plugin for persistence
- IPC commands for frontend-backend communication

### For State Management
**Option 1:** Zustand (recommended)
- Lightweight
- Simple API
- Good for window/panel state

**Option 2:** React Context
- Built-in
- Good for simple state

---

## Implementation Plan

### Phase 1: Basic Resizable Panels
1. Install `react-resizable-panels`
2. Create basic panel layout (editor, chat, tasks)
3. Implement horizontal/vertical splits
4. Test resizing performance

### Phase 2: Multi-Window Support
1. Create Tauri command to create new window
2. Implement window state management
3. Create window manager in frontend
4. Test window creation/destruction

### Phase 3: Detachable Panels
1. Implement drag detection
2. Create visual feedback (ghost/preview)
3. Implement content transfer to new window
4. Handle window closing (re-attach panel)

### Phase 4: Persistence
1. Integrate Tauri Window State Plugin
2. Save panel layouts
3. Restore layouts on app start
4. Save user preferences

---

## Code Structure

```
src/
├── components/
│   ├── Panels/
│   │   ├── ResizablePanel.tsx
│   │   ├── PanelGroup.tsx
│   │   └── DetachablePanel.tsx
│   ├── Windows/
│   │   ├── WindowManager.tsx
│   │   └── DetachedWindow.tsx
│   └── ...
├── hooks/
│   ├── useWindowManager.ts
│   ├── usePanelDrag.ts
│   └── ...
├── stores/
│   ├── windowStore.ts
│   ├── panelLayoutStore.ts
│   └── ...
└── ...
```

---

## Considerations

### Performance
- ⚠️ Tauri has reported slower resizing on Windows (known issue)
- ✅ React resizable panels are performant
- ✅ Minimize re-renders during resize

### User Experience
- ✅ Smooth animations during resize
- ✅ Visual feedback when dragging to detach
- ✅ Remember window positions/sizes
- ✅ Allow re-attaching panels

### State Management
- ✅ Keep panel state in sync across windows
- ✅ Handle window close events
- ✅ Persist layout preferences

---

## Next Steps

1. ✅ Research Tauri multi-window support (confirmed)
2. ✅ Research React resizable panel libraries (react-resizable-panels recommended)
3. ⏳ Design panel layout system
4. ⏳ Design window management architecture
5. ⏳ Create technical specification for UI system
6. ⏳ Implement prototype

---

## Sources

- Tauri Window Management Documentation
- react-resizable-panels GitHub
- Allotment GitHub
- Tauri Window State Plugin
- VS Code/Cursor UI patterns (reference)

---

## Conclusion

**✅ YES, we can absolutely implement this!**

**Stack:**
- **Resizable Panels:** `react-resizable-panels`
- **Multi-Window:** Tauri's built-in window management
- **State Management:** Zustand or React Context
- **Persistence:** Tauri Window State Plugin

**Implementation:**
- Custom drag-to-detach functionality
- Window manager component
- Panel state management
- Layout persistence

This is definitely achievable with Tauri + React, and will provide a Cursor-like experience!

