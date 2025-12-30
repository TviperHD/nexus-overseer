# UI Design: Chat Interface

**Created:** 2024-12-28  
**Status:** Design Document

## Overview

The Chat Interface provides the primary way for users to interact with the Overseer AI. It displays conversation history, handles user input, shows streaming responses, and manages chat state. The interface is designed for natural conversation about project planning, task creation, and project management.

## UI Components

### 1. ChatInterfacePanel

**Location:** Resizable panel (can be detached to separate window)

**Layout (with Chat History Sidebar):**
```
┌──────────────┬─────────────────────────────────────────┐
│              │  Chat - Overseer AI                [×] │
│  ┌─────────┐ ├─────────────────────────────────────────┤
│  │ [🔍]    │ │                                         │
│  │ Search  │ │  ┌─ Message Area ─────────────────────┐ │
│  │ Chats...│ │  │                                    │ │
│  └─────────┘ │  │  [User Avatar] User:               │ │
│              │  │  I want to add authentication     │ │
│  [New Chat]  │  │  to my project.                   │ │
│              │  │                                    │ │
│  Chats       │  │  [AI Avatar] Overseer:             │ │
│  ─────────── │  │  I'll help you set up             │ │
│  ∞ Chat 1    │  │  authentication. Let me create   │ │
│     (2m)     │  │  a task set for this...           │ │
│              │  │                                    │ │
│  ∞ Chat 2    │  │  [User Avatar] User:               │ │
│     (5h)     │  │  Can you break it down into       │ │
│              │  │  smaller tasks?                   │ │
│  ∞ Chat 3    │  │                                    │ │
│     (1d)     │  │  [AI Avatar] Overseer:            │ │
│              │  │  [Streaming...]                    │ │
│  ... More    │  │                                    │ │
│  [<]         │  └────────────────────────────────────┘ │
│              │                                         │
│              │  ┌─ Input Area ───────────────────────┐ │
│              │  │  Type your message...              │ │
│              │  │                                    │ │
│              │  │  [Send] [Attach]                  │ │
│              │  └────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────┘
```

**Features:**
- Left sidebar: Chat history/prompt selection (similar to Cursor)
  - **Collapsible:** Can be collapsed/expanded with toggle button
  - Toggle button `[>]` in panel header (when collapsed) or `[<]` at bottom of sidebar (when expanded)
  - When collapsed, sidebar slides out from left edge
- Main area: Message history and input
- Search bar at top of sidebar (when expanded)
- "New Chat" button (when expanded)
- List of previous chats with timestamps (when expanded)
- Infinity symbol (∞) prefix for each chat
- Selected chat highlighted
- Message history area (scrollable)
- User input field at bottom
- Send button
- Streaming response indicator
- Message timestamps (optional)
- Context indicators

### 2. ChatHistorySidebar

**Purpose:** Left sidebar showing chat history and prompt selection (similar to Cursor). **Collapsible.**

**Layout (Expanded):**
```
┌─────────────────────────┐
│  [🔍] Search Chats...   │  ← Search input
├─────────────────────────┤
│  [New Chat]             │  ← New chat button
├─────────────────────────┤
│  Chats                  │  ← Section header
│  ─────────────────────  │
│  ∞ Chat Title 1    (2m) │  ← Chat item (selected)
│  ∞ Chat Title 2    (5h) │  ← Chat item
│  ∞ Chat Title 3    (1d) │  ← Chat item
│  ... More               │  ← Show more option
│  [<]                    │  ← Collapse button
└─────────────────────────┘
```

**Layout (Collapsed):**
- Sidebar hidden (slides behind main area)
- Toggle button `[>]` appears in panel header
- Click `[>]` to expand sidebar

**Features:**
- **Collapsible:** Can be collapsed/expanded
  - Toggle button `[<]` at bottom of sidebar (when expanded)
  - Toggle button `[>]` in panel header (when collapsed)
  - Smooth slide animation when expanding/collapsing
