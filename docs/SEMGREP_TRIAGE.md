# Semgrep Triage

Status updated: March 13, 2026

## Current Baseline

- `.\security-scan.ps1 -FailOnFindings` now completes with `0 findings`.
- No Semgrep suppressions were added in this cleanup pass.
- The local wrapper now excludes generated/build/runtime directories so the scan stays fast enough to be a practical gate on this workstation.

## Resolved Findings In This Cleanup Loop

| Rule ID | File | Issue Summary | Resolution | Verified |
|---|---|---|---|---|
| `java.lang.security.audit.command-injection-process-builder.command-injection-process-builder` | `AlgotradingBot/src/main/java/com/algotrader/bot/service/SystemOperationsService.java` | Backup execution used configurable process names in `ProcessBuilder`, which Semgrep treated as a command-injection risk. | Replaced configurable executable names with fixed allowlisted constants for `pg_dump`, `docker`, and the managed PostgreSQL container name. | March 13, 2026 via `.\security-scan.ps1 -FailOnFindings` |
| `java.lang.security.audit.command-injection-process-builder.command-injection-process-builder` | `AlgotradingBot/src/main/java/com/algotrader/bot/repair/RepairWorkspaceSupport.java` and repair/validation callers | Repair and validation flows accepted free-form service/script identifiers or shell-shaped process calls. | Centralized service/script allowlists in `RepairWorkspaceSupport`, removed `cmd /c` command composition, switched to argument-list `ProcessBuilder` calls, and validated PID parsing before `taskkill`. | March 13, 2026 via `.\security-scan.ps1 -FailOnFindings` |
| `javascript.browser.security.insecure-websocket.insecure-websocket` | `frontend/src/services/websocket.ts` and related tests | WebSocket URL resolution relied on string replacement and could accept insecure/non-same-origin production endpoints. | Added `resolveWebSocketUrl()` with explicit production `wss` + same-origin rules, retained localhost `ws` only for development/test, and updated tests to exercise the secure resolution path. | March 13, 2026 via `.\security-scan.ps1 -FailOnFindings` |
| `java.net.security.audit.clear-text-socket.clear-text-socket` | `AlgotradingBot/src/main/java/com/algotrader/bot/service/SystemOperationsService.java` | Kafka health used a raw socket probe that Semgrep flagged as a clear-text network check. | Replaced the raw socket probe with a Kafka `AdminClient` metadata check using the configured bootstrap servers. | March 13, 2026 via `.\security-scan.ps1 -FailOnFindings` |

## Operational Notes

- Run `.\security-scan.ps1` for auth, secrets, process-execution, Docker/orchestration, and WebSocket/HTTP-boundary changes.
- Use `.\security-scan.ps1 -FailOnFindings` when closing a security-sensitive task or validating the zero-findings baseline.
