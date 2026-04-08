package com.algotrader.bot.backtest.infrastructure.persistence.repository;

import com.algotrader.bot.backtest.infrastructure.persistence.entity.BacktestDataset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BacktestDatasetRepository extends JpaRepository<BacktestDataset, Long> {
    List<BacktestDataset> findAllByReadyTrueOrderByUploadedAtDesc();
}
