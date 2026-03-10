package com.algotrader.bot.controller;

import com.algotrader.bot.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for account and dashboard operations.
 * Provides endpoints for balance, performance metrics, positions, and recent trades.
 * Supports environment-aware routing (test vs live).
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Account", description = "Account and dashboard operations")
@SecurityRequirement(name = "bearer-jwt")
public class AccountController {

    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);
    private static final Long DEFAULT_ACCOUNT_ID = 1L; // Default account for demo

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Get account balance with asset breakdown.
     * Supports environment-aware routing via query parameter.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @return balance response with total, available, locked, and asset breakdown
     */
    @GetMapping("/account/balance")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get account balance",
            description = "Returns account balance with asset breakdown. Supports test and live environments."
    )
    public ResponseEntity<BalanceResponse> getBalance(
            @Parameter(description = "Environment mode: test or live")
            @RequestParam(defaultValue = "test") String env) {
        
        logger.info("GET /api/account/balance - environment: {}", env);
        
        BalanceResponse balance = accountService.getBalance(env, DEFAULT_ACCOUNT_ID);
        return ResponseEntity.ok(balance);
    }

    /**
     * Get performance metrics for specified timeframe.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @param timeframe timeframe: "today", "week", "month", "all-time" (default: "month")
     * @return performance metrics including P&L, win rate, trade count, cash ratio
     */
    @GetMapping("/account/performance")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get performance metrics",
            description = "Returns performance metrics for specified timeframe: today, week, month, or all-time."
    )
    public ResponseEntity<PerformanceResponse> getPerformance(
            @Parameter(description = "Environment mode: test or live")
            @RequestParam(defaultValue = "test") String env,
            @Parameter(description = "Timeframe: today, week, month, all-time")
            @RequestParam(defaultValue = "month") String timeframe) {
        
        logger.info("GET /api/account/performance - environment: {}, timeframe: {}", env, timeframe);
        
        PerformanceResponse performance = accountService.getPerformance(env, DEFAULT_ACCOUNT_ID, timeframe);
        return ResponseEntity.ok(performance);
    }

    /**
     * Get open positions with unrealized P&L.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @return list of open positions
     */
    @GetMapping("/positions/open")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get open positions",
            description = "Returns all open positions with unrealized P&L."
    )
    public ResponseEntity<List<OpenPositionResponse>> getOpenPositions(
            @Parameter(description = "Environment mode: test or live")
            @RequestParam(defaultValue = "test") String env) {
        
        logger.info("GET /api/positions/open - environment: {}", env);
        
        List<OpenPositionResponse> positions = accountService.getOpenPositions(env, DEFAULT_ACCOUNT_ID);
        return ResponseEntity.ok(positions);
    }

    /**
     * Get recent completed trades.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @param limit maximum number of trades to return (default: 10)
     * @return list of recent completed trades
     */
    @GetMapping("/trades/recent")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get recent trades",
            description = "Returns recent completed trades with entry/exit details and P&L."
    )
    public ResponseEntity<List<RecentTradeResponse>> getRecentTrades(
            @Parameter(description = "Environment mode: test or live")
            @RequestParam(defaultValue = "test") String env,
            @Parameter(description = "Maximum number of trades to return")
            @RequestParam(defaultValue = "10") int limit) {
        
        logger.info("GET /api/trades/recent - environment: {}, limit: {}", env, limit);
        
        List<RecentTradeResponse> trades = accountService.getRecentTrades(env, DEFAULT_ACCOUNT_ID, limit);
        return ResponseEntity.ok(trades);
    }
}
