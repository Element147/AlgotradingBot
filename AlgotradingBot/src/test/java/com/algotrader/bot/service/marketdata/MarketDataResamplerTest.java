package com.algotrader.bot.service.marketdata;

import com.algotrader.bot.backtest.OHLCVData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MarketDataResamplerTest {

    private final MarketDataResampler marketDataResampler = new MarketDataResampler();

    @Test
    void toFourHourBars_rollsUpHourlyBars() {
        List<OHLCVData> bars = List.of(
            new OHLCVData(LocalDateTime.parse("2025-01-01T00:00:00"), "BTC/USDT", bd("100"), bd("101"), bd("99"), bd("100"), bd("10")),
            new OHLCVData(LocalDateTime.parse("2025-01-01T01:00:00"), "BTC/USDT", bd("100"), bd("103"), bd("98"), bd("102"), bd("11")),
            new OHLCVData(LocalDateTime.parse("2025-01-01T02:00:00"), "BTC/USDT", bd("102"), bd("104"), bd("101"), bd("103"), bd("12")),
            new OHLCVData(LocalDateTime.parse("2025-01-01T03:00:00"), "BTC/USDT", bd("103"), bd("105"), bd("100"), bd("104"), bd("13"))
        );

        List<OHLCVData> resampled = marketDataResampler.toFourHourBars(bars);

        assertThat(resampled).hasSize(1);
        OHLCVData bar = resampled.get(0);
        assertThat(bar.getTimestamp()).isEqualTo(LocalDateTime.parse("2025-01-01T00:00:00"));
        assertThat(bar.getOpen()).isEqualByComparingTo("100");
        assertThat(bar.getHigh()).isEqualByComparingTo("105");
        assertThat(bar.getLow()).isEqualByComparingTo("98");
        assertThat(bar.getClose()).isEqualByComparingTo("104");
        assertThat(bar.getVolume()).isEqualByComparingTo("46");
    }

    private BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
