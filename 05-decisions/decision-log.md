# Decision Log

**Created:** 2024-12-28

This document tracks all major decisions made during the Nexus Overseer project. Each decision follows the structured format below.

---

## Decision Format

### [YYYY-MM-DD] - [Decision Topic]

**Context:** [Why this decision is needed]  
**Options Considered:** 
- Option 1: [description]
- Option 2: [description]  
**Decision:** [What was chosen]  
**Rationale:** [Why this option was chosen]  
**Consequences:** [What this means for the project]

---

## Decisions

### 2024-12-28 - Project Codename

**Context:** Need a codename for the project during development.

**Options Considered:**
- Nexus Overseer
- Code Overseer
- Quantum Forge
- Apex Catalyst

**Decision:** Nexus Overseer

**Rationale:** 
- "Nexus" suggests central coordination and connection
- "Overseer" directly references the dual-AI architecture (Overseer AI)
- Clear and descriptive
- Professional sounding

**Consequences:** Project folder and documentation will use "nexus-overseer" naming.

---

### 2024-12-28 - Platform Selection

**Context:** Need to determine target platform for the application.

**Options Considered:**
- Web-based application
- PC Desktop Application (native)
- Mobile-first with desktop later
- Cross-platform from start

**Decision:** PC Desktop Application (native, not web-based)

**Rationale:**
- User specifically wants desktop app, not web-based
- Better file system integration for direct file writing
- More control over local LLM integration
- Better performance for code editing
- Mobile app is future consideration, not priority

**Consequences:** 
- Must choose native desktop framework (Tauri, Qt, etc.)
- Cannot use web-only technologies
- Focus on Windows initially, but keep cross-platform in mind

---

### 2024-12-28 - LLM Strategy

**Context:** Need to decide on LLM approach - cloud-based or local.

**Options Considered:**
- Cloud-based LLMs (OpenAI, Anthropic, etc.)
- Local LLMs (Ollama, LM Studio, etc.)
- Hybrid approach

**Decision:** Free local LLMs (privacy-focused, offline-capable)

**Rationale:**
- User explicitly wants free local LLMs
- Privacy concerns (code stays local)
- Offline functionality
- No API costs
- Full control over models

**Consequences:**
- Must integrate with local LLM runtime (Ollama, etc.)
- Performance depends on user's hardware
- Need to handle model management
- May need to recommend minimum hardware specs

---

### 2024-12-28 - Dual-AI Architecture

**Context:** Need to design the AI system architecture.

**Options Considered:**
- Single AI for everything
- Dual-AI system (Overseer + Implementation)
- Multi-AI system with specialized agents

**Decision:** Dual-AI system (Overseer AI + Implementation AI)

**Rationale:**
- User's core concept involves separation of concerns
- Overseer handles project-level thinking (research, docs, tasks)
- Implementation handles code generation
- Clear division of responsibilities
- Better than single AI trying to do everything

**Consequences:**
- Need to design communication between AIs
- Need to manage two AI instances (possibly different models)
- More complex architecture, but better results
- Task scheduler becomes critical integration point

---

### 2024-12-28 - Framework Selection

**Context:** Need to choose the desktop application framework for Nexus Overseer. Critical decision affecting performance, bundle size, development experience, and all future development.

