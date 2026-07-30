# Commit Strategy Guide

> How to create atomic, meaningful commits for Unified-EV going forward

This guide establishes a commit strategy to avoid massive monolithic commits and maintain a clean, reviewable git history.

---

## 🎯 Principles

1. **One logical change per commit** — If you need "and" to describe it, it should be multiple commits
2. **Atomic commits** — Each commit should be independently deployable and testable
3. **Meaningful messages** — Describe the "why" not just the "what"
4. **Consistent format** — Follow conventional commits specification

---

## 📝 Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature or significant enhancement | `feat(map): add filter by connector type` |
| `fix` | Bug fix | `fix(session): correct kWh calculation for DC fast charging` |
| `refactor` | Code restructuring without behavior change | `refactor(stores): extract reliability logic to separate hook` |
| `style` | Formatting, whitespace, styling (no code logic) | `style(passport): adjust spacing in stats cards` |
| `docs` | Documentation only | `docs: add API integration guide for Layer 2` |
| `test` | Adding or fixing tests | `test(recommend): add unit tests for smart recommendation` |
| `chore` | Tooling, dependencies, config | `chore: update tailwind to 4.0` |
| `perf` | Performance improvement | `perf(map): optimize station clustering for 1000+ pins` |
| `build` | Build system or dependencies | `build: add bundle analyzer` |
| `ci` | CI/CD changes | `ci: add vercel preview deployments` |

### Scope (Optional but Recommended)

Scopes help identify which part of the app changed:

**Features:**
- `map` — Unified map screen
- `station` — Station detail screen
- `scan` — QR scanning & payment
- `session` — Active session & completion
- `route` — Route planner
- `passport` — Charging passport
- `profile` — User profile
- `onboarding` — OTP & vehicle setup

**Technical:**
- `stores` — Zustand state management
- `hooks` — Custom React hooks
- `components` — Shared UI components
- `data` — Data layer & mock client
- `lib` — Utilities & business logic
- `api` — API routes (future)

**Infrastructure:**
- `config` — Next.js, TypeScript, ESLint config
- `deps` — Dependency updates
- `deploy` — Deployment configuration

### Subject Line Rules

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Max 72 characters
- Be specific: "add CCS2 filter" not "update filters"

### Body (When to Include)

Add a body if:
- The change needs context beyond the subject
- There are multiple sub-changes within the logical unit
- You're fixing a non-obvious bug
- Trade-offs were made

Format:
- Separate from subject with blank line
- Wrap at 72 characters
- Use bullet points for multiple points
- Explain **why** not **what** (code shows what)

### Footer (Optional)

Use for:
- Breaking changes: `BREAKING CHANGE: removed support for Type 1 connectors`
- Issue references: `Closes #123`
- Co-authors: `Co-authored-by: Cursor <cursoragent@cursor.com>`

---

## ✅ Good Commit Examples

### Example 1: Single Feature
```
feat(map): add connector type filter

Users can now filter stations by connector type (CCS2, CHAdeMO, Type 2, 
Bharat AC/DC). Filter chips appear below the search bar and update the 
map pins in real-time.

- Add FilterChips component with connector icons
- Update mapStore to track active connector filters
- Filter station list in useStations hook
```

### Example 2: Bug Fix
```
fix(session): correct settlement calculation for partial charges

Previous calculation didn't account for minimum billing increments. 
Now rounds up to nearest ₹1 as per CPO requirements.

Fixes edge case where ₹347.23 was captured as ₹347.00
```

### Example 3: Refactor
```
refactor(reliability): extract calculation to separate utility

Moved reliability score calculation from useStations to 
lib/reliability.ts for reuse in route planner and station detail.

No behavior change.
```

### Example 4: Multiple Related Changes
```
feat(passport): add battery health chart

- Create BatteryHealthChart component using Recharts
- Add last 10 sessions data to chart
- Show degradation trend with color-coded zones
- Add tooltip with session details on hover
```

### Example 5: Documentation
```
docs: add Layer 2 backend migration guide

Details Supabase schema, auth flow, and data client migration path 
for post-pilot implementation.
```

---

## ❌ Bad Commit Examples

### Too Vague
```
fix: bug fixes
update: improvements
feat: new stuff
```

**Why bad:** Impossible to understand what changed without reading the diff.

**Better:**
```
fix(session): prevent duplicate session creation on double-tap
feat(map): add 15 new stations in Delhi NCR corridor
refactor(components): extract StationCard to separate file
```

### Too Large
```
feat: complete week 4 - route planner + passport + polish

[Describes 50+ file changes across 3 major features]
```

**Why bad:** Multiple unrelated changes. If route planner has a bug, you can't revert without losing passport work.

**Better:** Split into 8-10 commits:
```
feat(route): add route data structure and types
feat(route): implement Mumbai-Pune route with polyline
feat(route): add charging stop recommendations
feat(route): create RouteMap component
feat(passport): add charging history data structure
feat(passport): create Passport screen layout
feat(passport): add BatteryHealthChart component
feat(passport): integrate session history filter
style(landing): update hero copy to match approved messaging
docs: add founder story content
```

