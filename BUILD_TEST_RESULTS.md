# Build and Test Results

Updated: March 10, 2026

## Environment Snapshot

- Java: 21 (project toolchain)
- Spring Boot: 3.4.1
- Node.js: local machine managed (minimum supported 18+)
- Frontend stack: React 19.2.0, React Router 7.13.1, MUI 7.3.9, Vite 8 beta

## Results

- Backend `.\gradlew.bat check`: PASS
- Frontend `npm run lint`: PASS
- Frontend `npm run test`: PASS (`389/389`)
- Frontend `npm run build`: PASS
- Root scripts `stop-all`, `build-all`, `run-all`: PASS

## Notes

- This file is a summary artifact.
- Source-of-truth status is maintained in `PROJECT_STATUS.md` and `VERIFICATION.md`.
