# UI Design: File Tree

**Created:** 2024-12-28  
**Status:** Design Document

## Overview

The File Tree provides hierarchical file and folder navigation for the current project. It's a standalone resizable panel that allows users to browse the project structure, open files in the editor, and perform file operations. The file tree integrates with the code editor and can be detached to a separate window.

## UI Components

### 1. FileTreePanel

**Location:** Resizable panel (typically left side, can be detached to separate window)

**Layout:**
```
┌─────────────────────────────────────────┐
│  File Tree                         [×] │
├─────────────────────────────────────────┤
│  [Search files...]                     │
├─────────────────────────────────────────┤
│                                         │
│  src/                                  │
│    main.ts                             │
│    utils.ts                            │
│    components/                         │
│      Button.tsx                        │
│      Header.tsx                        │
│    utils/                              │
│      helpers.ts                        │
│  docs/                                 │
│    README.md                           │
│    architecture.md                     │
│  tests/                                │
│    test.ts                             │
│  package.json                          │
│  tsconfig.json                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Search/filter files
- Hierarchical file and folder display
- Click to open files in editor
- Right-click context menu
- Expand/collapse folders
- Visual indicators for open/modified files

### 2. FileTreeSearch

**Purpose:** Search/filter files in the tree.

**Features:**
- Inline search box
- Real-time filtering
- Highlights matching files
- Clear search button
- Keyboard shortcut (Ctrl+F)

**Display:**
```
[Search files...]
```

### 3. FileTreeItem

**Purpose:** Individual file or folder item in the tree.

**Visual States:**
- **Folder (Collapsed):** `folder/`
- **Folder (Expanded):** `folder/` (with expanded indicator like `▶` or `▼`)
- **File:** `file.ext`
- **Open File:** Highlighted or different color
- **Modified File:** Indicator dot or asterisk (*)
- **Selected:** Background highlight

**Interaction:**
- Click folder → Expand/collapse
- Click file → Open in editor
- Right-click → Context menu
- Double-click folder → Expand/collapse
- Double-click file → Open in editor

**Context Menu (Right-click):**
- **For Files:**
  - Open in Editor
  - Open in New Tab
  - Rename
  - Delete
  - Copy Path
  - Show in File Explorer
- **For Folders:**
  - New File
  - New Folder
  - Rename
  - Delete
  - Collapse All
  - Expand All
  - Copy Path
  - Show in File Explorer

### 4. FileTreeContainer

**Purpose:** Container for the file tree items.

**Features:**
- Scrollable container
- Virtual scrolling for large trees (optional)
- Auto-expand to show selected file
- Keyboard navigation (arrow keys, Enter)
- Drag and drop support (optional)

## Visual Design

**See `visual-design-system.md` for complete styling guidelines.**

### Colors and Styling

**File Tree:**
- Background: `#252526` (Panel background, dark)
- Folders: Text `#4fc1ff` (Light blue icon/text)
- Files: Text `#cccccc` (Primary text color)
- Selected: Background `#37373d` (Active state)
- Hover: Background `#2a2d2e` (Subtle highlight)
- Open file: Text `#ffffff` (White, emphasized) or Border Left `2px solid #007acc`
- Modified file: Indicator dot `#4fc1ff` (Light blue)

**Tree Item:**
- Height: `22px` (Slim, compact)
- Padding: `2px 4px` (Minimal padding)
- Font Size: `13px`
- Icon Size: `16px`

**Search:**
- Background: `#3c3c3c` (Input background)
- Border: `1px solid #3e3e42` (Subtle border)
- Focus: Border `#007acc` (Blue accent)
- Text: `#cccccc` (Primary text)
- Placeholder: `#6a6a6a` (Muted)

### Typography

- File/folder names: System UI font, `13px`, Regular weight
- Search placeholder: `12px`, `#6a6a6a` (Muted)

### Spacing

- Indentation for nested items (consistent spacing)
- Comfortable padding around items
- Clear visual hierarchy

## User Interactions

### Opening a File

1. User clicks file in tree
2. File opens in code editor
3. File is highlighted in tree (if open)
4. Tab appears in editor
5. If file is already open, editor switches to that tab

### Expanding/Collapsing Folders

1. User clicks folder name or expand/collapse indicator
2. Folder expands to show contents
3. Visual indicator changes (▶ to ▼ or similar)
4. Click again to collapse

### Searching Files

1. User types in search box
2. File tree filters in real-time
3. Matching files/folders are highlighted
4. Non-matching items are hidden
5. Clear search to show all files again

### Creating New File/Folder

1. User right-clicks folder
2. Selects "New File" or "New Folder"
3. Dialog appears for name input
4. User enters name
5. File/folder is created
6. File tree updates
7. If file, opens in editor

### Renaming File/Folder

1. User right-clicks file/folder
2. Selects "Rename"
3. Name becomes editable inline
4. User enters new name
5. Press Enter to confirm, Esc to cancel
6. File/folder is renamed
7. File tree updates

### Deleting File/Folder

1. User right-clicks file/folder
2. Selects "Delete"
3. Confirmation dialog appears
4. User confirms
5. File/folder is deleted
6. File tree updates
7. If file was open, tab closes

## Integration Points

### With Code Editor

- Click file → Opens in editor
- Open files are highlighted in tree
- Modified files show indicator
- Editor tab changes → Tree selection updates

### With File System

- Watches for file changes on disk
- Updates tree when files are added/removed
- Shows file modification status
- Handles file system errors gracefully

### With Project Management

- Loads project file structure
- Updates when project changes
- Shows project-specific files
- Respects project ignore patterns

## Questions for Discussion

1. **Tree Depth:** Should there be a maximum visible depth, or show all levels?
3. **Virtual Scrolling:** Use virtual scrolling for large file trees?
4. **Drag and Drop:** Should users be able to drag files/folders to reorganize?
5. **File Preview:** Should hovering over a file show a preview?
6. **Keyboard Navigation:** Full keyboard navigation support (arrow keys, etc.)?
7. **Hidden Files:** Show hidden files by default, or have toggle?
8. **File Size:** Should file sizes be displayed?
9. **Last Modified:** Should last modified dates be shown?
10. **Collapse All:** Should there be a "Collapse All" button?

What are your thoughts on the File Tree UI? Any changes or additions you'd like?

