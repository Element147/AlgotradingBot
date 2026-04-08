package com.algotrader.bot.strategy.infrastructure.persistence.repository;

import com.algotrader.bot.strategy.infrastructure.persistence.entity.StrategyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StrategyConfigRepository extends JpaRepository<StrategyConfig, Long> {
    List<StrategyConfig> findAllByOrderByNameAsc();
}
