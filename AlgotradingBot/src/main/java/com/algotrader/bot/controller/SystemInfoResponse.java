package com.algotrader.bot.controller;

public class SystemInfoResponse {

    private String applicationVersion;
    private String lastDeploymentDate;
    private String databaseStatus;
    private String kafkaStatus;

    public SystemInfoResponse() {
    }

    public SystemInfoResponse(
        String applicationVersion,
        String lastDeploymentDate,
        String databaseStatus,
        String kafkaStatus
    ) {
        this.applicationVersion = applicationVersion;
        this.lastDeploymentDate = lastDeploymentDate;
        this.databaseStatus = databaseStatus;
        this.kafkaStatus = kafkaStatus;
    }

    public String getApplicationVersion() {
        return applicationVersion;
    }

    public void setApplicationVersion(String applicationVersion) {
        this.applicationVersion = applicationVersion;
    }

    public String getLastDeploymentDate() {
        return lastDeploymentDate;
    }

    public void setLastDeploymentDate(String lastDeploymentDate) {
        this.lastDeploymentDate = lastDeploymentDate;
    }

    public String getDatabaseStatus() {
        return databaseStatus;
    }

    public void setDatabaseStatus(String databaseStatus) {
        this.databaseStatus = databaseStatus;
    }

    public String getKafkaStatus() {
        return kafkaStatus;
    }

    public void setKafkaStatus(String kafkaStatus) {
        this.kafkaStatus = kafkaStatus;
    }
}
