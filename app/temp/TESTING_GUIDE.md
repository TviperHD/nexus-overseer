# Testing Guide: Phase 1.2 - Basic Tab System

**Date:** 2025-12-28  
**Phase:** 1.2 - Basic Tab System  
**Purpose:** Guide for testing the tab system implementation

---

## Overview

This guide walks you through testing the tab system for Phase 1.2. We have both automated tests (unit tests) and manual testing procedures.

---

## Automated Tests

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode (recommended during development):**
```bash
npm test
# Press 'a' to run all tests
# Press 'f' to run only failed tests
# Press 'u' to update snapshots
```

**Run tests once (CI mode):**
```bash
npm run test:run
```

**Run tests with UI (interactive):**
```bash
npm run test:ui
```

### Test Coverage

We have tests for:

1. **Tab Store (`src/stores/__tests__/tabStore.test.ts`)**
   - ✅ Tab group creation
   - ✅ Adding tabs
   - ✅ Removing tabs
   - ✅ Setting active tab
   - ✅ Updating tabs
   - ✅ Moving tabs between groups
   - ✅ Reordering tabs
   - ✅ Tab group removal
   - ✅ Edge cases (empty groups, non-existent tabs, etc.)

2. **Tab Component (`src/components/Tab/__tests__/Tab.test.tsx`)**
   - ✅ Rendering tab label
   - ✅ Active/inactive styling
   - ✅ Click handlers
   - ✅ Close button
   - ✅ Modified indicator
   - ✅ Pinned indicator
   - ✅ Keyboard accessibility (Enter, Space, Escape)
   - ✅ Icon display

3. **TabBar Component (`src/components/Tab/__tests__/TabBar.test.tsx`)**
   - ✅ Rendering all tabs
   - ✅ Active tab highlighting
   - ✅ Tab selection
   - ✅ Tab closing
   - ✅ Empty state handling
   - ✅ Keyboard shortcuts (Ctrl+Tab, Ctrl+W, Ctrl+1-9)

4. **TabContent Component (`src/components/Tab/__tests__/TabContent.test.tsx`)**
   - ✅ Empty state
   - ✅ File tab placeholder
   - ✅ Panel tab placeholders (editor, chat, task-scheduler)
   - ✅ Unknown component type handling
   - ✅ Unknown tab type handling

### Expected Test Results

All tests should pass. If any fail:
1. Check the error message
2. Review the test file to understand what's being tested
3. Check the implementation for issues
4. Fix the issue and re-run tests

---

## Manual Testing

### Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the app** - The app should load with the TabSystemTest component visible

### Test Checklist

#### 1. Tab Creation

**Test: Create File Tab**
- [ ] Click in the "Tab label" input field
- [ ] Type a file name (e.g., "main.ts")
- [ ] Select "File" from the type dropdown
- [ ] Click "Create Tab"
- [ ] Verify: Tab appears in the tab bar
- [ ] Verify: Tab shows file path placeholder
- [ ] Verify: New tab becomes active automatically

**Test: Create Panel Tab**
- [ ] Click in the "Tab label" input field
- [ ] Type a panel name (e.g., "Chat Panel")
- [ ] Select "Panel" from the type dropdown
- [ ] Select a component type (editor, chat, or task-scheduler)
- [ ] Click "Create Tab"
- [ ] Verify: Tab appears in the tab bar
- [ ] Verify: Tab shows appropriate placeholder content

**Test: Quick File Tab**
- [ ] Click "Quick File Tab" button
- [ ] Verify: A random file tab is created
- [ ] Verify: Tab may have modified indicator (random)

**Test: Quick Panel Tab**
- [ ] Click "Quick Panel Tab" button
- [ ] Verify: A random panel tab is created
- [ ] Verify: Tab shows appropriate placeholder

#### 2. Tab Switching

**Test: Click to Switch**
- [ ] Create multiple tabs (3-4 tabs)
- [ ] Click on different tabs
- [ ] Verify: Active tab is highlighted (blue border on top)
- [ ] Verify: Tab content updates to show active tab's content
- [ ] Verify: Inactive tabs have darker background

**Test: Keyboard Shortcuts - Ctrl+Tab**
- [ ] Create multiple tabs (3-4 tabs)
- [ ] Press `Ctrl+Tab` (or `Cmd+Tab` on Mac)
- [ ] Verify: Active tab cycles to the next tab
- [ ] Press `Ctrl+Tab` multiple times
- [ ] Verify: Tabs cycle through in order
- [ ] Verify: When reaching last tab, cycles back to first

**Test: Keyboard Shortcuts - Ctrl+Shift+Tab**
- [ ] Create multiple tabs (3-4 tabs)
- [ ] Press `Ctrl+Shift+Tab` (or `Cmd+Shift+Tab` on Mac)
- [ ] Verify: Active tab cycles backwards
- [ ] Press multiple times
- [ ] Verify: Tabs cycle backwards through the list

