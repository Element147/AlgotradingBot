package com.algotrader.bot.controller;

import com.algotrader.bot.entity.StrategyConfig;
import com.algotrader.bot.repository.StrategyConfigRepository;
import com.algotrader.bot.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StrategyManagementControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StrategyConfigRepository strategyConfigRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String authToken;
    private Long strategyId;

    @BeforeEach
    void setUp() {
        authToken = jwtTokenProvider.generateToken("testuser", "ROLE_USER");
        strategyConfigRepository.deleteAll();

        StrategyConfig strategy = new StrategyConfig(
            "Test Strategy",
            "bollinger-bands",
            "BTC/USDT",
            "1h",
            new BigDecimal("0.02"),
            new BigDecimal("10.00"),
            new BigDecimal("100.00")
        );
        strategyId = strategyConfigRepository.save(strategy).getId();
    }

    @Test
    void listStrategies_returnsStrategies() throws Exception {
        mockMvc.perform(get("/api/strategies")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
            .andExpect(jsonPath("$[0].name").exists())
            .andExpect(jsonPath("$[0].status").exists());
    }

    @Test
    void startStrategy_updatesStatus() throws Exception {
        mockMvc.perform(post("/api/strategies/{strategyId}/start", strategyId)
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.strategyId").value(strategyId))
            .andExpect(jsonPath("$.status").value("RUNNING"));
    }

    @Test
    void stopStrategy_updatesStatus() throws Exception {
        mockMvc.perform(post("/api/strategies/{strategyId}/stop", strategyId)
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.strategyId").value(strategyId))
            .andExpect(jsonPath("$.status").value("STOPPED"));
    }

    @Test
    void updateConfig_validatesRangeAndUpdates() throws Exception {
        UpdateStrategyConfigRequest request = new UpdateStrategyConfigRequest();
        request.setSymbol("ETH/USDT");
        request.setTimeframe("4h");
        request.setRiskPerTrade(new BigDecimal("0.03"));
        request.setMinPositionSize(new BigDecimal("20.00"));
        request.setMaxPositionSize(new BigDecimal("120.00"));

        mockMvc.perform(put("/api/strategies/{strategyId}/config", strategyId)
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.symbol").value("ETH/USDT"))
            .andExpect(jsonPath("$.timeframe").value("4h"))
            .andExpect(jsonPath("$.riskPerTrade").value(0.03));
    }

    @Test
    void updateConfig_rejectsInvalidRisk() throws Exception {
        UpdateStrategyConfigRequest request = new UpdateStrategyConfigRequest();
        request.setSymbol("ETH/USDT");
        request.setTimeframe("4h");
        request.setRiskPerTrade(new BigDecimal("0.10"));
        request.setMinPositionSize(new BigDecimal("20.00"));
        request.setMaxPositionSize(new BigDecimal("120.00"));

        mockMvc.perform(put("/api/strategies/{strategyId}/config", strategyId)
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
