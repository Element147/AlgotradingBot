package com.algotrader.bot.exchange.api.response;

import java.util.List;

public record ExchangeConnectionProfilesResponse(
    List<ExchangeConnectionProfileResponse> connections,
    String activeConnectionId
) {}
