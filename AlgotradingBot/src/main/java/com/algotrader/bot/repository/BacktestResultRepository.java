package com.algotrader.bot.repository;

import com.algotrader.bot.entity.BacktestResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for BacktestResult entity.
 * Provides CRUD operations and custom query methods for backtest result retrieval.
 */
@Repository
public interface BacktestResultRepository extends JpaRepository<BacktestResult, Long> {
    List<BacktestResult> findAllByOrderByTimestampDesc();
    List<BacktestResult> findAllByOrderByTimestampDesc(Pageable pageable);

    /**
     * Find all backtest results for a specific strategy.
     *
     * @param strategyId the strategy identifier
     * @return list of backtest results for the strategy
     */
    List<BacktestResult> findByStrategyId(String strategyId);
    List<BacktestResult> findByStrategyIdOrderByTimestampDesc(String strategyId, Pageable pageable);

    /**
     * Find all backtest results for a specific symbol.
     *
     * @param symbol the trading pair symbol (e.g., "BTC/USDT")
     * @return list of backtest results for the symbol
     */
    List<BacktestResult> findBySymbol(String symbol);
    List<BacktestResult> findBySymbolOrderByTimestampDesc(String symbol, Pageable pageable);

    /**
     * Find all backtest results with a specific validation status.
     *
     * @param status the validation status (PENDING, PASSED, FAILED, PRODUCTION_READY)
     * @return list of backtest results with the specified status
     */
    List<BacktestResult> findByValidationStatus(BacktestResult.ValidationStatus status);

    /**
     * Find all backtest results for a specific strategy and symbol.
     *
     * @param strategyId the strategy identifier
     * @param symbol the trading pair symbol
     * @return list of backtest results matching both criteria
     */
    List<BacktestResult> findByStrategyIdAndSymbol(String strategyId, String symbol);
    List<BacktestResult> findByStrategyIdAndSymbolOrderByTimestampDesc(String strategyId, String symbol, Pageable pageable);
}
