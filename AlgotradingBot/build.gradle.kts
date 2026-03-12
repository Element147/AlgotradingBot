plugins {
    java
    jacoco
    id("org.springframework.boot") version "4.0.3"
    id("io.spring.dependency-management") version "1.1.7"
}

import org.gradle.api.tasks.testing.Test
import org.gradle.testing.jacoco.plugins.JacocoTaskExtension

group = "com.algotrader"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
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
    
    // Lombok (optional, for reducing boilerplate)
    compileOnly("org.projectlombok:lombok:1.18.42")
    annotationProcessor("org.projectlombok:lombok:1.18.42")
    
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
