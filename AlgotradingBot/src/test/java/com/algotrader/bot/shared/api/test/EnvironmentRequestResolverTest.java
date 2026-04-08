package com.algotrader.bot.shared.api.test;

import org.junit.jupiter.api.Test;
import com.algotrader.bot.shared.api.service.EnvironmentRequestResolver;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EnvironmentRequestResolverTest {

    private final EnvironmentRequestResolver resolver = new EnvironmentRequestResolver();

    @Test
    void resolve_defaultsToTestWhenNoEnvironmentOrContextIsProvided() {
        assertEquals("test", resolver.resolve(null, null, null, null));
    }

    @Test
    void resolve_mapsResearchContextsToTestEnvironment() {
        assertEquals("test", resolver.resolve(null, null, "research", null));
        assertEquals("test", resolver.resolve(null, null, "forward-test", null));
        assertEquals("test", resolver.resolve(null, null, "paper", null));
    }

    @Test
    void resolve_mapsLiveContextToLiveEnvironment() {
        assertEquals("live", resolver.resolve(null, null, "live", null));
    }

    @Test
    void resolve_rejectsUnknownExecutionContexts() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> resolver.resolve(null, null, "sandbox", null)
        );

        assertEquals(
            "Unsupported execution context 'sandbox'. Expected 'research', 'forward-test', 'paper', or 'live'.",
            exception.getMessage()
        );
    }
}
