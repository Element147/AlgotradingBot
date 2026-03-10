package com.algotrader.bot.repository;

import com.algotrader.bot.entity.BacktestDataset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BacktestDatasetRepository extends JpaRepository<BacktestDataset, Long> {
}
