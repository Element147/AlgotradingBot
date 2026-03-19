# Gradle Automation

## Command Policy

Run backend Gradle commands from `AlgotradingBot/` with the wrapper:

```powershell
cd AlgotradingBot
.\gradlew.bat javaMigrationAudit --no-daemon
.\gradlew.bat test
.\gradlew.bat build
.\gradlew.bat bootRun
```

## Current Rules

1. Use the wrapper, not a system `gradle` install.
2. Prefer the narrowest useful test first, then `build` when the scope justifies it.
3. Use `javaMigrationAudit` when touching JDK-sensitive or toolchain-sensitive backend code.
4. Prefer `.\run.ps1` for normal local backend development because it wires the same repo runtime conventions as the rest of the stack.
5. Use direct `bootRun` only when you need backend-only iteration or a custom Gradle property flow.
6. Use `-PbackendDebug=true -PbackendDebugPort=5005 -PbackendDebugSuspend=n` only when you explicitly need JDWP through `bootRun`; otherwise prefer `.\run.ps1 -DebugBackend`.
7. Java 25 is the baseline across tests, build, audit, and runtime.

## Related Files

- Build definition: `AlgotradingBot/build.gradle.kts`
- Verification guide: `docs/guides/TESTING_AND_CONTRACTS.md`
- Runtime guide: `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
