# Technical Specification: Dual-AI System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The Dual-AI System is the core architecture of Nexus Overseer, coordinating two specialized AI agents: the Overseer AI (project manager, researcher, planner) and the Implementation AI (code generator, executor). The system manages their communication, shared state, and coordination to provide a structured, reliable AI coding assistant experience.

**Key Features:**
- Overseer AI for project-level thinking and planning
- Implementation AI for code generation and execution
- Shared state management (task scheduler, project docs)
- Communication patterns between AIs
- Context management and knowledge sharing
- AI orchestration and coordination

**Purpose:**
- Separate planning from execution for better results
- Provide project-level awareness and consistency
- Enable structured, trackable AI work
- Improve reliability and user visibility

---

## System Architecture

### High-Level Design

The Dual-AI System consists of:

1. **Overseer AI Module:** Handles planning, research, documentation, task creation
2. **Implementation AI Module:** Handles code generation and file writing
3. **AI Orchestrator:** Coordinates between AIs and manages shared state
4. **Context Manager:** Manages project context and knowledge
5. **Shared State:** Task scheduler and project documentation

### Component Hierarchy

```
DualAISystem (Main Module)
├── OverseerAI (Planning and Management)
│   ├── ProjectAnalyzer (Analyzes project state)
│   ├── TaskCreator (Creates and manages tasks)
│   ├── DocumentationManager (Manages project docs)
│   └── ResearchEngine (Conducts research)
├── ImplementationAI (Code Generation)
│   ├── CodeGenerator (Generates code)
│   ├── CodeWriter (Writes code to files)
│   └── TaskExecutor (Executes tasks)
├── AIOrchestrator (Coordination)
│   ├── StateManager (Manages shared state)
│   ├── CommunicationHandler (AI communication)
│   └── ContextProvider (Provides context to AIs)
└── ContextManager (Project Context)
    ├── ProjectKnowledge (Project knowledge base)
    └── FileContext (File and code context)
```

### Data Flow

```
User Request
  ↓
Overseer AI (Analyzes request)
  ↓
Overseer AI (Creates tasks in scheduler)
  ↓
Shared State (Task Scheduler updated)
  ↓
User clicks "Start Task"
  ↓
Implementation AI (Reads task from scheduler)
  ↓
Implementation AI (Gets context from Context Manager)
  ↓
Implementation AI (Generates code via LLM)
  ↓
Implementation AI (Writes code to files)
  ↓
Implementation AI (Updates task status)
  ↓
Overseer AI (Reviews completion, updates docs if needed)
```

---

## Data Structures

### Backend (Rust)

**AI Role:**
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AIRole {
    Overseer,
    Implementation,
}
```

**AI Context:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIContext {
    pub project_path: PathBuf,
    pub current_task: Option<Task>,
    pub related_files: Vec<PathBuf>,
    pub project_docs: Vec<String>,      // Relevant documentation snippets
    pub conversation_history: Vec<Message>,
    pub user_intent: String,             // What user wants to achieve
}
```

**AI Message:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIMessage {
    pub role: AIRole,
    pub content: String,
    pub timestamp: DateTime<Utc>,
    pub context: Option<AIContext>,
}
```

**Overseer AI State:**
```rust
#[derive(Debug, Clone)]
pub struct OverseerAIState {
    pub project_knowledge: ProjectKnowledge,
    pub active_task_sets: Vec<String>,  // Task set IDs
    pub conversation_history: Vec<AIMessage>,
    pub research_cache: HashMap<String, String>, // Cached research
}
```

**Implementation AI State:**
```rust
#[derive(Debug, Clone)]
pub struct ImplementationAIState {
    pub current_task: Option<Task>,
    pub code_context: CodeContext,      // Current code being worked on
    pub file_changes: Vec<FileChange>,  // Files modified in current session
    pub conversation_history: Vec<AIMessage>,
}
```

**Project Knowledge:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectKnowledge {
    pub project_path: PathBuf,
    pub overview: String,               // Project overview
    pub architecture: Option<String>,   // Architecture documentation
    pub tech_stack: Vec<String>,        // Technologies used
    pub key_decisions: Vec<Decision>,   // Important decisions
    pub file_structure: FileTree,      // Project file structure
    pub last_updated: DateTime<Utc>,
}
```

**Code Context:**
```rust
#[derive(Debug, Clone)]
pub struct CodeContext {
    pub target_file: PathBuf,
    pub related_files: Vec<PathBuf>,
    pub existing_code: Option<String>,   // Existing code in target file
    pub imports: Vec<String>,           // Required imports
    pub dependencies: Vec<String>,      // Code dependencies
}
```

