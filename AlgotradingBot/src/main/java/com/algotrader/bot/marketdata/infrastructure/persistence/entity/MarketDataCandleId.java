package com.algotrader.bot.marketdata.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Embeddable
public class MarketDataCandleId implements Serializable {

    @NotNull
    @Column(name = "segment_id", nullable = false)
    private Long segmentId;

    @NotNull
    @Size(min = 2, max = 10)
    @Column(name = "timeframe", nullable = false, length = 10)
    private String timeframe;

    @NotNull
    @Column(name = "bucket_start", nullable = false)
    private LocalDateTime bucketStart;

    public MarketDataCandleId() {
    }

    public MarketDataCandleId(Long segmentId, String timeframe, LocalDateTime bucketStart) {
        this.segmentId = segmentId;
        this.timeframe = timeframe;
        this.bucketStart = bucketStart;
    }

    public Long getSegmentId() {
        return segmentId;
    }

    public void setSegmentId(Long segmentId) {
        this.segmentId = segmentId;
    }

    public String getTimeframe() {
        return timeframe;
    }

    public void setTimeframe(String timeframe) {
        this.timeframe = timeframe;
    }

    public LocalDateTime getBucketStart() {
        return bucketStart;
    }

    public void setBucketStart(LocalDateTime bucketStart) {
        this.bucketStart = bucketStart;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MarketDataCandleId that)) {
            return false;
        }
        return Objects.equals(segmentId, that.segmentId)
            && Objects.equals(timeframe, that.timeframe)
            && Objects.equals(bucketStart, that.bucketStart);
    }

    @Override
    public int hashCode() {
        return Objects.hash(segmentId, timeframe, bucketStart);
    }
}
