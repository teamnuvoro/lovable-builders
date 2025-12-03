# Quick Git Commands Reference

## 🚀 Push to GitHub - Simple Steps

### Method 1: Fresh Repository (Recommended)

```bash
# Step 1: Initialize Git
git init

# Step 2: Add all files
git add .

# Step 3: Create first commit
git commit -m "Initial commit: Riya AI with video/audio calling features"

# Step 4: Set main branch
git branch -M main

# Step 5: Add GitHub repository
git remote add origin https://github.com/teamnuvoro/ready-to-deploy.git

# Step 6: Push to GitHub
git push -u origin main
```

---

### Method 2: If Repository Already Exists

```bash
# If remote already exists, update it
git remote set-url origin https://github.com/teamnuvoro/ready-to-deploy.git

# Pull existing changes first
git pull origin main --rebase

# Then push your changes
git push -u origin main
```

---

### Method 3: Force Push (Use with Caution!)

**⚠️ Warning: This will overwrite everything in the remote repository**

```bash
# Only use if you're sure you want to replace everything
git push -u origin main --force
```

---

## 📝 Making Updates After Initial Push

### Update existing code:

```bash
# Step 1: Make your changes to files

# Step 2: Check what changed
git status

# Step 3: Add changed files
git add .

# Step 4: Commit with message
git commit -m "Add video calling feature"

# Step 5: Push to GitHub
git push
```

---

## 🔍 Useful Git Commands

### Check Status
```bash
# See what files have changed
git status

# See what's different in files
git diff
```

### View History
```bash
# See commit history
git log

# See history in one line
git log --oneline

# See last 5 commits
git log -5
```

### Remote Management
```bash
# Check current remote
git remote -v

# Add new remote
git remote add origin URL

# Change remote URL
git remote set-url origin NEW_URL

# Remove remote
git remote remove origin
```

### Branch Management
```bash
# See all branches
git branch

# Create new branch
git branch feature-name

# Switch to branch
git checkout feature-name

# Create and switch in one command
git checkout -b feature-name

# Delete branch
git branch -d feature-name
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "fatal: remote origin already exists"

```bash
# Solution: Remove and re-add remote
git remote remove origin
git remote add origin https://github.com/teamnuvoro/ready-to-deploy.git
```

### Issue 2: "rejected because the remote contains work"

```bash
# Solution: Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue 3: Merge conflicts

```bash
# Solution: Resolve conflicts manually
# Open conflicted files, fix conflicts
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Issue 4: "Authentication failed"

```bash
# Solution: Use personal access token
# 1. Go to GitHub Settings → Developer settings → Personal access tokens
# 2. Generate new token with 'repo' scope
# 3. Use token as password when prompted

# Or configure Git credential helper
git config --global credential.helper store
```

### Issue 5: Want to undo last commit

```bash
# Keep changes but undo commit
git reset --soft HEAD~1

# Discard changes and undo commit (careful!)
git reset --hard HEAD~1
```

---

## 📦 Ignore Files (.gitignore)

Create a `.gitignore` file to exclude certain files:

```bash
# Create .gitignore
touch .gitignore
```

Add these lines to `.gitignore`:

```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env*.local

# Build output
dist/
build/

# Logs
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

Then commit:
```bash
git add .gitignore
git commit -m "Add .gitignore"
git push
```

---

## 🏷️ Tagging Releases

### Create version tags:

```bash
# Create tag for version 1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial launch with calling"

# Push tags to GitHub
git push origin --tags

# List all tags
git tag

# Delete a tag locally
git tag -d v1.0.0

# Delete tag from remote
git push origin --delete v1.0.0
```

---

## 🔄 Sync Fork (If Working with Team)

```bash
# Add upstream repository
git remote add upstream https://github.com/original/repo.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git merge upstream/main

# Or rebase instead of merge
git rebase upstream/main
```

---

## 📊 View Repository Info

```bash
# Show remote repositories
git remote -v

# Show current branch
git branch --show-current

# Show all branches (local and remote)
git branch -a

# Show configuration
git config --list
```

---

## 🚨 Emergency Commands

### Undo Everything (Back to Last Commit)
```bash
# Discard all local changes
git reset --hard HEAD

# Remove untracked files
git clean -fd
```

### Revert a Pushed Commit
```bash
# Create new commit that undoes changes
git revert COMMIT_HASH

# Push the revert
git push
```

### Change Last Commit Message
```bash
# Change message of last commit (before push)
git commit --amend -m "New message"

# If already pushed (creates new commit)
git commit --amend -m "New message"
git push --force-with-lease
```

---

## ✅ Workflow for Daily Development

```bash
# 1. Start your day - get latest code
git pull origin main

# 2. Create feature branch
git checkout -b feature/add-notifications

# 3. Make changes to files
# ... code, code, code ...

# 4. Check what changed
git status

# 5. Add changes
git add .

# 6. Commit changes
git commit -m "Add push notification feature"

# 7. Push to GitHub
git push origin feature/add-notifications

# 8. Create Pull Request on GitHub
# Go to GitHub and click "Create Pull Request"

# 9. After merge, switch back to main
git checkout main

# 10. Pull merged changes
git pull origin main

# 11. Delete feature branch
git branch -d feature/add-notifications
```

---

## 📱 GitHub CLI (Optional - Advanced)

Install GitHub CLI: https://cli.github.com/

```bash
# Login to GitHub
gh auth login

# Clone repository
gh repo clone teamnuvoro/ready-to-deploy

# Create repository
gh repo create teamnuvoro/ready-to-deploy --public

# Create pull request
gh pr create --title "Add calling feature" --body "Details..."

# View pull requests
gh pr list

# View repository in browser
gh repo view --web
```

---

## 🎯 Your Specific Commands for Riya AI

### First Time Setup:
```bash
cd /path/to/your/riya-ai-project
git init
git add .
git commit -m "Riya AI: Complete app with video/audio calling"
git branch -M main
git remote add origin https://github.com/teamnuvoro/ready-to-deploy.git
git push -u origin main
```

### Daily Updates:
```bash
# After making changes
git add .
git commit -m "Describe your changes here"
git push
```

### Check Everything is Pushed:
```bash
git status
# Should say: "nothing to commit, working tree clean"
```

---

## 🌟 Pro Tips

1. **Commit Often** - Small, frequent commits are better than large ones
2. **Write Good Messages** - Describe what and why, not how
3. **Pull Before Push** - Always pull latest changes before pushing
4. **Use Branches** - Don't work directly on main for big features
5. **Review Before Commit** - Use `git diff` to check changes
6. **Backup Important Work** - Push to GitHub regularly

---

## 📚 Learn More

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Interactive Tutorial: https://learngitbranching.js.org/

---

**Ready to push your code? Start with the "First Time Setup" commands above! 🚀**
