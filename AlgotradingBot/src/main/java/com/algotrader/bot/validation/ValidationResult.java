package com.algotrader.bot.validation;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ValidationResult {
    private String requirementId;
    private String requirementName;
    private ValidationStatus status;
    private String message;
    private LocalDateTime timestamp;
    private Duration executionTime;
    private Map<String, Object> metadata;

    public ValidationResult(String requirementId, String requirementName, ValidationStatus status, String message) {
        this.requirementId = requirementId;
        this.requirementName = requirementName;
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.metadata = new HashMap<>();
    }

    public boolean isPassed() {
        return status == ValidationStatus.PASSED;
    }

    public boolean isFailed() {
        return status == ValidationStatus.FAILED;
    }

    // Getters and setters
    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }
    
    public String getRequirementName() { return requirementName; }
    public void setRequirementName(String requirementName) { this.requirementName = requirementName; }
    
    public ValidationStatus getStatus() { return status; }
    public void setStatus(ValidationStatus status) { this.status = status; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Duration getExecutionTime() { return executionTime; }
    public void setExecutionTime(Duration executionTime) { this.executionTime = executionTime; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
    public void addMetadata(String key, Object value) {
        this.metadata.put(key, value);
    }
}
