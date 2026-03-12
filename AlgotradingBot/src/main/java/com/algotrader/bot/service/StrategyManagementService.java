package com.algotrader.bot.service;

import com.algotrader.bot.controller.StrategyActionResponse;
import com.algotrader.bot.controller.StrategyDetailsResponse;
import com.algotrader.bot.controller.UpdateStrategyConfigRequest;
import com.algotrader.bot.entity.StrategyConfig;
import com.algotrader.bot.repository.StrategyConfigRepository;
import com.algotrader.bot.websocket.WebSocketEventPublisher;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StrategyManagementService {

    private static final Logger logger = LoggerFactory.getLogger(StrategyManagementService.class);

    private final StrategyConfigRepository strategyConfigRepository;
    private final WebSocketEventPublisher webSocketEventPublisher;
    private final OperatorAuditService operatorAuditService;

    public StrategyManagementService(StrategyConfigRepository strategyConfigRepository,
                                     WebSocketEventPublisher webSocketEventPublisher,
                                     OperatorAuditService operatorAuditService) {
        this.strategyConfigRepository = strategyConfigRepository;
        this.webSocketEventPublisher = webSocketEventPublisher;
        this.operatorAuditService = operatorAuditService;
    }

    @Transactional
    public List<StrategyDetailsResponse> listStrategies() {
        ensureDefaultStrategies();

        return strategyConfigRepository.findAllByOrderByNameAsc().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public StrategyActionResponse startStrategy(Long strategyId) {
        StrategyConfig strategy = getById(strategyId);

        strategy.setStatus(StrategyConfig.StrategyStatus.RUNNING);
        strategy.setStartedAt(LocalDateTime.now());
        strategyConfigRepository.save(strategy);

        webSocketEventPublisher.publishStrategyStatus(
            "paper",
            String.valueOf(strategy.getId()),
            strategy.getStatus().name(),
            "Strategy started"
        );

        operatorAuditService.recordSuccess(
            "STRATEGY_STARTED",
            "paper",
            "STRATEGY",
            String.valueOf(strategy.getId()),
            strategy.getName()
        );

        return new StrategyActionResponse(strategy.getId(), strategy.getStatus().name(), "Strategy started in paper mode");
    }

    @Transactional
    public StrategyActionResponse stopStrategy(Long strategyId) {
        StrategyConfig strategy = getById(strategyId);

        strategy.setStatus(StrategyConfig.StrategyStatus.STOPPED);
        strategy.setStoppedAt(LocalDateTime.now());
        strategyConfigRepository.save(strategy);

        webSocketEventPublisher.publishStrategyStatus(
            "paper",
            String.valueOf(strategy.getId()),
            strategy.getStatus().name(),
            "Strategy stopped"
        );

        operatorAuditService.recordSuccess(
            "STRATEGY_STOPPED",
            "paper",
            "STRATEGY",
            String.valueOf(strategy.getId()),
            strategy.getName()
        );

        return new StrategyActionResponse(strategy.getId(), strategy.getStatus().name(), "Strategy stopped");
    }

    @Transactional
    public StrategyDetailsResponse updateStrategyConfig(Long strategyId, UpdateStrategyConfigRequest request) {
        StrategyConfig strategy = getById(strategyId);

        if (request.maxPositionSize().compareTo(request.minPositionSize()) < 0) {
            throw new IllegalArgumentException("Max position size must be greater than or equal to min position size");
        }

        if (StrategyConfig.StrategyStatus.RUNNING.equals(strategy.getStatus())) {
            strategy.setStatus(StrategyConfig.StrategyStatus.STOPPED);
            strategy.setStoppedAt(LocalDateTime.now());
        }

        strategy.setSymbol(request.symbol());
        strategy.setTimeframe(request.timeframe());
        strategy.setRiskPerTrade(request.riskPerTrade());
        strategy.setMinPositionSize(request.minPositionSize());
        strategy.setMaxPositionSize(request.maxPositionSize());

        StrategyConfig saved = strategyConfigRepository.save(strategy);

        webSocketEventPublisher.publishStrategyStatus(
            "paper",
            String.valueOf(saved.getId()),
            saved.getStatus().name(),
            "Strategy configuration updated"
        );

        operatorAuditService.recordSuccess(
            "STRATEGY_CONFIG_UPDATED",
            "paper",
            "STRATEGY",
            String.valueOf(saved.getId()),
            "symbol=" + saved.getSymbol() + ", timeframe=" + saved.getTimeframe()
        );

        return mapToResponse(saved);
    }

    private StrategyConfig getById(Long strategyId) {
        return strategyConfigRepository.findById(strategyId)
            .orElseThrow(() -> new EntityNotFoundException("Strategy not found: " + strategyId));
    }

    private StrategyDetailsResponse mapToResponse(StrategyConfig strategy) {
        return new StrategyDetailsResponse(
            strategy.getId(),
            strategy.getName(),
            strategy.getType(),
            strategy.getStatus().name(),
            strategy.getSymbol(),
            strategy.getTimeframe(),
            strategy.getRiskPerTrade(),
            strategy.getMinPositionSize(),
            strategy.getMaxPositionSize(),
            strategy.getProfitLoss(),
            strategy.getTradeCount(),
            strategy.getCurrentDrawdown(),
            strategy.getPaperMode()
        );
    }

    private void ensureDefaultStrategies() {
        if (strategyConfigRepository.count() > 0) {
            return;
        }

        logger.info("Seeding default paper strategies");

        StrategyConfig bollinger = new StrategyConfig(
            "Bollinger BTC Mean Reversion",
            "bollinger-bands",
            "BTC/USDT",
            "1h",
            new BigDecimal("0.02"),
            new BigDecimal("10.00"),
            new BigDecimal("100.00")
        );

        StrategyConfig bollingerEth = new StrategyConfig(
            "Bollinger ETH Mean Reversion",
            "bollinger-bands",
            "ETH/USDT",
            "1h",
            new BigDecimal("0.02"),
            new BigDecimal("10.00"),
            new BigDecimal("100.00")
        );

        strategyConfigRepository.saveAll(List.of(bollinger, bollingerEth));
    }
}
