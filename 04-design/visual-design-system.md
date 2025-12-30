# Visual Design System: Nexus Overseer

**Created:** 2024-12-28  
**Status:** Design Document  
**Inspiration:** Cursor IDE dark theme

## Design Philosophy

**Core Principles:**
- **Slim:** Minimal borders, thin dividers, compact spacing
- **Modern:** Clean lines, subtle shadows, smooth animations
- **Sleek:** Polished surfaces, refined details, premium feel
- **Dark Mode First:** Optimized for dark theme, with light mode as secondary

## Color Palette

### Dark Theme (Primary)

**Background Colors:**
- **Main Background:** `#1e1e1e` (Very dark gray, not pure black)
- **Panel Background:** `#252526` (Slightly lighter than main)
- **Sidebar Background:** `#2d2d30` (Darker sidebar)
- **Editor Background:** `#1e1e1e` (Matches main)
- **Tab Bar Background:** `#2d2d30` (Darker tab bar)
- **Input Background:** `#3c3c3c` (Input fields)

**Text Colors:**
- **Primary Text:** `#cccccc` (Off-white, high contrast)
- **Secondary Text:** `#858585` (Muted gray)
- **Tertiary Text:** `#6a6a6a` (Very muted)
- **Placeholder Text:** `#6a6a6a`
- **Disabled Text:** `#4a4a4a`

**Border & Divider Colors:**
- **Borders:** `#3e3e42` (Subtle, thin borders)
- **Dividers:** `#3e3e42` (Panel dividers)
- **Resize Handles:** `#3e3e42` (Invisible until hover)
- **Hover Border:** `#505050` (Slightly lighter on hover)

**Accent Colors:**
- **Primary Accent:** `#007acc` (Blue - Cursor's primary)
- **Primary Accent Hover:** `#1a8cd8` (Lighter blue)
- **Success:** `#4ec9b0` (Teal green)
- **Warning:** `#dcdcaa` (Soft yellow)
- **Error:** `#f48771` (Soft red)
- **Info:** `#4fc1ff` (Light blue)

**Interactive Elements:**
- **Button Background:** `#0e639c` (Dark blue)
- **Button Hover:** `#1177bb` (Lighter blue)
- **Button Active:** `#005a9e` (Darker blue)
- **Link Color:** `#4fc1ff` (Light blue)
- **Link Hover:** `#6fcfff` (Lighter blue)

**Selection & Highlight:**
- **Selection Background:** `#264f78` (Blue tint)
- **Selection Text:** `#ffffff` (White)
- **Hover Background:** `#2a2d2e` (Subtle highlight)
- **Active Background:** `#37373d` (Active state)
- **Focus Ring:** `#007acc` (Blue focus ring)

**Tab Colors:**
- **Active Tab Background:** `#1e1e1e` (Matches editor)
- **Active Tab Border Top:** `#007acc` (Blue accent line)
- **Inactive Tab Background:** `#2d2d30` (Darker)
- **Inactive Tab Hover:** `#37373d` (Lighter on hover)
- **Tab Text Active:** `#cccccc` (Primary text)
- **Tab Text Inactive:** `#858585` (Muted)

**Status Bar:**
- **Background:** `#007acc` (Blue)
- **Text:** `#ffffff` (White)
- **Info Items:** `#cccccc` (Light gray)

### Light Theme (Secondary)

**Note:** Light theme will be implemented later, dark theme is primary focus.

---

## Typography

### Font Families

**Primary Font (UI):**
- **Font:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace (Code):** `"Fira Code", "Consolas", "Monaco", "Courier New", monospace`

### Font Sizes

**UI Text:**
- **Extra Small:** `11px` (Tooltips, timestamps)
- **Small:** `12px` (Secondary text, labels)
- **Base:** `13px` (Primary UI text)
- **Medium:** `14px` (Emphasized text)
- **Large:** `16px` (Headings, important text)
- **Extra Large:** `18px` (Major headings)

**Code Editor:**
- **Base:** `14px` (Default code size)
- **Line Height:** `1.5` (22px for 14px font)

### Font Weights

- **Light:** `300`
- **Regular:** `400` (Default)
- **Medium:** `500` (Emphasized)
- **Semibold:** `600` (Headings)
- **Bold:** `700` (Strong emphasis)

### Line Heights

- **Tight:** `1.2` (Headings)
- **Normal:** `1.4` (Body text)
- **Relaxed:** `1.6` (Code, long text)

---

## Spacing System

**Slim, Compact Spacing:**
- **XS:** `4px` (Tight spacing)
- **SM:** `8px` (Small gaps)
- **MD:** `12px` (Medium spacing)
- **LG:** `16px` (Standard spacing)
- **XL:** `24px` (Large spacing)
- **2XL:** `32px` (Extra large)

**Component Spacing:**
- **Panel Padding:** `8px` (Slim padding)
- **Tab Padding:** `8px 12px` (Compact tabs)
- **Button Padding:** `6px 12px` (Slim buttons)
- **Input Padding:** `6px 10px` (Compact inputs)
- **Message Padding:** `8px 12px` (Chat messages)

---

## Component Styling

### Buttons

**Primary Button:**
- Background: `#0e639c`
- Text: `#ffffff`
- Border: None
- Padding: `6px 12px`
- Border Radius: `3px`
- Font Size: `13px`
- Hover: `#1177bb`
- Active: `#005a9e`

**Secondary Button:**
- Background: Transparent
- Text: `#cccccc`
- Border: `1px solid #3e3e42`
- Padding: `6px 12px`
- Border Radius: `3px`
- Hover: Background `#2a2d2e`

**Icon Button:**
- Background: Transparent
- Size: `24px × 24px`
- Padding: `4px`
- Border Radius: `3px`
- Hover: Background `#2a2d2e`

### Input Fields

**Text Input:**
- Background: `#3c3c3c`
- Border: `1px solid #3e3e42`
- Text: `#cccccc`
- Padding: `6px 10px`
- Border Radius: `3px`
- Font Size: `13px`
- Focus: Border `#007acc`, outline none

**Textarea:**
- Same as text input
- Min Height: `80px`
- Resize: Vertical only

### Tabs

**Tab Bar:**
- Background: `#2d2d30`
- Height: `35px`
- Border Bottom: `1px solid #3e3e42`

**Tab:**
- Background: `#2d2d30` (inactive) / `#1e1e1e` (active)
- Text: `#858585` (inactive) / `#cccccc` (active)
- Padding: `8px 12px`
- Border Top: `2px solid transparent` (inactive) / `2px solid #007acc` (active)
- Hover: Background `#37373d`
- Close Button: `#6a6a6a`, hover `#cccccc`

### Panels

**Panel Container:**
- Background: `#252526`
- Border: None (slim, no borders)
- Padding: `8px`

**Panel Header:**
- Background: `#2d2d30`
- Height: `32px`
- Padding: `6px 8px`
- Border Bottom: `1px solid #3e3e42`
- Font Size: `13px`
- Font Weight: `500`

**Panel Content:**
- Background: `#1e1e1e`
- Padding: `8px`

### Dividers & Resize Handles

**Divider:**
- Width: `1px`
- Color: `#3e3e42`
- Background: Transparent

**Resize Handle:**
- Width: `4px`
- Background: Transparent
- Hover: Background `#007acc` (20% opacity)
- Active: Background `#007acc` (40% opacity)

### Scrollbars

**Scrollbar:**
- Width: `10px`
- Track: Transparent
- Thumb: `#424242`
- Thumb Hover: `#4e4e4e`
- Thumb Active: `#5a5a5a`
- Border Radius: `5px`

### Tooltips

**Tooltip:**
- Background: `#3c3c3c`
- Text: `#cccccc`
- Padding: `6px 8px`
- Border Radius: `3px`
- Font Size: `12px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.3)`

### Dropdowns & Menus

**Dropdown:**
- Background: `#3c3c3c`
- Border: `1px solid #3e3e42`
- Border Radius: `3px`
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.4)`
- Padding: `4px 0`

**Menu Item:**
- Padding: `6px 12px`
- Hover: Background `#2a2d2e`
- Active: Background `#37373d`
- Font Size: `13px`

