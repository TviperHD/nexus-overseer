# Technical Specification: Project Management System

**Date:** 2024-12-28  
**Status:** Planning  
**Version:** 1.0

## Overview

The Project Management System manages project state, documentation, context, and settings for Nexus Overseer. It provides the foundation for project-aware operations, allowing both Overseer and Implementation AI to understand and work with the project structure, history, and knowledge.

**Key Features:**
- Project creation and initialization
- Project state management
- Project documentation management
- Project context tracking
- Project settings and configuration
- Project file structure tracking
- Project persistence

**Purpose:**
- Provide project context to both AIs
- Maintain project knowledge and documentation
- Track project state and history
- Enable project-specific settings
- Support multiple projects

---

## System Architecture

### High-Level Design

The Project Management System consists of:

1. **Project Manager Module:** Core project operations
2. **Project State Manager:** Manages project state
3. **Documentation Manager:** Manages project documentation
4. **Context Tracker:** Tracks project context
5. **Settings Manager:** Manages project settings

### Component Hierarchy

```
ProjectManagement (Main Module)
├── ProjectManager (Core Operations)
│   ├── ProjectCreator (Creates new projects)
│   ├── ProjectLoader (Loads existing projects)
│   └── ProjectValidator (Validates project structure)
├── ProjectStateManager (State Management)
│   ├── StateTracker (Tracks state changes)
│   └── StatePersistence (Saves/loads state)
├── DocumentationManager (Documentation)
│   ├── DocCreator (Creates documentation)
│   ├── DocUpdater (Updates documentation)
│   └── DocReader (Reads documentation)
├── ContextTracker (Context Management)
│   ├── FileStructureTracker (Tracks file structure)
│   └── ChangeTracker (Tracks changes)
└── SettingsManager (Settings)
    ├── SettingsLoader (Loads settings)
    └── SettingsSaver (Saves settings)
```

### Data Flow

```
User Creates/Opens Project
  ↓
Project Manager (Initializes/Loads)
  ↓
Project State (Loaded)
  ↓
Documentation (Loaded)
  ↓
Context (Built)
  ↓
AIs Use Context
  ↓
State Updates
  ↓
Persistence (Saved)
```

---

## Data Structures

### Backend (Rust)

**Project Structure:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,                     // UUID
    pub name: String,
    pub path: PathBuf,                  // Project root directory
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_opened: Option<DateTime<Utc>>,
    pub state: ProjectState,
    pub settings: ProjectSettings,
}
```

**Project State:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectState {
    pub project_id: String,
    pub current_phase: ProjectPhase,   // planning, development, etc.
    pub file_structure: FileTree,
    pub recent_changes: Vec<FileChange>,
    pub active_task_set_id: Option<String>,
    pub last_ai_activity: Option<DateTime<Utc>>,
}
```

**Project Documentation:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectDocumentation {
    pub project_id: String,
    pub overview: String,               // Project overview
    pub architecture: Option<String>,   // Architecture documentation
    pub tech_stack: Vec<String>,        // Technologies used
    pub key_decisions: Vec<Decision>,   // Important decisions
    pub notes: Vec<DocumentationNote>,  // Additional notes
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub id: String,
    pub date: DateTime<Utc>,
    pub topic: String,
    pub decision: String,
    pub rationale: String,
    pub consequences: Option<String>,
}
```

**Project Settings:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub project_id: String,
    pub llm_models: ModelConfig,       // LLM model preferences
    pub file_ignore_patterns: Vec<String>, // Files to ignore
    pub auto_save: bool,
    pub backup_enabled: bool,
    pub documentation_auto_update: bool,
}
```

