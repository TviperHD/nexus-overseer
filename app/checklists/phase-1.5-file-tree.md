# Phase 1.5: File Tree

**Phase:** 1.5  
**Duration:** 1 week  
**Priority:** High  
**Goal:** File tree working  
**Status:** Not Started  
**Created:** 2025-12-28  
**Last Updated:** 2025-12-28

---

## Overview

This phase implements the file tree for Nexus Overseer. We'll build file tree data structures, file tree store, file tree components, file system integration, and editor integration. This enables users to navigate and open files from a visual file tree.

**Deliverable:** File tree working

**Dependencies:** Phase 1.1 (File System Integration) must be complete. Phase 1.3 (Monaco Editor) recommended for full integration.

**Research Sources:**
- `../03-planning/technical-specs-file-system.md` - File System Integration specification
- VS Code file tree patterns
- General file explorer patterns

---

## 1. File Tree Data Structures

- [ ] Create `src/types/fileTree.ts`:
  - [ ] Define `FileTreeNode` interface:
    ```typescript
    interface FileTreeNode {
      id: string;
      name: string;
      path: string;
      type: 'file' | 'directory';
      children?: FileTreeNode[];
      isExpanded?: boolean;
      isSelected?: boolean;
    }
    ```
  - [ ] Define `FileTreeState` interface

---

## 2. File Tree Store (Zustand)

- [ ] Create `src/stores/fileTreeStore.ts`:
  - [ ] Define file tree store state:
    ```typescript
    interface FileTreeStore {
      rootPath: string | null;
      tree: FileTreeNode[];
      selectedNodeId: string | null;
      expandedNodes: Set<string>;
      
      // Actions
      setRootPath: (path: string) => Promise<void>;
      loadDirectory: (path: string) => Promise<void>;
      toggleNode: (nodeId: string) => void;
      selectNode: (nodeId: string) => void;
      refreshTree: () => Promise<void>;
    }
    ```
  - [ ] Implement all actions
  - [ ] Integrate with file system (list directories)

---

## 3. File Tree Component

- [ ] Create `src/components/FileTree/FileTree.tsx`:
  - [ ] Display file tree structure
  - [ ] Show files and directories with icons
  - [ ] Handle directory expansion/collapse
  - [ ] Handle file/directory selection
  - [ ] Style with design system colors
- [ ] Replace `FileTreePlaceholder` with actual component
- [ ] Test file tree component

---

## 4. File Tree Node Component

- [ ] Create `src/components/FileTree/FileTreeNode.tsx`:
  - [ ] Display node name and icon
  - [ ] Show expand/collapse indicator for directories
  - [ ] Handle click to select
  - [ ] Handle double-click to open file or expand directory
  - [ ] Style with design system colors
- [ ] Test file tree node component

---

## 5. File Tree Integration

- [ ] Integrate with file system:
  - [ ] Load root directory on mount
  - [ ] Load directory contents when expanded
  - [ ] Watch directory for changes
  - [ ] Update tree when files change
- [ ] Integrate with editor:
  - [ ] Open file when double-clicked
  - [ ] Create file tab
  - [ ] Load file in editor
- [ ] Integrate with file watcher:
  - [ ] Watch root directory
  - [ ] Update tree on file changes
  - [ ] Refresh tree when needed

---

## 6. File Tree Features

- [ ] Add file icons:
  - [ ] Different icons for file types
  - [ ] Directory icons
  - [ ] Use design system colors
- [ ] Add context menu (optional for Phase 1):
  - [ ] Right-click menu
  - [ ] New file option
  - [ ] New folder option
  - [ ] Delete option
  - [ ] Rename option
- [ ] Add search functionality (optional for Phase 1):
  - [ ] Filter tree by search term
  - [ ] Highlight matching nodes

---

## 7. Testing File Tree

- [ ] Test tree loading:
  - [ ] Root directory loads
  - [ ] Directories expand correctly
  - [ ] Files and directories displayed
- [ ] Test file opening:
  - [ ] Double-click file opens in editor
  - [ ] File tab created
  - [ ] File content loaded
- [ ] Test directory expansion:
  - [ ] Click to expand directory
  - [ ] Children loaded
  - [ ] Tree updates correctly
- [ ] Test file watching:
  - [ ] New file appears in tree
  - [ ] Deleted file removed from tree
  - [ ] Modified file updated in tree

---

## Verification Checklist

Before marking Phase 1.5 complete, verify all of the following:

- [ ] File tree displays correctly
- [ ] Directories can be expanded
- [ ] Files can be opened from tree
- [ ] File watching updates tree
- [ ] Tree integrates with editor
- [ ] File icons display correctly
- [ ] Tree updates on file changes
- [ ] Root path can be set
- [ ] Tree refreshes correctly

---

## Progress Tracking

**Started:** [Date]  
**Completed:** [Date]  
**Total Tasks:** 15+  
**Completed Tasks:** 0  
**Completion:** 0%

### Task Breakdown
- **File Tree Data Structures:** 2 tasks
- **File Tree Store:** 3 tasks
- **File Tree Component:** 2 tasks
- **File Tree Node Component:** 2 tasks
- **File Tree Integration:** 3 tasks
- **File Tree Features:** 3 tasks (some optional)
- **Testing:** 4 tasks

---

## Next Steps

After completing Phase 1.5:
- All Phase 1 systems complete
- Can proceed to Phase 2: LLM Integration & AI Foundation

---

**Last Updated:** 2025-12-28  
**Status:** Ready for Implementation

