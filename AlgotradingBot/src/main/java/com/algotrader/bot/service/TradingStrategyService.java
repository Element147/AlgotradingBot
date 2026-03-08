package com.algotrader.bot.service;

import com.algotrader.bot.controller.*;
import com.algotrader.bot.entity.Account;
import com.algotrader.bot.entity.BacktestResult;
import com.algotrader.bot.entity.Portfolio;
import com.algotrader.bot.entity.Trade;
import com.algotrader.bot.repository.AccountRepository;
import com.algotrader.bot.repository.BacktestResultRepository;
import com.algotrader.bot.repository.PortfolioRepository;
import com.algotrader.bot.repository.TradeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service layer for trading strategy operations.
 * Handles business logic for starting/stopping strategies, calculating metrics,
 * and retrieving trade history and backtest results.
 */
@Service
public class TradingStrategyService {
    
    private static final Logger logger = LoggerFactory.getLogger(TradingStrategyService.class);
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Autowired
    private TradeRepository tradeRepository;
    
    @Autowired
    private BacktestResultRepository backtestResultRepository;
    
    /**
     * Start a new trading strategy with the specified parameters.
     *
     * @param request the strategy start request
     * @return map containing accountId and status
     */
    @Transactional
        public StartStrategyResponse startStrategy(StartStrategyRequest request) {
            logger.info("Starting trading strategy with initial balance: {}, pairs: {}", 
                       request.getInitialBalance(), request.getPairs());

            // Create new account
            Account account = new Account(
                request.getInitialBalance(),
                request.getRiskPerTrade(),
                request.getMaxDrawdown()
            );
            account.setStatus(Account.AccountStatus.ACTIVE);
            account = accountRepository.save(account);

            // Initialize portfolio positions for each pair
            // Note: Portfolio positions start empty (no holdings yet)
            // We don't create Portfolio entries until first trade is executed
            logger.info("Account initialized. Portfolio positions will be created on first trade.");

            logger.info("Trading strategy started successfully. Account ID: {}", account.getId());

            return new StartStrategyResponse(
                account.getId(),
                "ACTIVE",
                account.getInitialBalance(),
                "Trading strategy started successfully"
            );
        }

    
    /**
     * Stop a trading strategy and close all positions.
     *
     * @param accountId the account ID (null for latest active account)
     * @return stop strategy response with final balance and PnL
     */
    @Transactional
    public StopStrategyResponse stopStrategy(Long accountId) {
        Account account = getAccountOrLatest(accountId);
        
        logger.info("Stopping trading strategy for account ID: {}", account.getId());
        
        // Close all open positions
        List<Portfolio> positions = portfolioRepository.findByAccountId(account.getId());
        for (Portfolio position : positions) {
            if (position.getPositionSize().compareTo(BigDecimal.ZERO) > 0) {
                logger.info("Closing position for {}: size={}", 
                           position.getSymbol(), position.getPositionSize());
                // In a real system, this would execute market orders
                // For now, we delete the position record
                portfolioRepository.delete(position);
            }
        }
        
        // Update account status
        account.setStatus(Account.AccountStatus.STOPPED);
        accountRepository.save(account);
        
        logger.info("Trading strategy stopped. Final balance: {}, Total PnL: {}", 
                   account.getCurrentBalance(), account.getTotalPnl());
        
        return new StopStrategyResponse(
            account.getId(),
            "STOPPED",
            account.getCurrentBalance(),
            account.getTotalPnl(),
            account.getTotalReturnPercentage(),
            "Trading strategy stopped successfully"
        );
    }
    
    /**
     * Get current strategy status and performance metrics.
     *
     * @param accountId the account ID (null for latest active account)
     * @return strategy status response
     */
    @Transactional(readOnly = true)
    public StrategyStatusResponse getStatus(Long accountId) {
        Account account = getAccountOrLatest(accountId);
        
        logger.debug("Fetching status for account ID: {}", account.getId());
        
        // Get all trades for this account (simplified - in real system would filter by account)
        List<Trade> allTrades = tradeRepository.findAll();
        
        // Calculate metrics
        int totalTrades = allTrades.size();
        int openPositions = (int) portfolioRepository.findByAccountId(account.getId())
            .stream()
            .filter(p -> p.getPositionSize().compareTo(BigDecimal.ZERO) > 0)
            .count();
        
        BigDecimal winRate = calculateWinRate(allTrades);
        BigDecimal profitFactor = calculateProfitFactor(allTrades);
        BigDecimal sharpeRatio = calculateSharpeRatio(allTrades);
        BigDecimal maxDrawdown = account.getCurrentDrawdown();
        BigDecimal maxDrawdownPercent = maxDrawdown;
        
        return new StrategyStatusResponse(
            account.getCurrentBalance(),
            account.getTotalPnl(),
            account.getTotalReturnPercentage(),
            sharpeRatio,
            maxDrawdown,
            maxDrawdownPercent,
            openPositions,
            totalTrades,
            winRate,
            profitFactor,
            account.getStatus().name()
        );
    }
    
