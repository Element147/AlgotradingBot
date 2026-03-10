# Frontend

React TypeScript SPA for the AlgoTrading Bot dashboard.

## Current Stack

- React 19.2.0
- TypeScript
- Vite 8 beta
- Redux Toolkit + RTK Query
- React Router 7.13.1
- MUI 7.3.9
- Vitest + React Testing Library

## Commands

```powershell
npm install
npm run dev
npm run lint
npm run test
npm run build
```

## Notes

- Feature modules live under `src/features`.
- API integration is centralized in RTK Query slices and services.
- Environment mode handling is safety-critical and should default to non-live behavior.
