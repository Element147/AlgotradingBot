package com.algotrader.bot.controller;

import com.algotrader.bot.service.BacktestManagementService;
import com.algotrader.bot.service.BacktestDatasetService;
import com.algotrader.bot.entity.BacktestDataset;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @GetMapping("/datasets/retention-report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestDatasetRetentionReportResponse> retentionReport() {
        return ResponseEntity.ok(backtestDatasetService.getRetentionReport());
    }

    @PostMapping(value = "/datasets/upload", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestDatasetResponse> uploadDataset(@RequestParam(required = false) String name,
                                                                 @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(backtestDatasetService.uploadDataset(name, file));
    }

    @PostMapping("/datasets/{datasetId}/archive")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestDatasetResponse> archiveDataset(
        @PathVariable Long datasetId,
        @RequestBody(required = false) BacktestDatasetArchiveRequest request
    ) {
        return ResponseEntity.ok(backtestDatasetService.archiveDataset(datasetId, request));
    }

    @PostMapping("/datasets/{datasetId}/restore")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestDatasetResponse> restoreDataset(@PathVariable Long datasetId) {
        return ResponseEntity.ok(backtestDatasetService.restoreDataset(datasetId));
    }

    @GetMapping("/datasets/{datasetId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadDataset(@PathVariable Long datasetId) {
        BacktestDataset dataset = backtestDatasetService.getDataset(datasetId);
        String safeFilename = dataset.getOriginalFilename().replace("\"", "");

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFilename + "\"")
            .header("X-Dataset-Checksum-Sha256", dataset.getChecksumSha256())
            .header("X-Dataset-Schema-Version", dataset.getSchemaVersion())
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(dataset.getCsvData());
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BacktestHistoryItemResponse>> history(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(backtestManagementService.getHistory(limit));
    }

    @GetMapping("/experiments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BacktestExperimentSummaryResponse>> experiments() {
        return ResponseEntity.ok(backtestManagementService.getExperimentSummaries());
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

    @PostMapping("/{backtestId}/replay")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestRunResponse> replay(@PathVariable Long backtestId) {
        return ResponseEntity.ok(backtestManagementService.replayBacktest(backtestId));
    }

    @GetMapping("/compare")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BacktestComparisonResponse> compare(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(backtestManagementService.compareBacktests(ids));
    }
}
