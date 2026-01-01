# Nexus Overseer - Implementation

**Project:** Nexus Overseer  
**Type:** PC Desktop Application  
**Framework:** Tauri (Rust + TypeScript/React)  
**Languages:** Rust (Backend), TypeScript/React (Frontend)  
**Status:** Planning Complete - Ready for Implementation  
**Last Updated:** 2024-12-28

---

## Project Overview

This is the implementation folder for **Nexus Overseer**. This folder contains all implementation code, assets, and resources for the desktop application.

**Key Features:**
- Dual-AI system (Overseer AI + Implementation AI)
- Task scheduler with integrated checklist UI
- Local LLM integration (Ollama)
- Monaco Editor for code editing
- Advanced resizable panels with tab system
- Multi-window support
- Chat interface with history sidebar
- File system integration

---

## Project Structure

```
app/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # React components
│   │   ├── Editor/        # Code editor components
│   │   ├── Chat/          # Chat interface components
│   │   ├── TaskScheduler/ # Task scheduler components
│   │   ├── Panels/        # Panel system components
│   │   ├── FileTree/      # File tree component
│   │   └── Settings/      # Settings UI components
│   ├── stores/            # Zustand state stores
│   ├── hooks/             # React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx           # Main app component
├── src-tauri/             # Backend (Rust)
│   ├── src/
│   │   ├── main.rs       # Tauri entry point
│   │   ├── commands.rs   # Tauri IPC commands
│   │   ├── filesystem.rs  # File system operations
│   │   ├── llm.rs        # LLM integration
│   │   ├── ai/           # AI system modules
│   │   │   ├── overseer.rs
│   │   │   └── implementation.rs
│   │   ├── scheduler.rs  # Task scheduler
│   │   ├── project.rs    # Project management
│   │   └── windows.rs    # Window management
│   └── Cargo.toml        # Rust dependencies
├── assets/                # Static assets (icons, images, etc.)
├── checklists/            # Implementation checklists
├── session-overviews/     # Session documentation
└── .cursor/              # Cursor AI rules
    └── rules/            # Implementation rules
```

---

## Development Workflow

1. **Follow Technical Specifications** - All implementation must follow specs in `../03-planning/technical-specs-*.md`
2. **Update Checklists** - Mark items complete as you work
3. **Document Sessions** - Create session overviews for each work session
4. **Follow Code Standards** - Adhere to project code standards and conventions (see `.cursor/rules/`)

---

## Technology Stack

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Code Editor:** Monaco Editor
- **Panels:** react-resizable-panels
- **Drag & Drop:** dnd-kit
- **Build Tool:** Vite

### Backend
- **Framework:** Tauri
- **Language:** Rust
- **HTTP Client:** reqwest (for Ollama API)
- **Serialization:** serde + serde_json
- **File Watching:** notify
- **State Storage:** In-memory with JSON persistence

### External Services
- **LLM Runtime:** Ollama (local)
- **Models:**
  - Overseer AI: Llama 3.1 8B (or similar reasoning model)
  - Implementation AI: Qwen2.5-Coder 7B (or similar code model)

---

## Implementation Approach

**As of 2025-12-30:** We use a **task-based approach** where checklists are created on-demand as tasks are completed, rather than following rigid phases.

- **Checklists:** Created as needed in `checklists/` folder
- **No Phases:** Work through tasks based on what needs to be done
- **Reference:** See `../03-planning/implementation-roadmap.md` for potential feature breakdown (reference only, not prescriptive)

**Key Features to Implement:**
- File system integration
- Basic tab system
- Monaco Editor integration
- LLM integration
- Task scheduler
- Dual-AI system
- Project management
- Chat interface
- Resizable panels
- Multi-window support
- State management
- Configuration system
- Settings UI

---

## Important Notes

- All implementation must follow the technical specifications in `../03-planning/technical-specs-*.md` files
- These specs are comprehensive and implementation-ready
- Update checklists and session overviews as you work
- Follow the code standards defined in `.cursor/rules/`
- Use Tailwind CSS for all styling (see `../04-design/visual-design-system.md`)
- Follow the visual design system for consistent UI

---

## Related Documentation

- **Planning Docs:** `../03-planning/` - Technical specifications and architecture
- **Design Docs:** `../04-design/` - UI/UX design documents
- **Decision Log:** `../05-decisions/decision-log.md` - Project decisions
- **Visual Design:** `../04-design/visual-design-system.md` - Design system
- **Architecture:** `../03-planning/technical-architecture.md` - System architecture

---

## Getting Started

1. **For Implementation Sessions:**
   - Copy and paste `_prompts/AI_SESSION_START.md` at session start
   - Follow all rules in `.cursor/rules/`
   - Work only in `app/` folder

2. **For Research/Planning Sessions:**
   - Copy and paste `_prompts/RESEARCH_PLANNING_SESSION.md` at session start
   - Focus on research, planning, reviewing documentation
   - Do NOT modify code files

3. **At Session End:**
   - Use `_prompts/AI_SESSION_END.md` to document session completion
   - Create session overview in `session-overviews/` (same name as checklist, no dates/times)

4. **Implementation Workflow:**
   - Review `../03-planning/implementation-roadmap.md` for feature reference (not prescriptive)
   - Create task-based checklists as needed (see `checklists/README.md`)
   - Follow technical specifications for each system
   - Update checklists as you complete tasks
   - Document sessions in `session-overviews/`
   - After completing a checklist, create a new one for next tasks

---

**Status:** Ready for Implementation (Task-Based Approach)

