# UI Design: Settings

**Created:** 2024-12-28  
**Status:** Design Document

## Overview

The Settings UI provides interfaces for configuring application settings, project-specific settings, and LLM model configuration. The interface follows a Godot-style layout with top-level tabs, a left navigation sidebar with hierarchical categories, and a right content pane showing the actual settings.

## UI Components

### 1. SettingsPanel

**Location:** Modal dialog or resizable panel (can be detached to separate window)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Settings                                           [×] │
├─────────────────────────────────────────────────────────┤
│  [App Settings] [Project] [LLM]                        │
├─────────────────────────────────────────────────────────┤
│  [Filter Settings...]                                   │
├──────────────┬──────────────────────────────────────────┤
│              │                                            │
│  Application │  Name: [Nexus Overseer]                   │
│    Config    │  Version: [1.0.0]                        │
│    Editor    │  Auto-save files: [☑]                    │
│    General   │  Show hidden files: [☑]                 │
│              │  File watcher: [☑]                       │
│  Appearance  │                                          │
│    Theme     │  Theme: [Dark ▼]                         │
│    Font      │  Font Size: [14] px                      │
│              │  Language: [English ▼]                  │
│  Editor      │                                          │
│    Font      │  Font Family: [Fira Code ▼]             │
│    Display   │  Font Size: [14] px                      │
│    Behavior  │  Tab Size: [2] spaces                    │
│              │  Word Wrap: [☑] Enabled                  │
│  Panel       │  Minimap: [☑] Enabled                   │
│    Layout    │                                          │
│              │  Line Numbers: [On ▼]                    │
│  LLM         │                                          │
│    Models    │  Default Layout: [Custom ▼]              │
│    Connection│  Auto-save Layout: [☑]                  │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

**Features:**
- Top-level tabs (App Settings, Project, LLM)
- Filter/search bar
- Left navigation sidebar (hierarchical categories)
- Right content pane (actual settings)
- Save/Cancel buttons at bottom

### 2. SettingsTabs

**Purpose:** Top-level tab navigation for major settings categories.

**Tabs:**
- **App Settings:** Application-wide settings
- **Project:** Project-specific settings (only visible if project is open)
- **LLM:** LLM model configuration

**Features:**
- Click tab to switch major category
- Active tab highlighted
- Project tab only visible if project is open

### 3. SettingsFilter

**Purpose:** Search/filter settings.

**Features:**
- Search box below tabs
- Real-time filtering
- Highlights matching categories/settings
- Keyboard shortcut (Ctrl+F)

**Display:**
```
[Filter Settings...]
```

### 4. SettingsNavigation

**Purpose:** Left sidebar with hierarchical category navigation.

**Structure:**
- Categories and subcategories in tree format
- Expandable/collapsible categories
- Click category to show its settings in right pane
- Selected category highlighted
- Indentation for subcategories

**Visual States:**
- **Category (Collapsed):** `▶ Category Name`
- **Category (Expanded):** `▼ Category Name`
- **Subcategory:** `  Subcategory Name` (indented)
- **Selected:** Highlighted background

### 5. SettingsContent

**Purpose:** Right pane displaying settings for selected category.

**Features:**
- Shows all settings for selected category/subcategory
- Form elements (inputs, dropdowns, checkboxes, sliders)
- Section headers for grouping
- Help text/tooltips (optional)
- Scrollable if content is long

## Settings Structure

### App Settings Tab

**Left Navigation:**
```
Application
  Config
  Editor
  General
Appearance
  Theme
  Font
Editor
  Font
  Display
  Behavior
Panel
  Layout
LLM
  Models
  Connection
```

**Settings by Category:**

**Application > Config:**
- Application Name
- Version
- Auto-save files (checkbox)
- Show hidden files (checkbox)
- File watcher enabled (checkbox)

**Application > Editor:**
- Default editor settings
- Editor behavior options

**Application > General:**
- General application preferences

**Appearance > Theme:**
- Theme (Dark, Light, System)
- Theme customization options

**Appearance > Font:**
- UI Font Size
- UI Font Family

**Editor > Font:**
- Editor Font Family
- Editor Font Size

**Editor > Display:**
- Line Numbers (On, Off, Relative)
- Minimap (enabled/disabled)
- Word Wrap (on/off)

**Editor > Behavior:**
- Tab Size
- Insert Spaces
- Auto-indent

**Panel > Layout:**
- Default Layout (preset layouts)
- Auto-save Layout (checkbox)

**LLM > Models:**
- Default model settings
- Model preferences

**LLM > Connection:**
- Connection settings
- Test Connection button

### Project Settings Tab

**Left Navigation:**
```
Project Info
  General
File Management
  Ignore Patterns
LLM
  Model Overrides
Auto-save
  Settings
```

**Settings by Category:**

**Project Info > General:**
- Project Name (editable)
- Project Path (read-only)
- Created Date (read-only)

**File Management > Ignore Patterns:**
- List of ignore patterns
- Add/Remove patterns
- Common patterns (node_modules, .git, etc.)

**LLM > Model Overrides:**
- Override global LLM settings
- Project-specific model selection

