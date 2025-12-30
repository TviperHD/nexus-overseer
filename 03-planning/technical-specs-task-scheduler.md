# Technical Specification: Task Scheduler System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The Task Scheduler System is a core component of Nexus Overseer that manages tasks created by the Overseer AI and executed by the Implementation AI. It provides a visual checklist interface where users can see tasks, expand them to view subtasks, and start tasks with a button click. The system supports multiple task sets, task breakdown into subtasks, and persistent storage.

**Key Features:**
- Visual checklist UI with collapsible tasks
- Multiple task sets (groups of related tasks)
- Task breakdown into subtasks
- Start Task button to trigger Implementation AI
- Persistent storage per project
- Real-time status updates

**Purpose:**
- Provide structure for AI work
- Give users visibility into what AI is doing
- Enable task management and tracking
- Support complex multi-step requests

---

## System Architecture

### High-Level Design

The Task Scheduler consists of three main layers:

1. **Frontend (React/TypeScript):** UI components for displaying and interacting with tasks
2. **Backend (Rust):** Task management logic, persistence, and state
3. **Storage:** JSON file in project directory (`.nexus-overseer/tasks.json`)

### Component Hierarchy

```
TaskSchedulerPanel (Main Container)
├── TaskSetSelector (Dropdown to select task set)
├── TaskList (List of tasks)
│   └── TaskItem (Individual task row)
│       ├── TaskHeader (Name, expand/collapse, start button)
│       └── SubtaskList (Shown when expanded)
│           └── SubtaskItem (Individual subtask)
└── CreateTaskSetButton
```

### Data Flow

```
User Action (click "Start Task")
  ↓
Frontend: TaskStore.startTask(taskId)
  ↓
Tauri IPC: invoke('start_task', { taskId })
  ↓
Backend: TaskScheduler.start_task(taskId)
  ↓
Backend: Updates task status, saves to file
  ↓
Backend: Triggers Implementation AI with task context
  ↓
Frontend: Receives status update, refreshes UI
```

---

## Data Structures

### Frontend (TypeScript)

**Task Status:**
```typescript
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
```

**Task Priority:**
```typescript
type TaskPriority = 'low' | 'medium' | 'high';
```

**Task Interface:**
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // Short title
  description: string;            // Detailed description
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: 'overseer' | 'implementation';
  parentTaskId?: string;          // For subtasks
  subtasks?: Task[];             // Nested tasks
  taskSetId: string;             // Which task set this belongs to
  createdAt: string;             // ISO date string
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}
```

**Task Set Interface:**
```typescript
interface TaskSet {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdBy: 'user' | 'overseer';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

**Task Scheduler State:**
```typescript
interface TaskSchedulerState {
  taskSets: TaskSet[];
  activeTaskSetId: string | null;
  currentTaskId: string | null;
  projectId: string;
}
```

### Backend (Rust)

**Task Status Enum:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Blocked,
}
```

**Task Priority Enum:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskPriority {
    Low,
    Medium,
    High,
}
```

**Task Struct:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: TaskPriority,
    pub assigned_to: AIAgent,
    pub parent_task_id: Option<String>,
    pub subtasks: Vec<Task>,
    pub task_set_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}
```

**Task Set Struct:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskSet {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub tasks: Vec<Task>,
    pub status: TaskSetStatus,
    pub created_by: CreatedBy,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}
```

