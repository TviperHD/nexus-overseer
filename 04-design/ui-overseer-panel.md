# UI Design: Overseer Panel

**Created:** 2024-12-28  
**Status:** Design Document

## Overview

The Overseer Panel provides a dedicated interface for interacting with the Overseer AI. While similar to the Chat Interface, it is specifically designed for the Overseer AI and includes Overseer-specific information, context, and features. This panel serves as the primary communication channel with the Overseer AI for project management, task creation, and high-level project guidance.

## UI Components

### 1. OverseerPanel

**Location:** Resizable panel (can be detached to separate window)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Overseer AI                        [×] │
├─────────────────────────────────────────┤
│  ┌─ Context Info ─────────────────────┐ │
│  │  📊 Project Status: Active         │ │
│  │  📝 Tasks: 12 active, 3 completed │ │
│  │  📁 Files: 42 tracked             │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─ Message Area ─────────────────────┐ │
│  │                                    │ │
│  │  [AI Avatar] Overseer:             │ │
│  │  Welcome! I'm your Overseer AI.   │ │
│  │  I'll help you manage your        │ │
│  │  project and create tasks.         │ │
│  │                                    │ │
│  │  [User Avatar] User:               │ │
│  │  I want to add authentication     │ │
│  │  to my project.                   │ │
│  │                                    │ │
│  │  [AI Avatar] Overseer:             │ │
│  │  I'll help you set up             │ │
│  │  authentication. Let me create   │ │
│  │  a task set for this...           │ │
│  │                                    │ │
│  │  [User Avatar] User:               │ │
│  │  Can you break it down into       │ │
│  │  smaller tasks?                   │ │
│  │                                    │ │
│  │  [AI Avatar] Overseer:            │ │
│  │  [Streaming...]                    │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─ Input Area ───────────────────────┐ │
│  │  Type your message...              │ │
│  │                                    │ │
│  │  [Send] [Attach]                  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Message history area (scrollable)
- Context information panel (Overseer-specific)
- User input field at bottom
- Send button
- Streaming response indicator
- Message timestamps (optional)

### 2. MessageList

**Purpose:** Displays all messages in the conversation with Overseer AI.

**Features:**
- Scrollable container
- Auto-scroll to bottom on new messages
- Virtual scrolling for long conversations
- Message grouping (same sender, close timestamps)
- Loading indicator for streaming messages
- Overseer-specific message formatting

### 3. MessageItem

**Purpose:** Individual message component.

**Visual States:**
- **User Message:** Right-aligned, user avatar, user name
- **Overseer Message:** Left-aligned, Overseer avatar, "Overseer" label
- **Streaming Message:** Shows typing indicator, updates in real-time
- **Error Message:** Red border, error icon, retry button
- **Task Creation Message:** Special formatting when Overseer creates tasks
- **Context Update Message:** Special formatting when Overseer updates context

**Layout:**
```
User Message:
                    [User Avatar] User
                    I want to add authentication
                    to my project.
                    10:23 AM

Overseer Message:
[Overseer Avatar] Overseer
I'll help you set up authentication.
Let me create a task set for this...
10:23 AM

Task Creation Message:
[Overseer Avatar] Overseer
✅ Created task set: "Add Authentication"
  • Task: Create User model
  • Task: Create login endpoint
  • Task: Add password hashing
10:23 AM
```

**Interaction:**
- Click to select/copy
- Hover to show timestamp
- Right-click for context menu (copy, delete, etc.)
- Click on task links to open Task Scheduler

### 4. ContextInfoPanel

**Purpose:** Shows Overseer-specific project context information.

**Display:**
- Project status (Active, Planning, Development, etc.)
- Task statistics (active, completed, total)
- File count (tracked files)
- Recent activity summary
- Project phase/status

**Layout:**
```
📊 Project Status: Active
📝 Tasks: 12 active, 3 completed
📁 Files: 42 tracked
🕒 Last Activity: 2 hours ago
```

**Features:**
- Updates in real-time
- Collapsible (can be hidden)
- Click to expand for more details

### 5. MessageInput

**Purpose:** User input field and controls.

