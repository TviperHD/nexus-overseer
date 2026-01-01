# Phase 5.1 Testing Guide - Step by Step

**Date:** 2025-12-30  
**Purpose:** Test tab dragging functionality one feature at a time

---

## Test 1: Basic Tab Dragging (Drag Start)

**What to test:**
- Can you click and drag a tab?
- Does the tab become semi-transparent (opacity 0.5) when dragging?
- Does a drag overlay appear showing the tab label?

**Steps:**
1. Open the app (ensure dev server is running)
2. Open at least one tab (use "View" dropdown in TopBar → select a tab type)
3. Click and hold on a tab
4. Move your mouse slightly (8px threshold)
5. Observe:
   - Tab becomes semi-transparent
   - A drag overlay appears following your cursor
   - Tab shows "cursor-grabbing" style

**Expected Result:**
✅ Tab becomes draggable, shows drag overlay, and becomes semi-transparent

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 2: Drop Zone Detection (Empty Canvas)

**What to test:**
- When dragging over empty canvas, does a blue drop zone indicator appear?
- Does it cover the entire canvas area?

**Steps:**
1. Start with empty canvas (no tabs open, or clear layout)
2. Open a tab using "View" dropdown
3. Click and drag the tab
4. Move mouse over the empty canvas area (below TopBar)
5. Observe:
   - Blue rectangle overlay appears
   - Covers the canvas area
   - Has blue border (#007acc)

**Expected Result:**
✅ Blue drop zone indicator appears when dragging over empty canvas

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 3: Tab Bar Drop Zone

**What to test:**
- When dragging over a tab bar, does a blue border appear at the top?
- Does the drop zone indicator show the tab bar area?

**Steps:**
1. Open at least 2 tabs in the same tab group
2. Click and drag one tab
3. Move mouse over the tab bar area (where tabs are displayed)
4. Observe:
   - Blue border appears at top of tab bar
   - Drop zone indicator shows tab bar dimensions
   - Visual feedback is clear

**Expected Result:**
✅ Tab bar shows blue border and drop zone indicator when dragging over it

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 4: Edge Drop Zones (Top/Bottom/Left/Right)

**What to test:**
- When dragging near edges of a panel, do edge drop zones appear?
- Do arrows show the direction (↑ ↓ ← →)?

**Steps:**
1. Open a tab (so you have a panel visible)
2. Click and drag a tab
3. Move mouse near the TOP edge of the panel (within 20px)
4. Observe:
   - Blue rectangle appears at top
   - Arrow pointing up (↑) is visible
5. Repeat for bottom, left, and right edges

**Expected Result:**
✅ Edge drop zones appear with directional arrows when dragging near panel edges

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 5: Drop on Tab Bar (Move Tab Between Groups)

**What to test:**
- Can you drop a tab on another tab bar to move it to that group?
- Does the tab actually move?

**Steps:**
1. Open 2 tabs in one tab group (Group A)
2. Open 1 tab in another tab group (Group B) - if you only have one group, this test may need multiple groups
3. Drag a tab from Group A
4. Drop it on Group B's tab bar
5. Observe:
   - Tab moves to Group B
   - Tab appears in Group B's tab list
   - Tab is removed from Group A

**Expected Result:**
✅ Tab successfully moves from one group to another when dropped on tab bar

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 6: Drop on Empty Canvas

**What to test:**
- Can you drop a tab on empty canvas?
- Does it create/maintain the main panel?

**Steps:**
1. Open a tab (this creates a panel)
2. Drag the tab
3. Move to empty canvas area (if possible, or drag outside current panel)
4. Drop the tab
5. Observe:
   - Tab remains in main panel
   - Main panel is created/maintained
   - Tab is still accessible

**Expected Result:**
✅ Dropping on empty canvas maintains main panel and keeps tab accessible

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 7: Drag Cancel (Escape Key)

**What to test:**
- Can you cancel a drag operation?
- Does state reset properly?

**Steps:**
1. Start dragging a tab
2. Press Escape key
3. Observe:
   - Drag operation cancels
   - Tab returns to original position
   - No drop zone indicators remain
   - Tab is not moved

**Expected Result:**
✅ Escape key cancels drag operation and resets state

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Test 8: Visual Feedback During Drag

**What to test:**
- Are all visual indicators smooth and responsive?
- Does the drag overlay follow the cursor smoothly?

**Steps:**
1. Drag a tab
2. Move mouse around quickly
3. Observe:
   - Drop zone indicators update smoothly
   - Drag overlay follows cursor
   - No lag or jank
   - Visual feedback is immediate

**Expected Result:**
✅ All visual feedback is smooth and responsive during drag

**Actual Result:**
[ ] ✅ Works
[ ] ❌ Doesn't work - Notes: _______________

---

## Issues Found

**List any issues discovered during testing:**

1. 
2. 
3. 

---

## Next Steps

After completing all tests:
- [ ] Fix any issues found
- [ ] Re-test fixed issues
- [ ] Proceed to Section 8 (Tab Reordering) if all tests pass