### Frontend (TypeScript)

**AI Message Interface:**
```typescript
interface AIMessage {
  role: 'overseer' | 'implementation';
  content: string;
  timestamp: string;
  context?: AIContext;
}

interface AIContext {
  projectPath: string;
  currentTask?: Task;
  relatedFiles: string[];
  projectDocs: string[];
  conversationHistory: AIMessage[];
  userIntent: string;
}
```

---

## Core Components

### Backend Modules

#### ai_orchestrator.rs (Main Module)

**Purpose:** Coordinates Overseer and Implementation AI, manages shared state.

**Key Functions:**

**AI Coordination:**
- `initialize_ai_system(project_path)` - Initialize both AIs for project
- `handle_user_request(request, role)` - Route request to appropriate AI
- `coordinate_ai_work()` - Coordinate work between AIs
- `sync_ai_state()` - Sync state between AIs

**Shared State Management:**
- `get_shared_state()` - Get current shared state
- `update_task_scheduler(updates)` - Update task scheduler
- `update_project_docs(updates)` - Update project documentation
- `get_project_context()` - Get current project context

**Communication:**
- `send_to_overseer(message, context)` - Send message to Overseer AI
- `send_to_implementation(message, context)` - Send message to Implementation AI
- `get_ai_response(role, prompt)` - Get response from AI

#### overseer_ai.rs

**Purpose:** Overseer AI logic - planning, research, documentation, task management.

**Key Functions:**

**Project Management:**
- `analyze_project(project_path)` - Analyze project state
- `create_project_overview()` - Create project overview
- `update_project_docs(content)` - Update project documentation
- `research_topic(topic)` - Research a topic for the project

**Task Management:**
- `create_task_set(title, description)` - Create new task set
- `break_down_task(task_id)` - Break task into subtasks
- `review_task_completion(task_id)` - Review completed task
- `update_task_priority(task_id, priority)` - Update task priority

**Planning:**
- `plan_feature(description)` - Plan a feature implementation
- `analyze_user_request(request)` - Analyze user request
- `create_implementation_plan(feature)` - Create implementation plan

**Integration:**
- Uses LLM Integration for AI responses
- Uses Task Scheduler for task management
- Uses File System for reading project files
- Uses Project Management for project state

#### implementation_ai.rs

**Purpose:** Implementation AI logic - code generation and execution.

**Key Functions:**

**Task Execution:**
- `get_next_task()` - Get next pending task
- `start_task(task_id)` - Start working on task
- `execute_task(task)` - Execute task (generate and write code)
- `complete_task(task_id, notes)` - Mark task as complete

**Code Generation:**
- `generate_code(task, context)` - Generate code for task
- `review_generated_code(code, task)` - Review generated code
- `write_code_to_file(code, file_path)` - Write code to file
- `update_existing_code(file_path, changes)` - Update existing code

**Context Management:**
- `get_code_context(task)` - Get code context for task
- `get_related_files(task)` - Get files related to task
- `analyze_existing_code(file_path)` - Analyze existing code

**Integration:**
- Uses LLM Integration for code generation
- Uses File System for file operations
- Uses Task Scheduler for task management
- Uses Context Manager for project context

#### context_manager.rs

**Purpose:** Manages project context and knowledge for both AIs.

**Key Functions:**

**Project Knowledge:**
- `load_project_knowledge(project_path)` - Load project knowledge
- `update_project_knowledge(updates)` - Update project knowledge
- `get_project_overview()` - Get project overview
- `get_project_architecture()` - Get architecture documentation

**Code Context:**
- `get_file_context(file_path)` - Get context for specific file
- `get_related_files_context(file_paths)` - Get context for multiple files
- `analyze_code_structure(file_path)` - Analyze code structure

**Context for AI:**
- `build_context_for_overseer(request)` - Build context for Overseer AI
- `build_context_for_implementation(task)` - Build context for Implementation AI
- `get_conversation_context()` - Get conversation history context

### Tauri Commands

**IPC Commands for Frontend-Backend Communication:**

