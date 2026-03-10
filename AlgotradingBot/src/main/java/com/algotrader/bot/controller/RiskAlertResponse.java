package com.algotrader.bot.controller;

import java.time.LocalDateTime;

public class RiskAlertResponse {

    private Long id;
    private String type;
    private String severity;
    private String message;
    private String actionTaken;
    private LocalDateTime timestamp;

    public RiskAlertResponse(Long id, String type, String severity, String message, String actionTaken, LocalDateTime timestamp) {
        this.id = id;
        this.type = type;
        this.severity = severity;
        this.message = message;
        this.actionTaken = actionTaken;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getSeverity() {
        return severity;
    }

    public String getMessage() {
        return message;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