### Mixing Concerns
```
feat: add dark mode and fix session bug and update dependencies
```

**Why bad:** Three unrelated changes. Should be three commits.

**Better:**
```
feat(theme): add dark mode toggle with system preference
fix(session): correct SoC calculation for Tesla vehicles
chore(deps): update recharts to 2.12.0
```

---

## 🔄 Workflow for Atomic Commits

### 1. Make Changes in Small Batches

Instead of:
```bash
# Work for 3 hours, change 20 files
git add .
git commit -m "feat: lots of stuff"
```

Do:
```bash
# Implement one feature
git add src/components/map/FilterChips.tsx
git add src/stores/mapStore.ts
git commit -m "feat(map): add connector type filter chips"

# Implement next feature
git add src/hooks/useStations.ts
git commit -m "feat(map): filter stations by connector type"

# Polish the feature
git add src/components/map/FilterChips.tsx
git commit -m "style(map): improve filter chip spacing on mobile"
```

### 2. Use `git add -p` for Partial Staging

If you have changes in one file that belong to different commits:

```bash
git add -p src/components/map/MapCanvas.tsx
# Stage only the lines related to one logical change
git commit -m "feat(map): add clustering for 100+ stations"

git add -p src/components/map/MapCanvas.tsx
# Stage the remaining lines
git commit -m "fix(map): prevent map flicker on filter change"
```

### 3. Check Before Committing

```bash
# See what's staged
git diff --cached

# See full diff
git diff

# Review files changed
git status
```

### 4. Commit Often, Push in Batches

- Commit after every logical unit (could be 10+ commits per hour)
- Push to remote every 3-5 commits or end of work session
- Don't push broken code (run `pnpm build` first)

---

## 📦 Feature Branch Strategy

For larger features that take multiple days:

### 1. Create Feature Branch
```bash
git checkout -b feature/fleet-dashboard
```

### 2. Make Atomic Commits
```bash
git commit -m "feat(fleet): add fleet data types"
git commit -m "feat(fleet): create FleetDashboard page"
git commit -m "feat(fleet): add vehicle list component"
git commit -m "feat(fleet): integrate session data"
git commit -m "test(fleet): add dashboard unit tests"
```

### 3. Keep Branch Updated
```bash
# Rebase on main regularly to avoid conflicts
git fetch origin
git rebase origin/main
```

### 4. Merge with Squash (Optional)

If you have too many micro-commits (e.g., 30 commits for one feature), you can squash on merge:

```bash
git checkout main
git merge --squash feature/fleet-dashboard
git commit -m "feat(fleet): add fleet management dashboard

Includes:
- Fleet data types and stores
- Dashboard page with vehicle list
- Session aggregation by vehicle
- Unit tests and documentation
"
```

---

## 🚫 What NOT to Commit

1. **Environment files with secrets**
   - ❌ `.env.local` with API keys
   - ✅ `.env.example` as template

2. **Build artifacts**
   - ❌ `.next/`, `dist/`, `out/`
   - ✅ These are in `.gitignore`

3. **Dependencies**
   - ❌ `node_modules/`
   - ✅ `package.json` and `pnpm-lock.yaml`

4. **IDE configs (personal)**
   - ❌ `.vscode/settings.json` (personal preferences)
   - ✅ `.vscode/extensions.json` (recommended extensions)

5. **Temporary files**
   - ❌ `debug.log`, `test.js`, `.DS_Store`

6. **Large binary files**
   - ❌ Large images, videos (use Git LFS if needed)
   - ✅ Small icons, logos (<100KB)

---

## 🔧 Git Aliases (Optional Time Savers)

Add to `~/.gitconfig`:

```ini
[alias]
  # Quick status
  s = status -sb
  
  # Pretty log
  lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
  
  # Stage interactively
  ap = add -p
  
  # Commit with message
  c = commit -m
  
  # Amend last commit (use carefully!)
  amend = commit --amend --no-edit
  
  # Undo last commit but keep changes
  undo = reset HEAD~1 --soft
```

Usage:
```bash
git s           # Quick status
git lg          # Pretty log
git ap file.tsx # Stage parts of file
git c "feat(map): add filters"
```

---

## 📊 Review Your Commits

Before pushing, check your commit history:

```bash
# Last 5 commits
git log --oneline -5

# Detailed last 3 commits
git log -3 --stat

# Visual graph
git log --graph --oneline --all -10
```

**Quality check:**
- [ ] Each commit has a clear, specific message
- [ ] Subject lines are <72 characters
- [ ] No "WIP", "fix", "update" generic messages
- [ ] Each commit is atomic (one logical change)
- [ ] Build passes for each commit
- [ ] No secrets or temp files committed

---

## 🎓 Learning Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Atomic Commits](https://www.aleksandrhovhannisyan.com/blog/atomic-git-commits/)

---

## 📞 Questions?

If you're unsure whether to split a commit, ask:
1. Could I revert this commit without affecting unrelated features?
2. Can I describe this commit in one sentence without using "and"?
3. Would a code reviewer understand this change from the message alone?

If any answer is "no", split the commit.

---

**Remember:** Good commits are a gift to your future self and your team. Take the extra 30 seconds to make them meaningful.