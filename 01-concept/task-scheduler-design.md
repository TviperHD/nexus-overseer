# Task Scheduler Design Discussion

**Created:** 2024-12-28  
**Status:** Superseded by `task-scheduler-refined.md`

**Note:** This document contains initial discussion. See `task-scheduler-refined.md` for the refined design based on user feedback.

## Is Task Scheduler a Good Idea?

### ✅ YES - Here's Why:

1. **Structure and Accountability:**
   - Breaks down large requests into manageable tasks
   - Provides clear progress tracking
   - Makes AI work more predictable and reliable

2. **Separation of Concerns:**
   - Overseer AI plans (creates tasks)
   - Implementation AI executes (follows tasks)
   - Clear division of responsibilities

3. **User Visibility:**
   - User can see what AI is working on
   - User can review and modify tasks
   - User understands progress

4. **Error Recovery:**
   - If task fails, can retry or adjust
   - Can identify blocking tasks
   - Can reorder tasks based on dependencies

5. **Project Continuity:**
   - Tasks persist across sessions
   - Can resume work later
   - Can review what was done

### Potential Concerns:

1. **Complexity:**
   - Adds complexity to the system
   - Need to manage task state, dependencies, etc.
   - More moving parts

2. **Overhead:**
   - Overseer needs to create good tasks
   - Implementation needs to follow tasks correctly
   - Might slow down simple requests

3. **User Experience:**
   - Need good UI for task management
   - Shouldn't overwhelm user with too many tasks
   - Should be optional for simple requests

**Verdict:** ✅ **Good idea, but needs careful design** - The benefits outweigh the complexity, especially for larger projects.

---

## Design Questions

### 1. What is a Task?

**Options:**

**Option A: Simple Task (Recommended)**
```typescript
interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo: 'overseer' | 'implementation';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

**Option B: Detailed Task**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: AIAgent;
  dependencies: string[]; // Task IDs
  context: {
    files: string[];
    relatedTasks: string[];
    notes: string;
  };
  metadata: {
    estimatedTime?: number;
    actualTime?: number;
    retryCount: number;
    error?: string;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
  };
}
```

**Recommendation:** Start with **Option A (Simple)**, add complexity as needed.

---

### 2. How Does Overseer Create Tasks?

**Workflow Ideas:**

**Workflow A: Automatic Breakdown**
```
User: "Add authentication system"
  ↓
Overseer AI analyzes request
  ↓
Overseer AI breaks down into tasks:
  - Task 1: Create user model
  - Task 2: Create login endpoint
  - Task 3: Create register endpoint
  - Task 4: Add password hashing
  - Task 5: Add JWT tokens
  ↓
Overseer AI creates tasks in scheduler
  ↓
User can review/modify tasks
  ↓
Implementation AI starts executing
```

**Workflow B: User-Approved Tasks**
```
User: "Add authentication system"
  ↓
Overseer AI creates task breakdown
  ↓
Overseer AI shows tasks to user
  ↓
User reviews and approves/modifies
  ↓
Tasks are added to scheduler
  ↓
Implementation AI starts executing
```

**Workflow C: Hybrid (Recommended)**
```
Simple requests: Auto-create and execute
Complex requests: Show breakdown, user can review
User can always view/edit tasks
```

**Recommendation:** **Workflow C (Hybrid)** - Balance automation with user control.

---

### 3. How Does Implementation AI Follow Tasks?

**Execution Flow:**

```
Implementation AI checks scheduler
  ↓
Finds next available task (pending, no dependencies)
  ↓
Gets task context (files, related tasks, etc.)
  ↓
Generates code to complete task
  ↓
Writes code to files
  ↓
Marks task as completed
  ↓
Reports completion to Overseer
  ↓
Overseer reviews and updates related tasks if needed
  ↓
Moves to next task
```

**Questions:**
- Should Implementation AI work on one task at a time or multiple?
- What if task fails? Retry? Mark as blocked?
- Should Implementation AI ask Overseer for help if stuck?

**Recommendation:** 
- One task at a time (simpler, clearer)
- Retry failed tasks (with limit)
- Ask Overseer if stuck (after retries)

---

### 4. Task Dependencies

**Do we need dependencies?**

**Pros:**
- ✅ Can model complex workflows
- ✅ Ensures correct order (e.g., create model before endpoint)
- ✅ Can identify blocking tasks

**Cons:**
- ⚠️ Adds complexity
- ⚠️ Overseer needs to understand dependencies
- ⚠️ Can create dependency chains that are hard to resolve

**Recommendation:** 
- **Start simple:** No dependencies initially
- **Add later:** If we find we need them
- **Alternative:** Use task ordering (priority + sequence)

---

### 5. Task States

**Minimal States:**
- `pending` - Not started
- `in-progress` - Currently being worked on
- `completed` - Done
- `blocked` - Can't proceed (needs user input or dependency)

**Extended States:**
- `pending` - Not started
- `ready` - Ready to start (dependencies met)
- `in-progress` - Currently being worked on
- `review` - Needs review (user or Overseer)
- `completed` - Done
- `blocked` - Can't proceed
- `cancelled` - User cancelled

**Recommendation:** Start with **Minimal States**, add more if needed.

---

### 6. Task Persistence

**Where to store tasks?**

**Option A: In-Memory (Simple)**
- Fast
- Lost on app close
- Good for testing

**Option B: JSON File (Recommended for Start)**
- Simple
- Human-readable
- Easy to debug
- Persists across sessions
- Can version control

**Option C: SQLite Database**
- More robust
- Better for complex queries
- Scales better
- More complex setup

