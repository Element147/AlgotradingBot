package com.algotrader.bot.repair;

import com.algotrader.bot.validation.ValidationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RepairEngine {
    private static final Logger logger = LoggerFactory.getLogger(RepairEngine.class);
    private static final int MAX_REPAIR_ATTEMPTS = 3;

    public RepairResult repairBuildFailure(ValidationResult failure) {
        logger.info("Attempting to repair build failure");
        RepairAction action = selectRepairAction(failure);
        return executeRepairAction(action, failure);
    }

    public RepairResult repairOrchestrationFailure(ValidationResult failure) {
        logger.info("Attempting to repair orchestration failure");
        RepairAction action = RepairAction.RESTART_SERVICES;
        return executeRepairAction(action, failure);
    }

    public RepairResult repairHealthCheckFailure(ValidationResult failure) {
        logger.info("Attempting to repair health check failure");
        RepairAction action = RepairAction.RESTART_CONTAINER;
        return executeRepairAction(action, failure);
    }

    public RepairResult repairApiFailure(ValidationResult failure) {
        logger.info("Attempting to repair API failure");
        RepairAction action = RepairAction.RESTART_CONTAINER;
        return executeRepairAction(action, failure);
    }

    public RepairAction selectRepairAction(ValidationResult failure) {
        String reqId = failure.getRequirementId();
        
        if (reqId.startsWith("REQ-7")) {
            // Build failures
            if (reqId.contains("7.1") || reqId.contains("7.2")) {
                return RepairAction.CLEAN_GRADLE_CACHE;
            } else if (reqId.contains("7.5") || reqId.contains("7.6")) {
                return RepairAction.PRUNE_DOCKER_IMAGES;
            }
        } else if (reqId.startsWith("REQ-8")) {
            // Orchestration failures
            return RepairAction.RESTART_SERVICES;
        } else if (reqId.startsWith("REQ-9")) {
            // API failures
            return RepairAction.RESTART_CONTAINER;
        }
        
        return RepairAction.CHECK_LOGS;
    }

    public RepairResult executeRepairAction(RepairAction action, ValidationResult failure) {
        logger.info("Executing repair action: {}", action);
        LocalDateTime start = LocalDateTime.now();
        
        try {
            boolean success = false;
            String message = "";
            
            switch (action) {
                case CLEAN_GRADLE_CACHE:
                    // This would be handled by BuildRepairActions
                    success = true;
                    message = "Gradle cache cleanup initiated";
                    break;
                case REBUILD_JAR:
                    success = true;
                    message = "JAR rebuild initiated";
                    break;
                case PRUNE_DOCKER_IMAGES:
                    success = true;
                    message = "Docker image prune initiated";
                    break;
                case REBUILD_DOCKER_IMAGE:
                    success = true;
                    message = "Docker image rebuild initiated";
                    break;
                case RESTART_SERVICES:
                    success = true;
                    message = "Service restart initiated";
                    break;
                case RESTART_CONTAINER:
                    success = true;
                    message = "Container restart initiated";
                    break;
                case CHECK_LOGS:
                    success = true;
                    message = "Log check initiated";
                    break;
                default:
                    success = false;
                    message = "Unknown repair action";
            }
            
            RepairResult result = new RepairResult(success, message);
            logger.info("Repair action {} completed: {}", action, message);
            return result;
            
        } catch (Exception e) {
            logger.error("Error executing repair action", e);
            return new RepairResult(false, "Error: " + e.getMessage());
        }
    }

    public ValidationResult retryValidation(ValidationResult originalFailure) {
        logger.info("Retrying validation after repair");
        // This would trigger the original validation again
        return originalFailure;
    }

    public boolean shouldRetry(int attemptCount) {
        return attemptCount < MAX_REPAIR_ATTEMPTS;
    }

    public FailureReport generateFailureReport(List<RepairAttempt> attempts) {
        logger.info("Generating failure report for {} attempts", attempts.size());
        
        if (attempts.isEmpty()) {
            return null;
        }
        
        FailureReport report = new FailureReport(attempts.get(0).getTriggeringFailure());
        report.setEnvironment("Docker Production");
        
        for (RepairAttempt attempt : attempts) {
            report.addRepairAttempt(attempt);
            if (attempt.getLogOutput() != null) {
                report.addDiagnosticLog(attempt.getLogOutput());
            }
        }
        
        report.addSystemInfo("maxAttempts", String.valueOf(MAX_REPAIR_ATTEMPTS));
        report.addSystemInfo("totalAttempts", String.valueOf(attempts.size()));
        
        return report;
    }
}
