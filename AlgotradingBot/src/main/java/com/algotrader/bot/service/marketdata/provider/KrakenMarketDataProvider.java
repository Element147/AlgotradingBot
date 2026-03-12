package com.algotrader.bot.service.marketdata.provider;

import com.algotrader.bot.backtest.OHLCVData;
import com.algotrader.bot.service.marketdata.AbstractMarketDataProvider;
import com.algotrader.bot.service.marketdata.MarketDataAssetType;
import com.algotrader.bot.service.marketdata.MarketDataHttpClient;
import com.algotrader.bot.service.marketdata.MarketDataProviderCredentialService;
import com.algotrader.bot.service.marketdata.MarketDataProviderDefinition;
import com.algotrader.bot.service.marketdata.MarketDataProviderFetchRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class KrakenMarketDataProvider extends AbstractMarketDataProvider {

    private static final MarketDataProviderDefinition DEFINITION = new MarketDataProviderDefinition(
        "kraken",
        "Kraken",
        "Public OHLC market data for major crypto pairs with no API key required.",
        Set.of(MarketDataAssetType.CRYPTO),
        List.of("1m", "5m", "15m", "30m", "1h", "4h", "1d"),
        false,
        null,
        false,
        false,
        List.of("BTC/USD", "ETH/USD", "SOL/USD"),
        "https://docs.kraken.com/api/docs/rest-api/get-ohlc-data/",
        "https://www.kraken.com/",
        "No API key is needed for public OHLC queries."
    );

    public KrakenMarketDataProvider(
        MarketDataHttpClient httpClient,
        ObjectMapper objectMapper,
        MarketDataProviderCredentialService marketDataProviderCredentialService
    ) {
        super(httpClient, objectMapper, marketDataProviderCredentialService);
    }

    @Override
    public MarketDataProviderDefinition definition() {
        return DEFINITION;
    }

    @Override
    public List<OHLCVData> fetch(MarketDataProviderFetchRequest request) {
        if (request.assetType() != MarketDataAssetType.CRYPTO) {
            throw new IllegalArgumentException("Kraken only supports crypto imports.");
        }

        JsonNode root = getJson(
            "https://api.kraken.com/0/public/OHLC",
            Map.of(
                "pair", providerPair(request.requestedSymbol()),
                "interval", intervalMinutes(request),
                "since", String.valueOf(request.start().toEpochSecond(ZoneOffset.UTC))
            )
        );

        JsonNode errors = root.path("error");
        if (errors.isArray() && !errors.isEmpty()) {
            throw new IllegalArgumentException("Kraken request failed: " + errors.get(0).asText());
        }

        JsonNode result = root.path("result");
        if (!result.isObject()) {
            throw new IllegalArgumentException("Kraken returned an unexpected payload.");
        }

        Iterator<String> fieldNames = result.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            if ("last".equals(fieldName)) {
                continue;
            }
            JsonNode rows = result.get(fieldName);
            if (!rows.isArray()) {
                continue;
            }

            String symbol = toDatasetSymbol(request.assetType(), request.requestedSymbol());
            List<OHLCVData> bars = new ArrayList<>();
            for (JsonNode row : rows) {
                if (!row.isArray() || row.size() < 7) {
                    continue;
                }
                LocalDateTime timestamp = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(row.get(0).asLong()),
                    ZoneOffset.UTC
                );
                if (timestamp.isBefore(request.start()) || timestamp.isAfter(request.end())) {
                    continue;
                }
                bars.add(new OHLCVData(
                    timestamp,
                    symbol,
                    new BigDecimal(row.get(1).asText()),
                    new BigDecimal(row.get(2).asText()),
                    new BigDecimal(row.get(3).asText()),
                    new BigDecimal(row.get(4).asText()),
                    new BigDecimal(row.get(6).asText())
                ));
            }
            return bars;
        }

        return List.of();
    }

    private String intervalMinutes(MarketDataProviderFetchRequest request) {
        return switch (request.timeframe().id()) {
            case "1m" -> "1";
            case "5m" -> "5";
            case "15m" -> "15";
            case "30m" -> "30";
            case "1h" -> "60";
            case "4h" -> "240";
            case "1d" -> "1440";
            default -> throw new IllegalArgumentException("Kraken does not support timeframe " + request.timeframe().id());
        };
    }

    private String providerPair(String requestedSymbol) {
        String normalized = normalizeCryptoSymbol(requestedSymbol);
        if (!normalized.contains("/")) {
            return normalized.replace("BTC", "XBT");
        }
        String[] parts = normalized.split("/");
        String base = "BTC".equals(parts[0]) ? "XBT" : parts[0];
        return base + parts[1];
    }
}
