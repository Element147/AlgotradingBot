package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.backtest.OHLCVData;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class MarketDataResampler {

    public List<OHLCVData> toFourHourBars(List<OHLCVData> hourlyBars) {
        Map<String, Accumulator> grouped = new LinkedHashMap<>();

        hourlyBars.stream()
            .sorted(Comparator.comparing(OHLCVData::getTimestamp))
            .forEach(bar -> {
                LocalDateTime bucketStart = alignToFourHourBucket(bar.getTimestamp());
                String key = bar.getSymbol() + "|" + bucketStart;
                grouped.computeIfAbsent(key, ignored -> new Accumulator(bar.getSymbol(), bucketStart)).add(bar);
            });

        List<OHLCVData> output = new ArrayList<>();
        for (Accumulator accumulator : grouped.values()) {
            output.add(accumulator.toBar());
        }
        return output;
    }

    private LocalDateTime alignToFourHourBucket(LocalDateTime timestamp) {
        int bucketHour = (timestamp.getHour() / 4) * 4;
        return timestamp.withHour(bucketHour)
            .withMinute(0)
            .withSecond(0)
            .withNano(0)
            .with(ChronoField.NANO_OF_SECOND, 0);
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