**File Tree:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileTree {
    pub root: PathBuf,
    pub entries: Vec<FileTreeEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileTreeEntry {
    pub name: String,
    pub path: PathBuf,
    pub is_file: bool,
    pub is_directory: bool,
    pub children: Option<Vec<FileTreeEntry>>,
}
```

**File Change:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChange {
    pub path: PathBuf,
    pub change_type: ChangeType,
    pub timestamp: DateTime<Utc>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeType {
    Created,
    Modified,
    Deleted,
    Renamed { old_path: PathBuf },
}
```

### Frontend (TypeScript)

**Project Interface:**
```typescript
interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  lastOpened?: string;
  state: ProjectState;
  settings: ProjectSettings;
}

interface ProjectState {
  projectId: string;
  currentPhase: 'planning' | 'development' | 'maintenance';
  fileStructure: FileTree;
  recentChanges: FileChange[];
  activeTaskSetId?: string;
  lastAIActivity?: string;
}

interface ProjectDocumentation {
  projectId: string;
  overview: string;
  architecture?: string;
  techStack: string[];
  keyDecisions: Decision[];
  notes: DocumentationNote[];
  lastUpdated: string;
}
```

---

## Core Components

### Backend Modules

#### project.rs (Main Module)

**Purpose:** Core project management operations.

**Key Functions:**

**Project Operations:**
- `create_project(name, path)` - Create new project
- `load_project(project_id)` - Load existing project
- `open_project(project_id)` - Open project (updates last_opened)
- `close_project(project_id)` - Close project
- `delete_project(project_id)` - Delete project
- `list_projects()` - List all projects
- `get_current_project()` - Get currently open project

**Project State:**
- `get_project_state(project_id)` - Get project state
- `update_project_state(project_id, updates)` - Update state
- `track_file_change(project_id, change)` - Track file change
- `get_recent_changes(project_id, limit)` - Get recent changes

**Documentation:**
- `get_documentation(project_id)` - Get project documentation
- `update_overview(project_id, overview)` - Update overview
- `update_architecture(project_id, architecture)` - Update architecture
- `add_decision(project_id, decision)` - Add decision
- `add_note(project_id, note)` - Add documentation note

**Context:**
- `build_project_context(project_id)` - Build full project context
- `get_file_structure(project_id)` - Get file structure
- `update_file_structure(project_id)` - Update file structure

#### project_state.rs

**Purpose:** Manages project state persistence and tracking.

**Key Functions:**
- `save_state(project_id, state)` - Save project state
- `load_state(project_id)` - Load project state
- `track_change(project_id, change)` - Track state change
- `get_state_history(project_id)` - Get state history

#### documentation_manager.rs

**Purpose:** Manages project documentation.

**Key Functions:**
- `load_documentation(project_id)` - Load documentation
- `save_documentation(project_id, docs)` - Save documentation
- `update_documentation(project_id, updates)` - Update documentation
- `search_documentation(project_id, query)` - Search documentation

#### context_tracker.rs

**Purpose:** Tracks project context for AI use.

**Key Functions:**
- `build_context(project_id)` - Build project context
- `get_file_context(project_id, file_path)` - Get file context
- `get_project_overview(project_id)` - Get project overview
- `get_tech_stack(project_id)` - Get tech stack
- `get_recent_activity(project_id)` - Get recent activity

### Tauri Commands

**IPC Commands for Frontend-Backend Communication:**

```rust
#[tauri::command]
async fn create_project(name: String, path: String) -> Result<Project>;

#[tauri::command]
async fn load_project(project_id: String) -> Result<Project>;

#[tauri::command]
async fn open_project(project_id: String) -> Result<()>;

#[tauri::command]
async fn close_project() -> Result<()>;

#[tauri::command]
async fn list_projects() -> Result<Vec<Project>>;

#[tauri::command]
async fn get_current_project() -> Result<Option<Project>>;

#[tauri::command]
async fn get_project_state(project_id: String) -> Result<ProjectState>;

#[tauri::command]
async fn update_project_state(updates: ProjectStateUpdate) -> Result<()>;

#[tauri::command]
async fn get_documentation(project_id: String) -> Result<ProjectDocumentation>;

#[tauri::command]
async fn update_documentation(updates: DocumentationUpdate) -> Result<()>;

#[tauri::command]
async fn get_project_context(project_id: String) -> Result<ProjectContext>;

#[tauri::command]
async fn get_file_structure(project_id: String) -> Result<FileTree>;

#[tauri::command]
async fn update_file_structure(project_id: String) -> Result<FileTree>;
```

---

## Algorithms

### Project Creation Flow

1. User provides project name and path
2. Validate path (exists, writable, not already a project)
3. Create project directory structure:
   - Project root
   - `.nexus-overseer/` directory
   - Initial config files
4. Initialize project state:
   - Create Project struct
   - Initialize ProjectState
   - Initialize ProjectDocumentation
   - Initialize ProjectSettings
5. Save project metadata
6. Return Project to caller

### Project Loading Flow

1. User selects project to open
2. Load project metadata
3. Validate project structure (still exists, valid)
4. Load project state
5. Load project documentation
6. Load project settings
7. Build file structure
8. Update last_opened timestamp
9. Return Project to caller

### Documentation Update Flow

1. Overseer AI or user updates documentation
2. Documentation Manager receives update
3. Validate update (format, content)
4. Merge with existing documentation
5. Update last_updated timestamp
6. Save to file
7. Notify context tracker of update
8. Return updated documentation

### Context Building Flow

1. AI or system requests project context
2. Context Tracker gathers information:
   - Project overview
   - Architecture documentation
   - Tech stack
   - Key decisions
   - File structure
   - Recent changes
3. Context Tracker formats context:
   - Structures information
   - Includes relevant details
   - Excludes irrelevant information
4. Return context to requester

---

## Integration Points

### With Task Scheduler

**Project-Specific Tasks:**
- Task scheduler stores tasks per project
- Project state tracks active task set
- Project context includes task information

### With Dual-AI System

**Project Context for AIs:**
- Both AIs use project context
- Overseer AI updates project documentation
- Implementation AI uses project file structure
- Context Manager provides context to both

### With File System

**Project File Management:**
- File operations scoped to project
- File structure tracked per project
- File changes tracked per project
- Project root used for relative paths

### With Configuration System

**Project Settings:**
- Project-specific settings stored per project
- Global settings apply to all projects
- Settings merged when loading project

---

## Storage

### Project Metadata

**Location:** Global config directory (e.g., `~/.nexus-overseer/projects.json`)

**Structure:**
```json
{
  "projects": [
    {
      "id": "project-123",
      "name": "My Project",
      "path": "/path/to/project",
      "createdAt": "2024-12-28T10:00:00Z",
      "updatedAt": "2024-12-28T10:00:00Z",
      "lastOpened": "2024-12-28T15:00:00Z"
    }
  ],
  "currentProjectId": "project-123"
}
```

### Project State

**Location:** `.nexus-overseer/state.json` in project root

**Structure:**
```json
{
  "projectId": "project-123",
  "currentPhase": "development",
  "fileStructure": { ... },
  "recentChanges": [ ... ],
  "activeTaskSetId": "task-set-1",
  "lastAIActivity": "2024-12-28T15:00:00Z"
}
```

### Project Documentation

**Location:** `.nexus-overseer/documentation.json` in project root

**Structure:**
```json
{
  "projectId": "project-123",
  "overview": "Project description...",
  "architecture": "Architecture documentation...",
  "techStack": ["TypeScript", "Rust", "Tauri"],
  "keyDecisions": [ ... ],
  "notes": [ ... ],
  "lastUpdated": "2024-12-28T15:00:00Z"
}
```

### Project Settings

**Location:** `.nexus-overseer/settings.json` in project root

**Structure:**
```json
{
  "projectId": "project-123",
  "llmModels": {
    "overseer": "llama3.1:8b",
    "implementation": "qwen2.5-coder:7b"
  },
  "fileIgnorePatterns": ["node_modules", ".git"],
  "autoSave": true,
  "backupEnabled": true,
  "documentationAutoUpdate": true
}
```

---

## Performance Considerations

### State Management

1. **Lazy Loading:** Load project state on demand
2. **Incremental Updates:** Only update changed parts
3. **Caching:** Cache frequently accessed state
4. **Efficient Storage:** Use efficient data structures

### File Structure Tracking

1. **Incremental Updates:** Only update changed parts of file tree
2. **Caching:** Cache file structure, invalidate on changes
3. **Selective Scanning:** Only scan when needed
4. **Ignore Patterns:** Skip ignored files/directories

### Documentation Management

1. **Efficient Storage:** Store documentation efficiently
2. **Incremental Updates:** Only update changed sections
3. **Search Optimization:** Index documentation for search

---

## Security Considerations

1. **Path Validation:** Validate all project paths
2. **File Access:** All file access goes through security validation
3. **Project Isolation:** Projects are isolated from each other
4. **Metadata Protection:** Protect project metadata from corruption
5. **Backup Strategy:** Backup project data before major changes

---

## Error Handling

### Error Types

1. **Project Not Found:** Project doesn't exist
2. **Invalid Path:** Project path is invalid
3. **Corrupted State:** Project state is corrupted
4. **Permission Denied:** No permission to access project
5. **Storage Error:** Failed to save/load project data

### Error Handling Strategy

1. **Validation:** Validate project structure on load
2. **Recovery:** Attempt to recover corrupted data
3. **User Feedback:** Show user-friendly error messages
4. **Logging:** Log technical details for debugging
5. **Backup Restoration:** Restore from backup if needed

---

## Testing Checklist

### Unit Tests

- [ ] Project creation
- [ ] Project loading
- [ ] Project state updates
- [ ] Documentation updates
- [ ] File structure tracking
- [ ] Settings management
- [ ] Error handling

### Integration Tests

- [ ] Project creation with file system
- [ ] Project loading with persistence
- [ ] Documentation integration with Overseer AI
- [ ] Context building for AIs
- [ ] File structure updates on file changes

### User Acceptance Tests

- [ ] User can create new project
- [ ] User can open existing project
- [ ] Project state persists across sessions
- [ ] Documentation is maintained
- [ ] File structure is tracked
- [ ] Settings are saved and loaded
- [ ] Multiple projects can be managed

---

## Research Notes

### Project Management Patterns

**Research Findings:**
- Project management systems typically use metadata files
- State persistence is important for user experience
- Documentation should be structured and searchable
- File structure tracking enables project awareness

**Sources:**
- General project management system patterns
- IDE project management (VS Code, etc.)

**Implementation Approach:**
- Use JSON files for persistence (simple, debuggable)
- Store metadata globally, project data in project directory
- Structure documentation for easy access
- Track file structure incrementally

**Why This Approach:**
- JSON is simple and human-readable
- Separation of metadata and project data is clean
- Structured documentation is easy to use
- Incremental tracking is efficient

### File Structure Tracking

**Research Findings:**
- File structure tracking can be expensive for large projects
- Incremental updates are more efficient
- Ignore patterns are important for performance
- Caching reduces redundant scans

**Sources:**
- File system monitoring patterns
- IDE file tree implementations

**Implementation Approach:**
- Track file structure incrementally
- Use file watcher to detect changes
- Cache file structure
- Respect ignore patterns

**Why This Approach:**
- Efficient for large projects
- Real-time updates via file watcher
- Caching improves performance
- Ignore patterns reduce work

---

## Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement project manager module
3. ⏳ Implement project state manager
4. ⏳ Implement documentation manager
5. ⏳ Implement context tracker
6. ⏳ Create Tauri commands
7. ⏳ Integrate with Task Scheduler
8. ⏳ Integrate with Dual-AI System
9. ⏳ Testing and refinement

---

## Notes

- Project Management System is foundational for project awareness
- Keep it simple - start with basic structure, add complexity as needed
- Documentation is critical for AI context
- File structure tracking enables project-aware operations
- State persistence ensures good user experience
- Multiple projects support is important for flexibility

