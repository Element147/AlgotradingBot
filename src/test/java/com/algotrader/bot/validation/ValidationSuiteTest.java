package com.algotrader.bot.validation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

class ValidationSuiteTest {

    private ValidationSuite validationSuite;

    @BeforeEach
    void setUp() {
        validationSuite = new ValidationSuite();
    }

    @Test
    void testValidationSuiteCreation() {
        assertNotNull(validationSuite);
    }

    @Test
    void testRunAllValidationsReturnsExitCode() {
        // Test that runAllValidations returns an exit code
        // We don't call main() because it calls System.exit()
        int exitCode = validationSuite.runAllValidations();
        assertTrue(exitCode >= 0, "Exit code should be non-negative");
    }
}
