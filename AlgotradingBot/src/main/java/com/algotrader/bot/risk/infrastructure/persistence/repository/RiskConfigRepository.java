package com.algotrader.bot.risk.infrastructure.persistence.repository;

import com.algotrader.bot.risk.infrastructure.persistence.entity.RiskConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RiskConfigRepository extends JpaRepository<RiskConfig, Long> {
    Optional<RiskConfig> findFirstByOrderByIdAsc();
}
