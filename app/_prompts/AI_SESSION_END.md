# AI Session End Prompt

**Reference this prompt at the end of each AI coding session to ensure all session overview sections are completed.**

---

## Session End Instructions

When the user indicates the session is ending or references this file, you MUST:

### 1. Complete Session Overview Document

**Update the session overview document (`session-overviews/YYYY-MM-DD-session-overview.md`) with:**

- ✅ **Session End Time:** Update when user provides it
- ✅ **Session Duration:** Calculate and update duration
- ✅ **Quick Overview:** Ensure summary is complete and accurate
- ✅ **Session Summary:** Add final summary if not already present

### 2. Complete All Sections

**Ensure ALL sections are filled in:**

- ✅ **AI Workflow Recommendations:** Add any workflow issues or improvements noticed
- ✅ **Development Recommendations:** Add any technical or implementation recommendations
- ✅ **Questions & Discussion Points:** Add any questions for user or topics to discuss
- ✅ **Next Steps:** Update with immediate next steps and follow-up items
- ✅ **Session Metrics:** Finalize all metrics (files created/modified, lines of code, commits, tests)

### 3. Finalize Metrics

**Update session metrics section with accurate counts:**

- Files Created: [count]
- Files Modified: [count]
- Lines of Code Added: [approximate count]
- Lines of Code Removed: [approximate count]
- Git Commits: [count]
- Tests Created: [count]
- Checklist Items Completed: [count]
- Tests Passing: [X]/[Y]

### 4. Verify Checklist Updates

**Ensure all checklist items are updated:**

- ✅ All completed items marked as complete
- ✅ All deferred items properly documented with reasons
- ✅ All checklist deviations noted in session overview
- ✅ Status updated in checklist files

### 5. Commit Session Overview

**After completing all sections:**

- ✅ Commit the session overview to Git (if Git is set up)
- ✅ Use descriptive commit message: "Session overview: [Phase] - [Brief description]"

### 6. Provide Summary

**Give user a brief summary of:**

- What was accomplished
- Any important notes or recommendations
- Next steps for next session
- Any blockers or issues

---

## Checklist for Session End

Before marking session complete, verify:

- [ ] Session end time updated
- [ ] Session duration calculated
- [ ] Quick Overview complete
- [ ] Detailed History complete
- [ ] Checklist Deviations documented
- [ ] AI Workflow Recommendations filled in
- [ ] Development Recommendations filled in
- [ ] Questions & Discussion Points filled in
- [ ] Next Steps updated
- [ ] Session Metrics finalized
- [ ] All checklist items updated
- [ ] Session overview committed to Git (if applicable)
- [ ] Summary provided to user

---

## Notes

- **This is a living document** - update session overview continuously during session, not just at end
- **Be thorough** - ensure all sections are complete, not just placeholder text
- **Be accurate** - verify all metrics and counts are correct
- **Be helpful** - provide clear recommendations and next steps

---

## Reference

- **Session Overview Template:** `session-overviews/SESSION_OVERVIEW_TEMPLATE.md`
- **Session Start Instructions:** `AI_SESSION_START.md` (in this folder)
- **Implementation Workflow Rules:** `.cursor/rules/implementation-workflow.mdc`

