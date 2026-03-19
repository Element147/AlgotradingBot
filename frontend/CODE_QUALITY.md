# Frontend Code Quality

This file summarizes the frontend quality toolchain as it exists now.

## Tooling

- ESLint 9 for linting
- Prettier 3 for formatting
- Vitest 4 with React Testing Library and jsdom
- Husky plus lint-staged for pre-commit checks

## Common Commands

```powershell
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run test:coverage
npm run build
```

## Current Expectations

- TypeScript and React code should pass ESLint.
- Formatting should stay consistent through Prettier.
- Tests run in jsdom with shared setup and browser API mocks.
- Pre-commit hooks help keep staged files linted and formatted before commit.

## Related Docs

- `frontend/README.md`
- `docs/guides/FRONTEND_IMPLEMENTATION.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
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
