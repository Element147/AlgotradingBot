package com.algotrader.bot.service;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class EnvironmentRequestResolver {

    public static final String TEST = "test";
    public static final String LIVE = "live";

    public String resolve(String queryEnvironment, String headerEnvironment) {
        String rawEnvironment = hasText(queryEnvironment) ? queryEnvironment : headerEnvironment;
        if (!hasText(rawEnvironment)) {
            return TEST;
        }

        String normalized = rawEnvironment.trim().toLowerCase(Locale.ROOT);
        if (!TEST.equals(normalized) && !LIVE.equals(normalized)) {
            throw new IllegalArgumentException(
                "Unsupported environment '" + rawEnvironment + "'. Expected 'test' or 'live'."
            );
        }

        return normalized;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
