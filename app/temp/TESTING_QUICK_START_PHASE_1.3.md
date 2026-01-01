# Testing Quick Start Guide - Phase 1.3: Monaco Editor Integration

**Phase:** 1.3 - Monaco Editor Integration

---

## ✅ Automated Tests - All Passing!

**78 tests passing** across 6 test files:
- ✅ Tab Store (20 tests) - Phase 1.2
- ✅ Tab Component (11 tests) - Phase 1.2
- ✅ TabBar Component (8 tests) - Phase 1.2
- ✅ TabContent Component (7 tests) - Updated for Monaco Editor
- ✅ Editor Store (8 tests) - **NEW**
- ✅ Language Detection (24 tests) - **NEW**

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
npm run tauri dev
```

The app will open with the TabSystemTest component visible in the main area.

---

## 📋 Testing Checklist

### 1. File Opening

**Test Opening Files:**
- [ ] Open a file using the "Open File" input field
  - Enter a file path (e.g., `C:\path\to\file.ts` or `/path/to/file.ts`)
  - Click "Open File" or press Enter
  - ✅ Verify: File tab is created in tab bar
  - ✅ Verify: Monaco Editor displays file content
  - ✅ Verify: Syntax highlighting works (check language detection)
  - ✅ Verify: File name appears in tab label

**Test Opening Multiple Files:**
- [ ] Open 3-5 different files
  - ✅ Verify: Each file gets its own tab
  - ✅ Verify: All tabs are visible in tab bar
  - ✅ Verify: Active tab is highlighted

**Test Opening Same File Twice:**
- [ ] Open a file, then try to open it again
  - ✅ Verify: No duplicate tab is created
  - ✅ Verify: Existing tab becomes active

**Test Opening Non-Existent File:**
- [ ] Try to open a file that doesn't exist
  - ✅ Verify: Error message is shown (check console)
  - ✅ Verify: No tab is created

---

### 2. File Editing

**Test Basic Editing:**
- [ ] Open a file
- [ ] Type some text in the editor
  - ✅ Verify: Text appears in editor
  - ✅ Verify: Tab shows modified indicator (●)
  - ✅ Verify: Tab label shows file is modified

**Test Syntax Highlighting:**
- [ ] Open a TypeScript file (`.ts`)
  - ✅ Verify: TypeScript syntax highlighting works
- [ ] Open a Rust file (`.rs`)
  - ✅ Verify: Rust syntax highlighting works
- [ ] Open a Markdown file (`.md`)
  - ✅ Verify: Markdown syntax highlighting works
- [ ] Open a JSON file (`.json`)
  - ✅ Verify: JSON syntax highlighting works

**Test Large Files:**
- [ ] Open a large file (if available)
  - ✅ Verify: Editor loads without lag
  - ✅ Verify: Scrolling works smoothly
  - ✅ Verify: Performance is acceptable

---

### 3. File Saving

**Test Save Active File (Ctrl+S / Cmd+S):**
- [ ] Open a file and make changes
- [ ] Press `Ctrl+S` (or `Cmd+S` on Mac)
  - ✅ Verify: File is saved to disk
  - ✅ Verify: Modified indicator (●) disappears
  - ✅ Verify: Tab label shows file is not modified
  - ✅ Verify: Console shows "File saved: [path]"

**Test Save All Files (Ctrl+Shift+S / Cmd+Shift+S):**
- [ ] Open multiple files and make changes to some
- [ ] Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
  - ✅ Verify: All modified files are saved
  - ✅ Verify: Modified indicators disappear
  - ✅ Verify: Console shows "All files saved"

**Test Save Without Changes:**
- [ ] Open a file without making changes
- [ ] Press `Ctrl+S`
  - ✅ Verify: File is saved (no error)
  - ✅ Verify: Modified indicator remains unchanged

---

### 4. File Closing

**Test Close File Without Changes:**
- [ ] Open a file, don't make changes
- [ ] Click the "×" button on the tab
  - ✅ Verify: File tab closes immediately
  - ✅ Verify: No dialog appears
  - ✅ Verify: Next tab becomes active (if available)

**Test Close File With Unsaved Changes:**
- [ ] Open a file and make changes
- [ ] Click the "×" button on the tab
  - ✅ Verify: Unsaved changes dialog appears
  - ✅ Verify: Dialog shows file name
  - ✅ Verify: Dialog has three options: "Save", "Don't Save", "Cancel"

**Test Unsaved Changes Dialog - Save:**
- [ ] Make changes to a file
- [ ] Try to close the tab
- [ ] Click "Save" in the dialog
  - ✅ Verify: File is saved
  - ✅ Verify: Tab closes
  - ✅ Verify: File is written to disk

**Test Unsaved Changes Dialog - Don't Save:**
- [ ] Make changes to a file
- [ ] Try to close the tab
- [ ] Click "Don't Save" in the dialog
  - ✅ Verify: Tab closes without saving
  - ✅ Verify: Changes are lost
  - ✅ Verify: File on disk is unchanged

**Test Unsaved Changes Dialog - Cancel:**
- [ ] Make changes to a file
- [ ] Try to close the tab
- [ ] Click "Cancel" in the dialog
  - ✅ Verify: Dialog closes
  - ✅ Verify: Tab remains open
  - ✅ Verify: Changes are preserved

**Test Close File Keyboard Shortcut (Ctrl+W / Cmd+W):**
- [ ] Open a file with unsaved changes
- [ ] Press `Ctrl+W` (or `Cmd+W` on Mac)
  - ✅ Verify: Unsaved changes dialog appears
  - ✅ Verify: Same behavior as clicking "×" button

---

### 5. ViewState Preservation

**Test Cursor Position:**
- [ ] Open a file
- [ ] Place cursor at a specific line/column (e.g., line 10, column 5)
- [ ] Switch to another file tab
- [ ] Switch back to the first file
  - ✅ Verify: Cursor position is restored (line 10, column 5)

**Test Scroll Position:**
- [ ] Open a file with many lines
- [ ] Scroll down to middle of file
- [ ] Switch to another file tab
- [ ] Switch back to the first file
  - ✅ Verify: Scroll position is restored

**Test Multiple Files ViewState:**
- [ ] Open 3-5 files
- [ ] Set different cursor/scroll positions in each
- [ ] Switch between files multiple times
  - ✅ Verify: Each file maintains its own viewState
  - ✅ Verify: Cursor and scroll positions are preserved per file

---

### 6. File Watching (External Changes)

**Test Auto-Reload (No Unsaved Changes):**
- [ ] Open a file in the editor
- [ ] Don't make any changes
- [ ] Modify the file externally (using another editor or command line)
- [ ] Wait a moment for file watcher to detect change
  - ✅ Verify: File content updates automatically
  - ✅ Verify: Console shows "File [path] reloaded from disk"
  - ✅ Verify: Modified indicator remains false

**Test Conflict Detection (With Unsaved Changes):**
- [ ] Open a file in the editor
- [ ] Make some changes (don't save)
- [ ] Modify the file externally
- [ ] Wait for file watcher to detect change
  - ✅ Verify: Console shows warning about conflict
  - ✅ Verify: Warning mentions file has unsaved changes
  - ✅ Verify: Editor content is NOT automatically replaced
  - ✅ Verify: User can manually reload if desired

**Test File Deletion:**
- [ ] Open a file in the editor
- [ ] Delete the file externally
- [ ] Wait for file watcher to detect change
  - ✅ Verify: Console shows warning about file deletion
  - ✅ Verify: File tab remains open (for now)
  - ✅ Verify: User is notified

**Test File Rename:**
- [ ] Open a file in the editor
- [ ] Rename the file externally
- [ ] Wait for file watcher to detect change
  - ✅ Verify: Tab label updates with new file name
  - ✅ Verify: File path in editor store is updated
  - ✅ Verify: Console shows "File path updated in editor"

---

### 7. Language Detection

**Test Common File Types:**
- [ ] Open files with different extensions:
  - `.ts` → ✅ Should show TypeScript syntax highlighting
  - `.tsx` → ✅ Should show TypeScript React syntax highlighting
  - `.js` → ✅ Should show JavaScript syntax highlighting
  - `.rs` → ✅ Should show Rust syntax highlighting
  - `.py` → ✅ Should show Python syntax highlighting
  - `.md` → ✅ Should show Markdown syntax highlighting
  - `.json` → ✅ Should show JSON syntax highlighting
  - `.yaml` / `.yml` → ✅ Should show YAML syntax highlighting
  - `.html` → ✅ Should show HTML syntax highlighting
  - `.css` → ✅ Should show CSS syntax highlighting

**Test Edge Cases:**
- [ ] Open a file with no extension
  - ✅ Verify: Defaults to plaintext
- [ ] Open a file with unknown extension
  - ✅ Verify: Defaults to plaintext
- [ ] Open a file with uppercase extension (`.TS`, `.JSON`)
  - ✅ Verify: Language detection is case-insensitive

---

### 8. Keyboard Shortcuts

**Test Save Shortcuts:**
- [ ] `Ctrl+S` (or `Cmd+S` on Mac) → ✅ Saves active file
- [ ] `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) → ✅ Saves all files

