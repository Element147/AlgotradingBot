package com.algotrader.bot.repository;

import com.algotrader.bot.entity.RiskConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskConfigRepository extends JpaRepository<RiskConfig, Long> {
}
