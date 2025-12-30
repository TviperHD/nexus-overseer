# Task Scheduler Design - Refined Vision

**Created:** 2024-12-28  
**Status:** Refined Design Based on User Input

## User Vision

1. **Checklist Form:** Tasks displayed as checkboxes/checklist in the app UI
2. **Integrated in App:** Not a document, but a UI component in the application
3. **User Can See Tasks:** Visual checklist interface
4. **Start Task Button:** Button next to each task to start working on it
5. **Opens in Implementation AI:** Button triggers Implementation AI to work on that task
6. **Multiple Task Sets:** Overseer can create multiple groups/lists of tasks
7. **Task Breakdown:** Overseer can break tasks into smaller, more reasonable subtasks

---

## Refined Design

### Task Structure

```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // Short title
  description: string;            // Detailed description
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignedTo: 'overseer' | 'implementation';
  parentTaskId?: string;         // For subtasks
  subtasks?: Task[];             // Nested tasks
  taskSetId: string;             // Which task set this belongs to
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

interface TaskSet {
  id: string;                    // UUID
  title: string;                  // "Add Authentication System"
  description?: string;          // Optional description
  tasks: Task[];                  // Tasks in this set
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdBy: 'user' | 'overseer';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface TaskScheduler {
  taskSets: TaskSet[];
  activeTaskSetId?: string;      // Currently active task set
  currentTaskId?: string;        // Currently executing task
  projectId: string;
}
```

---

## UI Design

### Task Scheduler Panel

**Location:** Resizable panel in main window (can be detached)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Task Scheduler                         │
├─────────────────────────────────────────┤
│  [Task Set: Add Authentication ▼]      │
│                                         │
│  ┌─ Tasks ─────────────────────────────┐│
│  │                                     ││
│  │ ▶ Create User model [Start Task]   ││
│  │                                     ││
│  │ ▼ Create login endpoint [Completed]││
│  │   ☑ Create login route             ││
│  │   ☑ Add password validation        ││
│  │   ☑ Return JWT token               ││
│  │                                     ││
│  │ ▶ Create register endpoint [Start] ││
│  │                                     ││
│  │ ▶ Add password hashing [Start]      ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  [+ Create New Task Set]                │
└─────────────────────────────────────────┘
```

**Key Features:**
- **Collapsed by default:** Tasks show as list items with names only
- **Click to expand:** Click task name to expand and show subtasks
- **Start Task button:** Button next to each task name (always visible)
- **Visual indicators:**
  - `▶` = Collapsed (has subtasks)
  - `▼` = Expanded (showing subtasks)
  - `☐` = Pending task
  - `☑` = Completed task
  - `🔄` = In progress

### Task States Visual

**Main Task List:**
- **▶ Task Name [Start Task]** = Collapsed, pending
- **▼ Task Name [Working...]** = Expanded, in progress
- **▶ Task Name [Completed]** = Collapsed, completed
- **▶ Task Name [Blocked]** = Collapsed, blocked

**When Expanded (showing subtasks):**
- **☐ Subtask name** = Pending subtask
- **🔄 Subtask name** = In progress subtask
- **☑ Subtask name** = Completed subtask

### Start Task Button

**Behavior:**
1. Button always visible next to task name (even when collapsed)
2. User clicks "Start Task" button
3. Button changes to "Working..." (disabled, shows spinner)
4. Task status changes to "in-progress"
5. If task has subtasks, it auto-expands to show progress
6. Implementation AI is triggered with task context
7. Implementation AI starts working on the task
8. Progress updates in real-time (subtasks update as they complete)
9. When complete, button shows "Completed" (green checkmark)
10. Task can be collapsed again

### Expand/Collapse Behavior

**Clicking Task Name:**
- If collapsed → Expands to show subtasks
- If expanded → Collapses to hide subtasks
- If no subtasks → No expand/collapse (just shows task)

**Auto-Expand:**
- When task starts → Auto-expands to show subtasks (if any)
- When task completes → Can be collapsed again

---

## Workflow

### Overseer Creates Task Set

```
User: "Add authentication system"
  ↓
Overseer AI analyzes request
  ↓
Overseer AI creates Task Set:
  - Title: "Add Authentication System"
  - Tasks:
    1. Create User model
       - Subtasks:
         - Add email field
         - Add password field
         - Add validation
    2. Create login endpoint
    3. Create register endpoint
  ↓
Task Set appears in UI checklist
  ↓
User can review and modify tasks
  ↓
User clicks "Start Task" on any task
  ↓
Implementation AI starts working
```

### User Starts Task

```
User clicks "Start Task" button
  ↓
Frontend sends IPC command: startTask(taskId)
  ↓
Backend:
  - Updates task status to "in-progress"
  - Gets task context (description, related files, etc.)
  - Triggers Implementation AI with task
  ↓
