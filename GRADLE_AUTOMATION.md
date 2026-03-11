# GRADLE_AUTOMATION

## Backend Command Policy

Run Gradle from `AlgotradingBot/` using Windows wrapper commands:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

## Recommended Workflows

### Verify backend after changes

```powershell
cd AlgotradingBot
.\gradlew.bat test
```

### Full backend verification

```powershell
cd AlgotradingBot
.\gradlew.bat build
```

### Run backend locally

```powershell
cd AlgotradingBot
.\gradlew.bat bootRun
```

## Rules

1. Use wrapper commands, not system `gradle`.
2. Prefer targeted test execution first, then full build.
3. Report command failures with actionable context.