### Code Editor

**Editor Theme:**
- Use Monaco Editor's "Dark+" theme (VS Code dark theme)
- Background: `#1e1e1e`
- Line Numbers: `#858585`
- Active Line: `#2a2d2e`
- Selection: `#264f78`
- Cursor: `#aeafad`

**Syntax Highlighting:**
- Follow VS Code dark theme colors
- Keywords: `#569cd6` (Blue)
- Strings: `#ce9178` (Orange)
- Numbers: `#b5cea8` (Green)
- Comments: `#6a9955` (Green)
- Functions: `#dcdcaa` (Yellow)

### Chat Interface

**Message Bubbles:**
- User Message:
  - Background: `#0e639c`
  - Text: `#ffffff`
  - Border Radius: `8px 8px 2px 8px`
  - Padding: `8px 12px`
  
- AI Message:
  - Background: `#2d2d30`
  - Text: `#cccccc`
  - Border Radius: `8px 8px 8px 2px`
  - Padding: `8px 12px`

**Input Area:**
- Background: `#252526`
- Border Top: `1px solid #3e3e42`
- Input Field: Same as text input
- Send Button: Primary button style

### File Tree

**Tree Item:**
- Height: `22px`
- Padding: `2px 4px`
- Hover: Background `#2a2d2e`
- Selected: Background `#37373d`
- Text: `#cccccc`
- Font Size: `13px`

**Folder Icon:**
- Color: `#4fc1ff` (Light blue)
- Size: `16px`

**File Icon:**
- Color: `#858585` (Muted)
- Size: `16px`

### Task Scheduler