**Auto-save > Settings:**
- Auto-save enabled (checkbox)
- Auto-save interval (seconds)

### LLM Settings Tab

**Left Navigation:**
```
Overseer AI
  Model
  Parameters
Implementation AI
  Model
  Parameters
Connection
  Settings
  Test
Model Management
  Available
  Download
```

**Settings by Category:**

**Overseer AI > Model:**
- Model: [Llama 3.1 ▼]
- API Endpoint: [http://localhost:11434]

**Overseer AI > Parameters:**
- Temperature: [0.7] (slider)
- Max Tokens: [2048] (input)

**Implementation AI > Model:**
- Model: [Qwen2.5-Coder ▼]
- API Endpoint: [http://localhost:11434]

**Implementation AI > Parameters:**
- Temperature: [0.3] (slider)
- Max Tokens: [4096] (input)

**Connection > Settings:**
- Timeout (seconds)
- Retry attempts
- Connection status indicator

**Connection > Test:**
- Test Connection button
- Connection result display

**Model Management > Available:**
- List of available models
- Model info (size, description)

**Model Management > Download:**
- Download new models
- Remove models

## Visual Design

**See `visual-design-system.md` for complete styling guidelines.**

### Colors and Styling

**Settings Panel:**
- Background: `#1e1e1e` (Main background, dark)
- Left sidebar: `#2d2d30` (Darker sidebar)
- Right pane: `#252526` (Slightly lighter panel background)
- Selected category: Background `#37373d`, Border Left `2px solid #007acc` (Blue accent)
- Sections: Border `1px solid #3e3e42` (Subtle dividers)

**Input Fields:**
- Background: `#3c3c3c`
- Border: `1px solid #3e3e42`
- Text: `#cccccc`
- Focus: Border `#007acc`

**Buttons:**
- Primary: `#0e639c` background, `#ffffff` text
- Secondary: Transparent, `1px solid #3e3e42` border

**Tabs:**
- Active tab: Highlighted with underline
- Inactive tabs: Muted color
- Hover: Subtle highlight

**Navigation:**
- Categories: Clear hierarchy with indentation
- Selected: Highlighted background
- Hover: Subtle highlight
- Expand/collapse indicators: ▶ / ▼

**Form Elements:**
- Labels: Clear, readable
- Inputs: Standard form inputs
- Checkboxes: Standard checkboxes
- Dropdowns: Standard select dropdowns
- Sliders: Range sliders for numeric values

### Typography

- Tab labels: Medium weight
- Category names: Readable, clear
- Section headers: Medium weight, larger
- Labels: Readable, clear
- Input text: Standard form text
- Help text: Smaller, muted

### Spacing

- Comfortable padding around sections
- Clear separation between categories
- Consistent indentation for hierarchy
- Clear separation between form elements

## User Interactions

### Opening Settings

1. User clicks Settings button/menu item
2. Settings panel/dialog opens
3. Default tab (App Settings) is active
4. First category is selected
5. Settings for that category are displayed

### Navigating Categories

1. User clicks category in left sidebar
2. Category becomes selected (highlighted)
3. Settings for that category appear in right pane
4. User can expand/collapse categories with ▶/▼

### Filtering Settings

1. User types in filter box
2. Navigation tree filters in real-time
3. Matching categories are highlighted
4. Non-matching categories are hidden
5. Clear filter to show all categories

### Changing Settings

1. User modifies a setting value
2. Setting is marked as changed (optional indicator)
3. Real-time preview updates (where applicable)
4. Save button becomes enabled (if disabled initially)

### Saving Settings

1. User clicks "Save" button (bottom right)
2. Settings are validated
3. Settings are saved to configuration file
4. Settings are applied immediately
5. Panel/dialog closes
6. Success message shown (optional)

### Canceling Changes

1. User clicks "Cancel" button (bottom right)
2. Confirmation dialog appears (if changes were made)
3. If confirmed, changes are discarded
4. Panel/dialog closes
5. Settings revert to saved values

## Layout Details

### Three-Pane Layout

**Top Section:**
- Tabs (full width)
- Filter bar (full width)

**Bottom Section (split):**
- **Left Pane (30-40% width):** Navigation sidebar
- **Right Pane (60-70% width):** Settings content

**Bottom Bar:**
- Cancel button (left)
- Save button (right)

### Resizable Panes

- Left and right panes can be resized
- Minimum widths to prevent too narrow panes
- Layout persists between sessions

## Questions for Discussion

1. **Settings Persistence:** Auto-save on change, or manual save only?
2. **Settings Reset:** Should there be a "Reset to Defaults" option per category?
3. **Settings Export/Import:** Should users be able to export/import settings?
4. **Real-time Preview:** Which settings should have real-time preview?
5. **Settings Validation:** How should invalid settings be handled?
6. **Help Text:** Should settings have help text or tooltips?
7. **Category Organization:** Are the current categories sufficient, or should we reorganize?
8. **Advanced Settings:** Should there be an "Advanced" section for power users?
9. **Search Functionality:** Should search also search within setting descriptions?
10. **Settings Groups:** Should related settings be visually grouped in the content pane?

What are your thoughts on this Godot-style Settings UI? Any changes or additions you'd like?
