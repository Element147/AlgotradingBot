package com.algotrader.bot.controller;

import java.time.LocalDateTime;

public class BacktestRunResponse {

    private Long id;
    private String status;
    private LocalDateTime submittedAt;

    public BacktestRunResponse() {
    }

    public BacktestRunResponse(Long id, String status, LocalDateTime submittedAt) {
        this.id = id;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
