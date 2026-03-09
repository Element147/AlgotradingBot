# Code Quality Tools Configuration

This document describes the code quality tools configured for the frontend dashboard project.

## Tools Overview

### ESLint
- **Version**: 9.x (flat config)
- **Configuration**: Airbnb-inspired React/TypeScript rules
- **Plugins**:
  - `@typescript-eslint` - TypeScript linting
  - `eslint-plugin-react` - React-specific rules
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `eslint-plugin-jsx-a11y` - Accessibility rules
  - `eslint-plugin-import` - Import/export rules
  - `eslint-plugin-react-refresh` - Vite HMR rules

### Prettier
- **Version**: 3.x
- **Configuration**: Consistent formatting with single quotes, 100 char line width
- **Integration**: Works alongside ESLint without conflicts

### Vitest
- **Version**: 4.x
- **Configuration**: React Testing Library integration with jsdom environment
- **Coverage**: V8 provider with HTML/JSON/text reporters
- **Setup**: Global mocks for browser APIs (localStorage, WebSocket, etc.)

### Husky + lint-staged
- **Pre-commit hooks**: Automatically lint and format staged files
- **Configuration**: Runs ESLint --fix and Prettier on staged files

## Available Scripts

### Linting
```bash
# Run ESLint on all files
npm run lint

# Run ESLint and auto-fix issues
npm run lint:fix
```

### Formatting
```bash
# Check formatting without making changes
npm run format:check

# Format all files
npm run format
```

### Testing
```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## ESLint Rules Highlights

### Airbnb-Inspired Rules
- `prefer-const`: Enforce const for variables that are never reassigned
- `no-var`: Disallow var, use let/const instead
- `prefer-template`: Use template literals instead of string concatenation
- `prefer-arrow-callback`: Use arrow functions for callbacks
- `arrow-body-style`: Enforce concise arrow function bodies
- `no-param-reassign`: Prevent parameter mutation (except properties)

### Import Rules
- `import/order`: Enforce consistent import order with newlines between groups
- `import/no-duplicates`: Prevent duplicate imports
- `import/newline-after-import`: Require newline after imports

### React Rules
- `react/prop-types`: Disabled (using TypeScript)
- `react/react-in-jsx-scope`: Disabled (React 17+ JSX transform)
- `react-hooks/rules-of-hooks`: Enforce Hooks rules
- `react-hooks/exhaustive-deps`: Warn about missing dependencies

### TypeScript Rules
- `@typescript-eslint/no-unused-vars`: Error on unused variables (except prefixed with _)
- `@typescript-eslint/no-explicit-any`: Warn on explicit any usage
- `@typescript-eslint/explicit-function-return-type`: Disabled for flexibility

### Accessibility Rules
- All `jsx-a11y` recommended rules enabled
- Ensures semantic HTML and ARIA attributes

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

## Vitest Configuration

### Test Environment
- **Environment**: jsdom (browser-like environment)
- **Globals**: Enabled (describe, it, expect available globally)
- **Setup File**: `src/tests/setup.ts` (runs before each test file)

### Global Mocks
The setup file provides mocks for:
- `window.matchMedia` - Media query matching
- `IntersectionObserver` - Intersection observation API
- `ResizeObserver` - Resize observation API
- `localStorage` - Local storage API
- `sessionStorage` - Session storage API
- `WebSocket` - WebSocket API

### Test Utilities
- **Location**: `src/tests/test-utils.tsx`
- **Purpose**: Custom render function with providers (Redux, Router, etc.)
- **Usage**: Import from `./tests/test-utils` instead of `@testing-library/react`

## Pre-commit Hooks

Husky is configured to run lint-staged on pre-commit:

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

This ensures all committed code is:
1. Linted and auto-fixed
2. Formatted consistently
3. Free of common errors

## IDE Integration

### VS Code
Install these extensions for the best experience:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Vitest (`vitest.explorer`)

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Troubleshooting

### ESLint errors in config files
Config files (*.config.ts) are excluded from linting. If you see errors, ensure the file matches the ignore pattern.

### Prettier conflicts with ESLint
The configuration is designed to avoid conflicts. If you encounter issues, run:
```bash
npm run lint:fix
npm run format
```

### Tests failing with module errors
Ensure the test setup file is properly configured in `vitest.config.ts`:
```typescript
setupFiles: './src/tests/setup.ts'
```

### Pre-commit hooks not running
Initialize Husky from the repository root:
```bash
cd ..
npx husky install frontend/.husky
```

## Best Practices

1. **Run linting before committing**: `npm run lint:fix`
2. **Write tests for new components**: Aim for 80%+ coverage
3. **Use TypeScript strictly**: Avoid `any` types when possible
4. **Follow accessibility guidelines**: Use semantic HTML and ARIA attributes
5. **Keep imports organized**: ESLint will enforce consistent import order
6. **Format code consistently**: Let Prettier handle formatting

## Requirements Validation

This configuration satisfies the following requirements:
- **26.9**: Code quality tools configured (ESLint, Prettier)
- **28.1**: Testing framework configured (Vitest with React Testing Library)
- Pre-commit hooks ensure code quality before commits
- Comprehensive test setup with global mocks and utilities