Implementation AI:
  - Reads task description
  - Gets project context
  - Generates code
  - Writes to files
  ↓
Backend:
  - Updates task status to "completed"
  - Saves changes
  ↓
Frontend:
  - Updates UI (checkbox checked)
  - Shows completion indicator
  - Enables next task
```

### Task Breakdown

**Overseer can break down tasks:**

```
Original Task: "Create authentication system"
  ↓
Overseer breaks into:
  Task Set: "Add Authentication System"
    ├─ Task 1: "Create User model"
    │   └─ Subtask 1.1: "Add email field"
    │   └─ Subtask 1.2: "Add password field"
    │   └─ Subtask 1.3: "Add validation"
    ├─ Task 2: "Create login endpoint"
    └─ Task 3: "Create register endpoint"
```

**User can also request breakdown:**
- Right-click task → "Break into smaller tasks"
- Overseer AI analyzes and creates subtasks

---

## Implementation Details

### Frontend Components

**1. TaskSchedulerPanel.tsx**
- Main panel component
- Displays task sets
- Task list with checkboxes
- Start Task buttons

**2. TaskSetList.tsx**
- Dropdown/list of task sets
- Create new task set button
- Task set status indicators

**3. TaskItem.tsx**
- Individual task row (collapsed by default)
- Task name (clickable to expand/collapse)
- Expand/collapse indicator (▶/▼)
- Start Task button (always visible)
- Status indicator
- Expandable subtasks (shown when expanded)
- Subtask list (only visible when expanded)

**4. TaskDetails.tsx** (Modal or Side Panel)
- Detailed task view
- Full description
- Related files
- Notes
- History

### Backend (Rust)

**Module: `scheduler.rs`**

```rust
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: Priority,
    pub assigned_to: AIAgent,
    pub parent_task_id: Option<String>,
    pub subtasks: Vec<Task>,
    pub task_set_id: String,
    // ... timestamps, etc.
}

pub struct TaskSet {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub tasks: Vec<Task>,
    pub status: TaskSetStatus,
    pub created_by: CreatedBy,
    // ... timestamps, etc.
}

pub struct TaskScheduler {
    pub task_sets: Vec<TaskSet>,
    pub active_task_set_id: Option<String>,
    pub current_task_id: Option<String>,
    pub project_id: String,
}

impl TaskScheduler {
    // Task Set operations
    pub fn create_task_set(&mut self, title: String, created_by: CreatedBy) -> &mut TaskSet;
    pub fn get_task_set(&self, id: &str) -> Option<&TaskSet>;
    pub fn get_all_task_sets(&self) -> &Vec<TaskSet>;
    
    // Task operations
    pub fn add_task(&mut self, task_set_id: &str, task: Task);
    pub fn add_subtask(&mut self, parent_task_id: &str, subtask: Task);
    pub fn get_task(&self, task_id: &str) -> Option<&Task>;
    pub fn start_task(&mut self, task_id: &str) -> Result<()>;
    pub fn complete_task(&mut self, task_id: &str, notes: Option<String>);
    pub fn break_down_task(&mut self, task_id: &str) -> Result<()>; // Overseer breaks down
    
    // Persistence
    pub fn save(&self, project_path: &Path) -> Result<()>;
    pub fn load(project_path: &Path) -> Result<Self>;
}
```

**Tauri Commands:**

```rust
// Task Set commands
#[tauri::command]
fn create_task_set(title: String, description: Option<String>) -> Result<TaskSet>;

#[tauri::command]
fn get_task_sets() -> Result<Vec<TaskSet>>;

#[tauri::command]
fn get_task_set(id: String) -> Result<TaskSet>;

// Task commands
#[tauri::command]
fn add_task(task_set_id: String, title: String, description: String) -> Result<Task>;

#[tauri::command]
fn add_subtask(parent_task_id: String, title: String, description: String) -> Result<Task>;

#[tauri::command]
fn start_task(task_id: String) -> Result<()>; // Triggers Implementation AI

#[tauri::command]
fn complete_task(task_id: String, notes: Option<String>) -> Result<()>;

#[tauri::command]
fn break_down_task(task_id: String) -> Result<Vec<Task>>; // Overseer creates subtasks

#[tauri::command]
fn get_tasks(task_set_id: Option<String>) -> Result<Vec<Task>>;
```

### State Management (Frontend)

**Store: `taskStore.ts` (Zustand)**

```typescript
interface TaskStore {
  // State
  taskSets: TaskSet[];
  activeTaskSetId: string | null;
  currentTaskId: string | null;
  
