# UI Design: Code Editor

**Created:** 2024-12-28  
**Status:** Design Document

## Overview

The Code Editor UI provides a full-featured code editing experience using Monaco Editor (VS Code's editor). It supports file tabs, syntax highlighting, code editing, and can be detached to a separate window. The Implementation AI will write code directly into files displayed in this editor.

## UI Components

### 1. CodeEditorPanel

**Location:** Resizable panel (can be detached to separate window)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Code Editor                        [×] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ Editor Area ─────────────────────┐ │
│  │                                    │ │
│  │  1  function hello() {            │ │
│  │  2    console.log("Hello");       │ │
│  │  3  }                             │ │
│  │  4                                │ │
│  │  5  hello();                      │ │
│  │                                    │ │
│  │                                    │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  [Line: 5, Col: 8] [Language: JS]     │
└─────────────────────────────────────────┘
```

**Features:**
- Monaco Editor in main area
- Status bar at bottom (line/column, language)
- No internal file tabs (each file is its own tab in main tab system)
- File name shown in main tab bar

### 2. Editor Tab (in Main Tab System)

**Purpose:** Each open file appears as its own tab in the main tab system.

**Visual States:**
- **Active Tab:** Highlighted, file name visible
- **Inactive Tab:** Muted, file name visible
- **Modified Tab:** Dot indicator or asterisk (*)
- **Unsaved Tab:** Different color or indicator

**Layout:**
```
[main.ts] [utils.ts*] [config.json] [Task Scheduler] [Overseer]
```

**Features:**
- Each file is a separate tab in the main tab group
- Click tab to switch to that file
- Close button (×) on each tab (in main tab bar)
- Drag tab to move file to different tab group
- Right-click for context menu (close, close others, etc.)
- File tabs are integrated with other panel tabs (Task Scheduler, Overseer, etc.)

### 3. MonacoEditor (Single File View)

**Purpose:** The actual code editor component.

**Features:**
- Full Monaco Editor functionality
- Syntax highlighting
- Code completion
- Error/warning indicators
- Line numbers
- Minimap (optional)
- Find/replace
- Multi-cursor editing
- Code folding
- Bracket matching
- Auto-indentation

**Visual:**
- Standard VS Code editor appearance
- Customizable theme
- Font: Monospace, readable
- Line numbers: Left side
- Gutter: Error/warning icons

### 4. StatusBar

**Purpose:** Shows editor status information.

**Display:**
- Current line and column: `Line: 5, Col: 8`
- File language: `Language: JavaScript`
- File encoding: `UTF-8` (optional)
- Line ending: `LF` or `CRLF` (optional)
- File size: `1.2 KB` (optional)

**Layout:**
```
[Line: 5, Col: 8] [Language: JavaScript] [UTF-8]
```

### 5. EditorToolbar (Optional)

**Purpose:** Toolbar with editor actions (optional, can be in status bar or menu).

**Possible Actions:**
- Format code
- Find/Replace
- Go to line
- Toggle minimap
- Toggle word wrap
- Settings/Preferences

## Visual Design

**See `visual-design-system.md` for complete styling guidelines.**

### Colors and Styling

**Editor:**
- Background: `#1e1e1e` (Dark theme, Cursor-style)
- Text: `#cccccc` (High contrast, readable)
- Syntax highlighting: VS Code Dark+ theme colors
- Selection: `#264f78` (Blue tint)
- Cursor: `#aeafad` (Visible, blinking)
- Line Numbers: `#858585` (Muted)
- Active Line: `#2a2d2e` (Subtle highlight)

**Tabs (in Main Tab System):**
- Active tab: Background `#1e1e1e`, Border Top `2px solid #007acc` (Blue accent)
- Inactive tabs: Background `#2d2d30`, Text `#858585`
- Modified tab: Indicator dot `#4fc1ff` (Light blue)
- Hover: Background `#37373d` (Subtle highlight)

**Status Bar:**
- Background: `#007acc` (Blue, Cursor-style)
- Text: `#ffffff` (White)
- Separators: `#1a8cd8` (Lighter blue)

### Typography

- Editor font: `"Fira Code", "Consolas", "Monaco", monospace`
- Font size: `14px` (Default, adjustable)
- Line height: `1.5` (22px for 14px font)
- Tab font: System UI font, `13px`

## User Interactions

### Opening a File

1. User opens file (via file tree, command palette, etc.)
2. File opens in new tab in main tab system
3. Tab appears in current tab group (or creates new one)
4. Tab becomes active
5. Editor loads file content
6. File name shown in tab

### Switching Files

1. User clicks on different file tab in main tab bar
2. Current file is saved (if modified)
3. New file content loads in editor
4. Editor scrolls to last position (if saved)
5. Tab becomes active
6. Editor panel shows the selected file

### Editing Code

1. User types in editor
2. Tab shows modified indicator (*)
3. Syntax highlighting updates
4. Error/warning indicators update
5. Auto-completion suggestions appear
6. Status bar updates (line/column)

### Saving File

1. User presses Ctrl+S (or File → Save)
2. File is saved to disk
3. Modified indicator (*) disappears
4. Status bar shows "Saved" briefly

### Closing File

1. User clicks × on file tab in main tab bar
2. If file is modified, prompt to save
3. File closes, tab removed from main tab system
4. Next tab becomes active (could be another file or another panel)
5. If no tabs remain, tab group closes or shows empty state

### Detaching Editor

1. User drags editor panel to edge
2. Or uses detach button
3. Editor opens in new window
4. Editor remains functional in new window
5. Can be re-attached later

## Implementation AI Integration

### AI Writing Code

**When Implementation AI writes code:**

1. AI selects file (or creates new)
2. File opens in new tab in main tab system (if not already open)
3. File tab becomes active
4. Editor panel shows the file
5. AI writes code directly to editor
6. Code appears in real-time (or all at once)
7. File is marked as modified (indicator on tab)
8. User can review and save

**Visual Indicators:**
- Highlight AI-written code (optional)
- Show AI activity indicator
- Display AI message: "Writing code to file..."

### AI Editing Code

**When Implementation AI edits existing code:**

1. AI identifies file and location
2. File opens in tab (if not already open) or switches to existing tab
3. Tab becomes active
4. Editor scrolls to relevant section
5. AI makes changes
6. Changes are highlighted (optional)
7. File tab shows modified indicator
8. User can review and accept/reject

## File Management

### File Tree Integration

**Connection with Project Dashboard:**
- Click file in file tree → Opens in editor
- Right-click file → "Open in Editor"
- File tree shows open files indicator

### File Watcher Integration

**When file changes on disk:**
1. File watcher detects change
2. If file is open in editor:
   - Show notification: "File changed on disk"
   - Offer to reload or keep current version
3. If file is not open:
   - Update file tree
   - No editor action needed

## Questions for Discussion

1. **Editor Theme:** Default to dark or light theme?
2. **Minimap:** Show minimap by default?
3. **Word Wrap:** Enable word wrap by default?
4. **Font:** What monospace font should we use?
5. **AI Code Highlighting:** Should AI-written code be highlighted differently?
6. **Auto-save:** Should files auto-save, or manual save only?
7. **File Limit:** Maximum number of open file tabs?
8. **Editor Settings:** Should users be able to customize editor settings?
9. **Split View:** Should we support split editor view (same file, different sections) - would create multiple tabs?
10. **Diff View:** Should we show diff view when AI makes changes?
11. **Tab Grouping:** Should related files be grouped together in tabs?
12. **File Icons in Tabs:** Should file type icons appear in tabs?

What are your thoughts on the Code Editor UI? Any changes or additions you'd like?