- **Search Input:** Search through chat history (when expanded)
- **New Chat Button:** Create a new chat session (when expanded)
- **Chat List:** List of previous chats (when expanded)
  - Infinity symbol (∞) prefix for each chat
  - Chat title (truncated if long)
  - Timestamp (relative: 2m, 5h, 1d, etc.)
  - Selected chat highlighted
- **Show More:** Expand to show more chats (when expanded)

**Chat Item States:**
- **Normal:** Background transparent, text `#cccccc`
- **Selected:** Background `#37373d`, Border Left `2px solid #007acc`
- **Hover:** Background `#2a2d2e`

**Interaction:**
- Click toggle button `[<]` or `[>]` → Collapse/expand sidebar
- Click chat item → Load that chat's messages
- Right-click → Context menu (rename, delete, duplicate)
- Search → Filter chat list in real-time

**Collapse/Expand Behavior:**
- When expanded: Sidebar visible, `[<]` button at bottom of sidebar
- When collapsed: Sidebar hidden (slides behind), `[>]` button in panel header
- Animation: Smooth slide transition (200ms ease-in-out)
- State persists: Remembers collapsed/expanded state

### 3. MessageList

**Purpose:** Displays all messages in the current conversation.

**Features:**
- Scrollable container
- Auto-scroll to bottom on new messages
- Virtual scrolling for long conversations
- Message grouping (same sender, close timestamps)
- Loading indicator for streaming messages

### 4. MessageItem

**Purpose:** Individual message component.

**Visual States:**
- **User Message:** Right-aligned, user avatar, user name
- **AI Message:** Left-aligned, AI avatar, "Overseer" label
- **Streaming Message:** Shows typing indicator, updates in real-time
- **Error Message:** Red border, error icon, retry button

**Layout:**
```
User Message:
                    [User Avatar] User
                    I want to add authentication
                    to my project.
                    10:23 AM

AI Message:
[AI Avatar] Overseer
I'll help you set up authentication.
Let me create a task set for this...
10:23 AM

Streaming Message:
[AI Avatar] Overseer
I'll help you set up authentication.
Let me create a task set for this...
[typing indicator...]
```

**Interaction:**
- Click to select/copy
- Hover to show timestamp
- Right-click for context menu (copy, delete, etc.)

### 5. MessageInput

**Purpose:** User input field and controls.

**Features:**
- Multi-line text input (grows with content)
- Placeholder text: "Type your message..."
- Send button (Enter to send, Shift+Enter for new line)
- Attach button (attach files, code snippets)
- Character count (optional)
- Auto-focus when panel is active

**Keyboard Shortcuts:**
- Enter: Send message
- Shift+Enter: New line
- Ctrl+Enter: Send message (alternative)

### 6. StreamingIndicator

**Purpose:** Shows when AI is generating a response.

**Visual:**
- Animated typing dots: `...`
- Or animated spinner
- Appears below last message
- Disappears when streaming completes

## Visual Design

**See `visual-design-system.md` for complete styling guidelines.**

### Colors and Styling

**Message Bubbles:**
- User messages: Background `#0e639c` (Blue), Text `#ffffff`, right-aligned, border radius `8px 8px 2px 8px`
- AI messages: Background `#2d2d30` (Dark gray), Text `#cccccc`, left-aligned, border radius `8px 8px 8px 2px`
- Error messages: Border `1px solid #f48771` (Soft red), error icon

**Avatars:**
- User: User icon or initial, `#4fc1ff` (Light blue)
- AI: Bot icon or "O" for Overseer, `#858585` (Muted)

