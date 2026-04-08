package com.algotrader.bot.system.api;

public record SystemInfoResponse(
    String applicationVersion,
    String lastDeploymentDate,
    String databaseStatus
) {}
