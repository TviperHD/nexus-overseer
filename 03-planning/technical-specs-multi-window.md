# Technical Specification: Multi-Window System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The Multi-Window System enables users to detach panels from the main window into separate windows, similar to Cursor. It manages window creation, lifecycle, content transfer, and state persistence. Windows can be created dynamically, closed, and their positions/sizes are remembered.

**Key Features:**
- Dynamic window creation
- Panel detachment to separate windows
- Window state persistence (position, size)
- Window communication
- Window lifecycle management
- Drag-to-detach functionality

**Purpose:**
- Provide flexible workspace layout
- Allow users to use multiple monitors
- Enable panel isolation
- Improve productivity with multi-window setup

---

## System Architecture

### High-Level Design

The Multi-Window System consists of:

1. **Window Manager:** Manages all windows
2. **Window Creator:** Creates new windows dynamically
3. **Content Transfer:** Transfers panel content to windows
4. **Window State Manager:** Manages window positions/sizes
5. **Window Communication:** Handles communication between windows

### Component Hierarchy

```
MultiWindowSystem
├── WindowManager (Main Manager)
│   ├── WindowRegistry (Tracks all windows)
│   ├── WindowCreator (Creates windows)
│   └── WindowDestroyer (Closes windows)
├── ContentTransfer (Content Management)
│   ├── PanelDetacher (Detaches panel to window)
│   └── PanelReattacher (Reattaches panel from window)
├── WindowStateManager (State Persistence)
│   ├── StateSaver (Saves window state)
│   └── StateLoader (Loads window state)
└── WindowCommunication (Inter-Window Communication)
    ├── EventEmitter (Emits events)
    └── EventListener (Listens to events)
```

### Data Flow

```
User Drags Panel to Detach
  ↓
Window Manager (Detects drag)
  ↓
Window Creator (Creates new window)
  ↓
Content Transfer (Transfers panel content)
  ↓
Window State Manager (Saves window state)
  ↓
New Window (Displays panel content)
```

---

## Data Structures

### Frontend (TypeScript)

**Window Configuration:**
```typescript
interface WindowConfig {
  id: string;                    // Unique window ID
  label: string;                 // Tauri window label
  title: string;                 // Window title
  component: string;             // Component to render (editor, chat, etc.)
  panelId: string;               // Original panel ID (if detached)
  position: { x: number; y: number };
  size: { width: number; height: number };
  isDetached: boolean;           // Is this a detached panel?
  parentWindowId?: string;       // Parent window ID (if detached)
}

interface WindowState {
  windows: WindowConfig[];
  mainWindowId: string;
  activeWindowId: string | null;
}
```

### Backend (Rust)

