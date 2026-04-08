package com.algotrader.bot.system.api.response;

import java.util.List;

public record OperatorAuditEventListResponse(
    OperatorAuditSummaryResponse summary,
    List<OperatorAuditEventResponse> events
) {}
