---
name: saveb4clear
description: Document significant session work to history/ folder before clearing conversation
source: rocket289k/Noted
---

# Save Before Clear

Document the session's significant work, update project tracking, and set a resume breadcrumb before clearing the conversation.

## Instructions

### Step 1: Document session work to history/

1. **Review the conversation** for significant changes made during this session:
   - Bug fixes
   - New features
   - Architecture/design decisions
   - Spec or requirements changes
   - Configuration changes
   - Refactoring
   - Build/CI changes

2. **For each significant change**, create a history log file at:

   ```
   {project}/history/yyyy-mm-dd - {Task Description}.md
   ```

   Use this format:

   ```markdown
   # {Task Description}

   **Date:** yyyy-mm-dd
   **Type:** {Bug Fix | Feature | Decision | Refactor | Config | Docs}

   ## What

   {Brief description of what was done, including key files changed}

   ## Why

   {Reason/motivation for the change}

   ## Problems Encountered

   {Any issues hit during implementation, or "None"}

   ## How

   {Key implementation details, approach taken}
   ```

3. **If multiple unrelated changes** were made, create separate log files for each.

4. **Format history files** — After creating each history file, run prettier on it to prevent CI failures:

   ```bash
   pnpm prettier --write "history/{filename}.md"
   ```

   This is critical — history files have repeatedly broken CI formatting checks.

5. **Skip documentation** for:
   - Trivial typo fixes
   - Exploratory questions that didn't result in changes
   - Changes that were already documented earlier in the session

### Step 2: Track bugs (MANDATORY)

**Run `document_bugs_issues` skill** — This is a **blocking prerequisite**, not optional. If ANY bug fixes were made during the session, you MUST invoke the `document_bugs_issues` skill BEFORE reporting completion. This ensures:

- Every fixed bug has a GitHub Issue (created if missing, closed with fix comment)
- Every fixed bug has a `docs/BUG_FIXES.md` entry with `**GitHub Issue:** #NNN` cross-reference
- Pre-existing open issues matching fixed bugs are found and closed
- No stale open issues remain for bugs that were fixed

**DO NOT** handle GitHub Issues or BUG_FIXES.md manually — always delegate to the skill so the full checklist (audit open issues, create missing issues, close fixed issues, cross-reference) is followed consistently.

**Even if no bugs were fixed**, briefly verify: run `gh issue list --state open` and confirm no open issues correspond to work done in this session.

### Step 3: Update ROADMAP.md (MANDATORY)

Read `docs/ROADMAP.md` and update it to reflect this session's work:

1. **Check off completed steps** — Change `[ ]` to `[x]`, add strikethrough to the item text, and append ` — Done yyyy-mm-dd`
2. **Update progress counters** — Recalculate "Progress: N/M complete" for any phase that changed
3. **Add new steps** — If work done this session introduced new planned work not yet in the roadmap, add it as a new numbered step in the appropriate phase
4. **Modify existing steps** — If decisions changed the scope or approach of a step, update its description
5. **Update gap analysis** — If HIPAA gaps were addressed, strikethrough the row and mark as fixed
6. **Move steps between phases** — If priorities shifted, move steps to the appropriate phase and renumber

**Key principle:** The roadmap must always reflect the current plan and current progress. Anyone reading it should know exactly what's done, what's next, and what changed.

7. **Refresh status line roadmap cache** — After updating ROADMAP.md, run:
   ```bash
   node -e "
   const fs = require('fs');
   const path = require('path');
   const dir = process.cwd();
   const cacheDir = path.join(require('os').homedir(), '.claude', 'cache');
   let roadmapPath = null;
   let searchDir = dir;
   for (let i = 0; i < 5; i++) {
     const c = path.join(searchDir, 'docs', 'ROADMAP.md');
     if (fs.existsSync(c)) { roadmapPath = c; break; }
     const p = path.dirname(searchDir); if (p === searchDir) break; searchDir = p;
   }
   if (!roadmapPath) { console.log('No ROADMAP.md found'); process.exit(0); }
   const content = fs.readFileSync(roadmapPath, 'utf8');
   const phases = []; let cur = null;
   for (const line of content.split('\n')) {
     const pm = line.match(/^### Phase (\d+):/);
     if (pm) { cur = { number: parseInt(pm[1]), steps: [], completed: 0, total: 0 }; phases.push(cur); continue; }
     if (cur) { const sm = line.match(/^\|\s*(\d+\.\d+)\s*\|\s*\[([ x])\]\s*\|/); if (sm) { const d = sm[2]==='x'; cur.steps.push({id:sm[1],done:d}); cur.total++; if(d) cur.completed++; } }
   }
   if (!phases.length) { console.log('No phases found'); process.exit(0); }
   const totalSteps = phases.reduce((s,p) => s+p.total, 0);
   const totalDone = phases.reduce((s,p) => s+p.completed, 0);
   const active = phases.find(p => p.completed < p.total) || phases[phases.length-1];
   const next = active.steps.find(s => !s.done);
   const data = { pct: Math.round((totalDone/totalSteps)*100), phase: active.number, totalPhases: phases.length, phaseCompleted: active.completed, phaseTotal: active.total, nextStep: next ? next.id : null };
   if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, {recursive:true});
   fs.writeFileSync(path.join(cacheDir, 'roadmap-progress.json'), JSON.stringify({dir, timestamp: Date.now(), data}));
   console.log('Status line updated:', data.pct + '% P' + data.phase + '/' + data.totalPhases + (data.nextStep ? ' next:' + data.nextStep : ''));
   "
   ```
   This writes the cache file that the status line reads. Without this step, the status line progress won't reflect ROADMAP.md changes until the next `/saveb4clear`.

