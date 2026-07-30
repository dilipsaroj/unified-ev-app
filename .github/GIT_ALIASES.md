# Helpful Git Aliases for Unified-EV

These aliases make the commit workflow faster and more convenient.

## Installation

Add these to your `~/.gitconfig` file:

```ini
[alias]
  # Quick status with branch info
  s = status -sb
  
  # Pretty log with graph
  lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative
  
  # Short log (last 10 commits)
  l = log --oneline -10
  
  # Stage interactively (for partial file staging)
  ap = add -p
  
  # Commit with message
  c = commit -m
  
  # Amend last commit (CAREFUL: only for unpushed commits)
  amend = commit --amend --no-edit
  
  # Undo last commit but keep changes staged
  undo = reset HEAD~1 --soft
  
  # Show what would be committed
  staged = diff --cached
  
  # Show what's not staged
  unstaged = diff
  
  # Clean up merged branches (after PR merge)
  cleanup = "!git branch --merged | grep -v '\\*\\|main\\|master' | xargs -n 1 git branch -d"
  
  # Sync with upstream (for forks)
  sync = "!git fetch upstream && git checkout main && git merge upstream/main && git push origin main"
  
  # Create feature branch
  feature = "!f() { git checkout -b feature/$1; }; f"
  
  # Create fix branch
  fix = "!f() { git checkout -b fix/$1; }; f"
```

## Usage Examples

### Quick Status
```bash
git s
```
Output:
```
## main...origin/main [ahead 2]
M  src/app/map/page.tsx
?? src/components/map/NewComponent.tsx
```

### Pretty Log
```bash
git lg
```
Output with colors and graph:
```
* a1b2c3d - (HEAD -> feature/filters) feat(map): add connector filter (2 minutes ago) <You>
* d4e5f6g - fix(map): prevent filter race condition (1 hour ago) <You>
* g7h8i9j - (origin/main, main) feat: complete week 4 (2 days ago) <Dilip>
```

### Stage Part of a File
```bash
git ap src/app/map/page.tsx
```
Interactive staging - choose which hunks to stage.

### Quick Commit
```bash
git c "feat(map): add CCS2 filter"
```
Shorter than typing `git commit -m`.

### View Staged Changes
```bash
git staged
```
See exactly what will be committed.

### Undo Last Commit (Keep Changes)
```bash
git undo
```
Useful if you committed too early or need to split the commit.

### Create Feature Branch
```bash
git feature add-fleet-dashboard
```
Creates and checks out `feature/add-fleet-dashboard`.

### Clean Up Merged Branches
```bash
git cleanup
```
Deletes local branches that have been merged (keeps main/master).

### Sync Fork with Upstream
```bash
git sync
```
Fetches upstream, merges into main, pushes to your fork.

---

## Pro Tips

### Combine Aliases

```bash
# Stage, commit, and view log
git ap src/app/map/page.tsx
git c "feat(map): add filter"
git lg
```

### Chain with Shell Commands

```bash
# Commit and immediately check build
git c "feat(map): add filter" && pnpm build
```

### Use with Tab Completion

Most shells support tab completion for git aliases:

```bash
git fe<TAB>  # Expands to: git feature
git lg<TAB>  # Expands to: git lg
```

---

## Verification

After adding to `~/.gitconfig`, verify:

```bash
git config --get-regexp alias
```

You should see all your aliases listed.

---

## Remove an Alias

```bash
git config --global --unset alias.s
```

Or edit `~/.gitconfig` directly and remove the line.

---

## More Resources

- [Git Aliases Documentation](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)
- [Must Have Git Aliases](https://www.durdn.com/blog/2012/11/22/must-have-git-aliases-advanced-examples/)
- [Oh My Zsh Git Plugin](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git) (even more aliases)