**Task Scheduler Struct:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskScheduler {
    pub task_sets: Vec<TaskSet>,
    pub active_task_set_id: Option<String>,
    pub current_task_id: Option<String>,
    pub project_id: String,
}
```

---

## Core Components

### Frontend Components

#### TaskSchedulerPanel.tsx

**Purpose:** Main container component for the task scheduler UI panel.

**Props:**
- `projectId: string` - Current project ID

**State:**
- Task sets loaded from backend
- Active task set selection
- Expanded tasks (which tasks are expanded to show subtasks)

**Features:**
- Displays task set selector
- Renders task list
- Handles task expansion/collapse
- Manages "Start Task" button clicks

#### TaskItem.tsx

**Purpose:** Individual task row component.

**Props:**
- `task: Task` - Task data
- `isExpanded: boolean` - Whether task is expanded
- `onToggleExpand: (taskId: string) => void` - Toggle expand/collapse
- `onStartTask: (taskId: string) => void` - Start task handler

**Features:**
- Displays task name with expand/collapse indicator (▶/▼)
- Shows "Start Task" button
- Renders subtasks when expanded
- Shows status indicators

**Visual States:**
- Collapsed: `▶ Task Name [Start Task]`
- Expanded: `▼ Task Name [Start Task]` with subtasks below
- In Progress: Button shows "Working..." with spinner
- Completed: Button shows "Completed" with checkmark

#### TaskStore (Zustand)

**Purpose:** Global state management for tasks.

**State:**
- Task sets array
- Active task set ID
- Current task ID
- Expanded task IDs

**Actions:**
- `loadTaskSets()` - Load all task sets from backend
- `createTaskSet(title, description?)` - Create new task set
- `addTask(taskSetId, title, description)` - Add task to set
- `startTask(taskId)` - Start a task (triggers Implementation AI)
- `completeTask(taskId, notes?)` - Mark task as complete
- `toggleTaskExpand(taskId)` - Expand/collapse task

### Backend Modules

#### scheduler.rs

**Purpose:** Core task scheduler logic and state management.

**Key Functions:**

**Task Set Management:**
- `create_task_set(title, description, created_by)` - Create new task set
- `get_task_set(id)` - Get task set by ID
- `get_all_task_sets()` - Get all task sets
- `update_task_set_status(id, status)` - Update task set status

**Task Management:**
- `add_task(task_set_id, title, description, priority)` - Add task to set
- `add_subtask(parent_task_id, title, description)` - Add subtask
- `get_task(task_id)` - Get task by ID
- `start_task(task_id)` - Start task execution
- `complete_task(task_id, notes)` - Mark task complete
- `update_task_status(task_id, status)` - Update task status
- `break_down_task(task_id)` - Break task into subtasks (Overseer AI)

**Persistence:**
- `save(project_path)` - Save to JSON file
- `load(project_path)` - Load from JSON file

#### Tauri Commands

**IPC Commands for Frontend-Backend Communication:**

```rust
#[tauri::command]
fn create_task_set(title: String, description: Option<String>) -> Result<TaskSet>;

#[tauri::command]
fn get_task_sets() -> Result<Vec<TaskSet>>;

#[tauri::command]
fn get_task_set(id: String) -> Result<TaskSet>;

#[tauri::command]
fn add_task(task_set_id: String, title: String, description: String, priority: String) -> Result<Task>;

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

