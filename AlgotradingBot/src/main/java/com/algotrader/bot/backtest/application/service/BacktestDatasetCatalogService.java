package com.algotrader.bot.backtest.application.service;

import com.algotrader.bot.backtest.api.request.BacktestDatasetArchiveRequest;
import com.algotrader.bot.backtest.api.response.BacktestDatasetResponse;
import com.algotrader.bot.backtest.api.response.BacktestDatasetRetentionReportResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BacktestDatasetCatalogService {

    private final BacktestDatasetLifecycleService backtestDatasetLifecycleService;

    public BacktestDatasetCatalogService(BacktestDatasetLifecycleService backtestDatasetLifecycleService) {
        this.backtestDatasetLifecycleService = backtestDatasetLifecycleService;
    }

    @Transactional(readOnly = true)
    public List<BacktestDatasetResponse> listDatasets() {
        return backtestDatasetLifecycleService.listDatasets();
    }

    @Transactional(readOnly = true)
    public BacktestDatasetRetentionReportResponse getRetentionReport() {
        return backtestDatasetLifecycleService.getRetentionReport();
    }

    @Transactional
    public BacktestDatasetResponse archiveDataset(Long datasetId, BacktestDatasetArchiveRequest request) {
        return backtestDatasetLifecycleService.archiveDataset(datasetId, request);
    }

    @Transactional
    public BacktestDatasetResponse restoreDataset(Long datasetId) {
        return backtestDatasetLifecycleService.restoreDataset(datasetId);
    }
}
