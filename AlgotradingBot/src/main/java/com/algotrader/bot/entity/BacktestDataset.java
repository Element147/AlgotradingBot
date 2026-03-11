package com.algotrader.bot.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "backtest_datasets")
public class BacktestDataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull
    @Size(min = 3, max = 255)
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @NotNull
    @JdbcTypeCode(SqlTypes.LONGVARBINARY)
    @Column(name = "csv_data", nullable = false)
    private byte[] csvData;

    @NotNull
    @Column(name = "row_count", nullable = false)
    private Integer rowCount;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "symbols_csv", nullable = false, length = 255)
    private String symbolsCsv;

    @NotNull
    @Column(name = "data_start", nullable = false)
    private LocalDateTime dataStart;

    @NotNull
    @Column(name = "data_end", nullable = false)
    private LocalDateTime dataEnd;

    @NotNull
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public byte[] getCsvData() {
        return csvData;
    }

    public void setCsvData(byte[] csvData) {
        this.csvData = csvData;
    }

    public Integer getRowCount() {
        return rowCount;
    }

    public void setRowCount(Integer rowCount) {
        this.rowCount = rowCount;
    }

    public String getSymbolsCsv() {
        return symbolsCsv;
    }

    public void setSymbolsCsv(String symbolsCsv) {
        this.symbolsCsv = symbolsCsv;
    }

    public LocalDateTime getDataStart() {
        return dataStart;
    }

    public void setDataStart(LocalDateTime dataStart) {
        this.dataStart = dataStart;
    }

    public LocalDateTime getDataEnd() {
        return dataEnd;
    }

    public void setDataEnd(LocalDateTime dataEnd) {
        this.dataEnd = dataEnd;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
