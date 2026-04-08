package com.algotrader.bot.account.application;

public class LiveAccountReadUnavailableException extends RuntimeException {

    public LiveAccountReadUnavailableException(String message) {
        super(message);
    }
}