**Test Tab Shortcuts (from Phase 1.2):**
- [ ] `Ctrl+Tab` → ✅ Cycles forward through tabs
- [ ] `Ctrl+Shift+Tab` → ✅ Cycles backward through tabs
- [ ] `Ctrl+W` (or `Cmd+W` on Mac) → ✅ Closes active tab (with unsaved changes dialog if needed)
- [ ] `Ctrl+1` through `Ctrl+9` → ✅ Switches to specific tab number

---

### 9. Editor Settings

**Test Default Settings:**
- [ ] Open a file
  - ✅ Verify: Editor uses dark theme (vs-dark)
  - ✅ Verify: Font size is 14
  - ✅ Verify: Word wrap is enabled
  - ✅ Verify: Minimap is enabled
  - ✅ Verify: Line numbers are shown

**Note:** Editor settings UI is optional for Phase 1.3. Settings can be tested programmatically if needed.

---

### 10. Multiple Files Management

**Test Multiple Open Files:**
- [ ] Open 5-10 files simultaneously
  - ✅ Verify: All files are accessible via tabs
  - ✅ Verify: Tab bar scrolls horizontally if needed
  - ✅ Verify: Switching between files is smooth
  - ✅ Verify: Each file maintains its own content and viewState
  - ✅ Verify: Modified state is tracked per file