**Options Considered:**
- Tauri (Rust + TypeScript/React)
- Qt (C++ or Python/PySide)
- Eclipse Theia (TypeScript)
- Electron (TypeScript/JavaScript)
- WPF (C# / .NET)

**Decision:** Tauri (Rust + TypeScript/React)

**Rationale:**
- **Best balance of performance and bundle size:** ~5-10MB bundle vs Electron's 100MB+
- **Excellent performance:** Rust backend provides native-level performance
- **Modern development experience:** TypeScript/React frontend (familiar web tech)
- **Easy LLM integration:** Rust has excellent HTTP client libraries (reqwest) for Ollama API
- **Easy code editor integration:** Monaco Editor works perfectly as web component
- **Cross-platform:** Windows, macOS, Linux from the start
- **Security:** Rust's memory safety and minimal attack surface
- **Active development:** Growing community, stable and production-ready
- **File system:** Excellent Rust file I/O capabilities for direct file writing

**Consequences:**
- Need to learn Rust for backend development (though can be minimal initially)
- Frontend will use TypeScript/React (modern web stack)
- Will use system's native WebView (not bundled Chromium)
- Smaller ecosystem than Electron, but sufficient for our needs
- No official mobile support yet (future consideration)
- Development will be faster with modern tooling

---

## Pending Decisions

### 2024-12-28 - Code Editor Selection

**Context:** Need to choose code editor component for the application.

**Options Considered:**
- Monaco Editor (VS Code's editor)
- CodeMirror 6
- Ace Editor

**Decision:** Monaco Editor

**Rationale:**
- Full-featured code editing experience (what users expect)
- Excellent IntelliSense (code completion, hover info)
- Mature and battle-tested (used in VS Code)
- Perfect integration with React/TypeScript
- Bundle size (2-3MB) is acceptable for the features provided
- Excellent TypeScript support

**Consequences:**
- Will use Monaco Editor in React frontend
- Bundle size will be ~2-3MB larger
- Users get full VS Code-like editing experience
- Easy integration with Tauri + React

---

### 2024-12-28 - UI Resizable Panels Library

**Context:** Need library for resizable panels within the application.

**Options Considered:**
- react-resizable-panels
- Allotment
- react-split-pane (legacy)

**Decision:** react-resizable-panels

**Rationale:**
- Modern, actively maintained library
- Excellent performance
- TypeScript support
- Flexible API
- Supports nested panels
- Used by many modern applications

**Consequences:**
- Will use react-resizable-panels for panel system
- Need to implement custom drag-to-detach functionality
- Good performance for resizing operations

---

### 2024-12-28 - Multi-Window Support

**Context:** User wants ability to detach panels into separate windows (like Cursor).

**Options Considered:**
- Tauri's built-in multi-window support
- Custom implementation
- Third-party window management library

**Decision:** Tauri's built-in multi-window API + custom implementation

**Rationale:**
- Tauri natively supports creating multiple windows
- Can create windows dynamically via WindowBuilder
- Window State Plugin available for persistence
- Custom drag-to-detach implementation gives full control
- No need for third-party libraries

**Consequences:**
- Will implement custom drag detection and window creation
- Need to manage window state across application
- Will use Tauri Window State Plugin for persistence
- Can create Cursor-like detachable panel experience

---

### 2024-12-28 - UI Library Selection

**Context:** Need to choose UI styling library for the React frontend.

**Options Considered:**
- Tailwind CSS (utility-first CSS framework)
- shadcn/ui (component library built on Tailwind)
- Material-UI (MUI)
- Chakra UI
- Styled Components
- Plain CSS/SCSS

**Decision:** Tailwind CSS

**Rationale:**
- **Flexibility:** Utility-first approach allows rapid UI development
- **Widely used:** Industry standard, excellent documentation
- **Small bundle size:** Only includes used styles (tree-shaking)
- **Perfect for custom design:** Easy to implement Cursor-style dark theme
- **TypeScript support:** Excellent type safety
- **Can add shadcn/ui later:** If needed, can add component library on top
- **Matches visual design system:** Easy to implement custom color palette and spacing

**Consequences:**
- Will use Tailwind CSS for all styling
- Need to configure Tailwind with custom theme (colors, spacing from visual design system)
- Can add shadcn/ui components later if needed
- All UI components will use Tailwind utility classes

---

### 2024-12-28 - State Persistence Format

**Context:** Need to decide how to persist application state (tasks, projects, chat history, etc.).

**Options Considered:**
- JSON files (human-readable, simple)
- SQLite database (structured, queryable)
- YAML files (human-readable, more structured)
- Binary format (compact, fast)

**Decision:** JSON files

**Rationale:**
- **Simplicity:** Easy to read, write, and debug
- **Human-readable:** Users can inspect and edit if needed
- **Already used in specs:** All technical specs already specify JSON format
- **No dependencies:** No need for database libraries
- **Sufficient for use case:** Task data, project state, chat history are not large enough to need SQLite
- **Easy migration:** Can migrate to SQLite later if needed
- **Cross-platform:** Works everywhere
- **Version control friendly:** Can be tracked in git if needed

**Consequences:**
- All state persistence will use JSON files
- Files stored in `.nexus-overseer/` directory in project root
- Global config in `~/.nexus-overseer/` (or app config directory)
- Easy to debug by inspecting JSON files
- Can migrate to SQLite later if data grows large

---

### 2024-12-28 - Backend State Storage

**Context:** Need to decide how backend (Rust) manages state in memory and persistence.

**Options Considered:**
- In-memory only (fast, but lost on restart)
- SQLite (persistent, queryable)
- In-memory with JSON persistence (fast access + persistence)
- Redis (overkill for desktop app)

**Decision:** In-memory with JSON persistence

**Rationale:**
- **Best of both worlds:** Fast in-memory access during runtime, persistent storage on disk
- **Simple architecture:** Load JSON on startup, keep in memory, save on changes
- **Matches persistence format:** Uses JSON files (already decided)
- **Performance:** In-memory access is fast, no database overhead
- **Sufficient for use case:** Desktop app doesn't need complex queries
- **Easy to implement:** Simple load/save pattern
- **Can migrate to SQLite later:** If needed, can add SQLite without changing API

**Consequences:**
- Backend state kept in Rust structs in memory
- State loaded from JSON files on startup
- State saved to JSON files on changes (debounced)
- Fast runtime performance (no database queries)
- Simple implementation pattern

---

## Pending Decisions

### Code Editor Selection
**Status:** ✅ Decided - Monaco Editor

### UI Resizable Panels
**Status:** ✅ Decided - react-resizable-panels

### Multi-Window Support
**Status:** ✅ Decided - Tauri built-in + custom implementation

### UI Library Selection
**Status:** ✅ Decided - Tailwind CSS

### State Persistence Format
**Status:** ✅ Decided - JSON files

### Backend State Storage
**Status:** ✅ Decided - In-memory with JSON persistence

### Local LLM Runtime
**Status:** ✅ Decided - Ollama (from research)

### Task Scheduler Design
**Status:** ✅ Decided - Documented in technical specs

---

## Notes

- Decisions are documented as they're made
- Pending decisions will be added once resolved
- Rationale should explain "why" not just "what"
- Consequences help understand impact on project