### Step 3.5: Update step plan progress (if exists)

If there's an active plan in `docs/plans/` for the current step:

1. Mark completed sub-steps with `[x]`
2. Note any deviations from the original plan
3. If the step is fully complete, move the plan to `docs/plans/completed/`

### Step 4: Update plans and specs if decisions changed

If the session involved **architecture decisions, plan changes, or scope changes**:

1. **Update the relevant spec** in `specs/` or `docs/` to reflect the new decision
2. **Update MEMORY.md** "Key Architectural Decisions" section if a new major decision was made
3. **Update `.claude/rules/`** if new patterns or anti-patterns were established

Skip this step if the session was pure implementation with no plan/decision changes.

### Step 5: Write resume breadcrumb to MEMORY.md (MANDATORY)

Update the `## Current Position` section at the **top** of `MEMORY.md` (right after the header line). This section is loaded into every new session's system prompt, so it must give Claude enough context to resume immediately.

Write or replace this section:

```markdown
## Current Position

- **Roadmap Phase:** Phase {N} — {Phase Title}
- **Last Completed:** Step {N.X} — {step description}
- **Next Step:** Step {N.Y} — {step description}
- **Blockers:** {any blockers, or "None"}
- **Key Context:** {1-2 sentences of essential context for the next step — what was just built that the next step depends on, any decisions made, any gotchas discovered}
- **Session History:** history/{most recent history file}.md
```

If the session didn't advance the roadmap (e.g., pure bug fixes or tooling work), still update the breadcrumb to reflect the current position and note what was done instead.

### Step 6: Sync shared memory (if configured)

If this project has a `dotfiles/MEMORY.md` file (shared Claude Code memory across machines), sync it to the remote so other machines and developers receive the latest lessons.

1. **Check for dotfiles changes** to sync:
   ```bash
   git diff --name-only dotfiles/ 2>/dev/null
   ```
   If no dotfiles changed, skip to Step 7.

2. **Pull latest** from remote (uses autostash to preserve uncommitted session work):
   ```bash
   git pull --rebase --autostash origin $(git branch --show-current)
   ```
   If merge conflicts occur in `dotfiles/MEMORY.md`, resolve by keeping both versions — append the incoming additions below the local ones.

3. **Stage and commit only dotfiles** (do NOT stage history, ROADMAP, or other session files):
   ```bash
   git add dotfiles/MEMORY.md
   git add dotfiles/global-settings.json 2>/dev/null
   git diff --cached --quiet || git commit -m "auto: sync Claude Code memory"
   ```

4. **Push**:
   ```bash
   git push
   ```
   If push fails, warn the user but do not retry — the commit is saved locally and will sync next session.

**Skip this step entirely** if `dotfiles/MEMORY.md` does not exist in the project root.

### Step 7: Confirm and wait

**After completing all steps**, confirm to the user:

```
Session documented:
- history/yyyy-mm-dd - {Change 1}.md
- history/yyyy-mm-dd - {Change 2}.md

Bugs tracked: {count} (GitHub Issues created/closed + BUG_FIXES.md updated)
Roadmap updated: {summary of changes, e.g., "Phase 1: 3/9 → 4/9 complete"}
Memory synced: {pushed | no changes | skipped (no dotfiles/MEMORY.md) | push failed (committed locally)}
Resume point: Phase {N}, Step {N.Y} — {next step description}

Ready to clear. Run /clear when ready.
```

**Do NOT automatically clear** — let the user review and run `/clear` manually.