    /**
     * Get trade history with optional filters.
     *
     * @param accountId the account ID (null for all accounts)
     * @param symbol the trading pair symbol (null for all symbols)
     * @param startDate start date filter (null for no start date)
     * @param endDate end date filter (null for no end date)
     * @param limit maximum number of results
     * @return list of trade history responses
     */
    @Transactional(readOnly = true)
    public List<TradeHistoryResponse> getTradeHistory(Long accountId, String symbol, 
                                                      LocalDateTime startDate, LocalDateTime endDate, 
                                                      int limit) {
        logger.debug("Fetching trade history: accountId={}, symbol={}, startDate={}, endDate={}, limit={}", 
                    accountId, symbol, startDate, endDate, limit);
        
        List<Trade> trades;
        
        // Apply filters
        if (symbol != null && startDate != null && endDate != null) {
            trades = tradeRepository.findBySymbolAndEntryTimeBetween(symbol, startDate, endDate);
        } else if (symbol != null) {
            trades = tradeRepository.findBySymbol(symbol);
        } else if (startDate != null && endDate != null) {
            trades = tradeRepository.findByEntryTimeBetween(startDate, endDate);
        } else {
            trades = tradeRepository.findAll();
        }
        
        // Apply limit
        return trades.stream()
            .limit(limit)
            .map(this::mapToTradeHistoryResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get backtest results with optional filters.
     *
     * @param strategyId the strategy ID (null for all strategies)
     * @param symbol the trading pair symbol (null for all symbols)
     * @param limit maximum number of results
     * @return list of backtest result responses
     */
    @Transactional(readOnly = true)
    public List<BacktestResultResponse> getBacktestResults(String strategyId, String symbol, int limit) {
        logger.debug("Fetching backtest results: strategyId={}, symbol={}, limit={}", 
                    strategyId, symbol, limit);
        
        List<BacktestResult> results;
        
        // Apply filters
        if (strategyId != null && symbol != null) {
            results = backtestResultRepository.findByStrategyIdAndSymbol(strategyId, symbol);
        } else if (strategyId != null) {
            results = backtestResultRepository.findByStrategyId(strategyId);
        } else if (symbol != null) {
            results = backtestResultRepository.findBySymbol(symbol);
        } else {
            results = backtestResultRepository.findAll();
        }
        
        // Apply limit
        return results.stream()
            .limit(limit)
            .map(this::mapToBacktestResultResponse)
            .collect(Collectors.toList());
    }
    
    // Helper methods
    
    private Account getAccountOrLatest(Long accountId) {
        if (accountId != null) {
            return accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with ID: " + accountId));
        } else {
            return accountRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new EntityNotFoundException("No accounts found"));
        }
    }
    
    private BigDecimal calculateWinRate(List<Trade> trades) {
        if (trades.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        long winningTrades = trades.stream()
            .filter(t -> t.getPnl() != null && t.getPnl().compareTo(BigDecimal.ZERO) > 0)
            .count();
        
        return BigDecimal.valueOf(winningTrades)
            .divide(BigDecimal.valueOf(trades.size()), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
    }
    
    private BigDecimal calculateProfitFactor(List<Trade> trades) {
        BigDecimal totalProfit = trades.stream()
            .filter(t -> t.getPnl() != null && t.getPnl().compareTo(BigDecimal.ZERO) > 0)
            .map(Trade::getPnl)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalLoss = trades.stream()
            .filter(t -> t.getPnl() != null && t.getPnl().compareTo(BigDecimal.ZERO) < 0)
            .map(Trade::getPnl)
            .map(BigDecimal::abs)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalLoss.compareTo(BigDecimal.ZERO) == 0) {
            return totalProfit.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(999.99) : BigDecimal.ZERO;
        }
        
        return totalProfit.divide(totalLoss, 4, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateSharpeRatio(List<Trade> trades) {
        // Simplified Sharpe ratio calculation
        // In a real system, this would use rolling 30-day returns
        if (trades.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // For now, return a placeholder value
        // Real implementation would calculate: (mean return - risk-free rate) / std deviation
        return BigDecimal.valueOf(1.5);
    }
    
    private TradeHistoryResponse mapToTradeHistoryResponse(Trade trade) {
        return new TradeHistoryResponse(
            trade.getId(),
            trade.getSymbol(),
            trade.getEntryTime(),
            trade.getEntryPrice(),
            trade.getExitTime(),
            trade.getExitPrice(),
            trade.getSignalType().name(),
            trade.getPositionSize(),
            trade.getRiskAmount(),
            trade.getPnl(),
            trade.getActualFees(),
            trade.getActualSlippage(),
            trade.getStopLoss(),
            trade.getTakeProfit()
        );
    }
    
    private BacktestResultResponse mapToBacktestResultResponse(BacktestResult result) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String dateRange = result.getStartDate().format(formatter) + " to " + 
                          result.getEndDate().format(formatter);
        
        BigDecimal totalReturn = result.getFinalBalance()
            .subtract(result.getInitialBalance())
            .divide(result.getInitialBalance(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        
        // Simplified annual return calculation
        BigDecimal annualReturn = totalReturn; // In real system, would annualize based on date range
        
        // Calculate Calmar ratio: Annual Return / Max Drawdown
        BigDecimal calmarRatio = result.getMaxDrawdown().compareTo(BigDecimal.ZERO) > 0
            ? annualReturn.divide(result.getMaxDrawdown(), 4, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        
        return new BacktestResultResponse(
            result.getStrategyId(),
            result.getSymbol(),
            dateRange,
            result.getInitialBalance(),
            result.getFinalBalance(),
            totalReturn,
            annualReturn,
            result.getSharpeRatio(),
            calmarRatio,
            result.getMaxDrawdown(),
            result.getWinRate(),
            result.getProfitFactor(),
            result.getTotalTrades(),
            0, // winningSessions - not stored in entity
            0, // losingSessions - not stored in entity
            result.getValidationStatus().name()
        );
    }
}
