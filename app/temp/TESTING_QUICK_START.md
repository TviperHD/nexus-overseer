# Testing Quick Start Guide

**Phase 1.2: Basic Tab System**

---

## ✅ Automated Tests - All Passing!

**46 tests passing** across 4 test files:
- ✅ Tab Store (20 tests)
- ✅ Tab Component (11 tests)
- ✅ TabBar Component (8 tests)
- ✅ TabContent Component (7 tests)

### Run Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (recommended)
npm test

# Run tests with UI (interactive)
npm run test:ui
```

---

## 🧪 Manual Testing Steps

### Step 1: Start the App

```bash
npm run dev
```

The app will open with the TabSystemTest component visible in the main area.

### Step 2: Test Tab Creation

1. **Create a File Tab:**
   - Type "main.ts" in the "Tab label" field
   - Select "File" from dropdown
   - Click "Create Tab"
   - ✅ Verify: Tab appears with blue top border (active)
   - ✅ Verify: Content shows "Editor will be implemented in Phase 1.3"

2. **Create a Panel Tab:**
   - Type "Chat Panel" in the "Tab label" field
   - Select "Panel" from dropdown
   - Select "chat" from component dropdown
   - Click "Create Tab"
   - ✅ Verify: Tab appears
   - ✅ Verify: Content shows "Chat Panel (to be implemented)"

3. **Quick Create:**
   - Click "Quick File Tab" button
   - ✅ Verify: Random file tab is created
   - Click "Quick Panel Tab" button
   - ✅ Verify: Random panel tab is created

### Step 3: Test Tab Switching

1. **Click to Switch:**
   - Create 3-4 tabs
   - Click on different tabs
   - ✅ Verify: Active tab has blue top border
   - ✅ Verify: Inactive tabs have darker background
   - ✅ Verify: Content updates when switching

2. **Keyboard Shortcuts:**
   - Press `Ctrl+Tab` (or `Cmd+Tab` on Mac)
   - ✅ Verify: Tabs cycle forward
   - Press `Ctrl+Shift+Tab`
   - ✅ Verify: Tabs cycle backward
   - Press `Ctrl+1`, `Ctrl+2`, etc.
   - ✅ Verify: Specific tabs are activated (1-9)

### Step 4: Test Tab Closing

1. **Close Button:**
   - Click the "×" button on a tab
   - ✅ Verify: Tab is removed
   - ✅ Verify: Next tab becomes active

2. **Keyboard Shortcut:**
   - Press `Ctrl+W` (or `Cmd+W` on Mac)
   - ✅ Verify: Active tab closes
   - ✅ Verify: Next tab becomes active

3. **Close Last Tab:**
   - Close all tabs
   - ✅ Verify: Empty state message appears

### Step 5: Test Persistence

1. **Create Multiple Tabs:**
   - Create 3-4 tabs (mix of file and panel)
   - Switch between them
   - Note which tab is active

2. **Reload:**
   - Refresh the page (F5) or close/reopen app
   - ✅ Verify: All tabs are restored
   - ✅ Verify: Active tab is restored
   - ✅ Verify: Tab order is preserved

### Step 6: Test Edge Cases

1. **Modified Indicator:**
   - Create tabs using "Quick File Tab"
   - ✅ Verify: Some tabs show blue dot (●) for modified state
   - ✅ Verify: Hover shows "Unsaved changes" tooltip

2. **Long Tab Names:**
   - Create a tab with a very long name (50+ characters)
   - ✅ Verify: Name is truncated with ellipsis

3. **Many Tabs:**
   - Create 10+ tabs using "Quick File Tab"
   - ✅ Verify: Tab bar scrolls horizontally
   - ✅ Verify: All tabs are accessible

---

## 📋 Testing Checklist

Use this checklist to track your manual testing:

### Tab Creation
- [ ] File tabs work
- [ ] Panel tabs work
- [ ] Quick buttons work
- [ ] New tab becomes active

### Tab Switching
- [ ] Click to switch works
- [ ] Ctrl+Tab cycles forward
- [ ] Ctrl+Shift+Tab cycles backward
- [ ] Ctrl+1-9 switches to specific tabs

### Tab Closing
- [ ] Close button works
- [ ] Ctrl+W closes active tab
- [ ] Empty state shows when all tabs closed

### Persistence
- [ ] Tabs persist across reload
- [ ] Active tab persists
- [ ] Tab order persists

### Edge Cases
- [ ] Modified indicator works
- [ ] Long names truncate
- [ ] Many tabs scroll correctly

---

## 🐛 Troubleshooting

**Issue: Tests fail**
- Run `npm install` to ensure dependencies are installed
- Check that `src/test/setup.ts` exists

**Issue: App doesn't load**
- Check browser console for errors
- Verify `npm run dev` is running
- Check that TabSystemTest component is in App.tsx

**Issue: Keyboard shortcuts don't work**
- Click in the app window first (to give it focus)
- Check browser console for errors
- Verify no other app is intercepting shortcuts

**Issue: Persistence doesn't work**
- Check browser localStorage is enabled
- Check browser console for errors
- Clear localStorage and try again

---

## ✅ Next Steps

After completing manual testing:

1. Mark checklist items complete in `phase-1.2-tab-system.md`
2. Update session overview with test results
3. Document any issues found
4. Proceed to Phase 1.3: Monaco Editor Integration

---

**Happy Testing! 🎉**

