package com.algotrader.bot.risk.infrastructure.persistence;

import com.algotrader.bot.risk.infrastructure.persistence.RiskConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RiskConfigRepository extends JpaRepository<RiskConfig, Long> {
    Optional<RiskConfig> findFirstByOrderByIdAsc();
}