**Features:**
- Multi-line text input (grows with content)
- Placeholder text: "Ask the Overseer..."
- Send button (Enter to send, Shift+Enter for new line)
- Attach button (attach files, code snippets)
- Character count (optional)
- Auto-focus when panel is active

**Keyboard Shortcuts:**
- Enter: Send message
- Shift+Enter: New line
- Ctrl+Enter: Send message (alternative)

### 6. StreamingIndicator

**Purpose:** Shows when Overseer AI is generating a response.

**Visual:**
- Animated typing dots: `...`
- Or animated spinner
- Appears below last message
- Disappears when streaming completes
- Shows "Overseer is thinking..." message

## Visual Design

### Colors and Styling

**Message Bubbles:**
- User messages: Primary color (blue), right-aligned
- Overseer messages: Distinct color (purple/teal), left-aligned
- Task creation messages: Special highlight (green accent)
- Error messages: Red border, error icon

**Avatars:**
- User: User icon or initial
- Overseer: Special Overseer icon or "O" badge

**Context Info Panel:**
- Background: Subtle accent color
- Icons: Clear, recognizable
- Text: Readable, appropriate size

**Input Area:**
- Border: Subtle gray
- Focus: Blue border
- Background: White/light gray

### Typography

- Message text: Readable font, appropriate size
- Timestamps: Smaller, muted color
- User/Overseer labels: Medium weight, clear
- Context info: Smaller, organized

### Spacing

- Message padding: Comfortable spacing
- Message gap: Clear separation between messages
- Input area: Fixed at bottom, clear separation
- Context panel: Clear separation from messages

## User Interactions

### Sending a Message

1. User types in input field
2. User presses Enter (or clicks Send)
3. Message appears in chat immediately
4. Input field clears
5. Streaming indicator appears
6. Overseer response streams in real-time
7. Streaming indicator disappears when complete

### Streaming Response

1. Overseer starts generating response
2. Message appears with typing indicator
3. Text streams in character by character (or chunk by chunk)
4. User can see response as it's generated
5. When complete, indicator disappears
6. Message is finalized

### Task Creation

1. User asks Overseer to create tasks
2. Overseer responds and creates task set
3. Special message appears showing created tasks
4. Tasks are clickable links
5. Clicking task opens Task Scheduler
6. Task set appears in Task Scheduler panel

### Context Updates

1. Overseer updates project context
2. Context info panel updates automatically
3. Notification appears (optional)
4. User can see updated context

## Overseer-Specific Features

### Task Management Integration

- Overseer can create task sets from conversation
- Task creation messages show in chat
- Tasks are clickable to open in Task Scheduler
- Overseer can update task status

### Project Context Display

- Shows what Overseer knows about the project
- Updates in real-time as project changes
- Can be expanded for more details
- Shows project statistics

### Documentation Integration

- Overseer can reference project documentation
- Can update documentation from chat
- Documentation links appear in messages

### Research Integration

- Overseer can perform research
- Research results appear in chat
- Can create research notes
- Links to research documents

## Differences from Chat Interface

### Key Distinctions

1. **Purpose:** Overseer Panel is specifically for Overseer AI, not general chat
2. **Context Info:** Shows project context and statistics
3. **Task Integration:** Direct integration with task creation
4. **Project Management:** Overseer-specific project management features
5. **Labeling:** Clearly labeled as "Overseer AI" not just "Chat"

### Shared Features

- Message history
- Streaming responses
- User input
- Message formatting
- Avatars and timestamps

## Questions for Discussion

1. **Panel Name:** Should it be "Overseer Panel", "Overseer AI", or something else?
2. **Context Info:** What specific information should be shown in the context panel?
3. **Task Integration:** How should task creation messages be formatted?
4. **Documentation Links:** Should Overseer messages include links to documentation?
5. **Research Display:** How should research results be displayed in the panel?
6. **Panel Icon:** What icon should represent the Overseer panel?
7. **Message History:** Should Overseer conversation history persist across sessions?
8. **Quick Actions:** Should there be quick action buttons (Create Task, Research, etc.)?
9. **Status Indicators:** What status indicators should be shown?
10. **Integration:** How should this panel integrate with other panels (Task Scheduler, etc.)?

What are your thoughts on the Overseer Panel UI? Any changes or additions you'd like?

