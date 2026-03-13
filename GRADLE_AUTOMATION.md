# GRADLE_AUTOMATION

## Backend Command Policy

Run Gradle from `AlgotradingBot/` using Windows wrapper commands:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
.\gradlew.bat bootRun
```

## Rules

1. Use wrapper commands, not system `gradle`.
2. Prefer targeted test execution first, then full `build`.
3. Keep Gradle parallelism enabled unless a task proves it is the bottleneck.
4. Reusable Gradle daemons are intentionally capped lower and released sooner after 15 minutes idle.
5. Prefer `.\run.ps1` for long-running local backend development because it uses `--no-daemon` and the repo's untracked runtime log path.
6. Report command failures with actionable context.
7. Use `docs/guides/TESTING_AND_CONTRACTS.md` for cross-stack verification and contract workflow details.
