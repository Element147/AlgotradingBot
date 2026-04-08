package com.algotrader.bot.shared.application.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class SymbolCsvSupport {

    public List<String> parseDistinct(String symbolsCsv) {
        if (symbolsCsv == null || symbolsCsv.isBlank()) {
            return List.of();
        }
        Set<String> orderedSymbols = new LinkedHashSet<>();
        for (String symbol : symbolsCsv.split(",")) {
            String normalized = symbol == null ? "" : symbol.trim();
            if (!normalized.isBlank()) {
                orderedSymbols.add(normalized);
            }
        }
        return List.copyOf(orderedSymbols);
    }
}
