plugins {
    java
    jacoco
    id("org.springframework.boot") version "4.0.3"
    id("io.spring.dependency-management") version "1.1.7"
}

import org.gradle.api.tasks.testing.Test
import org.gradle.api.tasks.compile.JavaCompile
import org.gradle.api.tasks.Exec
import org.gradle.kotlin.dsl.withType
import org.springframework.boot.gradle.tasks.run.BootRun
import org.gradle.testing.jacoco.plugins.JacocoTaskExtension

group = "com.algotrader"
version = "0.0.1-SNAPSHOT"

val targetJavaVersion = JavaLanguageVersion.of(25)
val reportsDir = layout.buildDirectory.dir("reports/java-migration")
val mainRuntimeClasspath = providers.provider { sourceSets["main"].runtimeClasspath.asPath }
val mainClassesPath = providers.provider { sourceSets["main"].output.classesDirs.asPath }

java {
    toolchain {
        languageVersion = targetJavaVersion
    }
}

fun osExecutable(name: String): String =
    if (System.getProperty("os.name").lowercase().contains("win")) "$name.exe" else name

val java25Launcher = javaToolchains.launcherFor {
    languageVersion = targetJavaVersion
}

fun jdkBinary(name: String) =
    java25Launcher.map { launcher ->
        launcher.metadata.installationPath.file("bin/${osExecutable(name)}").asFile.absolutePath
    }

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-jackson")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    
    // JWT Authentication
    implementation("io.jsonwebtoken:jjwt-api:0.13.0")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.13.0")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.13.0")
    
    // OpenAPI/Swagger Documentation
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.2")
    
    // Database
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.springframework.boot:spring-boot-starter-liquibase")
    
    // Kafka
    implementation("org.springframework.kafka:spring-kafka")
    
    // Micrometer + Prometheus
    implementation("io.micrometer:micrometer-registry-prometheus")
    
    // Logging
    implementation("net.logstash.logback:logstash-logback-encoder:9.0")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.kafka:spring-kafka-test")
    testImplementation("org.mockito:mockito-core")
    testImplementation("org.mockito:mockito-junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testRuntimeOnly("com.h2database:h2")
}

tasks.withType<Test>().configureEach {
    val jacocoExecFile = layout.buildDirectory.file("jacoco/${name}.exec")

    useJUnitPlatform()
    javaLauncher.set(java25Launcher)
    // Enforce H2-backed test profile for all unit/integration tests
    systemProperty("spring.profiles.active", "test")

    extensions.configure(JacocoTaskExtension::class) {
        destinationFile = jacocoExecFile.get().asFile
    }

    doFirst {
        binaryResultsDirectory.get().asFile.mkdirs()
        jacocoExecFile.get().asFile.parentFile.mkdirs()
    }
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    archiveFileName.set("algotrading-bot.jar")
}

tasks.withType<JavaExec>().configureEach {
    javaLauncher.set(java25Launcher)
}

tasks.named<BootRun>("bootRun") {
    val backendDebug = providers.gradleProperty("backendDebug").map(String::toBoolean).orElse(false)
    val backendDebugPort = providers.gradleProperty("backendDebugPort").orElse("5005")
    val backendDebugSuspend = providers.gradleProperty("backendDebugSuspend").orElse("n")

    if (backendDebug.get()) {
        jvmArgs(
            "-agentlib:jdwp=transport=dt_socket,server=y,suspend=${backendDebugSuspend.get()},address=*:${backendDebugPort.get()}"
        )
    }
}

// JaCoCo Configuration
jacoco {
    toolVersion = "0.8.14"
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = "1.00".toBigDecimal()
            }
        }
    }
}

// Production Validation Task
tasks.register<JavaExec>("validateProduction") {
    group = "verification"
    description = "Run production readiness validation suite"
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("com.algotrader.bot.validation.ValidationSuite")
}

