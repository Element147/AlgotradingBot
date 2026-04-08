package com.algotrader.bot.marketdata.application.service;

public enum MarketDataCredentialSource {
    NOT_REQUIRED,
    DATABASE,
    ENVIRONMENT,
    DATABASE_LOCKED,
    NONE
}
