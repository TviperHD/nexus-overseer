# AI Session Start Prompt

**Copy and paste this prompt at the beginning of each new AI coding session.**

---

## Session Start Instructions

You are helping implement **Nexus Overseer**, a **PC desktop application** built with **Tauri (Rust + TypeScript/React)**.

**⚠️ CRITICAL: Rules Activation**

**All rules in `.cursor/rules/` are NOW ACTIVE for this session.** You MUST:
- ✅ Read and follow ALL rules in `.cursor/rules/` folder
- ✅ Apply code standards, workflow rules, and implementation guidelines
- ✅ Follow task completion and testing requirements
- ✅ These rules apply because you're working in the `@app` folder

### ⚠️ CRITICAL: Working Directory Restriction

**YOU MUST ONLY WORK IN THE `app/` FOLDER.**

- ✅ **DO** create, modify, and work with files inside `app/` folder only
- ✅ **DO** read documentation from parent folders (`../03-planning/`, etc.) for reference
- ❌ **DO NOT** create, modify, or edit files outside the `app/` folder
- ❌ **DO NOT** modify planning documents (`../03-planning/`, `../02-research/`, etc.)
- ❌ **DO NOT** modify project-level documentation (`../README.md`, etc.)

**Your workspace is:** `app/` folder only. All implementation work happens here.

### Project Context

This is a complex desktop application with **11 fully-specified systems** ready for implementation. The application features:
- **Dual-AI system** (Overseer AI + Implementation AI)
- **Task scheduler** with integrated checklist UI
- **Local LLM integration** (Ollama)
- **Monaco Editor** for code editing
- **Advanced resizable panels** with tab system
- **Multi-window support**
- **Chat interface** with history sidebar

### Before You Start

**⚠️ STEP 0: Create Session Overview Document (DO THIS FIRST)**
- **CRITICAL:** IMMEDIATELY upon session start, create a new session overview document
- Use template: `session-overviews/SESSION_OVERVIEW_TEMPLATE.md`
- **File naming:** `session-overviews/[CHECKLIST_NAME].md` - Use the SAME name as the checklist being worked on
  - Example: If checklist is `tab-system.md`, overview should be `tab-system.md`
- Fill in checklist name and focus
- **This document is a LIVING DOCUMENT** - update it continuously as you work, not just at the end
- You'll fill in tasks/focus after reading project overview below

**1. Read the Project Overview:**
- `app/README.md` - Implementation folder overview, structure, and technology stack
- `../README.md` - Project status and overview
- After reading, update session overview with current tasks and focus

**2. Review the Cursor Rules (CRITICAL - You MUST follow these):**
- `.cursor/rules/code-standards.mdc` - TypeScript/React/Rust naming conventions, code organization
- `.cursor/rules/implementation-workflow.mdc` - Implementation workflow, task completion, testing
- `.cursor/rules/README.md` - Rules overview

**⚠️ IMPORTANT:** All rules in `.cursor/rules/` apply to this session. Read and follow them strictly.

**⚠️ STEP 3: Get Session Checklist (CRITICAL)**
- **CRITICAL:** Check if user has provided a session checklist
- **Location:** `app/checklists/NEXT_SESSION_CHECKLIST.md` (or similar)
- **If checklist is empty/template:** ASK the user to provide the session checklist before continuing
- **If checklist has content:** Read it thoroughly to understand session goals and tasks
- **DO NOT proceed with implementation** until you have a clear session checklist
- Update session overview with checklist information

**3. Review Current Tasks:**
- Review the current checklist to understand what tasks need to be done
- Check `../03-planning/implementation-roadmap.md` for reference (not prescriptive)
- Update session overview with task/focus information

**4. Read Technical Specifications:**
- Before implementing ANY system, read its technical spec: `../03-planning/technical-specs-[system].md`
- See `../03-planning/technical-specs-index.md` for complete list
- **Technical specifications are implementation-ready** - they contain all details needed