```rust
#[tauri::command]
async fn overseer_analyze_request(request: String) -> Result<TaskSet>;

#[tauri::command]
async fn overseer_create_task_set(title: String, description: String) -> Result<TaskSet>;

#[tauri::command]
async fn overseer_break_down_task(task_id: String) -> Result<Vec<Task>>;

#[tauri::command]
async fn overseer_chat(message: String) -> Result<String>;

#[tauri::command]
async fn implementation_start_task(task_id: String) -> Result<()>;

#[tauri::command]
async fn implementation_execute_task(task_id: String) -> Result<()>;

#[tauri::command]
async fn implementation_get_status() -> Result<ImplementationAIState>;

#[tauri::command]
async fn get_project_context() -> Result<ProjectKnowledge>;

#[tauri::command]
async fn update_project_docs(content: String) -> Result<()>;
```

---

## Algorithms

### User Request Flow (Overseer AI)

1. User sends request to Overseer AI
2. Overseer AI analyzes request:
   - Gets project context
   - Understands user intent
   - Identifies what needs to be done
3. Overseer AI creates task set:
   - Breaks down request into tasks
   - Creates tasks in scheduler
   - Sets priorities
4. Overseer AI updates project docs if needed
5. Task set appears in UI
6. User can review and start tasks

### Task Execution Flow (Implementation AI)

1. User clicks "Start Task" button
2. Implementation AI gets task from scheduler
3. Implementation AI builds context:
   - Gets task description
   - Gets related files
   - Gets project knowledge
   - Gets existing code if updating
4. Implementation AI generates code:
   - Calls LLM with task and context
   - Receives generated code
   - Reviews code quality
5. Implementation AI writes code:
   - Writes to target file
   - Creates backup if needed
   - Handles errors
6. Implementation AI updates task:
   - Marks task as complete
   - Adds notes if needed
7. Overseer AI reviews completion (optional)

### Context Building Flow

1. AI needs context for operation
2. Context Manager gathers information:
   - Project knowledge (overview, architecture)
   - Related files (read file contents)
   - Task information (if applicable)
   - Conversation history
3. Context Manager formats context:
   - Structures information
   - Includes relevant details
   - Excludes irrelevant information
4. Context provided to AI
5. AI uses context for operation

### Shared State Synchronization

1. AI updates shared state (task, docs, etc.)
2. Update written to storage (JSON file)
3. Other AI reads updated state
4. UI notified of state change
5. UI updates display

---

## Integration Points

### With Task Scheduler

**Overseer AI Creates Tasks:**
- Overseer AI calls task scheduler to create tasks
- Overseer AI can break down tasks into subtasks
- Overseer AI can update task priorities

**Implementation AI Executes Tasks:**
- Implementation AI reads tasks from scheduler
- Implementation AI updates task status
- Implementation AI completes tasks

### With LLM Integration

**Both AIs Use LLM:**
- Overseer AI uses reasoning model for planning
- Implementation AI uses code model for generation
- Both use LLM Integration module
- Responses handled by respective AI modules

### With File System

**Implementation AI Writes Files:**
- Implementation AI uses file system to write code
- Implementation AI reads existing files for context
- File system handles all file operations

**Overseer AI Reads Files:**
- Overseer AI reads project files for analysis
- Overseer AI reads documentation files
- Overseer AI uses file system for research

### With Project Management

**Project Context:**
- Both AIs use project management for context
- Project knowledge shared between AIs
- Project docs updated by Overseer AI
- Project state tracked by system

### With UI Components

**User Interaction:**
- User chats with Overseer AI via UI
- User starts tasks via UI
- UI displays AI status and progress
- UI shows task scheduler

---

## Communication Patterns

### Shared State Pattern (Primary)

**How AIs Communicate:**
- AIs don't communicate directly
- They communicate via shared state:
  - Task Scheduler (tasks, status)
  - Project Documentation (knowledge)
  - Project State (context)

**Benefits:**
- Clear separation of concerns
- No circular dependencies
- Easy to understand and debug
- Scalable architecture

**Example:**
- Overseer AI creates task in scheduler
- Implementation AI reads task from scheduler
- Implementation AI updates task status
- Overseer AI reads updated status

### Event-Based Pattern (Secondary)

**For Real-Time Updates:**
- AIs emit events for important actions
- Other components can listen to events
- UI updates based on events

**Example:**
- Implementation AI emits "task_started" event
- UI listens and updates display
- Overseer AI listens and updates knowledge

---

## Context Management

### Project Knowledge Structure

