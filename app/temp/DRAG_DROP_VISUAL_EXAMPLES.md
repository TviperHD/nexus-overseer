# Drag and Drop Visual Examples

**Purpose:** Visual examples to confirm understanding of drag-and-drop behavior

---

## Example 1: Dragging Tab to Top of Panel

**Initial State:**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Editor] [Chat]           │  ← Tab bar
├─────────────────────────────────────────┤
│                                         │
│         Editor Panel                    │
│         (main.ts)                       │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**User drags "Chat" tab upward:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Editor]                   │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════╗   │  ← Blue drop zone
│ ║     DROP ZONE (TOP)              ║   │     (fits within panel)
│ ║     Chat will go here            ║   │     (exact size shown)
│ ╚═══════════════════════════════════╝   │
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
│                                         │
└─────────────────────────────────────────┘
```

**After Drop:**
```
┌─────────────────────────────────────────┐
│  [Chat]                                 │  ← New tab group (top)
├─────────────────────────────────────────┤
│         Chat Panel                      │
│         (messages)                       │
├─────────────────────────────────────────┤
│  [File Tree] [Editor]                   │  ← Original tab group (bottom)
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
└─────────────────────────────────────────┘
```

---

## Example 2: Dragging Tab to Right of Panel

**Initial State:**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Editor]                   │
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
│                                         │
└─────────────────────────────────────────┘
```

**User drags "File Tree" tab to right edge:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [Editor]                               │
├──────────────┬──────────────────────────┤
│              │ ╔════════════════════╗  │
│  Editor      │ ║ DROP ZONE (RIGHT)  ║  │  ← Blue drop zone
│  Panel       │ ║ File Tree goes here ║  │     (fits within panel)
│  (main.ts)   │ ╚════════════════════╝  │     (exact size shown)
│              │                          │
└──────────────┴──────────────────────────┘
```

**After Drop:**
```
┌─────────────────────────────────────────┐
│  [Editor]          │  [File Tree]       │
├────────────────────┼────────────────────┤
│                    │                    │
│  Editor Panel      │  File Tree Panel   │
│  (main.ts)         │  (directory tree)  │
│                    │                    │
└────────────────────┴────────────────────┘
```

---

## Example 3: Dragging Tab to Bottom of Panel

**Initial State:**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Editor]                   │
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
│                                         │
└─────────────────────────────────────────┘
```

**User drags "Chat" tab to bottom edge:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Editor]                   │
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
│                                         │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════╗   │  ← Blue drop zone
│ ║     DROP ZONE (BOTTOM)            ║   │     (fits within panel)
│ ║     Chat will go here             ║   │     (exact size shown)
│ ╚═══════════════════════════════════╝   │
└─────────────────────────────────────────┘
```

**After Drop:**
```
┌─────────────────────────────────────────┐
│  [File Tree] [Editor]                   │
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
├─────────────────────────────────────────┤
│  [Chat]                                 │  ← New tab group (bottom)
├─────────────────────────────────────────┤
│         Chat Panel                      │
│         (messages)                       │
└─────────────────────────────────────────┘
```

---

## Example 4: Dragging Tab to Left of Panel

**Initial State:**
```
┌─────────────────────────────────────────┐
│  [Editor] [Chat]                       │
├─────────────────────────────────────────┤
│         Editor Panel                    │
│         (main.ts)                       │
│                                         │
└─────────────────────────────────────────┘
```

**User drags "Chat" tab to left edge:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [Editor]                               │
├──────────────┬──────────────────────────┤
│ ╔═══════════╗ │                         │
│ ║ DROP ZONE ║ │  Editor Panel          │  ← Blue drop zone
│ ║  (LEFT)   ║ │  (main.ts)             │     (fits within panel)
│ ║ Chat here ║ │                         │     (exact size shown)
│ ╚═══════════╝ │                         │
└──────────────┴──────────────────────────┘
```

**After Drop:**
```
┌─────────────────────────────────────────┐
│  [Chat]          │  [Editor]           │
├──────────────────┼─────────────────────┤
│                  │                     │
│  Chat Panel      │  Editor Panel        │
│  (messages)      │  (main.ts)           │
│                  │                     │
└──────────────────┴─────────────────────┘
```

---

## Example 5: Adding Third Panel Between Two Existing Panels

**Initial State (Two Panels Side by Side):**
```
┌─────────────────────────────────────────┐
│  [File Tree]    │  [Editor]            │
├─────────────────┼───────────────────────┤
│                 │                       │
│  File Tree      │  Editor Panel         │
│  Panel          │  (main.ts)             │
│                 │                       │
└─────────────────┴───────────────────────┘
```

