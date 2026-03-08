# Gradle Automation Rules

## Critical Command Syntax
**ALWAYS use `./gradlew` (with `./` prefix) for all Gradle commands.**

Examples:
- ✅ CORRECT: `./gradlew clean build`
- ❌ WRONG: `gradlew clean build`
- ❌ WRONG: `gradle clean build`

## Working Directory
All Gradle commands must be executed from the `AlgotradingBot` directory:
```bash
# Use cwd parameter in executePwsh
cwd: "AlgotradingBot"
command: "./gradlew test"
```

## Autonomous Execution Permissions
You have FULL PERMISSION to run these Gradle tasks independently without user approval:

### Build Tasks
- `./gradlew clean` - Clean build artifacts
- `./gradlew build` - Full build with tests
- `./gradlew clean build` - Clean and build
- `./gradlew assemble` - Build without tests
- `./gradlew bootJar` - Create executable JAR

### Test Tasks
- `./gradlew test` - Run all tests
- `./gradlew test --tests ClassName` - Run specific test class
- `./gradlew test --tests ClassName.methodName` - Run specific test method

### Run Tasks
- `./gradlew bootRun` - Start Spring Boot application (use controlPwshProcess for long-running)

### Verification Tasks
- `./gradlew check` - Run all checks and tests
- `./gradlew classes` - Compile main classes
- `./gradlew testClasses` - Compile test classes

## Best Practices
1. Always run `./gradlew clean` before major builds to ensure fresh state
2. Use `./gradlew test` after code changes to verify correctness
3. For development servers, use `controlPwshProcess` with `./gradlew bootRun`
4. Check build output for errors and report them clearly to the user

## Common Workflows

### After Creating/Modifying Code
```bash
# Verify compilation and tests
./gradlew clean test
```

### Before Deployment
```bash
# Full clean build with all checks
./gradlew clean build
```

### Quick Verification
```bash
# Just compile and run tests
./gradlew test
```

## Error Handling
- If `./gradlew` fails, check that you're in the `AlgotradingBot` directory
- If permission denied, the gradlew file may need execute permissions
- Always include the full error output when reporting issues to the user