tasks.register<Test>("exportOpenApiContract") {
    group = "verification"
    description = "Export the generated OpenAPI contract to build/openapi/openapi.json"

    useJUnitPlatform()
    javaLauncher.set(java25Launcher)
    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath
    systemProperty("spring.profiles.active", "test")
    systemProperty(
        "openapi.output",
        layout.buildDirectory.file("openapi/openapi.json").get().asFile.absolutePath
    )
    filter {
        includeTestsMatching("com.algotrader.bot.controller.OpenApiContractExportTest")
    }
}

tasks.register<JavaExec>("legacyMarketDataFlowAudit") {
    group = "verification"
    description = "Benchmark the legacy CSV-backed dataset flow and write a markdown audit report."
    dependsOn(tasks.named("testClasses"))
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("com.algotrader.bot.analysis.LegacyMarketDataFlowAuditRunner")
    systemProperty(
        "legacyAudit.output",
        layout.buildDirectory.file("reports/legacy-market-data-flow-audit/report.md").get().asFile.absolutePath
    )
}

tasks.register<JavaExec>("migrateLegacyDatasets") {
    group = "migration"
    description = "Migrate legacy CSV-backed backtest datasets into the normalized market-data store."
    dependsOn(tasks.named("classes"))
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("com.algotrader.bot.migration.LegacyMarketDataMigrationRunner")
    systemProperty("spring.main.web-application-type", "none")
    providers.gradleProperty("legacyMigrationSpringProfile").orNull?.let { profile ->
        systemProperty("spring.profiles.active", profile)
    }
    systemProperty(
        "legacyMigration.dryRun",
        providers.gradleProperty("legacyMigrationDryRun").orElse("true").get()
    )
    providers.gradleProperty("legacyMigrationDatasetIds").orNull?.let { datasetIds ->
        systemProperty("legacyMigration.datasetIds", datasetIds)
    }
    providers.gradleProperty("legacyMigrationLimit").orNull?.let { limit ->
        systemProperty("legacyMigration.limit", limit)
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.release.set(targetJavaVersion.asInt())
    options.compilerArgs.add("-Xlint:deprecation")
}

tasks.register<Exec>("jdepsMain") {
    group = "verification"
    description = "Run jdeps against the compiled backend classes using the Java 25 toolchain."
    dependsOn(tasks.named("classes"))
    notCompatibleWithConfigurationCache("Writes audit reports with toolchain-resolved executables at execution time.")

    val outputFile = reportsDir.map { it.file("jdeps.txt").asFile }
    val errorFile = reportsDir.map { it.file("jdeps.stderr.txt").asFile }
    doFirst {
        outputFile.get().parentFile.mkdirs()
        standardOutput = outputFile.get().outputStream()
        errorOutput = errorFile.get().outputStream()
        executable = jdkBinary("jdeps").get()
        args(
            "--multi-release", targetJavaVersion.asInt().toString(),
            "--ignore-missing-deps",
            "--recursive",
            "--class-path", mainRuntimeClasspath.get(),
            mainClassesPath.get()
        )
    }
}

tasks.register<Exec>("jdeprscanMain") {
    group = "verification"
    description = "Run jdeprscan against the compiled backend classes using the Java 25 toolchain."
    dependsOn(tasks.named("classes"))
    notCompatibleWithConfigurationCache("Writes audit reports with toolchain-resolved executables at execution time.")

    val outputFile = reportsDir.map { it.file("jdeprscan.txt").asFile }
    val errorFile = reportsDir.map { it.file("jdeprscan.stderr.txt").asFile }
    doFirst {
        outputFile.get().parentFile.mkdirs()
        standardOutput = outputFile.get().outputStream()
        errorOutput = errorFile.get().outputStream()
        executable = jdkBinary("jdeprscan").get()
        args(
            "--release", targetJavaVersion.asInt().toString(),
            "--class-path", mainRuntimeClasspath.get(),
            mainClassesPath.get()
        )
    }
}

tasks.register("javaMigrationAudit") {
    group = "verification"
    description = "Run the Java 25 migration audit toolchain (jdeps + jdeprscan)."
    dependsOn("jdepsMain", "jdeprscanMain")
}