**Window Metadata:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowMetadata {
    pub id: String,
    pub label: String,
    pub title: String,
    pub component: String,
    pub panel_id: Option<String>,
    pub position: WindowPosition,
    pub size: WindowSize,
    pub is_detached: bool,
    pub parent_window_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowSize {
    pub width: u32,
    pub height: u32,
}
```

---

## Core Components

### Frontend Components

#### WindowManager.tsx

**Purpose:** Manages all windows and window operations.

**Features:**
- Tracks all open windows
- Creates new windows
- Closes windows
- Manages window state
- Handles window communication

#### DetachablePanel.tsx

**Purpose:** Wrapper component that enables panel detachment.

**Props:**
- `panelId: string` - Panel ID
- `component: React.ComponentType` - Panel content component
- `onDetach: (panelId: string) => void` - Detach handler

**Features:**
- Detects drag gesture
- Shows visual feedback
- Triggers window creation
- Handles re-attachment

### Backend Modules

#### windows.rs

**Purpose:** Window management in Rust backend.

**Key Functions:**

**Window Operations:**
- `create_window(config)` - Create new window
- `close_window(window_id)` - Close window
- `get_window(window_id)` - Get window by ID
- `list_windows()` - List all windows
- `update_window_state(window_id, state)` - Update window state

**Window State:**
- `save_window_state(window_id, state)` - Save window state
- `load_window_state(window_id)` - Load window state
- `save_all_windows_state()` - Save all windows state

### Tauri Commands

**IPC Commands:**

```rust
#[tauri::command]
async fn create_window(
    label: String,
    title: String,
    url: String,
    width: u32,
    height: u32,
    x: Option<i32>,
    y: Option<i32>,
) -> Result<String>; // Returns window ID

#[tauri::command]
async fn close_window(window_id: String) -> Result<()>;

#[tauri::command]
async fn get_window_state(window_id: String) -> Result<WindowMetadata>;

#[tauri::command]
async fn update_window_state(window_id: String, state: WindowState) -> Result<()>;

#[tauri::command]
async fn list_windows() -> Result<Vec<WindowMetadata>>;

#[tauri::command]
async fn save_windows_state() -> Result<()>;

#[tauri::command]
async fn load_windows_state() -> Result<Vec<WindowMetadata>>;
```

---

## Algorithms

### Panel Detachment Flow

1. User drags panel (detects drag gesture)
2. User drags outside main window bounds
3. Show visual feedback (ghost/preview)
4. User releases drag
5. Window Manager creates new window:
   - Generate unique window ID
   - Create window via Tauri WindowBuilder
   - Load panel content in new window
6. Remove panel from main window layout
7. Track detached window
8. Save window state

### Panel Re-attachment Flow

1. User closes detached window or clicks re-attach
2. Window Manager detects window close
3. Get panel content from window
4. Re-add panel to main window layout
5. Remove window from registry
6. Update layout state

### Window State Persistence Flow

1. Window position/size changes
2. Window State Manager tracks changes
3. On window close or app exit:
   - Save window state to file
   - Include position, size, component type
4. On app start:
   - Load saved window states
   - Restore windows if needed
   - Or restore to default layout

### Window Communication Flow

1. Window A needs to communicate with Window B
2. Window A emits Tauri event
3. All windows listen to events
4. Window B receives event
5. Window B handles event
6. Response sent back if needed

---

## Integration Points

### With Resizable Panels

**Panel Detachment:**
- Panels can be detached from main window
- Detached panels become separate windows
- Panels can be re-attached to main window

### With Window State Plugin

**State Persistence:**
- Use Tauri Window State Plugin for automatic persistence
- Plugin handles position/size saving
- Plugin restores windows on app start

### With UI Components

**Window Content:**
- Each window can contain any panel component
- Code Editor in editor window
- Chat Interface in chat window
- Task Scheduler in tasks window

---

## Configuration

### Window State Storage

**Location:** `.nexus-overseer/windows.json` (or app config directory)

**Structure:**
```json
{
  "windows": [
    {
      "id": "window-1",
      "label": "editor-window",
      "title": "Code Editor",
      "component": "editor",
      "panelId": "panel-editor",
      "position": { "x": 100, "y": 100 },
      "size": { "width": 800, "height": 600 },
      "isDetached": true
    }
  ],
  "mainWindowId": "main",
  "lastSaved": "2024-12-28T15:00:00Z"
}
```

---

## Performance Considerations

### Window Management

1. **Efficient Tracking:** Track windows efficiently
2. **Lazy Loading:** Load window content on demand
3. **State Updates:** Batch window state updates
4. **Memory Management:** Clean up closed windows

### Window Communication

1. **Event Efficiency:** Use efficient event system
2. **Selective Listening:** Only listen to relevant events
3. **Message Batching:** Batch messages when possible

---

## Security Considerations

1. **Window Validation:** Validate window configurations
2. **Content Validation:** Validate content before transfer
3. **Path Security:** All paths validated through security system
4. **Window Isolation:** Windows are isolated from each other

---

## Error Handling

### Error Types

1. **Window Creation Failed:** Failed to create window
2. **Window Not Found:** Window ID doesn't exist
3. **State Corruption:** Window state is corrupted
4. **Communication Error:** Inter-window communication failed

### Error Handling Strategy

1. **Validation:** Validate window configs before creation
2. **Recovery:** Attempt to recover from errors
3. **User Feedback:** Show user-friendly error messages
4. **Logging:** Log technical details for debugging
5. **Fallback:** Fall back to default layout on error

---

## Testing Checklist

### Unit Tests

- [ ] Window creation
- [ ] Window closing
- [ ] Window state management
- [ ] Panel detachment
- [ ] Panel re-attachment
- [ ] State persistence

### Integration Tests

- [ ] Tauri window creation
- [ ] Content transfer
- [ ] Window state plugin integration
- [ ] Inter-window communication
- [ ] State save/load

### User Acceptance Tests

- [ ] User can detach panels to separate windows
- [ ] Windows remember positions/sizes
- [ ] User can close detached windows
- [ ] Panels can be re-attached
- [ ] Multiple windows work correctly
- [ ] Performance is acceptable

---

## Research Notes

### Tauri Multi-Window Support

**Research Findings:**
- Tauri supports creating multiple windows dynamically
- Each window has unique label
- Windows can be created via WindowBuilder in Rust
- Window State Plugin available for persistence
- Windows can communicate via events

**Sources:**
- Tauri multi-window documentation
- Tauri Window State Plugin documentation

**Implementation Approach:**
- Use Tauri WindowBuilder for window creation
- Use Window State Plugin for persistence
- Track windows in registry
- Use Tauri events for communication

**Why This Approach:**
- Native Tauri support
- Well-documented
- Reliable and performant
- Standard pattern

### Drag-to-Detach Pattern

**Research Findings:**
- Drag-to-detach is common in modern IDEs
- Visual feedback important (ghost/preview)
- Need to detect drag outside window bounds
- Re-attachment should be easy

**Sources:**
- VS Code/Cursor UI patterns
- General drag-and-drop patterns

**Implementation Approach:**
- Detect drag gesture on panel
- Show visual feedback when dragging
- Create window when drag released outside
- Support re-attachment via close or button

**Why This Approach:**
- Familiar UX pattern
- Intuitive for users
- Standard in modern IDEs
- Good user experience

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement window manager module
3. ⏳ Implement window creator
4. ⏳ Implement content transfer
5. ⏳ Integrate Window State Plugin
6. ⏳ Implement drag-to-detach
7. ⏳ Create Tauri commands
8. ⏳ Testing and refinement

---

## Notes

- Multi-window system enables flexible workspace
- Drag-to-detach is key feature
- Window state persistence is important for UX
- Integration with resizable panels is critical
- Performance is important with multiple windows
- Keep it simple - start with basic functionality

