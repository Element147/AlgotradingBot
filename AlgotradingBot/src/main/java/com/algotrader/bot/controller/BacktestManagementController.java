package com.algotrader.bot.controller;

import com.algotrader.bot.service.BacktestManagementService;
import com.algotrader.bot.service.BacktestDatasetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/backtests")
public class BacktestManagementController {

    private final BacktestManagementService backtestManagementService;
    private final BacktestDatasetService backtestDatasetService;

    public BacktestManagementController(BacktestManagementService backtestManagementService,
                                        BacktestDatasetService backtestDatasetService) {
        this.backtestManagementService = backtestManagementService;
        this.backtestDatasetService = backtestDatasetService;
    }

    @GetMapping("/algorithms")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BacktestAlgorithmResponse>> algorithms() {
        return ResponseEntity.ok(backtestManagementService.getAlgorithms());
    }

    @GetMapping("/datasets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BacktestDatasetResponse>> datasets() {
        return ResponseEntity.ok(backtestDatasetService.listDatasets());
    }

    @PostMapping(value = "/datasets/upload", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestDatasetResponse> uploadDataset(@RequestParam(required = false) String name,
                                                                 @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(backtestDatasetService.uploadDataset(name, file));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BacktestHistoryItemResponse>> history(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(backtestManagementService.getHistory(limit));
    }

    @GetMapping("/{backtestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestDetailsResponse> details(@PathVariable Long backtestId) {
        return ResponseEntity.ok(backtestManagementService.getDetails(backtestId));
    }

    @PostMapping("/run")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestRunResponse> run(@Valid @RequestBody RunBacktestRequest request) {
        return ResponseEntity.ok(backtestManagementService.runBacktest(request));
    }
}
