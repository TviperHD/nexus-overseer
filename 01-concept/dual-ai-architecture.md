# Dual-AI Architecture Discussion

**Created:** 2024-12-28  
**Status:** Discussion Document - Needs Refinement

## Overview

This document explores the dual-AI system architecture for Nexus Overseer. This is a key concept that needs discussion and refinement before implementation.

## Core Concept

Two AI agents work together:
1. **Overseer AI** - Project manager, researcher, documenter
2. **Implementation AI** - Code generator, file writer

## Questions to Explore

### 1. How Do the AIs Communicate?

**Option A: Direct Communication**
- Implementation AI directly queries Overseer AI
- Overseer AI responds with context/guidance
- Pros: Simple, direct
- Cons: May be inefficient, circular dependencies

**Option B: Shared State/Database**
- Both AIs read/write to shared project state
- Task scheduler is the shared state
- Project documentation is shared state
- Pros: Clear separation, no direct coupling
- Cons: Need to design state management

**Option C: User as Mediator**
- User talks to Overseer, Overseer updates tasks
- User (or system) triggers Implementation AI
- Implementation AI reads tasks, executes, reports back
- Pros: Clear workflow, user in control
- Cons: May be less automated

**Current Thinking:** Option B (Shared State) seems best - Task scheduler and project docs are the shared state.

---

### 2. What Does the Task Scheduler Look Like?

**Key Questions:**
- Is it a simple list of tasks?
- Does it have dependencies between tasks?
- Does it track progress/completion?
- Can tasks be prioritized?
- Can tasks be broken down into subtasks?

**Initial Ideas:**
- Task has: ID, description, status, priority, dependencies, assigned AI, context
- Overseer creates/updates tasks
- Implementation AI reads next task, executes, marks complete
- User can view/edit tasks

**Needs Discussion:**
- How detailed should tasks be?
- Should tasks be automatically created or user-approved?
- How does task breakdown work?

---

### 3. When Does Overseer AI Activate?

**Scenarios:**
1. **Project Creation:** User talks to Overseer, Overseer researches and creates initial tasks
2. **User Requests:** User asks for feature, Overseer plans it, creates tasks
3. **Implementation Feedback:** Implementation AI reports issues, Overseer reviews and adjusts
4. **Periodic Review:** Overseer periodically reviews project state and updates tasks/docs

**Questions:**
- Should Overseer be proactive or reactive?
- How often should Overseer review the project?
- Should Overseer interrupt Implementation AI?

---

### 4. How Does Implementation AI Work?

**Workflow Ideas:**
1. Reads next task from scheduler
2. Gets context from Overseer (project docs, related files)
3. Generates code using local LLM
4. Writes code to files
5. Reports completion/status
6. Moves to next task

**Questions:**
- Should Implementation AI ask Overseer for clarification?
- What if Implementation AI can't complete a task?
- Should Implementation AI review its own code before writing?

---

### 5. Project Knowledge Management

**How does Overseer maintain project knowledge?**

**Option A: Vector Database**
- Store project files, docs, conversations in vector DB
- Overseer queries vector DB for context
- Pros: Semantic search, good for large projects
- Cons: More complex, need to manage embeddings

**Option B: Structured Documentation**
- Overseer maintains structured markdown docs
- Project overview, architecture, decisions, etc.
- Pros: Human-readable, simple
- Cons: May not scale to very large projects

**Option C: Hybrid**
- Structured docs for high-level info
- Vector DB for code/file search
- Pros: Best of both
- Cons: More complex

**Current Thinking:** Start with Option B (structured docs), add Option C later if needed.

---

### 6. User Interaction Model

**How does the user interact with the system?**

**Overseer Interaction:**
- Chat interface with Overseer
- User asks questions, requests features
- Overseer responds, creates tasks, updates docs
- User can review/approve tasks

**Implementation Interaction:**
- User can trigger Implementation AI
- User can view Implementation AI progress
- User can review code before/after writing
- User can provide feedback

**Questions:**
- Should user approve every task?
- Should user review every code change?
- How much automation vs. user control?

---

## Proposed Architecture (Initial)

```
┌─────────────────────────────────────────┐
│         Nexus Overseer App              │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Overseer   │  │Implementation│   │
│  │     AI       │  │     AI       │   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                 │            │
│         └────────┬────────┘            │
│                  │                      │
│         ┌────────▼────────┐            │
│         │  Shared State   │            │
│         │                 │            │
│         │ - Task Scheduler│            │
│         │ - Project Docs │            │
│         │ - Project State│            │
│         └─────────────────┘            │
│                  │                      │
│         ┌────────▼────────┐            │
│         │  Local LLM API  │            │
│         │    (Ollama)     │            │
│         └─────────────────┘            │
└─────────────────────────────────────────┘
```

## Key Design Principles

1. **Separation of Concerns:** Overseer plans, Implementation executes
2. **Shared State:** Task scheduler and docs are the integration point
3. **User Control:** User can interact with both, review everything
4. **Local First:** Everything runs locally, no cloud dependencies
5. **Incremental:** Start simple, add complexity as needed

## Next Steps for Discussion

1. ✅ Document initial architecture ideas (this document)
2. ⏳ Discuss task scheduler design in detail
3. ⏳ Discuss communication patterns between AIs
4. ⏳ Design project knowledge management
5. ⏳ Create technical specifications

## Notes

- This is a discussion document - nothing is final yet
- Architecture will evolve as we discuss and research
- Start simple, add complexity only when needed
- Focus on making it work smoothly for the user

