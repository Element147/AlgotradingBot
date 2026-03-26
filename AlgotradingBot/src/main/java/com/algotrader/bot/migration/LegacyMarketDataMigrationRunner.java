package com.algotrader.bot.migration;

import com.algotrader.bot.BotApplication;
import com.algotrader.bot.service.marketdata.LegacyMarketDataMigrationRequest;
import com.algotrader.bot.service.marketdata.LegacyMarketDataMigrationService;
import com.algotrader.bot.service.marketdata.LegacyMarketDataMigrationSummary;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

public final class LegacyMarketDataMigrationRunner {

    private LegacyMarketDataMigrationRunner() {
    }

    public static void main(String[] args) {
        ConfigurableApplicationContext context = new SpringApplicationBuilder(BotApplication.class)
            .web(WebApplicationType.NONE)
            .properties("spring.main.banner-mode=off")
            .run(args);
        int exitCode = 0;
        try {
            LegacyMarketDataMigrationService migrationService = context.getBean(LegacyMarketDataMigrationService.class);
            LegacyMarketDataMigrationRequest request = new LegacyMarketDataMigrationRequest(
                Boolean.parseBoolean(System.getProperty("legacyMigration.dryRun", "true")),
                parseDatasetIds(System.getProperty("legacyMigration.datasetIds")),
                parseLimit(System.getProperty("legacyMigration.limit"))
            );
            LegacyMarketDataMigrationSummary summary = migrationService.migrate(request);
            summary.datasetResults().forEach(result -> System.out.println(result.toLogLine()));
            System.out.println(summary.renderReport());
            if (summary.failedDatasets() > 0) {
                exitCode = 2;
            }
        } finally {
            int finalExitCode = exitCode;
            SpringApplication.exit(context, () -> finalExitCode);
        }
        if (exitCode != 0) {
            System.exit(exitCode);
        }
    }

    private static Set<Long> parseDatasetIds(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return Set.of();
        }
        Set<Long> datasetIds = new LinkedHashSet<>();
        Arrays.stream(rawValue.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(Long::parseLong)
            .forEach(datasetIds::add);
        return datasetIds;
    }

    private static Integer parseLimit(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }
        return Integer.parseInt(rawValue.trim());
    }
}
