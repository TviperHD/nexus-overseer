# Testing Section 0: Empty Canvas & Top Bar

**Date:** 2025-12-30  
**Phase:** 5.1 - Section 0 Testing  
**Status:** Ready for Testing

---

## Test Checklist

### 1. Empty Canvas Display
- [ ] **Test:** Clear localStorage and restart app
- [ ] **Expected:** Empty canvas should display with:
  - TopBar at top (40px height, dark background #2d2d30)
  - "Welcome to Nexus Overseer" heading
  - "Select a tab from the menu above to get started" message
  - Keyboard shortcut hints section
- [ ] **Verify:** No panels are rendered
- [ ] **Verify:** No console errors

### 2. TopBar Component
- [ ] **Test:** Check TopBar appearance
- [ ] **Expected:** TopBar should show:
  - "Nexus Overseer" text on left
  - "Open Tab" dropdown button in center
  - Empty space on right (for future settings)
- [ ] **Verify:** TopBar is fixed at top (doesn't scroll)
- [ ] **Verify:** TopBar height is 40px
- [ ] **Verify:** TopBar background color is #2d2d30

### 3. Tab Type Dropdown - Visual
- [ ] **Test:** Click "Open Tab" button
- [ ] **Expected:** Dropdown menu should appear with:
  - Code Editor (📝)
  - Chat Interface (💬)
  - File Tree (📁)
  - Task Scheduler (✓)
- [ ] **Verify:** Dropdown is centered below button
- [ ] **Verify:** Dropdown has dark background (#252526)
- [ ] **Verify:** Dropdown has border (#3e3e42)
- [ ] **Verify:** Menu items are properly styled

### 4. Tab Type Dropdown - Mouse Interaction
- [ ] **Test:** Hover over menu items
- [ ] **Expected:** Items should highlight on hover (bg-[#2a2d2e])
- [ ] **Test:** Click outside dropdown
- [ ] **Expected:** Dropdown should close
- [ ] **Test:** Click on a menu item
- [ ] **Expected:** 
  - Dropdown should close
  - Tab should be created in main panel
  - Panel layout should appear (replacing empty canvas)

### 5. Tab Type Dropdown - Keyboard Navigation
- [ ] **Test:** Press Enter/Space/ArrowDown when dropdown is closed
- [ ] **Expected:** Dropdown should open, first item selected
- [ ] **Test:** Use ArrowDown key
- [ ] **Expected:** Selection should move down, wrapping to top
- [ ] **Test:** Use ArrowUp key
- [ ] **Expected:** Selection should move up, wrapping to bottom
- [ ] **Test:** Press Enter on selected item
- [ ] **Expected:** Tab should open, dropdown should close
- [ ] **Test:** Press Escape
- [ ] **Expected:** Dropdown should close without opening tab

### 6. Tab Opening Functionality
- [ ] **Test:** Open "Code Editor" tab
- [ ] **Expected:** 
  - Main panel should be created
  - Tab group should be created for main panel
  - Code Editor tab should appear in tab bar
  - Tab should be active
  - Editor panel content should display (or placeholder)
- [ ] **Test:** Open "Chat Interface" tab
- [ ] **Expected:** 
  - Chat tab should be added to same tab group
  - Chat tab should become active
  - Code Editor tab should still be visible but inactive
- [ ] **Test:** Open "File Tree" tab
- [ ] **Expected:** File Tree tab should be added to tab group
- [ ] **Test:** Open "Task Scheduler" tab
- [ ] **Expected:** Task Scheduler tab should be added to tab group

### 7. Main Panel Management
- [ ] **Test:** Open first tab (should create main panel)
- [ ] **Expected:** 
  - Main panel should be created automatically
  - Panel ID should be 'main-panel'
  - Tab group should be mapped to main panel
- [ ] **Test:** Open additional tabs
- [ ] **Expected:** All tabs should be in same tab group (main panel's tab group)
- [ ] **Verify:** Check browser console for any errors related to panel creation

### 8. Layout Persistence
- [ ] **Test:** Open a few tabs, then refresh page
- [ ] **Expected:** 
  - Layout should be restored
  - Tabs should still be open
  - Active tab should be restored
- [ ] **Test:** Clear localStorage, restart app
- [ ] **Expected:** Should show empty canvas again

### 9. Edge Cases
- [ ] **Test:** Rapidly click dropdown multiple times
- [ ] **Expected:** Should handle gracefully, no errors
- [ ] **Test:** Open same tab type multiple times
- [ ] **Expected:** Multiple tabs of same type should be created (each with unique ID)
- [ ] **Test:** Open tab, then close all tabs
- [ ] **Expected:** Should return to empty canvas (or show empty tab group)

### 10. Visual Design
- [ ] **Verify:** All colors match design system:
  - TopBar: #2d2d30 background
  - Dropdown: #252526 background, #3e3e42 border
  - Text: #cccccc primary, #858585 secondary
- [ ] **Verify:** Spacing and padding are consistent
- [ ] **Verify:** Font sizes are appropriate
- [ ] **Verify:** Hover states work smoothly
- [ ] **Verify:** Focus states are visible (keyboard navigation)

---

## Known Issues / Notes

- [ ] Document any issues found during testing
- [ ] Document any unexpected behavior
- [ ] Document any visual inconsistencies

---

## Test Results

**Date Tested:** _______________  
**Tester:** _______________  
**Overall Status:** ⏳ Pending / ✅ Pass / ❌ Fail

**Summary:**
- [ ] All tests passed
- [ ] Some tests failed (see notes below)
- [ ] Blocking issues found

**Issues Found:**
1. 
2. 
3. 

**Next Steps:**
- [ ] Fix any blocking issues
- [ ] Continue with Section 1 implementation
- [ ] Re-test after fixes

---

## How to Test

1. **Start the development server:**
   ```bash
   cd nexus-overseer/app
   npm run dev
   ```

2. **Clear localStorage (to test empty canvas):**
   - Open browser DevTools (F12)
   - Go to Application tab → Local Storage
   - Clear all storage for localhost
   - Refresh page

3. **Test each item in the checklist above**

4. **Check browser console for errors**

5. **Verify visual appearance matches design system**

---

**Last Updated:** 2025-12-30

