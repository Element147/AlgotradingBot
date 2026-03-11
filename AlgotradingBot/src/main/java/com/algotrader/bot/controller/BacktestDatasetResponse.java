package com.algotrader.bot.controller;

import java.time.LocalDateTime;

public record BacktestDatasetResponse(
    Long id,
    String name,
    String originalFilename,
    Integer rowCount,
    String symbolsCsv,
    LocalDateTime dataStart,
    LocalDateTime dataEnd,
    LocalDateTime uploadedAt
) {}
