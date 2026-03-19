# Semgrep Baseline

## Current Baseline

- `.\security-scan.ps1 -FailOnFindings` is the local zero-findings gate for security-sensitive changes.
- No standing Semgrep suppressions are documented here.
- The wrapper excludes generated, build, and runtime directories so scans stay practical.

## Security-Sensitive Areas To Recheck

- auth and session handling
- secret or credential storage
- process execution and shelling out
- Docker, PowerShell, and runtime orchestration
- WebSocket and HTTP boundary parsing

## Current Hardening Expectations

- Process execution should stay allowlisted and argument-based rather than shell-composed.
- WebSocket URLs should remain secure and same-origin in production.
- Runtime health checks should avoid ad-hoc raw socket probing when safer client APIs are available.
- Security fixes should be reflected in the current code, not only in scan notes.

## Usage

```powershell
.\security-scan.ps1
.\security-scan.ps1 -FailOnFindings
```

Use the failing variant when closing a security-sensitive task or revalidating the baseline.
