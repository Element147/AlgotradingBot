package com.algotrader.bot.system.api.response;

public record SystemInfoResponse(
    String applicationVersion,
    String lastDeploymentDate,
    String databaseStatus
) {}