**Stored Information:**
- Project overview (what the project does)
- Architecture documentation (how it's structured)
- Tech stack (technologies used)
- Key decisions (important choices made)
- File structure (project organization)

**Maintained By:**
- Overseer AI creates and updates
- Both AIs can read
- Stored in project directory

### Code Context for Implementation AI

**Includes:**
- Target file path
- Existing code in file
- Related files and their contents
- Required imports
- Code dependencies
- Task description

**Built By:**
- Context Manager
- Based on task requirements
- Includes relevant project knowledge

---

## Performance Considerations

### LLM Request Optimization

1. **Context Size:** Limit context size to avoid slow responses
2. **Caching:** Cache common responses where appropriate
3. **Streaming:** Use streaming for long responses
4. **Batching:** Batch related requests when possible

### State Management

1. **Lazy Loading:** Load project knowledge on demand
2. **Incremental Updates:** Only update changed parts
3. **Caching:** Cache frequently accessed state
4. **Efficient Storage:** Use efficient data structures

### File Operations

1. **Async Operations:** All file operations are async
2. **Selective Reading:** Only read files that are needed
3. **Caching:** Cache file contents when appropriate

---

## Security Considerations

1. **Input Validation:** Validate all AI inputs
2. **File Access:** All file access goes through security validation
3. **LLM Security:** All LLM calls are local (no external network)
4. **State Validation:** Validate shared state updates
5. **Error Handling:** Don't expose sensitive information in errors

---

## Error Handling

### Error Types

1. **LLM Errors:** LLM request failed, model unavailable
2. **File Errors:** File operation failed, permission denied
3. **State Errors:** Invalid state, corruption
4. **Task Errors:** Task execution failed, task not found
5. **Context Errors:** Context building failed, missing information

### Error Handling Strategy

1. **Retry Logic:** Retry transient errors (LLM, file I/O)
2. **User Feedback:** Show user-friendly error messages
3. **Logging:** Log technical details for debugging
4. **Graceful Degradation:** Continue with reduced functionality if possible
5. **Task Recovery:** Mark failed tasks appropriately, allow retry

---

## Testing Checklist

### Unit Tests

- [ ] Overseer AI task creation
- [ ] Implementation AI code generation
- [ ] Context building
- [ ] Shared state updates
- [ ] Error handling
- [ ] State synchronization

### Integration Tests

- [ ] Overseer AI → Task Scheduler integration
- [ ] Implementation AI → File System integration
- [ ] Both AIs → LLM Integration
- [ ] Shared state synchronization
- [ ] Context management
- [ ] Communication patterns

### User Acceptance Tests

- [ ] User can chat with Overseer AI
- [ ] Overseer AI creates tasks correctly
- [ ] User can start tasks
- [ ] Implementation AI generates code
- [ ] Code is written to files correctly
- [ ] Tasks complete successfully
- [ ] Project knowledge is maintained
- [ ] Errors are handled gracefully

---

## Research Notes

### Multi-Agent AI Systems

**Research Findings:**
- Multi-agent systems use shared state for communication
- Separation of concerns improves reliability
- Clear interfaces between agents are important
- Event-based communication complements shared state

**Sources:**
- General multi-agent system patterns
- AI agent architecture research

**Implementation Approach:**
- Use shared state (task scheduler, project docs) for communication
- Separate Overseer (planning) from Implementation (execution)
- Clear interfaces and responsibilities
- Event-based updates for real-time UI

**Why This Approach:**
- Avoids circular dependencies
- Clear separation of concerns
- Easy to understand and debug
- Scalable architecture

### Context Management Patterns

**Research Findings:**
- Context should be structured and relevant
- Too much context slows down LLM
- Context should include project knowledge and task-specific info
- Context should be updated as project evolves

**Sources:**
- LLM context management best practices
- RAG (Retrieval-Augmented Generation) patterns

**Implementation Approach:**
- Build context on demand
- Include project knowledge and task-specific info
- Limit context size
- Update context as project evolves

**Why This Approach:**
- Efficient LLM usage
- Relevant context improves results
- On-demand building is performant
- Keeps context current

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement AI Orchestrator module
3. ⏳ Implement Overseer AI module
4. ⏳ Implement Implementation AI module
5. ⏳ Implement Context Manager
6. ⏳ Create Tauri commands
7. ⏳ Integrate with Task Scheduler
8. ⏳ Integrate with LLM Integration
9. ⏳ Integrate with File System
10. ⏳ Testing and refinement

---

## Notes

- Dual-AI System is the core differentiator of Nexus Overseer
- Separation of planning and execution improves results
- Shared state pattern is key to coordination
- Context management is critical for quality results
- Keep it simple - start with basic patterns, add complexity only if needed
- Focus on making it work smoothly for the user

