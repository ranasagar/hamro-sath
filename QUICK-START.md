# 🚀 Quick Start Guide

## Development Commands

### Start Development Server
```bash
npm run dev
```
Open browser to http://localhost:3000

### Code Quality
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all code
npm run format:check  # Check if code is formatted
npm run type-check    # Check TypeScript types
```

### Build & Preview
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📁 Project Structure

```
hamro-saath-safa-nepal-v3/
├── .github/                    # Documentation & workflows
│   ├── DEVELOPMENT-TOOLS.md   # Tools inventory
│   ├── PHASE-0-PROGRESS.md    # Current progress
│   └── prompts/               # AI prompts
├── .vscode/                   # VS Code settings
├── components/                # 24 React components
├── pages/                     # 13 page components
├── App.tsx                    # Main app (1300+ lines)
├── types.ts                   # TypeScript interfaces
├── constants.tsx              # Mock data
├── imageUtils.ts              # Image utilities
├── index.tsx                  # Entry point
├── DEVELOPMENT-BLUEPRINT.md   # Development roadmap
└── package.json               # Dependencies
```

---

## 🎯 Current Status

**Phase:** 0 - Foundation Setup  
**Progress:** 75% Complete  
**Issues:** 15 errors, 49 warnings

### ✅ Completed
- Development environment setup
- Linting and formatting configured
- Form validation tools installed
- VS Code workspace configured

### 🚧 Next Tasks
1. Fix 15 ESLint errors
2. Set up Git hooks
3. Enable TypeScript strict mode

---

## 📋 Todo List

Use this command to view/update todos:
- Read: `manage_todo_list` with operation="read"
- Write: `manage_todo_list` with operation="write"

Current todos tracked in DEVELOPMENT-BLUEPRINT.md

---

## 🔧 Common Tasks

### Add a New Component
1. Create file in `components/` folder
2. Use TypeScript and React.FC type
3. Add proper prop types
4. Run `npm run lint:fix` to format

### Add a New Page
1. Create file in `pages/` folder
2. Import in `App.tsx`
3. Add route logic
4. Update Page type in `types.ts`

### Fix Linting Error
1. Run `npm run lint` to see errors
2. Fix error in code
3. Run `npm run lint:fix` to auto-fix formatting
4. Verify with `npm run lint`

---

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Stop any running node processes
Stop-Process -Name node -Force

# Reinstall dependencies
rm -r node_modules
npm install

# Try again
npm run dev
```

### Linting Errors
```bash
# See full error details
npm run lint

# Auto-fix what's possible
npm run lint:fix

# Check specific file
npx eslint path/to/file.tsx
```

### TypeScript Errors
```bash
# Check types without building
npm run type-check

# See errors in VS Code
# Open Command Palette (Ctrl+Shift+P)
# Type: "TypeScript: Restart TS Server"
```

---

## 📖 Documentation

- **DEVELOPMENT-BLUEPRINT.md** - Full development roadmap
- **.github/DEVELOPMENT-TOOLS.md** - Tools and installation
- **.github/PHASE-0-PROGRESS.md** - Current progress report
- **CHANGELOG.md** - Version history
- **README.md** - Project overview

---

## 🤝 Workflow

### Before Starting Work
1. Pull latest changes
2. Review current todo list
3. Check for any errors: `npm run lint`

### While Working
1. Make small, incremental changes
2. Test in browser frequently
3. Run `npm run lint:fix` periodically

### Before Committing
1. Run `npm run lint` - Fix any errors
2. Run `npm run format` - Format code
3. Run `npm run type-check` - Check types
4. Test in browser one final time

### After Task Complete
1. Update todo list status
2. Document changes in commit message
3. Update CHANGELOG.md if needed

---

## 💬 Getting Help

### Ask for:
- Specific file and line number
- What you're trying to achieve
- Any error messages
- Your preferences

### Provide:
- Clear, specific description
- Relevant code context
- Expected vs actual behavior

---

**Quick Tips:**
- 📝 Always update the todo list
- 🔍 Fix errors before moving on
- 🧪 Test after each change
- 📚 Document important decisions

**Last Updated:** November 18, 2025