**Option D: Project-Specific File**
- Tasks stored in project directory
- Each project has its own tasks
- Can be committed to git (optional)

**Recommendation:** **Option D (Project-Specific File)** - Store in `.nexus-overseer/tasks.json` in project root.

---

### 7. Task UI/UX

**What should user see?**

**Minimal View:**
- List of tasks with status
- Current task highlighted
- Progress indicator

**Detailed View:**
- Task list with details
- Task dependencies (if any)
- Task history/log
- Ability to edit/delete tasks
- Ability to reorder tasks

**Recommendation:** Start with **Minimal View**, add details as needed.

---

## Proposed Implementation

### Phase 1: Simple Task Scheduler

**Data Structure:**
```typescript
interface Task {
  id: string;                    // UUID
  description: string;            // What needs to be done
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignedTo: 'overseer' | 'implementation';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;                 // Optional notes from AI
}

interface TaskScheduler {
  tasks: Task[];
  currentTaskId?: string;          // Currently executing task
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Storage:**
- File: `.nexus-overseer/tasks.json` in project root
- JSON format for simplicity
- Auto-save on changes

**Basic Operations:**
1. `createTask(description, priority)` - Overseer creates task
2. `getNextTask()` - Implementation gets next pending task
3. `updateTaskStatus(id, status)` - Update task status
4. `completeTask(id, notes?)` - Mark task complete
5. `getTasks(status?)` - Get tasks (optionally filtered)

**Overseer AI Integration:**
- Overseer can create tasks when user makes request
- Overseer can update tasks based on progress
- Overseer can review completed tasks

**Implementation AI Integration:**
- Implementation checks for next task
- Implementation updates task status
- Implementation completes task when done

---

### Phase 2: Enhanced Features (Future)

**Add Later If Needed:**
- Task dependencies
- Task estimates (time)
- Task retry logic
- Task templates
- Task categories/tags
- Task history/audit log
- Task comments/notes
- Task attachments (files, code snippets)

---

## Architecture Integration

### Backend (Rust)

**Module: `scheduler.rs`**
```rust
pub struct Task {
    pub id: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: Priority,
    pub assigned_to: AIAgent,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

pub struct TaskScheduler {
    tasks: Vec<Task>,
    current_task_id: Option<String>,
    project_id: String,
}

impl TaskScheduler {
    pub fn create_task(&mut self, description: String, priority: Priority) -> Task;
    pub fn get_next_task(&self) -> Option<&Task>;
    pub fn update_task_status(&mut self, id: &str, status: TaskStatus);
    pub fn complete_task(&mut self, id: &str, notes: Option<String>);
    pub fn save(&self, project_path: &Path) -> Result<()>;
    pub fn load(project_path: &Path) -> Result<Self>;
}
```

**Tauri Commands:**
- `create_task(description, priority)` - Create new task
- `get_tasks(status?)` - Get all tasks or filtered
- `get_next_task()` - Get next pending task
- `update_task_status(id, status)` - Update task status
- `complete_task(id, notes?)` - Complete task

### Frontend (React)

**Component: `TaskScheduler.tsx`**
- Display task list
- Show current task
- Show progress
- Allow user to view/edit tasks

**Store: `taskStore.ts` (Zustand)**
- Task state
- Sync with backend
- Real-time updates

---

## Benefits of This Design

1. **Simple to Start:** Basic task structure, easy to implement
2. **Extensible:** Can add features later as needed
3. **User-Friendly:** Clear visibility into what AI is doing
4. **AI-Friendly:** Clear interface for both AIs to use
5. **Persistent:** Tasks saved, can resume work
6. **Debuggable:** JSON format, easy to inspect

---

## Potential Issues & Solutions

### Issue 1: Overseer Creates Bad Tasks
**Solution:** User can review and edit tasks before execution

### Issue 2: Implementation Gets Stuck
**Solution:** Retry logic, ask Overseer for help, mark as blocked

### Issue 3: Too Many Tasks
**Solution:** Overseer should group related tasks, user can collapse/expand

### Issue 4: Task Ordering
**Solution:** Use priority + creation order, user can reorder if needed

---

## Next Steps

1. ✅ Discuss task scheduler design (this document)
2. ⏳ Get feedback and refine design
3. ⏳ Create technical specification
4. ⏳ Design data structures in detail
5. ⏳ Design UI/UX for task scheduler
6. ⏳ Implement basic task scheduler
7. ⏳ Integrate with Overseer AI
8. ⏳ Integrate with Implementation AI

---

## Questions for Discussion

1. **Should tasks be mandatory or optional?**
   - Always use tasks? Or only for complex requests?
   - Can user skip task scheduler for simple requests?

2. **How detailed should tasks be?**
   - High-level ("Add authentication") or detailed ("Create User model with email, password fields")?

3. **Should user approve tasks?**
   - Auto-create and execute? Or show to user first?

4. **What happens if task fails?**
   - Retry automatically? Mark as blocked? Ask user?

5. **Should tasks have time estimates?**
   - Useful for user, but hard for AI to estimate accurately

6. **How to handle task dependencies?**
   - Start simple (no dependencies) or design for dependencies from start?

---

## My Recommendations

1. **Start Simple:** Basic task structure, no dependencies initially
2. **Make it Optional:** Simple requests can bypass scheduler
3. **User Can Review:** Show tasks to user, allow editing
4. **Auto-Execute:** If user doesn't modify, start executing
5. **Retry Logic:** Failed tasks retry with limit, then mark blocked
6. **Project-Specific:** Tasks stored per project
7. **JSON Storage:** Simple file-based storage to start

What do you think? Should we refine this design or discuss specific aspects?

