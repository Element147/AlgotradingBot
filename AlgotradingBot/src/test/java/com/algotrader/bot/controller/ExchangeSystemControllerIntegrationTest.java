package com.algotrader.bot.controller;

import com.algotrader.bot.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ExchangeSystemControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String authToken;

    @BeforeEach
    void setUp() {
        authToken = jwtTokenProvider.generateToken("testuser", "ROLE_USER");
    }

    @Test
    void getExchangeConnectionStatus_returnsStatusPayload() throws Exception {
        mockMvc.perform(get("/api/exchange/connection-status")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.connected").isBoolean())
            .andExpect(jsonPath("$.exchange").value("binance"))
            .andExpect(jsonPath("$.lastSync").exists())
            .andExpect(jsonPath("$.rateLimitUsage").exists());
    }

    @Test
    void testConnection_withoutCredentials_returnsDisconnectedState() throws Exception {
        mockMvc.perform(post("/api/system/test-connection")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.connected").value(false))
            .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void getSystemInfo_returnsRuntimeStatus() throws Exception {
        mockMvc.perform(get("/api/system/info")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.applicationVersion").exists())
            .andExpect(jsonPath("$.lastDeploymentDate").exists())
            .andExpect(jsonPath("$.databaseStatus").value(anyOf(is("UP"), is("DOWN"), is("unavailable"))))
            .andExpect(jsonPath("$.kafkaStatus").exists());
    }

    @Test
    void triggerBackup_createsDatabaseBackupArtifact() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/system/backup")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.path").exists())
            .andExpect(jsonPath("$.size").exists())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String pathValue = responseBody.replaceAll(".*\"path\":\"([^\"]+)\".*", "$1").replace("\\\\", "\\");
        Path backupPath = Path.of(pathValue);

        org.junit.jupiter.api.Assertions.assertTrue(Files.exists(backupPath));
        String backupContent = Files.readString(backupPath);
        org.junit.jupiter.api.Assertions.assertFalse(backupContent.contains("Local metadata backup"));
        org.junit.jupiter.api.Assertions.assertTrue(
            backupContent.contains("CREATE")
                || backupContent.contains("INSERT")
                || backupContent.contains("SET DB_CLOSE_DELAY"),
            "Expected SQL backup content instead of placeholder metadata."
        );
    }

    @Test
    void listAuditEvents_returnsRecentEntries() throws Exception {
        mockMvc.perform(post("/api/system/backup")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/system/audit-events")
                .header("Authorization", "Bearer " + authToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.summary.visibleEventCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.events").isArray())
            .andExpect(jsonPath("$.events[0].action").exists())
            .andExpect(jsonPath("$.events[0].actor").exists());
    }

    @Test
    void listAuditEvents_supportsOutcomeFiltering() throws Exception {
        mockMvc.perform(post("/api/system/test-connection")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/system/audit-events")
                .header("Authorization", "Bearer " + authToken)
                .param("outcome", "FAILED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.events[0].outcome").value("FAILED"));
    }
}
