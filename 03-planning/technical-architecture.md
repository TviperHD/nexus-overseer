# Technical Architecture

**Created:** 2024-12-28  
**Status:** Draft - Initial Architecture

## Overview

This document outlines the high-level technical architecture for Nexus Overseer, built with Tauri (Rust + TypeScript/React).

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│              (React + TypeScript Frontend)              │
│  - Monaco Editor (Code Editor)                          │
│  - Chat Interface (Overseer AI)                         │
│  - Task Scheduler UI                                    │
│  - Project Dashboard                                    │
└────────────────────┬──────────────────────────────────┘
                     │ IPC (Tauri Commands)
┌────────────────────▼──────────────────────────────────┐
│              Tauri Backend (Rust)                       │
│  - File System Operations                               │
│  - LLM API Integration (Ollama)                         │
│  - Task Scheduler Logic                                 │
│  - Project State Management                             │
│  - AI Orchestration (Overseer + Implementation)          │
└────────────────────┬──────────────────────────────────┘
                     │ HTTP API
┌────────────────────▼──────────────────────────────────┐
│            Local LLM Runtime (Ollama)                   │
│  - Overseer AI Model (Llama 3.1 8B or similar)          │
│  - Implementation AI Model (Qwen2.5-Coder or similar)  │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (React + TypeScript)

**Location:** `src/` (Tauri frontend directory)

**Components:**
1. **Tab System**
   - Tab groups for organizing panels and files
   - Draggable tabs (panels and files)
   - Tab bar UI
   - Tab switching and management
   - All panels and files exist as tabs

2. **Code Editor Component**
   - Monaco Editor integration
   - Single file view (no internal tabs)
   - Files appear as tabs in main tab system
   - Syntax highlighting
   - Code editing
   - Detachable (can be moved to separate window)

3. **Chat Interface**
   - Chat interface for user interaction
   - Message history
   - Detachable (can be moved to separate window)

4. **Overseer Panel**
   - Overseer AI chat interface
   - Context information panel
   - Project statistics
   - Detachable (can be moved to separate window)

5. **Task Scheduler UI**
   - Task list view
   - Task details
   - Progress tracking
   - Task creation/editing
   - Detachable (can be moved to separate window)

6. **File Tree**
   - Hierarchical file navigation
   - Text-only (no icons)
   - Search functionality
   - Detachable (can be moved to separate window)

7. **Resizable Panel System**
   - `react-resizable-panels` for resizable splits
   - Tab-based panel organization
   - Horizontal and vertical panel groups
   - Nested panels supported (up to 5 levels)
   - Advanced drag-and-drop
   - Collapsible panels with toggle buttons
   - Panel embedding (slide behind adjacent panels)
   - Right-click divider options

8. **Window Management**
   - Window manager component
   - Create/destroy windows dynamically
   - Track window state
   - Restore window positions/sizes
   - Tab/panel re-attachment
   - Support for tab groups in windows

7. **State Management**
   - Zustand for global state (recommended)
   - Project state
   - UI state (tab groups, panel layouts, window positions)
   - Panel customization state (embedded, collapsed, etc.)
   - AI conversation state
   - Window/panel state management
   - File tab state (integrated with tab system)

### Backend (Rust)

**Location:** `src-tauri/src/` (Tauri backend directory)

**Modules:**
1. **File System Module** (`filesystem.rs`)
   - Read/write files
   - Watch file changes
   - Directory operations
   - File metadata

2. **LLM Integration Module** (`llm.rs`)
   - Ollama API client
   - Model management
   - Request/response handling
   - Streaming support

3. **AI Orchestration Module** (`ai_orchestrator.rs`)
   - Overseer AI logic
   - Implementation AI logic
   - Task coordination
   - Context management

4. **Task Scheduler Module** (`scheduler.rs`)
   - Task storage
   - Task execution
   - Dependency management
   - Progress tracking

5. **Project Management Module** (`project.rs`)
   - Project state
   - Project documentation
   - Project context
   - Project settings

6. **Window Management Module** (`windows.rs`)
   - Create new windows
   - Manage window lifecycle
   - Window state persistence
   - Window communication

7. **Tauri Commands** (`commands.rs`)
   - IPC endpoints
   - Frontend-backend communication
   - Command handlers
   - Window management commands

## Data Flow

### User Request Flow

```
User → Frontend (React) 
  → Tauri IPC Command 
  → Backend (Rust) 
  → AI Orchestrator 
  → LLM Module 
  → Ollama API 
  → Response back through chain
```

### Code Generation Flow

```
User: "Add a function to do X"
  ↓
Frontend sends to Overseer AI
  ↓
Overseer AI analyzes request
  ↓
Overseer AI creates/updates tasks in scheduler
  ↓
Implementation AI reads next task
  ↓
Implementation AI generates code
  ↓
Backend writes code to file
  ↓
Frontend updates editor with new code
  ↓
User reviews code
```

