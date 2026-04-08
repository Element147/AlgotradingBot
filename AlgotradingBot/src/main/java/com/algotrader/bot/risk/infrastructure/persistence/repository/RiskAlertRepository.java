package com.algotrader.bot.risk.infrastructure.persistence.repository;

import com.algotrader.bot.risk.infrastructure.persistence.entity.RiskAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {
    List<RiskAlert> findTop50ByOrderByTimestampDesc();
}
