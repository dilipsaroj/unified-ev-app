# Contributing to Unified-EV

Thank you for your interest in contributing to Unified-EV! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Testing](#testing)

---

## 📜 Code of Conduct

This project follows a simple code of conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the project and community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- Git
- Google Maps API key (for development)

### Setup

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/unified-ev-app.git
   cd unified-ev-app
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/dilipsaroj/unified-ev-app.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google Maps API key.

6. **Run the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code refactoring
- `docs/` — Documentation changes
- `test/` — Test additions/updates
- `chore/` — Tooling, config, dependencies

### 3. Make Changes

- Write clean, readable code
- Follow the project's code style (see [Code Style](#code-style))
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Type check
pnpm build

# Lint
pnpm lint

# Test in browser
pnpm dev
```

### 5. Commit Your Changes

Follow the [Commit Strategy Guide](./DOCS/COMMIT_STRATEGY.md):

```bash
git add <files>
git commit -m "feat(scope): description"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Go to the original repository and click "New Pull Request". Fill out the PR template with details about your changes.

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/). Read the full [Commit Strategy Guide](./DOCS/COMMIT_STRATEGY.md).

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code refactoring
- `style` — Formatting, styling
- `docs` — Documentation
- `test` — Tests
- `chore` — Tooling, dependencies
- `perf` — Performance improvement

### Examples

```bash
feat(map): add connector type filter
fix(session): correct settlement calculation
refactor(stores): extract reliability logic
docs: update Layer 2 migration guide
```

### Rules

- Use imperative mood: "add" not "added"
- Don't capitalize first letter
- No period at the end
- Max 72 characters for subject
- One logical change per commit

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code builds without errors (`pnpm build`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Tested on desktop and mobile viewports
- [ ] Tested in dark and light modes
- [ ] Documentation updated if needed
- [ ] Commits follow conventional format
- [ ] PR template filled out completely

### PR Title

Use the same format as commit messages:

```
feat(map): add connector type filter
fix(session): correct settlement calculation
```

### Review Process

1. Maintainer reviews your PR
2. Address any requested changes
3. Push new commits to the same branch
4. Maintainer merges when approved

### After Merge

1. Delete your feature branch
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Sync your fork
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

---

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new files
- Define types for all function parameters and returns
- Avoid `any` — use proper types or `unknown`
- Use interfaces for object shapes

```typescript
// Good
interface Station {
  id: string;
  name: string;
  reliability: number;
}

function getStation(id: string): Station | null {
  // ...
}

// Bad
function getStation(id: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- One component per file
- Export as default for pages, named export for components
- Use `'use client'` directive when needed

```typescript
// components/map/FilterChips.tsx
'use client';

import { useState } from 'react';

interface FilterChipsProps {
  onFilterChange: (filters: string[]) => void;
}

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  // ...
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `FilterChips.tsx` |
| Hooks | camelCase with `use` prefix | `useStations.ts` |
| Utilities | camelCase | `reliability.ts` |
| Types/Interfaces | PascalCase | `Station`, `ConnectorType` |
| Constants | UPPER_SNAKE_CASE | `MAX_STATIONS` |
| Variables | camelCase | `stationList` |

### File Organization

```typescript
// 1. Imports - external first, then internal
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useStations } from '@/hooks/useStations';
import { FilterChips } from '@/components/map/FilterChips';

// 2. Types/Interfaces
interface MapPageProps {
  initialZoom?: number;
}

// 3. Component
export default function MapPage({ initialZoom = 12 }: MapPageProps) {
  // 4. Hooks
  const router = useRouter();
  const [zoom, setZoom] = useState(initialZoom);
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleFilterChange = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Tailwind CSS

- Use Tailwind utility classes
- Group by category: layout → spacing → typography → colors → effects
- Use the `cn()` utility for conditional classes

```typescript
import { cn } from '@/lib/utils';

<div 
  className={cn(
    // Layout
    "flex flex-col",
    // Spacing
    "p-4 gap-2",
    // Typography
    "text-sm font-medium",
    // Colors
    "bg-white dark:bg-zinc-900",
    // Conditional
    isActive && "border-green-500"
  )}
>
```

### Comments

- Avoid obvious comments
- Explain "why" not "what"
- Document complex algorithms
- Use JSDoc for public APIs

```typescript
// ❌ Bad - obvious
// Increment counter
count++;

// ✅ Good - explains why
// Round up to nearest ₹1 as per CPO billing requirements
const finalAmount = Math.ceil(rawAmount);
```

---

## 🏗️ Project Structure

Key directories:

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Reusable React components
├── data/             # Mock JSON data (Layer 1)
├── hooks/            # Custom React hooks
├── lib/              # Utilities & business logic
└── stores/           # Zustand state stores
```

See [README.md](./README.md) for detailed structure.

---

## 🧪 Testing

### Manual Testing Checklist

For UI changes:

- [ ] Desktop (Chrome, Safari, Firefox)
- [ ] Mobile viewport (DevTools)
- [ ] Dark mode
- [ ] Light mode
- [ ] Different screen sizes (375px, 768px, 1024px, 1440px)
- [ ] Touch interactions (if mobile)

### Unit Tests (Future)

Currently, the project doesn't have unit tests (Layer 1 prototype). When adding tests:

- Use Jest + React Testing Library
- Place tests next to source files: `Component.test.tsx`
- Test behavior, not implementation
- Aim for 80%+ coverage on critical paths

---

## 📚 Documentation

### When to Update Docs

Update documentation when you:

- Add a new feature
- Change architecture or data structures
- Add new dependencies
- Modify the development workflow
- Fix a non-obvious bug

### Which Docs to Update

| Change Type | Update |
|-------------|--------|
| New feature | README.md + relevant Layer doc |
| Bug fix | Usually no doc update needed |
| Architecture change | Relevant Layer doc (01-04) |
| New dependency | README.md (Tech Stack section) |
| Workflow change | CONTRIBUTING.md |

---

## 🤔 Questions?

- Open an issue for bug reports or feature requests
- Start a discussion for questions or ideas
- Email dilipsaroj95@gmail.com for private inquiries

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make Unified-EV better for Indian EV drivers. Thank you for being part of this journey!
