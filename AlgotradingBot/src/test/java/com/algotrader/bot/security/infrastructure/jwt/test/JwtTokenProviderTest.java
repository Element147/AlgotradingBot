package com.algotrader.bot.security.infrastructure.jwt.test;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import com.algotrader.bot.security.infrastructure.jwt.JwtTokenProvider;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenProviderTest {

    @Test
    void validateConfigurationRejectsMissingSecret() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", "");

        assertThrows(
                IllegalStateException.class,
                () -> ReflectionTestUtils.invokeMethod(provider, "validateConfiguration")
        );
    }

    @Test
    void validateConfigurationRejectsLegacyPlaceholderSecret() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(
                provider,
                "jwtSecret",
                "mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLongForHS256Algorithm"
        );

        assertThrows(
                IllegalStateException.class,
                () -> ReflectionTestUtils.invokeMethod(provider, "validateConfiguration")
        );
    }

    @Test
    void validateConfigurationRejectsShortSecret() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", "short-secret");

        assertThrows(
                IllegalStateException.class,
                () -> ReflectionTestUtils.invokeMethod(provider, "validateConfiguration")
        );
    }

    @Test
    void validateConfigurationAcceptsConfiguredSecret() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(
                provider,
                "jwtSecret",
                "algotradingbot-test-secret-that-is-long-enough-for-hs256-signing"
        );

        assertDoesNotThrow(() -> ReflectionTestUtils.invokeMethod(provider, "validateConfiguration"));
    }
}