**Chat History Sidebar:**
- Background: `#2d2d30` (Darker sidebar)
- Width: `240px` (Fixed, resizable)
- Border Right: `1px solid #3e3e42` (Divider)
- Collapsed: Hidden (slides behind main area)
- Toggle Button: Icon button style, `24px × 24px`, `#858585` (Muted)
- Toggle Button Hover: `#cccccc` (Lighter)
- Search Input: Background `#3c3c3c`, Border `1px solid #3e3e42`, Text `#cccccc`
- New Chat Button: Primary button style (`#0e639c` background)
- Chat Item: Height `32px`, Padding `8px 12px`
- Selected Chat: Background `#37373d`, Border Left `2px solid #007acc`
- Chat Item Hover: Background `#2a2d2e`
- Timestamp: `11px`, `#6a6a6a` (Muted, right-aligned)
- Animation: Slide transition `200ms ease-in-out`

**Input Area:**
- Background: `#252526` (Panel background)
- Border Top: `1px solid #3e3e42` (Subtle divider)
- Input Field: Background `#3c3c3c`, Border `1px solid #3e3e42`, Text `#cccccc`
- Focus: Border `#007acc` (Blue accent)
- Send Button: Primary button style (`#0e639c` background)

### Typography

- Message text: `13px`, `#cccccc` (User) / `#cccccc` (AI)
- Timestamps: `11px`, `#6a6a6a` (Very muted)
- User/AI labels: `13px`, Medium weight (`500`)

### Spacing

- Message padding: `8px 12px` (Compact, slim)
- Message gap: `12px` (Clear separation)
- Input area: Fixed at bottom, `8px` padding

## User Interactions

### Selecting a Chat

1. User clicks on chat item in sidebar
2. Chat becomes selected (highlighted)
3. Message area loads that chat's messages
4. Chat title updates in header
5. Input area is ready for new messages

### Creating a New Chat

1. User clicks "New Chat" button
2. New chat is created in sidebar
3. Chat is automatically selected
4. Message area clears (or shows welcome message)
5. Input area is ready for first message

### Collapsing/Expanding Sidebar

1. User clicks toggle button `[<]` (at bottom of sidebar) or `[>]` (in header)
2. Sidebar slides out/in with smooth animation
3. Toggle button position updates
4. State is saved (remembers preference)

### Searching Chats

1. User types in search input (when sidebar expanded)
2. Chat list filters in real-time
3. Only matching chats are shown
4. Clear search to show all chats again

### Sending a Message

1. User types in input field
2. User presses Enter (or clicks Send)
3. Message appears in chat immediately
4. Input field clears
5. Streaming indicator appears
6. AI response streams in real-time
7. Streaming indicator disappears when complete
8. Chat is saved to history (if new, appears in sidebar)

### Streaming Response

1. AI starts generating response
2. Message appears with typing indicator
3. Text streams in character by character (or chunk by chunk)
4. User can see response as it's generated
5. When complete, indicator disappears
6. Message is finalized
7. Chat is saved to history

### Message Actions

- **Copy:** Right-click → Copy message
- **Delete:** Right-click → Delete message (user messages only)
- **Retry:** If error, show retry button
- **Edit:** Edit user message (before AI responds)

## Context Display

### Project Context Indicator

**Purpose:** Show what project context is being used.

**Display:**
- Small badge/indicator at top of chat
- Shows current project name
- Click to view/edit context
- Updates when project changes

### Context Summary

**Purpose:** Show what information Overseer AI has access to.

**Display:**
- Collapsible section at top
- Shows: Project files, documentation, task sets
- Can be expanded to see details
- Updates as project changes

## Questions for Discussion

1. **Message History:** Should we persist chat history across sessions?
2. **Message Search:** Should users be able to search past messages?
3. **Message Export:** Should users be able to export conversations?
4. **Context Display:** How much context info should be visible?
5. **Attachments:** What types of attachments should be supported?
6. **Voice Input:** Should we support voice input (future feature)?
7. **Message Formatting:** Should we support markdown in messages?
8. **Code Blocks:** How should code blocks be displayed and formatted?

What are your thoughts on the Chat Interface UI? Any changes or additions you'd like?

