# 🧰 Development Tools Checklist

This document tracks all required tools for developing Hamro Saath - Safa Nepal v3.

## ✅ Already Installed

### Core Dependencies (from package.json)
- ✅ **react@19.2.0** - UI framework
- ✅ **react-dom@19.2.0** - React DOM rendering
- ✅ **typescript@5.8.2** - Type safety
- ✅ **vite@6.2.0** - Build tool and dev server
- ✅ **@vitejs/plugin-react@5.0.0** - React support for Vite
- ✅ **@types/node@22.14.0** - Node.js type definitions

---

## 🔧 Essential Tools to Install (Phase 0)

### Code Quality
- [ ] **eslint** - JavaScript/TypeScript linting
- [ ] **@typescript-eslint/parser** - TypeScript parser for ESLint
- [ ] **@typescript-eslint/eslint-plugin** - TypeScript linting rules
- [ ] **eslint-plugin-react** - React-specific linting rules
- [ ] **eslint-plugin-react-hooks** - React hooks linting
- [ ] **prettier** - Code formatter
- [ ] **eslint-config-prettier** - Disable ESLint rules that conflict with Prettier
- [ ] **eslint-plugin-prettier** - Run Prettier as ESLint rule

### Git Hooks
- [ ] **husky** - Git hooks manager
- [ ] **lint-staged** - Run linters on staged files

### Form Management & Validation
- [ ] **react-hook-form** - Performant form management
- [ ] **zod** - TypeScript-first schema validation
- [ ] **@hookform/resolvers** - Connect Zod with React Hook Form

---

## 🧪 Testing Tools (Phase 1)

### Unit Testing
- [ ] **vitest** - Fast unit test framework (Vite-native)
- [ ] **@vitest/ui** - Vitest UI dashboard
- [ ] **jsdom** - DOM implementation for Node.js
- [ ] **@testing-library/react** - React component testing utilities
- [ ] **@testing-library/jest-dom** - Custom Jest matchers
- [ ] **@testing-library/user-event** - User interaction simulation

### E2E Testing
- [ ] **playwright** - Modern E2E testing framework
- [ ] **@playwright/test** - Playwright test runner

### API Mocking
- [ ] **msw** - Mock Service Worker for API mocking

---

## 🎨 UI/UX Enhancements (Phase 2)

### Styling
- [ ] **tailwindcss** - Utility-first CSS (currently using inline styles)
- [ ] **autoprefixer** - PostCSS plugin for vendor prefixes
- [ ] **postcss** - CSS transformation tool

### Animation
- [ ] **framer-motion** - Production-ready animation library

### Icons (Alternative to custom Icons.tsx)
- [ ] **lucide-react** OR **react-icons** - Icon library

---

## 📊 State Management (If needed - Phase 3)

- [ ] **zustand** - Lightweight state management
- [ ] **@tanstack/react-query** - Server state management
- [ ] **react-query-devtools** - React Query debugging

---

## 🌐 Backend Tools (Phase 4)

### HTTP Client
- [ ] **axios** - Promise-based HTTP client
- [ ] **swr** OR **@tanstack/react-query** - Data fetching/caching

### Authentication
- [ ] **jose** - JWT utilities
- [ ] **bcryptjs** - Password hashing (backend)

### File Upload
- [ ] **react-dropzone** - Drag-n-drop file upload

---

## 📦 Build & Bundle Optimization

- [ ] **vite-plugin-compression** - Gzip/Brotli compression
- [ ] **rollup-plugin-visualizer** - Bundle size visualization
- [ ] **vite-plugin-pwa** - Progressive Web App support

---

## 🔍 Developer Experience

### VS Code Extensions (Recommended)
- [ ] **ESLint** (dbaeumer.vscode-eslint)
- [ ] **Prettier** (esbenp.prettier-vscode)
- [ ] **Error Lens** (usernamehw.errorlens)
- [ ] **Auto Rename Tag** (formulahendry.auto-rename-tag)
- [ ] **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- [ ] **GitLens** (eamodio.gitlens)
- [ ] **Import Cost** (wix.vscode-import-cost)
- [ ] **Pretty TypeScript Errors** (yoavbls.pretty-ts-errors)

### Browser Extensions
- [ ] **React Developer Tools** - Component inspection
- [ ] **Redux DevTools** - State debugging (if using Redux/Zustand)

---

## 📈 Monitoring & Analytics (Phase 6)

### Error Tracking
- [ ] **@sentry/react** - Error monitoring
- [ ] **@sentry/vite-plugin** - Source map upload

### Analytics
- [ ] **react-ga4** - Google Analytics 4
- [ ] **@vercel/analytics** - Vercel Analytics (if deploying to Vercel)

---

## 🚀 Deployment Tools

### Hosting
- [ ] **vercel** CLI - Vercel deployment
- [ ] **netlify-cli** - Netlify deployment

### Containerization (Optional)
- [ ] **docker** - Container platform
- [ ] **docker-compose** - Multi-container orchestration

---

## 📝 Documentation

- [ ] **typedoc** - TypeScript documentation generator
- [ ] **storybook** - Component documentation (optional)

---

## Installation Commands

### Phase 0 - Essential Tools
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged
npm install react-hook-form zod @hookform/resolvers
```

### Phase 1 - Testing
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright @playwright/test msw
```

### Phase 2 - UI Enhancements
```bash
npm install -D tailwindcss autoprefixer postcss
npm install framer-motion lucide-react
```

### Phase 4 - Backend Integration
```bash
npm install axios swr react-dropzone
```

### Phase 6 - Monitoring
```bash
npm install @sentry/react @sentry/vite-plugin react-ga4
```

---

**Note:** Install tools incrementally as needed per phase. Don't install everything at once to avoid bloat.

**Last Updated:** November 18, 2025
