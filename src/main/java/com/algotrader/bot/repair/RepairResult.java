package com.algotrader.bot.repair;

import com.algotrader.bot.validation.ValidationResult;

public class RepairResult {
    private boolean successful;
    private String message;
    private ValidationResult retryResult;

    public RepairResult(boolean successful, String message) {
        this.successful = successful;
        this.message = message;
    }

    public boolean isSuccessful() { return successful; }
    public void setSuccessful(boolean successful) { this.successful = successful; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public ValidationResult getRetryResult() { return retryResult; }
    public void setRetryResult(ValidationResult retryResult) { this.retryResult = retryResult; }
}
