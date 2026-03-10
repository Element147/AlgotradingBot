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
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Get account balance with asset breakdown.
     * Supports environment-aware routing via query parameter.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @param accountId optional account ID (defaults to latest account)
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
            @RequestParam(defaultValue = "test") String env,
            @Parameter(description = "Account ID (optional, defaults to latest account)")
            @RequestParam(required = false) Long accountId) {
        
        logger.info("GET /api/account/balance - environment: {}, accountId: {}", env, accountId);
        
        BalanceResponse balance = accountService.getBalance(env, accountId);
        return ResponseEntity.ok(balance);
    }

    /**
     * Get performance metrics for specified timeframe.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @param timeframe timeframe: "today", "week", "month", "all-time" (default: "month")
     * @param accountId optional account ID (defaults to latest account)
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
            @RequestParam(defaultValue = "month") String timeframe,
            @Parameter(description = "Account ID (optional, defaults to latest account)")
            @RequestParam(required = false) Long accountId) {
        
        logger.info("GET /api/account/performance - environment: {}, timeframe: {}, accountId: {}",
                env, timeframe, accountId);
        
        PerformanceResponse performance = accountService.getPerformance(env, accountId, timeframe);
        return ResponseEntity.ok(performance);
    }

    /**
     * Get open positions with unrealized P&L.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @param accountId optional account ID (defaults to latest account)
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
            @RequestParam(defaultValue = "test") String env,
            @Parameter(description = "Account ID (optional, defaults to latest account)")
            @RequestParam(required = false) Long accountId) {
        
        logger.info("GET /api/positions/open - environment: {}, accountId: {}", env, accountId);
        
        List<OpenPositionResponse> positions = accountService.getOpenPositions(env, accountId);
        return ResponseEntity.ok(positions);
    }

    /**
     * Get recent completed trades.
     *
     * @param env environment mode: "test" or "live" (default: "test")
     * @param limit maximum number of trades to return (default: 10)
     * @param accountId optional account ID (defaults to latest account)
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
            @RequestParam(defaultValue = "10") int limit,
            @Parameter(description = "Account ID (optional, defaults to latest account)")
            @RequestParam(required = false) Long accountId) {
        
        logger.info("GET /api/trades/recent - environment: {}, limit: {}, accountId: {}", env, limit, accountId);
        
        List<RecentTradeResponse> trades = accountService.getRecentTrades(env, accountId, limit);
        return ResponseEntity.ok(trades);
    }
}