**User drags "Chat" tab to right edge of File Tree panel:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [File Tree]    │  [Editor]            │
├─────────────────┼───────────────────────┤
│                 │                       │
│  File Tree      │ ╔═══════════════════╗ │
│  Panel          │ ║ DROP ZONE (RIGHT)  ║ │  ← Blue drop zone
│                 │ ║ Chat goes here     ║ │     (fits between)
│                 │ ╚═══════════════════╝ │     (inserts here)
│                 │  Editor Panel         │
│                 │  (main.ts)             │
└─────────────────┴───────────────────────┘
```

**After Drop (Three Panels):**
```
┌─────────────────────────────────────────┐
│  [File Tree] │ [Chat] │ [Editor]       │
├──────────────┼─────────┼─────────────────┤
│              │         │                 │
│  File Tree   │  Chat   │  Editor Panel   │
│  Panel       │  Panel  │  (main.ts)       │
│              │         │                 │
└──────────────┴─────────┴─────────────────┘
```

---

## Example 6: Adding Panel Above/Below Existing Horizontal Split

**Initial State (Two Panels Stacked):**
```
┌─────────────────────────────────────────┐
│  [File Tree]                            │
├─────────────────────────────────────────┤
│  File Tree Panel                        │
├─────────────────────────────────────────┤
│  [Editor]                               │
├─────────────────────────────────────────┤
│  Editor Panel                           │
│  (main.ts)                              │
└─────────────────────────────────────────┘
```

**User drags "Chat" tab to top edge of Editor panel:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [File Tree]                            │
├─────────────────────────────────────────┤
│  File Tree Panel                        │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════╗   │
│ ║     DROP ZONE (TOP)              ║   │  ← Blue drop zone
│ ║     Chat goes here               ║   │     (fits between)
│ ╚═══════════════════════════════════╝   │     (inserts here)
├─────────────────────────────────────────┤
│  [Editor]                               │
├─────────────────────────────────────────┤
│  Editor Panel                           │
│  (main.ts)                              │
└─────────────────────────────────────────┘
```

**After Drop (Three Panels Stacked):**
```
┌─────────────────────────────────────────┐
│  [File Tree]                            │
├─────────────────────────────────────────┤
│  File Tree Panel                        │
├─────────────────────────────────────────┤
│  [Chat]                                 │
├─────────────────────────────────────────┤
│  Chat Panel                             │
├─────────────────────────────────────────┤
│  [Editor]                               │
├─────────────────────────────────────────┤
│  Editor Panel                           │
│  (main.ts)                              │
└─────────────────────────────────────────┘
```

---

## Example 7: Complex Layout - Adding Panel to Nested Structure

**Initial State (Complex Layout):**
```
┌─────────────────────────────────────────┐
│  [File Tree] │  [Editor]                │
├──────────────┼───────────────────────────┤
│              │  [Chat]                   │
│  File Tree   ├───────────────────────────┤
│  Panel       │  Chat Panel               │
│              │                           │
│              │  [Tasks]                  │
│              ├───────────────────────────┤
│              │  Tasks Panel              │
└──────────────┴───────────────────────────┘
```

**User drags "Settings" tab to right edge of Editor panel:**

**During Drag (Drop Zone Visible):**
```
┌─────────────────────────────────────────┐
│  [File Tree] │  [Editor]                │
├──────────────┼───────────────────────────┤
│              │ ╔═══════════════════════╗│
│  File Tree   │ ║ DROP ZONE (RIGHT)     ║│  ← Blue drop zone
│  Panel       │ ║ Settings goes here    ║│     (fits in space)
│              │ ╚═══════════════════════╝│     (creates new split)
│              │  [Chat]                   │
│              ├───────────────────────────┤
│              │  Chat Panel               │
│              │                           │
│              │  [Tasks]                  │
│              ├───────────────────────────┤
│              │  Tasks Panel              │
└──────────────┴───────────────────────────┘
```

**After Drop (Settings Panel Added):**
```
┌─────────────────────────────────────────┐
│  [File Tree] │ [Editor] │ [Settings]    │
├──────────────┼───────────┼───────────────┤
│              │           │               │
│  File Tree   │  Editor   │  Settings     │
│  Panel       │  Panel    │  Panel        │
│              │           │               │
│              │  [Chat]   │               │
│              ├───────────┤               │
│              │  Chat     │               │
│              │  Panel    │               │
│              │           │               │
│              │  [Tasks]  │               │
│              ├───────────┤               │
│              │  Tasks    │               │
│              │  Panel    │               │
└──────────────┴───────────┴───────────────┘
```

---

## Key Behaviors

### 1. Drop Zone Indicators
- **Blue highlighted border/box** showing exact drop location
- **Fits within the target panel's boundaries** (doesn't overflow)
- **Shows exact size** the new panel will be
- **Arrow indicators** pointing to drop location
- **Snaps to edges** when within 20px

### 2. Drop Zone Locations
- **Top Edge:** Creates horizontal split, new panel above
- **Right Edge:** Creates vertical split, new panel to the right
- **Bottom Edge:** Creates horizontal split, new panel below
- **Left Edge:** Creates vertical split, new panel to the left
- **Tab Bar:** Adds to existing tab group (no split)

### 3. Visual Feedback
- Drop zone appears **only when dragging**
- Drop zone **highlights when cursor hovers** over it
- Drop zone **shows exact dimensions** (not just a line)
- **Semi-transparent preview** of dragged tab/panel follows cursor

### 4. Panel Fitting
- New panel **fits exactly within the drop zone box**
- Drop zone **respects panel boundaries** (doesn't go outside)
- Drop zone **shows proportional size** (e.g., 50/50 split, 30/70 split)
- **Smooth animation** when panel is created

### 5. Multiple Panels Behavior
- **Inserting between panels:** Drop zone shows where new panel will be inserted
- **Splitting existing panel:** Drop zone shows new split will be created
- **Nested splits:** Can create complex nested panel structures
- **Panel groups:** New panels can be added to existing tab groups or create new ones
- **Proportional sizing:** New panels take proportional space (default 50/50 or based on existing sizes)

---

## Is this correct?

Please confirm if this matches what you're describing:
- ✅ Drop zones appear as **blue boxes** that fit within the target panel
- ✅ Drop zones show **exact size** where the panel will be placed
- ✅ Can drop to **top, right, bottom, or left** of any panel
- ✅ Drop zones **snap to edges** when near
- ✅ Visual feedback shows **exact placement** before dropping

If this is correct, I'll create a comprehensive checklist with proper implementation details!

