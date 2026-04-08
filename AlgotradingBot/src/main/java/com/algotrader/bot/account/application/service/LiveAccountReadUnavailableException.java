package com.algotrader.bot.account.application.service;

public class LiveAccountReadUnavailableException extends RuntimeException {

    public LiveAccountReadUnavailableException(String message) {
        super(message);
    }
}
