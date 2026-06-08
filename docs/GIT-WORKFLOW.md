# Git Workflow & Branching Strategy

How to collaborate on this repo using Git — clone, branch, commit, push, pull, and merge.

---

## Branch overview

| Branch | Purpose |
|---|---|
| **`main`** | Production-ready code. Protected — changes land here via PR only. |
| **`clean-main`** | Active integration branch (current default in this repo). Feature branches merge here first. |
| **`feature/*`** | Short-lived branches for new work |
| **`fix/*`** | Bug fixes |
| **`chore/*`** | Tooling, deps, config, docs |

> **Note:** This repo currently uses `clean-main` as the primary working branch. Treat it like `main` for day-to-day development until the team consolidates to a single default branch.

---

## Branching strategy (GitHub Flow)

We use a simplified **GitHub Flow**:

```
main (or clean-main)
  └── feature/add-job-filters     ← your work happens here
  └── fix/onboarding-redirect
  └── chore/update-deps
```

### Rules

1. **Never commit directly to `main` / `clean-main`** — always use a feature branch + PR
2. **Keep branches short-lived** — merge within a few days, not weeks
3. **One concern per branch** — don't mix unrelated features and fixes
4. **Pull before you push** — stay up to date with the base branch
5. **Delete branches after merge** — keeps the repo clean

### Branch naming

```bash
feature/short-description    # new functionality
fix/short-description        # bug fix
chore/short-description      # maintenance, docs, deps
```

Examples:

```bash
feature/job-search-filters
fix/auth-callback-redirect
chore/add-setup-docs
```

---

## Daily workflow

### 1. Start fresh — pull latest

```bash
git checkout clean-main
git pull origin clean-main
```

### 2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

### 3. Make changes and commit

```bash
# See what changed
git status
git diff

# Stage specific files
git add app/api/jobs/route.ts
git add components/jobs/FilterPanel.tsx

# Or stage everything
git add .

# Commit with a clear message
git commit -m "feat: add visa type filter to job search"
```

#### Commit message format

```
<type>: <short description>

Types:
  feat     — new feature
  fix      — bug fix
  chore    — tooling, deps, config
  docs     — documentation only
  refactor — code change, no behavior change
  test     — adding/updating tests
```

Examples:

```bash
git commit -m "feat: add sponsor score badge to job cards"
git commit -m "fix: redirect to onboarding when profile incomplete"
git commit -m "docs: add architecture walkthrough"
git commit -m "chore: bump next to 14.2.16"
```

### 4. Push your branch

First push (sets upstream tracking):

```bash
git push -u origin feature/my-feature
```

Subsequent pushes:

```bash
git push
```

### 5. Open a Pull Request

On GitHub, open a PR from `feature/my-feature` → `clean-main` (or `main`).

Include:
- What changed and why
- How to test it
- Screenshots for UI changes

### 6. After merge — clean up locally

```bash
git checkout clean-main
git pull origin clean-main
git branch -d feature/my-feature        # delete local branch
git push origin --delete feature/my-feature  # delete remote branch (optional)
```

---

## Pull & sync commands

### Pull latest changes on current branch

```bash
git pull
```

### Pull a specific branch

```bash
git pull origin clean-main
```

### Fetch without merging (safe preview)

```bash
git fetch origin
git log HEAD..origin/clean-main --oneline   # see what's new on remote
```

### Rebase your feature branch onto latest main

Keeps a linear history. Do this **before** opening a PR or after review feedback:

```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/clean-main

# If conflicts occur, fix them, then:
git add .
git rebase --continue

# Force push only YOUR feature branch (never main)
git push --force-with-lease
```

> Use `--force-with-lease` instead of `--force` — it refuses to overwrite if someone else pushed to your branch.

---

## Common scenarios

### Clone the repo for the first time

```bash
git clone <repo-url>
cd homebase
git checkout clean-main
```

### Check which branch you're on

```bash
git branch          # local branches (* = current)
git branch -a       # all branches including remote
git status          # current branch + uncommitted changes
```

### Switch branches

```bash
git checkout clean-main
git checkout feature/my-feature

# Or (Git 2.23+)
git switch clean-main
git switch -c feature/new-thing   # create + switch
```

### Stash uncommitted work temporarily

```bash
git stash                  # save changes, clean working tree
git checkout other-branch  # switch branches
git stash pop              # restore stashed changes
```

### Undo uncommitted changes

```bash
git checkout -- path/to/file     # discard changes to one file
git restore path/to/file         # same (Git 2.23+)
git reset --hard HEAD            # discard ALL uncommitted changes (destructive)
```

### Undo last commit (keep changes)

```bash
git reset --soft HEAD~1
```

### See commit history

```bash
git log --oneline -20
git log --oneline --graph --all   # visual branch graph
```

### See what changed in a commit

```bash
git show <commit-hash>
git diff main..feature/my-feature  # diff between branches
```

---

## Working with remotes

### List remotes

```bash
git remote -v
```

### Add a remote (if you forked)

```bash
git remote add origin https://github.com/your-org/homebase.git
git remote add upstream https://github.com/original-org/homebase.git
```

### Pull from upstream (fork workflow)

```bash
git fetch upstream
git checkout clean-main
git merge upstream/clean-main
git push origin clean-main
```

---

## What NOT to do

| Don't | Why |
|---|---|
| `git push --force` to `main` / `clean-main` | Overwrites shared history — breaks teammates' repos |
| Commit `.env.local` or secrets | Credentials leak into git history permanently |
| Commit `node_modules/` | Huge, reproducible via `npm install` |
| Long-lived branches without merging | Causes painful merge conflicts |
| Mix unrelated changes in one commit | Hard to review and revert |

`.env.local`, `node_modules/`, and Supabase temp files are already in `.gitignore`.

---

## Quick reference cheat sheet

```bash
# Setup
git clone <url> && cd homebase
git checkout clean-main

# New work
git pull origin clean-main
git checkout -b feature/my-feature

# Save work
git add .
git commit -m "feat: description"
git push -u origin feature/my-feature

# Stay updated
git fetch origin
git rebase origin/clean-main

# After PR merged
git checkout clean-main
git pull origin clean-main
git branch -d feature/my-feature
```
