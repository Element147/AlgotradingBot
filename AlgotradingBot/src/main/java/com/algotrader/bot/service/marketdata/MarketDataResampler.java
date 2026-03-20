package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.backtest.OHLCVData;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class MarketDataResampler {

    public List<OHLCVData> toFourHourBars(List<OHLCVData> hourlyBars) {
        return resample(hourlyBars, MarketDataTimeframe.ONE_HOUR, MarketDataTimeframe.FOUR_HOURS);
    }

    public List<OHLCVData> resample(List<OHLCVData> bars, String targetTimeframeId) {
        return resample(bars, inferTimeframe(bars), MarketDataTimeframe.from(targetTimeframeId));
    }

    private List<OHLCVData> resample(List<OHLCVData> bars,
                                     MarketDataTimeframe sourceTimeframe,
                                     MarketDataTimeframe targetTimeframe) {
        List<OHLCVData> sortedBars = bars.stream()
            .sorted(Comparator.comparing(OHLCVData::getSymbol).thenComparing(OHLCVData::getTimestamp))
            .toList();
        if (sortedBars.isEmpty() || sourceTimeframe == targetTimeframe) {
            return sortedBars;
        }

        long sourceMinutes = sourceTimeframe.step().toMinutes();
        long targetMinutes = targetTimeframe.step().toMinutes();
        if (targetMinutes < sourceMinutes) {
            throw new IllegalArgumentException(
                "Requested timeframe " + targetTimeframe.id() + " is finer than dataset granularity " + sourceTimeframe.id() + "."
            );
        }
        if (targetMinutes % sourceMinutes != 0) {
            throw new IllegalArgumentException(
                "Requested timeframe " + targetTimeframe.id() + " is not aligned with dataset granularity " + sourceTimeframe.id() + "."
            );
        }

        Map<String, Accumulator> grouped = new LinkedHashMap<>();

        sortedBars.forEach(bar -> {
                LocalDateTime bucketStart = alignToBucket(bar.getTimestamp(), targetTimeframe);
                String key = bar.getSymbol() + "|" + bucketStart;
                grouped.computeIfAbsent(key, ignored -> new Accumulator(bar.getSymbol(), bucketStart)).add(bar);
            });

        List<OHLCVData> output = new ArrayList<>();
        for (Accumulator accumulator : grouped.values()) {
            output.add(accumulator.toBar());
        }
        return output;
    }

    private MarketDataTimeframe inferTimeframe(List<OHLCVData> bars) {
        Long minimumGapMinutes = null;
        Map<String, List<OHLCVData>> bySymbol = bars.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                OHLCVData::getSymbol,
                LinkedHashMap::new,
                java.util.stream.Collectors.collectingAndThen(
                    java.util.stream.Collectors.toList(),
                    symbolBars -> symbolBars.stream()
                        .sorted(Comparator.comparing(OHLCVData::getTimestamp))
                        .toList()
                )
            ));

        for (List<OHLCVData> symbolBars : bySymbol.values()) {
            for (int index = 1; index < symbolBars.size(); index++) {
                long gapMinutes = java.time.Duration.between(
                    symbolBars.get(index - 1).getTimestamp(),
                    symbolBars.get(index).getTimestamp()
                ).toMinutes();
                if (gapMinutes > 0) {
                    minimumGapMinutes = minimumGapMinutes == null
                        ? gapMinutes
                        : Math.min(minimumGapMinutes, gapMinutes);
                }
            }
        }

        if (minimumGapMinutes == null) {
            throw new IllegalArgumentException("Unable to infer dataset timeframe from fewer than two ordered candles.");
        }
        long inferredGapMinutes = minimumGapMinutes;

        return Arrays.stream(MarketDataTimeframe.values())
            .filter(candidate -> candidate.step().toMinutes() == inferredGapMinutes)
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException(
                "Unsupported dataset candle spacing: " + inferredGapMinutes + " minutes."
            ));
    }

    private LocalDateTime alignToBucket(LocalDateTime timestamp, MarketDataTimeframe targetTimeframe) {
        if (targetTimeframe == MarketDataTimeframe.ONE_DAY) {
            return timestamp.toLocalDate().atStartOfDay();
        }

        long stepMinutes = targetTimeframe.step().toMinutes();
        long minutesFromMidnight = timestamp.getHour() * 60L + timestamp.getMinute();
        long bucketStartMinutes = (minutesFromMidnight / stepMinutes) * stepMinutes;
        return timestamp.toLocalDate().atStartOfDay().plusMinutes(bucketStartMinutes);
    }

    private static final class Accumulator {
        private final String symbol;
        private final LocalDateTime bucketStart;
        private BigDecimal open;
        private BigDecimal high;
        private BigDecimal low;
        private BigDecimal close;
        private BigDecimal volume = BigDecimal.ZERO;

        private Accumulator(String symbol, LocalDateTime bucketStart) {
            this.symbol = symbol;
            this.bucketStart = bucketStart;
        }

        private void add(OHLCVData bar) {
            if (open == null) {
                open = bar.getOpen();
            }
            high = high == null ? bar.getHigh() : high.max(bar.getHigh());
            low = low == null ? bar.getLow() : low.min(bar.getLow());
            close = bar.getClose();
            volume = volume.add(bar.getVolume());
        }

        private OHLCVData toBar() {
            return new OHLCVData(bucketStart, symbol, open, high, low, close, volume);
        }
    }
}