**Test Save All:**
- [ ] Open multiple files
- [ ] Make changes to some files
- [ ] Press `Ctrl+Shift+S`
  - ✅ Verify: Only modified files are saved
  - ✅ Verify: All modified files are saved successfully
  - ✅ Verify: Modified indicators disappear

---

### 11. Error Handling

**Test File Read Errors:**
- [ ] Try to open a file without read permission
  - ✅ Verify: Error is shown (check console)
  - ✅ Verify: No tab is created
  - ✅ Verify: User-friendly error message

**Test File Write Errors:**
- [ ] Open a file
- [ ] Make changes
- [ ] Try to save to a location without write permission
  - ✅ Verify: Error is shown (check console)
  - ✅ Verify: File remains modified
  - ✅ Verify: User-friendly error message

**Test Invalid File Paths:**
- [ ] Try to open a file with invalid characters in path
  - ✅ Verify: Error is handled gracefully
  - ✅ Verify: No crash occurs

---

## 🐛 Troubleshooting

**Issue: File doesn't open**
- Check browser console for errors
- Verify file path is correct and accessible
- Check that file system integration is working (Phase 1.1)

**Issue: Syntax highlighting doesn't work**
- Verify file extension is recognized (check language detection)
- Check browser console for Monaco Editor errors
- Try refreshing the page

**Issue: File watching doesn't work**
- Check browser console for file watcher errors
- Verify file system file watching is working (Phase 1.1)
- Check that file watcher is initialized in App.tsx

**Issue: Unsaved changes dialog doesn't appear**
- Verify file has unsaved changes (check tab modified indicator)
- Check browser console for errors
- Verify TabGroup component has unsaved changes handling

**Issue: ViewState not preserved**
- Check browser console for errors
- Verify viewState is being saved in editor store
- Try switching files multiple times

**Issue: Keyboard shortcuts don't work**
- Click in the app window first (to give it focus)
- Check browser console for errors
- Verify no other app is intercepting shortcuts
- Try `Ctrl+S` and `Ctrl+Shift+S` specifically

---

## ✅ Test Results Summary

After completing all manual tests, document:

- **Files Tested:** [List of file types/extensions tested]
- **Issues Found:** [Any bugs or issues discovered]
- **Performance Notes:** [Any performance observations]
- **Edge Cases Tested:** [Any edge cases verified]
- **Overall Status:** [Pass / Fail / Needs Work]

---

## 📝 Notes

- **File Paths:** Use absolute paths when testing (e.g., `C:\path\to\file.ts` on Windows)
- **External Editors:** Use a text editor or command line to modify files externally for file watching tests
- **Console Logging:** Check browser console for helpful debug messages
- **Persistence:** Editor settings and viewState should persist across app restarts (via localStorage)

---

## ✅ Next Steps

After completing manual testing:

1. Mark checklist items complete in `phase-1.3-monaco-editor.md`
2. Update session overview with test results
3. Document any issues found
4. Proceed to next phase or fix any critical issues

---

**Happy Testing! 🎉**

