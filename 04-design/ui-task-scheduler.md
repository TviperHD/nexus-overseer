# UI Design: Task Scheduler

**Created:** 2024-12-28  
**Status:** Design Document

## Overview

The Task Scheduler UI provides a visual checklist interface where users can see tasks created by the Overseer AI, expand them to view subtasks, and start tasks with a button click.

## UI Components

### 1. TaskSchedulerPanel

**Location:** Resizable panel (can be detached to separate window)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Task Scheduler                    [×] │
├─────────────────────────────────────────┤
│  [Task Set: Add Authentication ▼]     │
│                                         │
│  ┌─ Tasks ───────────────────────────┐ │
│  │                                     │ │
│  │ ▶ Create User model [Start Task]   │ │
│  │                                     │ │
│  │ ▼ Create login endpoint [Completed]│ │
│  │   ☑ Create login route             │ │
│  │   ☑ Add password validation        │ │
│  │   ☑ Return JWT token               │ │
│  │                                     │ │
│  │ ▶ Create register endpoint [Start] │ │
│  │                                     │ │
│  │ ▶ Add password hashing [Start]     │ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  [+ Create New Task Set]                │
└─────────────────────────────────────────┘
```

**Features:**
- Task set dropdown selector
- List of tasks (collapsed by default)
- Expand/collapse on click
- Start Task button next to each task
- Create New Task Set button

### 2. TaskSetSelector

**Purpose:** Dropdown to select which task set to view.

**Features:**
- Shows current task set name
- Dropdown list of all task sets
- Task set status indicator (active, completed, etc.)
- Create new task set option

### 3. TaskItem

**Purpose:** Individual task row.

**Visual States:**
- **Collapsed (Pending):** `▶ Task Name [Start Task]`
- **Expanded (Pending):** `▼ Task Name [Start Task]` with subtasks below
- **Collapsed (In Progress):** `▶ Task Name [Working...]` with spinner
- **Collapsed (Completed):** `▶ Task Name [Completed]` with checkmark
- **Collapsed (Blocked):** `▶ Task Name [Blocked]` with warning icon

**Interaction:**
- Click task name → Expand/collapse
- Click "Start Task" button → Start task execution
- Hover → Show tooltip with description

### 4. SubtaskList

**Purpose:** Shows subtasks when task is expanded.

**Display:**
- Indented under parent task
- Checkboxes for each subtask
- Status indicators (pending, in-progress, completed)
- Updates in real-time as subtasks complete

## Visual Design

**See `visual-design-system.md` for complete styling guidelines.**

### Colors and Styling

**Task States:**
- Pending: Text `#858585` (Muted gray)
- In Progress: Text `#4fc1ff` (Light blue), spinner icon `#4fc1ff`
- Completed: Text `#4ec9b0` (Teal green), checkmark `#4ec9b0`
- Blocked: Text `#f48771` (Soft red), warning icon `#f48771`

**Task Item:**
- Background: Transparent (default)
- Hover: Background `#2a2d2e` (Subtle highlight)
- Selected/Active: Background `#37373d`, Border Left `2px solid #007acc` (Blue accent)
- Padding: `4px 8px` (Compact, slim)

**Buttons:**
- Start Task: Primary button (`#0e639c` background, `#ffffff` text)
- Working...: Disabled, shows spinner `#4fc1ff`
- Completed: Green checkmark button (`#4ec9b0`)

### Typography

- Task names: `13px`, Medium weight (`500`), `#cccccc`
- Subtasks: `12px`, Indented `16px`, `#858585`
- Status text: `11px`, Muted color (`#6a6a6a`)

## User Interactions

### Starting a Task

1. User clicks "Start Task" button
2. Button changes to "Working..." (disabled, spinner)
3. Task auto-expands (if has subtasks)
4. Implementation AI starts working
5. Subtasks update as they complete
6. When done, button shows "Completed"

### Expanding/Collapsing Tasks

1. User clicks task name
2. Task expands to show subtasks
3. Click again to collapse
4. Visual indicator changes (▶ to ▼)

### Creating New Task Set

1. User clicks "+ Create New Task Set"
2. Dialog/modal appears
3. User enters title (and optional description)
4. Overseer AI creates initial tasks
5. New task set appears in dropdown

## Questions for Discussion

1. **Task Set Display:** Should task sets be in a dropdown, or tabs?
2. **Task Details:** Should there be a way to see full task description without expanding?
3. **Task Actions:** Besides "Start Task", should there be other actions (edit, delete, etc.)?
4. **Progress Indicator:** Should we show overall progress (X of Y tasks complete)?
5. **Task Filtering:** Should users be able to filter tasks by status?
6. **Task Search:** Should there be a search/filter box?

What are your thoughts on the Task Scheduler UI? Any changes or additions you'd like?

