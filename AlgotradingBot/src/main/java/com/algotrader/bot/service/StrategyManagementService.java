package com.algotrader.bot.service;

import com.algotrader.bot.controller.StrategyActionResponse;
import com.algotrader.bot.controller.StrategyConfigHistoryResponse;
import com.algotrader.bot.controller.StrategyDetailsResponse;
import com.algotrader.bot.controller.UpdateStrategyConfigRequest;
import com.algotrader.bot.entity.StrategyConfig;
import com.algotrader.bot.entity.StrategyConfigVersion;
import com.algotrader.bot.repository.StrategyConfigRepository;
import com.algotrader.bot.repository.StrategyConfigVersionRepository;
import com.algotrader.bot.websocket.WebSocketEventPublisher;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class StrategyManagementService {

    private static final Logger logger = LoggerFactory.getLogger(StrategyManagementService.class);

    private final StrategyConfigRepository strategyConfigRepository;
    private final StrategyConfigVersionRepository strategyConfigVersionRepository;
    private final WebSocketEventPublisher webSocketEventPublisher;
    private final OperatorAuditService operatorAuditService;

    public StrategyManagementService(StrategyConfigRepository strategyConfigRepository,
                                     StrategyConfigVersionRepository strategyConfigVersionRepository,
                                     WebSocketEventPublisher webSocketEventPublisher,
                                     OperatorAuditService operatorAuditService) {
        this.strategyConfigRepository = strategyConfigRepository;
        this.strategyConfigVersionRepository = strategyConfigVersionRepository;
        this.webSocketEventPublisher = webSocketEventPublisher;
        this.operatorAuditService = operatorAuditService;
    }

    @Transactional
    public List<StrategyDetailsResponse> listStrategies() {
        ensureDefaultStrategies();
        ensureVersionHistoryForExistingStrategies();

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

        ensureVersionHistoryForStrategy(strategy);

        if (StrategyConfig.StrategyStatus.RUNNING.equals(strategy.getStatus())) {
            strategy.setStatus(StrategyConfig.StrategyStatus.STOPPED);
            strategy.setStoppedAt(LocalDateTime.now());
        }

        String changeReason = buildChangeReason(strategy, request);

        strategy.setSymbol(request.symbol());
        strategy.setTimeframe(request.timeframe());
        strategy.setRiskPerTrade(request.riskPerTrade());
        strategy.setMinPositionSize(request.minPositionSize());
        strategy.setMaxPositionSize(request.maxPositionSize());

        StrategyConfig saved = strategyConfigRepository.save(strategy);
        recordVersion(saved, changeReason);

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
            changeReason
        );

        return mapToResponse(saved);
    }

    @Transactional
    public List<StrategyConfigHistoryResponse> getStrategyConfigHistory(Long strategyId) {
        StrategyConfig strategy = getById(strategyId);
        ensureVersionHistoryForStrategy(strategy);

        return strategyConfigVersionRepository.findByStrategyConfigIdOrderByVersionNumberDesc(strategyId).stream()
            .map(version -> new StrategyConfigHistoryResponse(
                version.getId(),
                version.getVersionNumber(),
                version.getChangeReason(),
                version.getSymbol(),
                version.getTimeframe(),
                version.getRiskPerTrade(),
                version.getMinPositionSize(),
                version.getMaxPositionSize(),
                version.getStatus(),
                version.getPaperMode(),
                version.getChangedAt()
            ))
            .toList();
    }

    private StrategyConfig getById(Long strategyId) {
        return strategyConfigRepository.findById(strategyId)
            .orElseThrow(() -> new EntityNotFoundException("Strategy not found: " + strategyId));
    }

    private StrategyDetailsResponse mapToResponse(StrategyConfig strategy) {
        StrategyConfigVersion latestVersion = strategyConfigVersionRepository
            .findFirstByStrategyConfigIdOrderByVersionNumberDesc(strategy.getId())
            .orElse(null);

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
            strategy.getPaperMode(),
            latestVersion == null ? 0 : latestVersion.getVersionNumber(),
            latestVersion == null ? null : latestVersion.getChangedAt()
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

        List<StrategyConfig> savedStrategies = strategyConfigRepository.saveAll(List.of(bollinger, bollingerEth));
        savedStrategies.forEach(strategy -> recordVersion(strategy, "Seeded default strategy configuration"));
    }

    private void ensureVersionHistoryForExistingStrategies() {
        strategyConfigRepository.findAll().forEach(this::ensureVersionHistoryForStrategy);
    }

    private void ensureVersionHistoryForStrategy(StrategyConfig strategy) {
        if (strategyConfigVersionRepository.countByStrategyConfigId(strategy.getId()) > 0) {
            return;
        }

        recordVersion(strategy, "Captured existing strategy configuration baseline");
    }

    private void recordVersion(StrategyConfig strategy, String changeReason) {
        int nextVersion = (int) strategyConfigVersionRepository.countByStrategyConfigId(strategy.getId()) + 1;
        strategyConfigVersionRepository.save(StrategyConfigVersion.fromStrategy(strategy, nextVersion, changeReason));
    }

    private String buildChangeReason(StrategyConfig strategy, UpdateStrategyConfigRequest request) {
        List<String> changedFields = new ArrayList<>();
        if (!strategy.getSymbol().equals(request.symbol())) {
            changedFields.add("symbol");
        }
        if (!strategy.getTimeframe().equals(request.timeframe())) {
            changedFields.add("timeframe");
        }
        if (strategy.getRiskPerTrade().compareTo(request.riskPerTrade()) != 0) {
            changedFields.add("riskPerTrade");
        }
        if (strategy.getMinPositionSize().compareTo(request.minPositionSize()) != 0) {
            changedFields.add("minPositionSize");
        }
        if (strategy.getMaxPositionSize().compareTo(request.maxPositionSize()) != 0) {
            changedFields.add("maxPositionSize");
        }
        if (changedFields.isEmpty()) {
            return "No parameter changes detected; configuration was re-saved.";
        }

        return "Updated " + String.join(", ", changedFields);
    }
}
