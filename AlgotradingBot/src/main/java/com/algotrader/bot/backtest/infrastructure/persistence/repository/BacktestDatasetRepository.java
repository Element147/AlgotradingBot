package com.algotrader.bot.backtest.infrastructure.persistence;

import com.algotrader.bot.backtest.infrastructure.persistence.BacktestDataset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BacktestDatasetRepository extends JpaRepository<BacktestDataset, Long> {
    List<BacktestDataset> findAllByOrderByUploadedAtDesc();
}
