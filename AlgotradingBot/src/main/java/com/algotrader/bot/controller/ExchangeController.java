package com.algotrader.bot.controller;

import com.algotrader.bot.service.ExchangeIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exchange")
@Tag(name = "Exchange", description = "Exchange integration and status")
@SecurityRequirement(name = "bearer-jwt")
public class ExchangeController {

    private final ExchangeIntegrationService exchangeIntegrationService;

    public ExchangeController(ExchangeIntegrationService exchangeIntegrationService) {
        this.exchangeIntegrationService = exchangeIntegrationService;
    }

    @GetMapping("/connection-status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get exchange connection status")
    public ResponseEntity<ExchangeConnectionStatusResponse> getConnectionStatus() {
        return ResponseEntity.ok(exchangeIntegrationService.getConnectionStatus());
    }
}
