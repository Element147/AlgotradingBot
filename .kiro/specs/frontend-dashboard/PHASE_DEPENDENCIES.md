# Phase Dependencies and Execution Order

## Overview

This document defines the strict sequential dependencies between phases. Each phase MUST be completed before the next phase can begin.

## Dependency Chain

```
Phase 1 (Authentication)
    ↓
Phase 2 (Layout & Dashboard)
    ↓
Phase 3 (Strategy Management)
    ↓
Phase 4 (Trade History)
    ↓
Phase 5 (Backtest Visualization)
    ↓
Phase 6 (Risk Management)
    ↓
Phase 7 (Settings & Exchange)
    ↓
Phase 8 (Charts & Visualization)
    ↓
Phase 9 (Performance Optimization)
    ↓
Phase 10 (Security Hardening)
    ↓
Phase 11 (Accessibility Compliance)
    ↓
Phase 12 (Testing & Documentation)
    ↓
Phase 13 (Deployment & Monitoring)
```

## Phase Completion Criteria

A phase is considered COMPLETE when ALL of the following are true:

1. ✅ All tasks in the phase are checked off
2. ✅ All unit tests pass
3. ✅ All property tests pass (if applicable)
4. ✅ All integration tests pass
5. ✅ Build verification passes (`.\build-all.ps1`)
6. ✅ Run verification passes (`.\run-all.ps1`)
7. ✅ Manual testing verification passes
8. ✅ Code is committed to git with proper commit message
9. ✅ Git push succeeds

## Dependency Checking Rules

### Rule 1: Sequential Execution
Phases MUST be executed in order (1 → 2 → 3 → ... → 13). Skipping phases is NOT allowed.

### Rule 2: Prerequisite Verification
Before starting Phase N, verify that Phase N-1 is COMPLETE by checking:
- Git commit exists with message: `feat: Phase N-1 - [description] complete`
- All files from Phase N-1 exist in the repository
- Build and run verification from Phase N-1 passed

### Rule 3: Queue Management
If Phase N is requested but Phase N-1 is not complete:
1. **STOP** - Do not proceed with Phase N
2. **NOTIFY** - Inform user that Phase N-1 must be completed first
3. **QUEUE** - Add Phase N to a queue for later execution
4. **REDIRECT** - Begin or resume work on Phase N-1
5. **RESUME** - Once Phase N-1 is complete, automatically start Phase N from queue

### Rule 4: Parallel Work Prohibited
Only ONE phase can be in progress at a time. Do not work on multiple phases simultaneously.

## Dependency Verification Checklist

Before starting any phase, verify:

```bash
# Check git history for previous phase completion
git log --oneline --grep="feat: Phase [N-1]"

# Verify previous phase files exist
ls .kiro/specs/frontend-dashboard/phase-0[N-1]-*.md

# Check if previous phase verification passed
# (Look for commit message indicating verification passed)
```

## Example Scenarios

### Scenario 1: Starting Phase 2 when Phase 1 is Complete
```
✅ Phase 1 commit exists: "feat: Phase 1 - Authentication module complete"
✅ Phase 1 verification passed
✅ All Phase 1 files exist
→ PROCEED with Phase 2
```

### Scenario 2: Starting Phase 3 when Phase 2 is Incomplete
```
❌ Phase 2 commit does NOT exist
❌ Phase 2 verification NOT passed
→ STOP - Cannot start Phase 3
→ NOTIFY user: "Phase 2 must be completed before Phase 3"
→ QUEUE Phase 3 for later
→ REDIRECT to Phase 2 work
```

### Scenario 3: User Requests Phase 5 when Phase 3 is Complete
```
✅ Phase 1 complete
✅ Phase 2 complete
✅ Phase 3 complete
❌ Phase 4 NOT complete
→ STOP - Cannot start Phase 5
→ NOTIFY user: "Phase 4 must be completed before Phase 5"
→ QUEUE Phase 5 for later
→ REDIRECT to Phase 4 work
```

## Phase Status Tracking

Track phase status in a simple format:

| Phase | Status | Commit Hash | Completed Date |
|-------|--------|-------------|----------------|
| 1 | ⏳ PENDING | - | - |
| 2 | 🚫 BLOCKED | - | - |
| 3 | 🚫 BLOCKED | - | - |
| 4 | 🚫 BLOCKED | - | - |
| 5 | 🚫 BLOCKED | - | - |
| 6 | 🚫 BLOCKED | - | - |
| 7 | 🚫 BLOCKED | - | - |
| 8 | 🚫 BLOCKED | - | - |
| 9 | 🚫 BLOCKED | - | - |
| 10 | 🚫 BLOCKED | - | - |
| 11 | 🚫 BLOCKED | - | - |
| 12 | 🚫 BLOCKED | - | - |
| 13 | 🚫 BLOCKED | - | - |

Status Legend:
- ⏳ PENDING - Can be started (prerequisites met)
- 🚧 IN PROGRESS - Currently being worked on
- ✅ COMPLETE - All criteria met, committed to git
- 🚫 BLOCKED - Cannot start (prerequisites not met)
- ⚠️ FAILED - Verification failed, needs repair

## Automated Dependency Checking

When starting any phase, run this check:

```typescript
function canStartPhase(phaseNumber: number): boolean {
  if (phaseNumber === 1) return true; // Phase 1 has no dependencies
  
  const previousPhase = phaseNumber - 1;
  const commitExists = checkGitCommit(`feat: Phase ${previousPhase}`);
  const filesExist = checkPhaseFiles(previousPhase);
  const verificationPassed = checkVerificationStatus(previousPhase);
  
  return commitExists && filesExist && verificationPassed;
}

function startPhase(phaseNumber: number): void {
  if (!canStartPhase(phaseNumber)) {
    const previousPhase = phaseNumber - 1;
    console.log(`❌ Cannot start Phase ${phaseNumber}`);
    console.log(`⚠️ Phase ${previousPhase} must be completed first`);
    console.log(`📋 Queueing Phase ${phaseNumber} for later`);
    console.log(`🔄 Redirecting to Phase ${previousPhase}...`);
    
    queuePhase(phaseNumber);
    startPhase(previousPhase);
    return;
  }
  
  console.log(`✅ Starting Phase ${phaseNumber}...`);
  executePhase(phaseNumber);
}
```

## Recovery from Failures

If a phase verification fails:

1. **DIAGNOSE** - Identify the specific failure (build, test, or manual verification)
2. **REPAIR** - Fix the issue immediately
3. **RETEST** - Run verification again
4. **COMMIT** - Only commit when ALL verification passes
5. **PROCEED** - Move to next phase only after successful commit

## Notes

- This dependency system ensures incremental, validated progress
- Each phase builds on the previous phase's foundation
- Skipping phases will result in missing dependencies and broken functionality
- Always verify previous phase completion before starting new work
- Keep the phase status table updated as work progresses

---

**Last Updated:** March 9, 2026
**Status:** Active enforcement required