## Technology Stack

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript
- **Code Editor:** Monaco Editor
- **Resizable Panels:** react-resizable-panels
- **Tab System:** Custom implementation (similar to Cursor)
- **State Management:** Zustand
- **UI Library:** Tailwind CSS
- **Build Tool:** Vite (Tauri default)

### Backend
- **Language:** Rust
- **Framework:** Tauri
- **HTTP Client:** reqwest (for Ollama API)
- **File System:** std::fs + tokio for async
- **Serialization:** serde + serde_json
- **State Management:** In-memory with JSON persistence

### External Services
- **LLM Runtime:** Ollama (local)
- **Models:**
  - Overseer AI: Llama 3.1 8B (or similar reasoning model)
  - Implementation AI: Qwen2.5-Coder 7B (or similar code model)

## Project Structure

```
nexus-overseer/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── Editor/
│   │   ├── Chat/
│   │   ├── TaskScheduler/
│   │   ├── Dashboard/
│   │   ├── Panels/
│   │   │   ├── ResizablePanel.tsx
│   │   │   ├── PanelGroup.tsx
│   │   │   └── DetachablePanel.tsx
│   │   └── Windows/
│   │       ├── WindowManager.tsx
│   │       └── DetachedWindow.tsx
│   ├── hooks/
│   │   ├── useWindowManager.ts
│   │   └── usePanelDrag.ts
│   ├── stores/                    # State management
│   │   ├── windowStore.ts
│   │   ├── panelLayoutStore.ts
│   │   └── ...
│   ├── types/
│   └── App.tsx
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── filesystem.rs
│   │   ├── llm.rs
│   │   ├── ai_orchestrator.rs
│   │   ├── scheduler.rs
│   │   ├── project.rs
│   │   └── windows.rs
│   └── Cargo.toml
├── package.json
└── README.md
```

## Key Design Decisions

1. **Separation of Concerns:**
   - Frontend handles UI only
   - Backend handles all file operations and AI logic
   - Clear IPC boundaries

2. **AI Architecture:**
   - Two separate AI instances (Overseer + Implementation)
   - Shared state via task scheduler and project docs
   - Overseer manages, Implementation executes

3. **State Management:**
   - Frontend: React state for UI
   - Backend: Rust structs for project state
   - Persistence: JSON files (in-memory with JSON persistence)

4. **File Operations:**
   - All file operations go through Rust backend
   - Frontend requests file operations via IPC
   - Backend handles file watching and updates

## Security Considerations

1. **File System Access:**
   - Tauri's security model restricts file access
   - Need to configure allowed paths
   - User grants permissions for project directories

2. **LLM Integration:**
   - All LLM calls are local (Ollama)
   - No data leaves the machine
   - Privacy-focused by design

3. **Code Execution:**
   - Code is written to files only
   - No automatic code execution
   - User controls what runs

## Performance Considerations

1. **LLM Inference:**
   - Local inference depends on hardware
   - May need to handle slow responses gracefully
   - Consider streaming responses for better UX

2. **File Operations:**
   - Async file operations (tokio)
   - Efficient file watching
   - Minimize file reads/writes

3. **Frontend:**
   - Lazy load Monaco Editor
   - Virtualize long lists (tasks, files)
   - Optimize re-renders
   - Efficient panel resizing (react-resizable-panels is performant)
   - Note: Tauri has reported slower window resizing on Windows (known issue)

## UI Features

### Resizable Panels
- ✅ **Supported:** Using `react-resizable-panels`
- Horizontal and vertical splits
- Nested panel groups
- Smooth resizing experience
- Panel sizes persist across sessions

### Detachable Windows
- ✅ **Supported:** Using Tauri's multi-window API
- Drag panels/tabs to create new windows
- Each window can contain any panel
- Windows can be closed (panels re-attach or stay detached)
- Window positions/sizes persist (Tauri Window State Plugin)

### Window Management
- Create windows dynamically from frontend
- Track all open windows
- Manage window lifecycle
- Restore window state on app restart

## Next Steps

1. ✅ Create initial architecture (this document)
2. ✅ Research resizable panels and multi-window support
3. ⏳ Design detailed component specifications
4. ⏳ Design data structures and schemas
5. ⏳ Create technical specifications for each module
6. ⏳ Design IPC command interface for window management
7. ⏳ Plan state management approach (window/panel state)
8. ⏳ Design file system integration
9. ⏳ Design LLM integration patterns
10. ⏳ Design panel drag-to-detach implementation

## Notes

- Architecture will evolve as we design detailed specifications
- Start simple, add complexity as needed
- Focus on making it work smoothly for the user
- Keep security and privacy in mind throughout

