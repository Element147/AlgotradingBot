# Phase 9: Performance Optimization (Week 9)

[← Previous: Phase 8 - Charts & Visualization](./phase-08-charts-visualization.md) | [Next: Phase 10 - Security Hardening →](./phase-10-security-hardening.md)

## Prerequisites

⚠️ **REQUIRED:** Phase 8 must be COMPLETE before starting this phase

### Verification Checklist
Before starting Phase 9, verify:
- [ ] Phase 8 git commit exists: `git log --oneline --grep="feat: Phase 8"`
- [ ] Phase 8 verification passed (build, run, test)
- [ ] Charts and visualization functional
- [ ] All Phase 8 tests passing

### If Phase 8 is Incomplete
1. **STOP** - Do not proceed with Phase 9
2. **NOTIFY** - "Phase 8 must be completed first"
3. **QUEUE** - Add Phase 9 to queue
4. **REDIRECT** - Complete Phase 8 first

## Phase Status

- **Dependencies:** Phase 1, 2, 3, 4, 5, 6, 7, 8
- **Can Start:** Only if Phase 8 is COMPLETE
- **Blocks:** Phase 10, 11, 12, 13

## Overview
Optimize application performance through code splitting, virtualization, caching, and bundle optimization to achieve Lighthouse score ≥ 90 and initial load < 3 seconds.

## Tasks

- [ ] 9.1 Implement code splitting for all route components
  - Use React.lazy() for all page components
  - Configure Suspense with loading fallbacks
  - Create separate bundles for each route
  - Verify bundle sizes with rollup-plugin-visualizer
  - _Requirements: 19.1, 26.7_

- [ ] 9.2 Add virtualization for all large lists
  - Implement virtualization for trade history table (100+ rows)
  - Implement virtualization for strategy list if needed
  - Use @tanstack/react-virtual consistently
  - Measure scroll performance improvement
  - _Requirements: 19.3_

- [ ] 9.3 Optimize WebSocket event handling with throttling
  - Throttle balance updates to max 1 per second
  - Throttle position updates to max 1 per second
  - Batch multiple Redux updates within 16ms
  - Pause event processing when tab is inactive
  - _Requirements: 15.11, 15.12, 19.7_

- [ ] 9.4 Implement comprehensive caching strategy
  - Configure RTK Query cache TTL (5 minutes default)
  - Implement optimistic updates for mutations
  - Cache static data (strategies, symbols) longer
  - Preload critical data on app startup
  - _Requirements: 19.5, 19.6, 19.9, 23.3, 23.4_

- [ ] 9.5 Add background tab optimization
  - Pause polling when tab is inactive
  - Pause WebSocket event processing when inactive
  - Resume on tab activation
  - Use Page Visibility API
  - _Requirements: 19.8_

- [ ] 9.6 Optimize bundle size with Vite configuration
  - Configure manual chunks for vendor libraries
  - Split react, redux, ui, and chart vendors
  - Enable terser minification with console.log removal
  - Generate source maps for debugging
  - Analyze bundle with visualizer
  - _Requirements: 26.5, 26.6_

- [ ] 9.7 Run Lighthouse audits and optimize
  - Measure Core Web Vitals (LCP, FID, CLS)
  - Achieve initial load < 3 seconds on 3G
  - Achieve Lighthouse performance score ≥ 90
  - Optimize images and assets
  - Implement resource hints (preload, prefetch)
  - _Requirements: 19.2, 19.10, 27.4_

- [ ] 9.8 Checkpoint - Verify performance optimization complete
  - Ensure Lighthouse score ≥ 90
  - Verify initial load < 3 seconds
  - Check bundle sizes are optimized
  - Verify smooth scrolling and interactions
  - Ask user if questions arise

- [ ] 9.9 Phase 9 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Measure build time (should be < 2 minutes)
  - Check bundle sizes with visualizer
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Test initial page load time (should be < 3 seconds)
  - Run Lighthouse audit (score should be ≥ 90)
  - Test virtualized lists scroll smoothly
  - Test code splitting with network tab
  - Test WebSocket throttling with rapid updates
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 9 - Performance optimization complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 10 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10, 19.2, 19.10_

## Phase Completion Checklist
- [ ] All tasks completed
- [ ] Code splitting implemented for all routes
- [ ] Virtualization added for large lists
- [ ] WebSocket throttling configured
- [ ] Caching strategy implemented
- [ ] Bundle size optimized
- [ ] Lighthouse score ≥ 90 achieved
- [ ] Initial load < 3 seconds verified
- [ ] Build, run, and test verification passed
- [ ] Code committed to git

---

[← Previous: Phase 8 - Charts & Visualization](./phase-08-charts-visualization.md) | [Next: Phase 10 - Security Hardening →](./phase-10-security-hardening.md) | [Back to Overview](./00-overview.md)