**Task Item:**
- Background: Transparent
- Padding: `4px 8px`
- Hover: Background `#2a2d2e`
- Selected: Background `#37373d`
- Border Left: `2px solid transparent`
- Active Task: Border Left `2px solid #007acc`

**Task Status:**
- Pending: Text `#858585`
- In Progress: Text `#4fc1ff`, Icon `#4fc1ff`
- Completed: Text `#4ec9b0`, Icon `#4ec9b0`
- Blocked: Text `#f48771`, Icon `#f48771`

**Start Button:**
- Primary button style
- Size: Compact

---

## Shadows & Elevation

**Minimal Shadows (Slim Design):**
- **Level 1:** `0 1px 2px rgba(0, 0, 0, 0.1)` (Subtle)
- **Level 2:** `0 2px 4px rgba(0, 0, 0, 0.2)` (Dropdowns)
- **Level 3:** `0 4px 8px rgba(0, 0, 0, 0.3)` (Modals)

**Use Sparingly:** Dark mode benefits from minimal shadows.

---

## Animations

**Smooth, Subtle Animations:**
- **Duration:** `150ms` (Fast) / `200ms` (Standard) / `300ms` (Slow)
- **Easing:** `ease-out` (Most) / `ease-in-out` (Transitions)
- **Properties:** Transform, opacity (GPU-accelerated)

**Common Animations:**
- **Hover:** `150ms ease-out`
- **Panel Expand/Collapse:** `200ms ease-in-out`
- **Tab Switch:** `150ms ease-out`
- **Modal Open:** `200ms ease-out`
- **Tooltip:** `150ms ease-out`

---

## Icons

**Icon Style:**
- **Library:** Lucide React (or similar)
- **Size:** `16px` (Small) / `20px` (Medium) / `24px` (Large)
- **Color:** Inherit from text color
- **Stroke Width:** `1.5px` (Slim, modern)
- **Style:** Outline icons (not filled)

---

## Accessibility

**Contrast Ratios:**
- **Text on Background:** Minimum 4.5:1 (WCAG AA)
- **Large Text:** Minimum 3:1 (WCAG AA)
- **Interactive Elements:** Minimum 3:1

**Focus Indicators:**
- **Focus Ring:** `2px solid #007acc`
- **Focus Offset:** `2px`
- **Always Visible:** Never remove focus indicators

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Clear tab order
- Keyboard shortcuts documented

---

## Responsive Considerations

### Application Window

**Minimum Window Size:**
- **Width:** `800px` (absolute minimum)
- **Height:** `600px` (absolute minimum)

**Responsive Behavior:**
- Application must fit and function at any size above minimum
- All panels scale proportionally
- Sidebars can collapse when space is limited
- Content areas adapt to available space
- Smooth transitions during window resize

### Component Minimum Sizes

**UI Elements:**
- **Button:** `24px` height minimum
- **Input:** `32px` height minimum
- **Tab:** `35px` height
- **Clickable Area:** `44px × 44px` minimum (touch-friendly)

**Panel Minimums:**
- **File Tree Sidebar:** `180px` width minimum
- **Chat History Sidebar:** `200px` width minimum (when expanded)
- **Chat Interface:** `300px` width minimum
- **Code Editor:** `400px` width minimum
- **Tab Bar:** `35px` height (fixed)
- **Status Bar:** `22px` height (fixed)

**Responsive Strategies:**
- Use flexbox/grid for flexible layouts
- Collapsible sidebars when space is limited
- Horizontal scrolling for content that can't shrink
- Vertical scrolling for overflow content
- Adaptive font sizes (optional, for very small windows)

### Breakpoints (Reference Only)

**Note:** Breakpoints are for reference, but the app should be fluid and work at any size above minimum.

- **Small:** `768px` (Tablet)
- **Medium:** `1024px` (Small desktop)
- **Large:** `1440px` (Standard desktop)
- **XLarge:** `1920px` (Large desktop)

---

## Implementation Notes

### CSS Variables

Use CSS variables for theming:

```css
:root {
  /* Backgrounds */
  --bg-main: #1e1e1e;
  --bg-panel: #252526;
  --bg-sidebar: #2d2d30;
  
  /* Text */
  --text-primary: #cccccc;
  --text-secondary: #858585;
  
  /* Accents */
  --accent-primary: #007acc;
  --accent-hover: #1a8cd8;
  
  /* Borders */
  --border-color: #3e3e42;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
}
```

### Component Library

**Recommended:**
- **Styling:** Tailwind CSS (with custom theme)
- **Icons:** Lucide React
- **Animations:** Framer Motion (for complex) or CSS transitions

---

## Design Checklist

When implementing components, ensure:
- [ ] Slim borders (1px max)
- [ ] Compact spacing (8-12px standard)
- [ ] Dark theme colors used
- [ ] Smooth animations (150-200ms)
- [ ] Proper contrast ratios
- [ ] Focus indicators visible
- [ ] Hover states defined
- [ ] Active states defined
- [ ] Disabled states defined

---

**Design System Status:** Complete  
**Next:** Update UI design documents to reference this system

