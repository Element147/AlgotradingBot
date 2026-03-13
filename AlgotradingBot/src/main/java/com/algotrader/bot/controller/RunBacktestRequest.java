package com.algotrader.bot.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RunBacktestRequest(
    @NotBlank(message = "Algorithm type is required")
    String algorithmType,
    @NotNull(message = "Dataset ID is required")
    @Positive(message = "Dataset ID must be positive")
    Long datasetId,
    @NotBlank(message = "Symbol is required")
    @Size(min = 3, max = 20, message = "Symbol length must be 3-20 characters")
    String symbol,
    @NotBlank(message = "Timeframe is required")
    @Size(min = 1, max = 10, message = "Timeframe length must be 1-10 characters")
    String timeframe,
    @NotNull(message = "Start date is required")
    LocalDate startDate,
    @NotNull(message = "End date is required")
    LocalDate endDate,
    @NotNull(message = "Initial balance is required")
    @Positive(message = "Initial balance must be positive")
    BigDecimal initialBalance,
    @NotNull(message = "Fees assumption is required")
    @PositiveOrZero(message = "Fees must be non-negative")
    @Max(value = 200, message = "Fees must be <= 200 bps")
    Integer feesBps,
    @NotNull(message = "Slippage assumption is required")
    @PositiveOrZero(message = "Slippage must be non-negative")
    @Max(value = 200, message = "Slippage must be <= 200 bps")
    Integer slippageBps,
    @Size(max = 120, message = "Experiment name must be <= 120 characters")
    String experimentName
) {
    public RunBacktestRequest {
        feesBps = feesBps == null ? 10 : feesBps;
        slippageBps = slippageBps == null ? 3 : slippageBps;
    }
}
