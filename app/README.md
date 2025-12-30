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

## Implementation Phases

See `../03-planning/implementation-roadmap.md` for detailed phase breakdown.

**Phase 0:** Project Setup (1-2 weeks)
- Create Tauri project structure
- Set up development environment
- Install dependencies
- Create basic UI shell

**Phase 1:** Core Foundation (3-4 weeks)
- File system integration
- Basic tab system
- Monaco Editor integration
- LLM integration
- Task scheduler
- Dual-AI system

**Phase 2:** Core Features (2-3 weeks)
- Project management
- Chat interface
- Resizable panels (basic)

**Phase 3:** UI Enhancement (2-3 weeks)
- Advanced panel customization
- Multi-window support
- State management

**Phase 4:** Polish (1-2 weeks)
- Configuration system
- Settings UI
- Final polish

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
   - Create session overview in `session-overviews/`

4. **Implementation Workflow:**
   - Review `../03-planning/implementation-roadmap.md` for phase breakdown
   - Start with Phase 0: Project Setup
   - Follow technical specifications for each system
   - Update checklists as you complete tasks
   - Document sessions in `session-overviews/`

---

**Status:** Ready for Phase 0: Project Setup

