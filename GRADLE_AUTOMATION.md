# Gradle Automation

## Command Policy

Run backend Gradle commands from `AlgotradingBot/` with the wrapper:

```powershell
cd AlgotradingBot
.\gradlew.bat javaMigrationAudit --no-daemon
.\gradlew.bat test
.\gradlew.bat build
.\gradlew.bat bootRun
.\gradlew.bat migrateLegacyDatasets -PlegacyMigrationDryRun=true
.\gradlew.bat reconcileLegacyDatasets
```

## Current Rules

1. Use the wrapper, not a system `gradle` install.
2. Prefer the narrowest useful test first, then `build` when the scope justifies it.
3. Use `javaMigrationAudit` when touching JDK-sensitive or toolchain-sensitive backend code.
4. Prefer `.\run.ps1` for normal local backend development because it wires the same repo runtime conventions as the rest of the stack.
5. Use direct `bootRun` only when you need backend-only iteration or a custom Gradle property flow.
6. Use `-PbackendDebug=true -PbackendDebugPort=5005 -PbackendDebugSuspend=n` only when you explicitly need JDWP through `bootRun`; otherwise prefer `.\run.ps1 -DebugBackend`.
7. Java 25 is the baseline across tests, build, audit, and runtime.
8. The legacy dataset migration task defaults to dry-run mode; use `-PlegacyMigrationDryRun=false` only when you are ready to write normalized rows.
9. The legacy dataset reconciliation task is read-only and uses the same optional dataset filters as migration.
10. Optional migration filters are available through Gradle properties such as `-PlegacyMigrationDatasetIds=1,2` and `-PlegacyMigrationLimit=10`.
11. New uploads and completed provider imports already hydrate normalized candles during ingestion, so the migration utilities are now for backfilling older datasets rather than for newly created ones.
12. Startup recovery now backfills catalog datasets that still lack normalized segments, while the Gradle migration and reconciliation tasks remain the explicit operator tools for dry runs, targeted replays, and cutover verification.

## Related Files

- Build definition: `AlgotradingBot/build.gradle.kts`
- Verification guide: `docs/guides/TESTING_AND_CONTRACTS.md`
- Runtime guide: `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- Legacy compatibility removal plan: `docs/LEGACY_DATASET_RETIREMENT_PLAN.md`