#[tauri::command]
fn toggle_task_expand(task_id: String) -> Result<bool>; // Returns new expanded state
```

---

## Algorithms

### Task Creation Flow

1. User or Overseer AI requests task creation
2. Validate input (title, description not empty)
3. Generate unique task ID (UUID)
4. Create Task struct with default status (pending)
5. Add to appropriate task set
6. Save to file
7. Return task to caller

### Task Start Flow

1. User clicks "Start Task" button
2. Frontend calls `start_task(taskId)` via Tauri IPC
3. Backend validates task exists and is pending
4. Backend updates task status to "in-progress"
5. Backend sets `started_at` timestamp
6. Backend saves to file
7. Backend triggers Implementation AI with task context
8. Backend returns success to frontend
9. Frontend updates UI (button shows "Working...", task auto-expands if has subtasks)
10. Implementation AI works on task
11. When complete, Implementation AI calls `complete_task(taskId)`
12. Backend updates status, sets `completed_at`
13. Frontend updates UI (button shows "Completed")

### Task Breakdown Flow

1. User or Overseer AI requests task breakdown
2. Backend gets task details
3. Overseer AI analyzes task description
4. Overseer AI generates subtask list
5. Backend creates subtask Task structs
6. Backend links subtasks to parent task
7. Backend saves to file
8. Frontend refreshes to show new subtasks

### Persistence Flow

**Save:**
1. Serialize TaskScheduler struct to JSON
2. Write to `.nexus-overseer/tasks.json` in project root
3. Create directory if it doesn't exist
4. Handle file write errors

**Load:**
1. Check if `.nexus-overseer/tasks.json` exists
2. Read file content
3. Deserialize JSON to TaskScheduler struct
4. Validate data structure
5. Return TaskScheduler or create new if file doesn't exist

---

## Integration Points

### With Overseer AI

**Overseer AI Creates Tasks:**
- Overseer AI calls `create_task_set()` when user makes request
- Overseer AI calls `add_task()` to add tasks to set
- Overseer AI calls `break_down_task()` to create subtasks
- Overseer AI can update task descriptions/notes

**Integration Method:**
- Overseer AI uses Tauri commands (same as frontend)
- Overseer AI has access to task scheduler state
- Overseer AI can read project context to create appropriate tasks

### With Implementation AI

**Implementation AI Executes Tasks:**
- Implementation AI calls `get_next_task()` to get pending task
- Implementation AI calls `start_task()` when beginning work
- Implementation AI calls `complete_task()` when finished
- Implementation AI can call `update_task_status()` if blocked

**Integration Method:**
- Implementation AI triggered by `start_task()` command
- Implementation AI receives task context (description, related files, etc.)
- Implementation AI reports progress via status updates

### With File System

**Storage Location:**
- Tasks stored in `.nexus-overseer/tasks.json` in project root
- File created automatically when first task set is created
- File updated on every task change

**File Format:**
- JSON format for human readability
- Can be edited manually if needed
- Version controlled (optional, user choice)

### With UI Components

**Task Scheduler Panel:**
- Resizable panel component
- Can be detached to separate window
- Updates in real-time when tasks change
- Uses Zustand store for state management

---

## Save/Load System

### Storage Format

**File:** `.nexus-overseer/tasks.json`

**Structure:**
```json
{
  "projectId": "project-123",
  "taskSets": [
    {
      "id": "task-set-1",
      "title": "Add Authentication System",
      "description": "Implement user authentication",
      "status": "active",
      "createdBy": "overseer",
      "tasks": [
        {
          "id": "task-1",
          "title": "Create User model",
          "description": "Create user model with email and password fields",
          "status": "completed",
          "priority": "high",
          "assignedTo": "implementation",
          "parentTaskId": null,
          "subtasks": [
            {
              "id": "subtask-1-1",
              "title": "Add email field",
              "status": "completed"
            }
          ],
          "taskSetId": "task-set-1",
          "createdAt": "2024-12-28T10:00:00Z",
          "updatedAt": "2024-12-28T10:15:00Z",
          "completedAt": "2024-12-28T10:15:00Z"
        }
      ],
      "createdAt": "2024-12-28T10:00:00Z",
      "updatedAt": "2024-12-28T10:15:00Z"
    }
  ],
  "activeTaskSetId": "task-set-1",
  "currentTaskId": null
}
```

### Migration Strategy

**Version 1.0 (Initial):**
- Basic task structure
- No migration needed (first version)

**Future Versions:**
- Add version field to JSON
- Migration functions to upgrade old formats
- Backward compatibility where possible

---

## Performance Considerations

### Frontend

1. **Virtual Scrolling:** For large task lists, use virtual scrolling to render only visible tasks
2. **Memoization:** Memoize task components to prevent unnecessary re-renders
3. **Lazy Loading:** Load task sets on demand, not all at once
4. **State Updates:** Batch state updates to minimize re-renders

### Backend

1. **File I/O:** Use async file operations (tokio::fs) to avoid blocking
2. **Caching:** Cache task scheduler state in memory, write to file on changes
3. **Incremental Updates:** Only update changed tasks, not entire file
4. **Error Handling:** Handle file I/O errors gracefully, don't crash on save failures

### Storage

1. **File Size:** JSON files are small for task data, no size concerns
2. **Concurrent Access:** Single writer (backend), multiple readers (frontend via IPC)
3. **Backup:** Consider auto-backup before major changes

---

## Security Considerations

1. **File Access:** Tauri security model restricts file access to allowed paths
2. **Input Validation:** Validate all task inputs (title, description) before saving
3. **Path Traversal:** Ensure task IDs and paths can't be used for path traversal
4. **Data Sanitization:** Sanitize user input in task descriptions
5. **Error Messages:** Don't expose file system paths in error messages

---

## Testing Checklist

### Unit Tests

- [ ] Task creation with valid input
- [ ] Task creation with invalid input (empty title, etc.)
- [ ] Task status updates
- [ ] Subtask creation and linking
- [ ] Task breakdown functionality
- [ ] File save/load operations
- [ ] Task set creation and management

### Integration Tests

- [ ] Frontend-backend communication via Tauri IPC
- [ ] Task start triggers Implementation AI
- [ ] Task completion updates UI
- [ ] Multiple task sets management
- [ ] Task expansion/collapse in UI

### User Acceptance Tests

- [ ] User can see task list
- [ ] User can expand/collapse tasks
- [ ] User can start tasks with button
- [ ] Tasks show correct status
- [ ] Completed tasks are marked
- [ ] Task sets can be created and switched
- [ ] Tasks persist across app restarts

---

## Research Notes

### Task Management Patterns

**Research Findings:**
- Task management systems typically use hierarchical structures (tasks with subtasks)
- Status tracking (pending, in-progress, completed) is standard
- Persistent storage (JSON, database) is common for task data
- Real-time updates improve user experience

**Sources:**
- General task management system patterns
- Project management tool designs (Jira, Trello, etc.)

**Implementation Approach:**
- Use nested task structure (tasks with subtasks)
- Store in JSON for simplicity and human readability
- Use Zustand for reactive state management in frontend
- Use Rust structs with serde for serialization

**Why This Approach:**
- JSON is simple, debuggable, and sufficient for task data
- Nested structure matches user's requirement for expandable tasks
- Zustand provides reactive updates without complexity
- Rust backend ensures data integrity and performance

### React Collapsible Components

**Research Findings:**
- React state management (useState) is standard for expand/collapse
- Simple toggle pattern works well for collapsible lists
- Visual indicators (▶/▼) improve UX
- Auto-expand on action (like starting task) is helpful

**Sources:**
- React documentation on state management
- UI component library patterns (Chakra UI, Ark UI)

**Implementation Approach:**
- Use useState to track expanded task IDs
- Toggle function to expand/collapse tasks
- Visual indicators (▶ collapsed, ▼ expanded)
- Auto-expand when task starts (if has subtasks)

**Why This Approach:**
- Simple and performant
- Matches user's requirement for click-to-expand
- Standard React pattern, easy to maintain

### Tauri IPC Patterns

**Research Findings:**
- Tauri commands are the standard way to communicate frontend-backend
- Commands should be async and return Results
- Error handling important for user experience
- State synchronization between frontend and backend

**Sources:**
- Tauri documentation on IPC
- Tauri best practices

**Implementation Approach:**
- Use Tauri commands for all task operations
- Return Results for error handling
- Frontend handles errors and shows user-friendly messages
- Backend validates all inputs

**Why This Approach:**
- Standard Tauri pattern
- Type-safe communication
- Good error handling
- Clear separation of concerns

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement backend module (scheduler.rs)
3. ⏳ Implement Tauri commands
4. ⏳ Implement frontend components
5. ⏳ Implement Zustand store
6. ⏳ Integrate with Overseer AI
7. ⏳ Integrate with Implementation AI
8. ⏳ Testing and refinement

---

## Notes

- Task scheduler is a core system that other systems depend on
- Keep it simple initially, add complexity only when needed
- Focus on user experience (smooth interactions, clear feedback)
- Ensure tasks persist correctly across sessions
- Consider future features (task dependencies, time tracking, etc.) but don't implement yet

