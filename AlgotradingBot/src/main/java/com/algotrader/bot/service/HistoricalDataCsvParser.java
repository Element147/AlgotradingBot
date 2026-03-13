package com.algotrader.bot.service;

import com.algotrader.bot.backtest.OHLCVData;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Component
public class HistoricalDataCsvParser {

    public List<OHLCVData> parse(byte[] csvBytes) {
        if (csvBytes == null || csvBytes.length == 0) {
            throw new IllegalArgumentException("CSV data is empty");
        }

        String csv = new String(csvBytes, StandardCharsets.UTF_8);
        String[] rawLines = csv.replace("\r", "").split("\n");
        if (rawLines.length < 2) {
            throw new IllegalArgumentException("CSV must contain header and at least one data row");
        }

        CsvIndexes indexes = resolveIndexes(rawLines[0]);
        List<OHLCVData> candles = new ArrayList<>(Math.max(1, rawLines.length - 1));
        LocalDateTime previousTimestamp = null;
        boolean alreadySorted = true;

        for (int i = 1; i < rawLines.length; i++) {
            String line = rawLines[i].trim();
            if (line.isEmpty()) {
                continue;
            }

            String[] columns = line.split(",");
            if (columns.length <= indexes.maxIndex()) {
                throw new IllegalArgumentException("Invalid CSV row at line " + (i + 1));
            }

            try {
                LocalDateTime timestamp = LocalDateTime.parse(columns[indexes.timestamp()].trim());
                if (previousTimestamp != null && timestamp.isBefore(previousTimestamp)) {
                    alreadySorted = false;
                }
                previousTimestamp = timestamp;
                candles.add(new OHLCVData(
                    timestamp,
                    columns[indexes.symbol()].trim(),
                    new BigDecimal(columns[indexes.open()].trim()),
                    new BigDecimal(columns[indexes.high()].trim()),
                    new BigDecimal(columns[indexes.low()].trim()),
                    new BigDecimal(columns[indexes.close()].trim()),
                    new BigDecimal(columns[indexes.volume()].trim())
                ));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Unable to parse CSV at line " + (i + 1) + ": " + ex.getMessage());
            }
        }

        if (!alreadySorted) {
            candles.sort(Comparator.comparing(OHLCVData::getTimestamp));
        }
        if (candles.isEmpty()) {
            throw new IllegalArgumentException("CSV does not contain valid OHLCV rows");
        }

        return candles;
    }

    private CsvIndexes resolveIndexes(String headerLine) {
        String[] headers = headerLine.toLowerCase(Locale.ROOT).split(",");
        int timestamp = findIndex(headers, "timestamp");
        int symbol = findIndex(headers, "symbol");
        int open = findIndex(headers, "open");
        int high = findIndex(headers, "high");
        int low = findIndex(headers, "low");
        int close = findIndex(headers, "close");
        int volume = findIndex(headers, "volume");

        return new CsvIndexes(timestamp, symbol, open, high, low, close, volume);
    }

    private int findIndex(String[] headers, String expected) {
        for (int i = 0; i < headers.length; i++) {
            if (expected.equals(headers[i].trim())) {
                return i;
            }
        }
        throw new IllegalArgumentException("CSV missing required column: " + expected);
    }

    private record CsvIndexes(int timestamp, int symbol, int open, int high, int low, int close, int volume) {
        private int maxIndex() {
            int max = timestamp;
            max = Math.max(max, symbol);
            max = Math.max(max, open);
            max = Math.max(max, high);
            max = Math.max(max, low);
            max = Math.max(max, close);
            return Math.max(max, volume);
        }
    }
}
