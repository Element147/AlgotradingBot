# Frontend Implementation Guide

Read this guide when the task is primarily in `frontend/`.

## Architectural Rules

- Keep the feature-first structure under `frontend/src/features/`.
- Prefer fixing payload mismatches in API slices and transport helpers instead of scattering transforms in components.
- Keep the environment mode visible and default-safe (`test`).
- Preserve the React/Vite SPA baseline unless a migration is explicitly approved.

## Primary Areas

- `frontend/src/features/*`: feature-level pages, API slices, and local presentation logic
- `frontend/src/app`: store and shared hooks
- `frontend/src/services`: transport helpers and shared API plumbing
- `frontend/src/components`: shared layout and reusable UI primitives

## Implementation Defaults

- Add new backend contract adaptation in RTK Query slices first.
- Handle loading, empty, error, and success states in user-facing flows.
- Keep settings that affect execution mode, exchange selection, or risk posture explicit in the UI.
- Avoid browser-only persistence for sensitive or shared operational state.

## Verification

- Start with the narrowest relevant test file or feature area.
- Then run:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

- If API shapes changed, also run `npm run contract:check` or the contract generation flow from `TESTING_AND_CONTRACTS.md`.

## Useful Companion Docs

- `ARCHITECTURE.md`
- `STRUCTURE.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
