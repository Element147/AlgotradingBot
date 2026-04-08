package com.algotrader.bot.strategy.infrastructure.persistence.repository;

import com.algotrader.bot.strategy.infrastructure.persistence.entity.StrategyConfigVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StrategyConfigVersionRepository extends JpaRepository<StrategyConfigVersion, Long> {
    List<StrategyConfigVersion> findByStrategyConfigIdOrderByVersionNumberDesc(Long strategyConfigId);

    long countByStrategyConfigId(Long strategyConfigId);

    Optional<StrategyConfigVersion> findFirstByStrategyConfigIdOrderByVersionNumberDesc(Long strategyConfigId);
}
