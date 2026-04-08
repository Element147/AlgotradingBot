package com.algotrader.bot.strategy.infrastructure.persistence;

import com.algotrader.bot.strategy.infrastructure.persistence.StrategyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StrategyConfigRepository extends JpaRepository<StrategyConfig, Long> {
    List<StrategyConfig> findAllByOrderByNameAsc();
}