  // Actions
  loadTaskSets: () => Promise<void>;
  createTaskSet: (title: string, description?: string) => Promise<TaskSet>;
  addTask: (taskSetId: string, title: string, description: string) => Promise<Task>;
  startTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string, notes?: string) => Promise<void>;
  breakDownTask: (taskId: string) => Promise<Task[]>;
  
  // UI State
  selectedTaskId: string | null;
  setSelectedTask: (taskId: string | null) => void;
}
```

---

## Features

### ✅ Checklist UI
- Visual checkboxes
- Expandable subtasks
- Status indicators
- Progress tracking

### ✅ Integrated in App
- Resizable panel
- Can be detached to separate window
- Always visible/accessible

### ✅ Start Task Button
- One-click to start task
- Triggers Implementation AI
- Shows progress
- Auto-updates on completion

### ✅ Multiple Task Sets
- Overseer can create multiple sets
- User can switch between sets
- Each set is independent
- Can archive completed sets

### ✅ Task Breakdown
- Overseer can create subtasks
- User can request breakdown
- Nested task structure
- Visual hierarchy in UI

---

## User Experience Flow

### Scenario 1: Overseer Creates Task Set

1. User: "Add authentication system"
2. Overseer AI creates task set with tasks
3. Task set appears in checklist panel (all tasks collapsed)
4. User sees list of task names:
   - ▶ Create User model [Start Task]
   - ▶ Create login endpoint [Start Task]
   - ▶ Create register endpoint [Start Task]
5. User clicks task name to expand and see subtasks (optional)
6. User clicks "Start Task" button on first task
7. Task auto-expands (if has subtasks) and shows "Working..."
8. Implementation AI works on it, subtasks update as they complete
9. Task completes, button shows "Completed"
10. User can collapse task or start next task
11. Repeat until all tasks done

### Scenario 2: User Expands Task to See Details

1. User sees: ▶ Create User model [Start Task]
2. User clicks "Create User model" (the name)
3. Task expands to show:
   - ▼ Create User model [Start Task]
     - ☐ Add email field
     - ☐ Add password field
     - ☐ Add validation
4. User can see what subtasks are involved
5. User clicks "Start Task" button
6. Task starts, subtasks update as they complete

### Scenario 2: User Requests Breakdown

1. User sees task: "Create authentication system" (too big)
2. User right-clicks → "Break into smaller tasks"
3. Overseer AI analyzes and creates subtasks
4. Subtasks appear nested under parent
5. User can start individual subtasks

### Scenario 3: Multiple Task Sets

1. User: "Add authentication"
2. Overseer creates Task Set 1: "Add Authentication"
3. User: "Add user profiles"
4. Overseer creates Task Set 2: "Add User Profiles"
5. Both sets visible in dropdown
6. User can switch between sets
7. Work on tasks from different sets

---

## Storage

**Location:** `.nexus-overseer/tasks.json`

**Structure:**
```json
{
  "projectId": "project-123",
  "taskSets": [
    {
      "id": "task-set-1",
      "title": "Add Authentication System",
      "status": "active",
      "tasks": [
        {
          "id": "task-1",
          "title": "Create User model",
          "status": "completed",
          "subtasks": [
            {
              "id": "subtask-1-1",
              "title": "Add email field",
              "status": "completed"
            }
          ]
        }
      ]
    }
  ],
  "activeTaskSetId": "task-set-1",
  "currentTaskId": null
}
```

---

## Next Steps

1. ✅ Refine design based on user vision (this document)
2. ⏳ Design detailed UI mockups
3. ⏳ Create technical specification for task scheduler
4. ⏳ Design data structures in detail
5. ⏳ Design Implementation AI integration
6. ⏳ Design Overseer AI task creation flow
7. ⏳ Implement task scheduler backend
8. ⏳ Implement task scheduler UI
9. ⏳ Integrate with AI systems

---

## Questions Resolved

✅ **Checklist Form:** Yes, visual checklist in UI  
✅ **Integrated in App:** Yes, resizable panel component  
✅ **User Can See Tasks:** Yes, list of task names (collapsed by default)  
✅ **Click to Expand:** Yes, click task name to see subtasks  
✅ **Start Task Button:** Yes, button next to each task name (always visible)  
✅ **Opens in Implementation AI:** Yes, button triggers Implementation AI  
✅ **Multiple Task Sets:** Yes, Overseer can create multiple sets  
✅ **Task Breakdown:** Yes, Overseer can create subtasks (shown when expanded)  

## Updated UI Design Summary

**Default View (Collapsed):**
- List of task names only
- Each task has expand/collapse indicator (▶)
- Each task has "Start Task" button
- Clean, compact view

**Expanded View:**
- Click task name to expand
- Shows subtasks with checkboxes
- Can see progress on subtasks
- Click again to collapse

**When Task Starts:**
- Button changes to "Working..."
- Task auto-expands (if has subtasks)
- Subtasks update in real-time
- Can collapse when done

This design matches your vision! Does this capture what you're thinking?

