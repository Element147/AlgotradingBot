package com.algotrader.bot.controller;

import java.time.LocalDateTime;

public class BacktestDatasetResponse {

    private final Long id;
    private final String name;
    private final String originalFilename;
    private final Integer rowCount;
    private final String symbolsCsv;
    private final LocalDateTime dataStart;
    private final LocalDateTime dataEnd;
    private final LocalDateTime uploadedAt;

    public BacktestDatasetResponse(Long id,
                                   String name,
                                   String originalFilename,
                                   Integer rowCount,
                                   String symbolsCsv,
                                   LocalDateTime dataStart,
                                   LocalDateTime dataEnd,
                                   LocalDateTime uploadedAt) {
        this.id = id;
        this.name = name;
        this.originalFilename = originalFilename;
        this.rowCount = rowCount;
        this.symbolsCsv = symbolsCsv;
        this.dataStart = dataStart;
        this.dataEnd = dataEnd;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public Integer getRowCount() {
        return rowCount;
    }

    public String getSymbolsCsv() {
        return symbolsCsv;
    }

    public LocalDateTime getDataStart() {
        return dataStart;
    }

    public LocalDateTime getDataEnd() {
        return dataEnd;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}