**Test: Keyboard Shortcuts - Ctrl+1 through Ctrl+9**
- [ ] Create at least 5 tabs
- [ ] Press `Ctrl+1` (or `Cmd+1` on Mac)
- [ ] Verify: First tab becomes active
- [ ] Press `Ctrl+3`
- [ ] Verify: Third tab becomes active
- [ ] Press `Ctrl+9`
- [ ] Verify: Ninth tab becomes active (if it exists)

#### 3. Tab Closing

**Test: Close Button**
- [ ] Create multiple tabs
- [ ] Click the "×" close button on a tab
- [ ] Verify: Tab is removed from tab bar
- [ ] Verify: Next tab becomes active (or previous if last tab)
- [ ] Verify: Tab content updates

**Test: Keyboard Shortcut - Ctrl+W**
- [ ] Create multiple tabs
- [ ] Press `Ctrl+W` (or `Cmd+W` on Mac)
- [ ] Verify: Active tab is closed
- [ ] Verify: Next tab becomes active
- [ ] Press `Ctrl+W` multiple times
- [ ] Verify: Tabs close one by one

**Test: Close Last Tab**
- [ ] Create one tab
- [ ] Close the tab
- [ ] Verify: Empty state is shown
- [ ] Verify: Message says "No tabs open"

#### 4. Tab Updates

**Test: Modified Indicator**
- [ ] Create a file tab
- [ ] Note: Modified indicator appears randomly for quick file tabs
- [ ] Verify: Modified tabs show a blue dot (●) indicator
- [ ] Verify: Hovering over indicator shows "Unsaved changes" tooltip

**Test: Pinned Indicator**
- [ ] Note: Pinning functionality will be added in Phase 1.4
- [ ] For now, verify pinned indicator would show if tab had `isPinned: true`

#### 5. Tab Persistence

**Test: Persistence Across Reload**
- [ ] Create multiple tabs (mix of file and panel tabs)
- [ ] Note which tabs are active
- [ ] Close the app or refresh the page
- [ ] Reopen the app
- [ ] Verify: All tabs are restored
- [ ] Verify: Active tab is restored
- [ ] Verify: Tab order is preserved

**Test: Persistence After Tab Operations**
- [ ] Create tabs
- [ ] Switch between tabs
- [ ] Close some tabs
- [ ] Refresh the page
- [ ] Verify: Current state is persisted correctly

#### 6. Multiple Tab Groups

**Test: Create Multiple Tab Groups**
- [ ] Note: Multiple tab groups UI will be added in Phase 1.4
- [ ] For now, verify tab store supports multiple groups via code inspection

#### 7. Edge Cases

**Test: Empty Tab Group**
- [ ] Start with no tabs
- [ ] Verify: Empty state message is shown
- [ ] Verify: Message says "No tabs in this group"

**Test: Rapid Tab Creation**
- [ ] Quickly create 10+ tabs using "Quick File Tab"
- [ ] Verify: All tabs appear correctly
- [ ] Verify: Tab bar scrolls horizontally if needed
- [ ] Verify: Performance is acceptable

**Test: Tab with Long Name**
- [ ] Create a tab with a very long name (50+ characters)
- [ ] Verify: Tab label is truncated with ellipsis
- [ ] Verify: Full name is visible on hover (if tooltip implemented)

---

## Testing Results Template

After completing manual testing, document your results:

```
## Manual Testing Results - [Date]

### Tab Creation
- ✅ File tabs: Working
- ✅ Panel tabs: Working
- ✅ Quick buttons: Working

### Tab Switching
- ✅ Click to switch: Working
- ✅ Ctrl+Tab: Working
- ✅ Ctrl+Shift+Tab: Working
- ✅ Ctrl+1-9: Working

### Tab Closing
- ✅ Close button: Working
- ✅ Ctrl+W: Working
- ✅ Last tab: Working

### Tab Persistence
- ✅ Across reload: Working
- ✅ After operations: Working

### Issues Found:
- [List any issues]

### Notes:
- [Any observations]
```

---

## Troubleshooting

### Tests Fail

**Issue:** Tests fail with "Cannot find module" errors
- **Solution:** Make sure all dependencies are installed: `npm install`

**Issue:** Tests fail with localStorage errors
- **Solution:** Check that `src/test/setup.ts` is properly configured

**Issue:** Component tests fail with "not wrapped in act"
- **Solution:** Make sure you're using `@testing-library/react` properly and awaiting async operations

### Manual Testing Issues

**Issue:** Tabs don't appear
- **Check:** Browser console for errors
- **Check:** Tab store is properly initialized
- **Check:** TabSystemTest component is rendering

**Issue:** Keyboard shortcuts don't work
- **Check:** Focus is on the window (click in the app first)
- **Check:** No other app is intercepting shortcuts
- **Check:** Browser console for errors

**Issue:** Persistence doesn't work
- **Check:** Browser localStorage is enabled
- **Check:** Browser console for errors
- **Check:** Zustand persist middleware is configured

---

## Next Steps

After completing all tests:

1. ✅ Mark checklist items as complete
2. ✅ Update session overview with test results
3. ✅ Document any issues found
4. ✅ Proceed to Phase 1.3: Monaco Editor Integration

---

**Last Updated:** 2025-12-28

