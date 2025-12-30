# Core Concept: Nexus Overseer

**Created:** 2024-12-28  
**Status:** Draft

## Elevator Pitch

Nexus Overseer is an AI-powered desktop coding assistant that uses a dual-AI system to provide smarter, more reliable code generation. An Overseer AI manages your project's big picture—research, documentation, and task scheduling—while an Implementation AI writes code directly to your files, following the overseer's guidance. All powered by free local LLMs for complete privacy and offline functionality.

## Vision

Create a desktop coding assistant that solves the common problems with existing AI coding tools:
- **Context awareness:** The Overseer AI maintains full project context and ensures consistency
- **Reliable implementation:** The Implementation AI follows structured tasks and writes code directly to files
- **Privacy-first:** All processing happens locally using free LLMs
- **Smooth workflow:** Integrated task scheduler and project management built into the app

## Core Idea

### The Problem

Existing AI coding assistants like Cursor have limitations:
- AI doesn't always maintain full project context
- Code generation can be inconsistent or miss project-wide concerns
- No built-in project management or task tracking
- Limited oversight of AI-generated code quality

### The Solution

A dual-AI architecture where:
1. **Overseer AI** acts as a project manager:
   - Maintains full project knowledge and context
   - Conducts research and creates documentation
   - Manages a built-in task scheduler
   - Ensures code quality and project consistency
   - User talks to the Overseer when creating/planning projects

2. **Implementation AI** acts as the coder:
   - Follows tasks from the Overseer's scheduler
   - Writes code directly to desktop files
   - Focuses on implementation, not planning
   - Receives guidance and context from Overseer

3. **Integrated Task Scheduler:**
   - Overseer maintains and updates task list
   - Implementation AI follows tasks in order
   - Built into the application (not external)
   - Provides structure and accountability

## Target Audience

**Primary:** Individual developers (starting with personal use)
- Developers who want better AI coding assistance
- Users who value privacy (local LLMs)
- Developers who want integrated project management
- Users frustrated with limitations of existing tools

**Future:** Could expand to teams, but initial focus is personal use.

## Core Workflow / User Flow

### Project Creation Flow
1. User opens Nexus Overseer
2. User creates a new project (or opens existing)
3. User talks to **Overseer AI** about the project:
   - Overseer asks questions to understand the project
   - Overseer conducts research (if needed)
   - Overseer creates initial documentation
   - Overseer sets up task scheduler with initial tasks
4. User can review/modify tasks in scheduler
5. User requests implementation work

### Implementation Flow
1. User requests code changes (or Overseer identifies tasks)
2. **Overseer AI** evaluates request:
   - Checks project context and consistency
   - Updates task scheduler if needed
   - Provides context to Implementation AI
3. **Implementation AI** executes:
   - Reads task from scheduler
   - Generates code using local LLM
   - Writes code directly to desktop files
   - Reports completion to Overseer
4. **Overseer AI** reviews:
   - Checks code quality
   - Updates documentation if needed
   - Updates task scheduler
   - Reports to user

### Ongoing Workflow
- User can chat with Overseer about project direction
- Overseer maintains project knowledge and documentation
- Task scheduler provides structure and progress tracking
- Implementation AI handles actual coding work
- Both AIs work together seamlessly

## Unique Selling Points

1. **Dual-AI Architecture:** Separation of concerns (planning vs. implementation) leads to better results
2. **Project-Level Awareness:** Overseer maintains full project context, not just file-level
3. **Integrated Task Management:** Built-in scheduler keeps work organized and trackable
4. **Local LLMs:** Complete privacy, no data sent to cloud, works offline
5. **Direct File Writing:** Code goes directly to desktop files, smoother workflow
6. **Research & Documentation:** Overseer handles project research and documentation automatically

## Key Features

### Overseer AI Features
- Project research and analysis
- Documentation generation and maintenance
- Task scheduler management
- Project context awareness
- Code quality oversight
- User interaction for project planning

### Implementation AI Features
- Code generation using local LLMs
- Direct file writing to desktop
- Task execution following scheduler
- Code quality focus
- Integration with Overseer for context

### Application Features
- Built-in code editor (Monaco Editor or CodeMirror)
- Task scheduler UI
- Chat interface with Overseer AI
- Project management dashboard
- Local LLM integration (Ollama, etc.)
- File system integration
- Project documentation viewer

## Technical Considerations

- **Desktop Application:** Native PC app, not web-based
- **Local LLMs:** Free, open-source models (Ollama, AMD Gaia, Qwen)
- **Framework:** TBD (researching Tauri, Qt, Eclipse Theia)
- **Code Editor:** Monaco Editor or CodeMirror integration
- **Future:** Mobile app possibility (way later)

## Success Criteria

- AI writes code directly to desktop files smoothly
- Overseer maintains accurate project context
- Task scheduler helps organize and track work
- Local LLMs provide good code generation quality
- User experience is smoother than existing tools
- Application is responsive and reliable

