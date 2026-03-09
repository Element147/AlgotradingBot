package com.algotrader.bot.config;

import com.algotrader.bot.entity.User;
import com.algotrader.bot.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Data initializer to create default users for development and testing.
 */
@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Profile({"dev", "default"})
    public CommandLineRunner initializeDefaultUsers(AuthService authService) {
        return args -> {
            try {
                // Create default admin user
                authService.createUser(
                        "admin",
                        "admin123",
                        "admin@algotrading.com",
                        User.Role.ADMIN
                );
                logger.info("Created default admin user: admin / admin123");
            } catch (IllegalArgumentException e) {
                logger.debug("Admin user already exists");
            }

            try {
                // Create default trader user
                authService.createUser(
                        "trader",
                        "trader123",
                        "trader@algotrading.com",
                        User.Role.TRADER
                );
                logger.info("Created default trader user: trader / trader123");
            } catch (IllegalArgumentException e) {
                logger.debug("Trader user already exists");
            }
        };
    }
}