**5. Session Overview Management:**
- **Update this document continuously throughout the session** - add entries to "Detailed History" as you work
- Document all tasks, file changes, issues, and solutions in real-time
- Note any deviations from checklists and reasons immediately
- Add workflow recommendations and discussion points as they arise
- Update "Next Steps" section at the end of the session

**⚠️ CRITICAL: Real-Time Checklist Updates**
- **Update checklist items immediately upon completion** - do NOT wait until the end of the session
- **Update checklists continuously as work progresses** - not just at major milestones
- **Do NOT defer checklist updates** - mark items complete as soon as they're verified
- **Keep checklists synchronized with actual work progress** - update both session overview AND checklists when making changes

### Session Overview Management

**⚠️ CRITICAL: Session Overview Requirements**

**At Session Start:**
1. ✅ Create new session overview file using template (same name as checklist)
2. ✅ Fill in checklist name and initial focus

**During Session:**
1. ✅ **Continuously update** the "Detailed History" section as you work
2. ✅ **Immediately update checklist items** when tasks are completed (do NOT wait until end)
3. ✅ Document each significant task/change with timestamp
4. ✅ Note files created/modified
5. ✅ Record issues encountered and solutions
6. ✅ Add checklist deviations as they occur (don't wait until end)
7. ✅ Add workflow recommendations as you notice them
8. ✅ Add questions/discussion points as they arise

**At Session End:**
1. ✅ Fill in session end time and duration
2. ✅ Complete "Quick Overview" summary
3. ✅ Finalize "Next Steps" section
4. ✅ Update session metrics
5. ✅ Add any final notes or observations
6. ✅ **Reference `AI_SESSION_END.md` for complete end-of-session checklist**

**What to Document:**
- Every significant task completed
- All files created or modified (with brief description)
- Issues encountered and how they were resolved
- Deviations from checklists (what was different and why)
- Workflow issues or improvements noticed
- Questions for the user
- Topics worth discussing
- Next steps and blockers

**Template Location:** `session-overviews/SESSION_OVERVIEW_TEMPLATE.md`
**Naming:** Session overview should have the SAME filename as the checklist (e.g., if checklist is `tab-system.md`, overview is `tab-system.md`)

### Critical Rules

**ALWAYS:**
- ✅ **ONLY work in the `app/` folder** - Never modify files outside this folder
- ✅ Read technical specifications before implementing
- ✅ Follow naming conventions (see `code-standards.mdc`)
- ✅ Use TypeScript types for ALL variables and functions
- ✅ Use Tailwind CSS for styling (see `../04-design/visual-design-system.md`)
- ✅ Make components modular and reusable
- ✅ Handle errors properly (try/catch, Result<T, E>)
- ✅ Document code (JSDoc comments, Rust doc comments)
- ✅ Test before marking complete
- ✅ Follow React best practices (hooks, functional components)
- ✅ Follow Rust best practices (ownership, error handling)

**NEVER:**
- ❌ **Work outside the `app/` folder** - This is your ONLY workspace
- ❌ Hardcode values (use config files or constants)
- ❌ Create god objects
- ❌ Skip error handling
- ❌ Ignore type safety
- ❌ Violate naming conventions
- ❌ Create circular dependencies
- ❌ Skip documentation
- ❌ Implement without checking specs
- ❌ Skip testing

### Implementation Workflow

For each system you implement:

1. **Read** the technical specification (`../03-planning/technical-specs-[system].md`)
2. **Check** the implementation roadmap (`../03-planning/implementation-roadmap.md`)
3. **Review** related systems (check dependencies)
4. **Follow** naming conventions (see `code-standards.mdc`)
5. **Use** TypeScript types and Rust types properly
6. **Make** it modular and configurable
7. **Handle** errors (try/catch, Result<T, E>)
8. **Document** code (JSDoc, Rust doc comments)
9. **Test** thoroughly (unit + integration)
10. **Verify** performance and responsiveness
11. **Update** session overview and checklists

### Project Structure

**STRICTLY follow this structure:**
```
app/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # React components
│   │   ├── Editor/       # Code editor components
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
│   │   ├── commands.rs   # Tauri IPC command handlers
│   │   ├── filesystem.rs # File system operations
│   │   ├── llm.rs        # LLM integration
│   │   ├── ai/           # AI system modules
│   │   ├── scheduler.rs  # Task scheduler
│   │   ├── project.rs    # Project management
│   │   └── windows.rs    # Window management
│   └── Cargo.toml        # Rust dependencies
├── assets/                # Static assets (icons, images, etc.)
├── checklists/            # Implementation checklists
├── session-overviews/      # Session documentation
└── .cursor/              # Cursor AI rules
    └── rules/            # Implementation rules
```

### Key Documentation Locations

- **Project Overview:** `app/README.md`
- **Technical Specs:** `../03-planning/technical-specs-*.md`
- **Spec Index:** `../03-planning/technical-specs-index.md`
- **Implementation Roadmap:** `../03-planning/implementation-roadmap.md`
- **Session Checklist:** `app/checklists/NEXT_SESSION_CHECKLIST.md` - **⚠️ User provides this at session start**
- **Cursor Rules:** `.cursor/rules/*.mdc`
- **Visual Design System:** `../04-design/visual-design-system.md`
- **UI Design Documents:** `../04-design/ui-*.md`

### System Dependencies

**Foundation Layer (must be first):**
- File System Integration
- Basic Tab System
- State Management (Zustand)

**Key Features to Implement (Task-Based):**
- Project Setup tasks
- Core Foundation (File System, Tab System, Monaco Editor, LLM Integration, Task Scheduler, Dual-AI)
- Core Features (Project Management, Chat Interface, Resizable Panels)
- UI Enhancement (Advanced Panels, Multi-Window, State Management)
- Polish (Configuration System, Settings UI)

**Note (2025-12-30):** We use a task-based approach - checklists are created as needed, not following rigid phases.

### When Asked to Implement Something

1. **Confirm** you've read the relevant technical specification
2. **Check** dependencies are already implemented
3. **Follow** the implementation roadmap for that system
4. **Implement** according to the spec (it's comprehensive and implementation-ready)
5. **Test** as you go
6. **Document** your code

### Code Examples

**Good Code (TypeScript/React):**
```typescript
/**
 * Chat interface component for interacting with Overseer AI.
 * Displays message history and handles user input.
 */
interface ChatInterfaceProps {
  projectId: string;
  onSendMessage: (message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  projectId, 
  onSendMessage 
}) => {
  const { messages, isStreaming } = useChatStore();
  
  const handleSend = async (content: string) => {
    try {
      await onSendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-panel">
      {/* Component content */}
    </div>
  );
};
```

**Good Code (Rust):**
```rust
/// Reads a file from the file system.
/// 
/// # Arguments
/// * `path` - The file path to read
/// 
/// # Returns
/// * `Ok(String)` - File contents on success
/// * `Err(String)` - Error message on failure
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

**Bad Code:**
```typescript
// No types, no documentation, no error handling
export const Chat = ({ id, onSend }) => {
  const msgs = useStore();
  return <div>{msgs.map(m => m.text)}</div>;
};
```

### Questions to Ask

If you're unsure about something:
1. Check the technical specification first
2. Check the implementation roadmap
3. Check the Cursor rules
4. Check `app/README.md`
5. Then ask the user for clarification

### Remember

- **Technical specifications are comprehensive** - they contain all implementation details
- **Follow the implementation roadmap** - it's a reference for features (not prescriptive phases)
- **Maintain modularity** - systems must work independently
- **Keep it configurable** - use configuration files and constants
- **Test everything** - individual functions + integration
- **Document as you go** - don't leave it for later
- **Use Tailwind CSS** - for all styling (see visual design system)
- **Follow visual design system** - for consistent UI

---

**Ready to start? Check the current checklist to see what tasks need to be done next.**

