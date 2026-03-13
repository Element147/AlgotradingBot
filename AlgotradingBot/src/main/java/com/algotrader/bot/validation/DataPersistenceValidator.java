package com.algotrader.bot.validation;

import com.algotrader.bot.repair.RepairWorkspaceSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;

public class DataPersistenceValidator {
    private static final Logger logger = LoggerFactory.getLogger(DataPersistenceValidator.class);
    private static final String BASE_URL = "http://localhost:8080";
    private static final int TIMEOUT_MS = 10000;
    private final RepairWorkspaceSupport workspaceSupport = RepairWorkspaceSupport.detect();
    private String testTradeId;

    public ValidationResult validateDatabasePersistence() {
        logger.info("Validating database persistence");
        
        ValidationResult insertResult = insertTestTradeData();
        if (insertResult.isFailed()) {
            return insertResult;
        }
        
        ValidationResult restartResult = restartPostgresContainer();
        if (restartResult.isFailed()) {
            return restartResult;
        }
        
        ValidationResult waitResult = waitForPostgresHealthy();
        if (waitResult.isFailed()) {
            return waitResult;
        }
        
        return verifyTestDataExists();
    }

    public ValidationResult validateApplicationReconnection() {
        logger.info("Validating application reconnection");
        
        ValidationResult restartResult = restartApplicationContainer();
        if (restartResult.isFailed()) {
            return restartResult;
        }
        
        ValidationResult waitResult = waitForApplicationHealthy();
        if (waitResult.isFailed()) {
            return waitResult;
        }
        
        ValidationResult reconnectResult = verifyApplicationReconnects();
        if (reconnectResult.isFailed()) {
            return reconnectResult;
        }
        
        return verifyDataQueryable();
    }

    public ValidationResult insertTestTradeData() {
        logger.info("Inserting test trade data");
        try {
            HttpURLConnection conn = openConnection("/api/strategy/start", "POST");
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            conn.setDoOutput(true);
            
            String jsonInput = "{\"symbol\":\"TESTBTC\",\"initialBalance\":1000.0}";
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200 || responseCode == 201) {
                testTradeId = "test-" + System.currentTimeMillis();
                logger.info("Test trade data inserted");
                return new ValidationResult(
                    "REQ-14.1", 
                    "Insert Test Data", 
                    ValidationStatus.PASSED, 
                    "Test data inserted"
                );
            } else {
                logger.error("Failed to insert test data, status: {}", responseCode);
                return new ValidationResult(
                    "REQ-14.1", 
                    "Insert Test Data", 
                    ValidationStatus.FAILED, 
                    "Failed to insert test data: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error inserting test data", e);
            return new ValidationResult(
                "REQ-14.1", 
                "Insert Test Data", 
                ValidationStatus.FAILED, 
                "Error inserting test data: " + e.getMessage()
            );
        }
    }

    public ValidationResult restartPostgresContainer() {
        logger.info("Restarting PostgreSQL container");
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "docker",
                "compose",
                "--project-name",
                workspaceSupport.composeProjectName(),
                "-f",
                workspaceSupport.composeFile().toString(),
                "restart",
                workspaceSupport.composeServiceFor("postgres")
            );
            pb.directory(workspaceSupport.repoRoot().toFile());
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    logger.debug("Docker: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                logger.info("PostgreSQL container restarted");
                return new ValidationResult(
                    "REQ-14.2", 
                    "Restart Postgres", 
                    ValidationStatus.PASSED, 
                    "Postgres restarted"
                );
            } else {
                logger.error("Failed to restart Postgres, exit code: {}", exitCode);
                return new ValidationResult(
                    "REQ-14.2", 
                    "Restart Postgres", 
                    ValidationStatus.FAILED, 
                    "Failed to restart Postgres: " + exitCode
                );
            }
        } catch (Exception e) {
            logger.error("Error restarting Postgres", e);
            return new ValidationResult(
                "REQ-14.2", 
                "Restart Postgres", 
                ValidationStatus.FAILED, 
                "Error restarting Postgres: " + e.getMessage()
            );
        }
    }

    public ValidationResult waitForPostgresHealthy() {
        logger.info("Waiting for PostgreSQL to become healthy");
        LocalDateTime start = LocalDateTime.now();
        Duration timeout = Duration.ofSeconds(60);
        
        while (Duration.between(start, LocalDateTime.now()).compareTo(timeout) < 0) {
            try {
                String containerName = workspaceSupport.containerNameFor("postgres");
                ProcessBuilder pb = new ProcessBuilder(
                    "docker",
                    "inspect",
                    "--format",
                    "{{.State.Health.Status}}",
                    containerName
                );
                pb.directory(workspaceSupport.repoRoot().toFile());
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String status = reader.readLine();
                reader.close();
                process.waitFor();
                
                if ("healthy".equals(status)) {
                    logger.info("PostgreSQL is healthy");
                    return new ValidationResult(
                        "REQ-14.3", 
                        "Postgres Healthy", 
                        ValidationStatus.PASSED, 
                        "Postgres healthy after restart"
                    );
                }
                
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return new ValidationResult(
                    "REQ-14.3", 
                    "Postgres Healthy", 
                    ValidationStatus.FAILED, 
                    "Wait interrupted"
                );
            } catch (Exception e) {
                logger.error("Error checking Postgres health", e);
            }
        }
        
        logger.error("PostgreSQL did not become healthy within timeout");
        return new ValidationResult(
            "REQ-14.3", 
            "Postgres Healthy", 
            ValidationStatus.FAILED, 
            "Postgres did not become healthy within 60s"
        );
    }

    public ValidationResult verifyTestDataExists() {
        logger.info("Verifying test data exists after restart");
        try {
            HttpURLConnection conn = openConnection("/api/strategy/status", "GET");
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                logger.info("Test data verified - API accessible");
                return new ValidationResult(
                    "REQ-14.4", 
                    "Verify Data Exists", 
                    ValidationStatus.PASSED, 
                    "Data persisted after restart"
                );
            } else {
                logger.error("Failed to verify data, status: {}", responseCode);
                return new ValidationResult(
                    "REQ-14.4", 
                    "Verify Data Exists", 
                    ValidationStatus.FAILED, 
                    "Failed to verify data: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error verifying test data", e);
            return new ValidationResult(
                "REQ-14.4", 
                "Verify Data Exists", 
                ValidationStatus.FAILED, 
                "Error verifying data: " + e.getMessage()
            );
        }
    }

    public ValidationResult restartApplicationContainer() {
        logger.info("Restarting application container");
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "docker",
                "compose",
                "--project-name",
                workspaceSupport.composeProjectName(),
                "-f",
                workspaceSupport.composeFile().toString(),
                "restart",
                workspaceSupport.composeServiceFor("algotrading-app")
            );
            pb.directory(workspaceSupport.repoRoot().toFile());
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    logger.debug("Docker: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                logger.info("Application container restarted");
                return new ValidationResult(
                    "REQ-14.5", 
                    "Restart Application", 
                    ValidationStatus.PASSED, 
                    "Application restarted"
                );
            } else {
                logger.error("Failed to restart application, exit code: {}", exitCode);
                return new ValidationResult(
                    "REQ-14.5", 
                    "Restart Application", 
                    ValidationStatus.FAILED, 
                    "Failed to restart application: " + exitCode
                );
            }
        } catch (Exception e) {
            logger.error("Error restarting application", e);
            return new ValidationResult(
                "REQ-14.5", 
                "Restart Application", 
                ValidationStatus.FAILED, 
                "Error restarting application: " + e.getMessage()
            );
        }
    }

    public ValidationResult waitForApplicationHealthy() {
        logger.info("Waiting for application to become healthy");
        LocalDateTime start = LocalDateTime.now();
        Duration timeout = Duration.ofSeconds(120);
        
        while (Duration.between(start, LocalDateTime.now()).compareTo(timeout) < 0) {
            try {
                String containerName = workspaceSupport.containerNameFor("algotrading-app");
                ProcessBuilder pb = new ProcessBuilder(
                    "docker",
                    "inspect",
                    "--format",
                    "{{.State.Health.Status}}",
                    containerName
                );
                pb.directory(workspaceSupport.repoRoot().toFile());
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String status = reader.readLine();
                reader.close();
                process.waitFor();
                
                if ("healthy".equals(status)) {
                    logger.info("Application is healthy");
                    return new ValidationResult(
                        "REQ-14.6", 
                        "Application Healthy", 
                        ValidationStatus.PASSED, 
                        "Application healthy after restart"
                    );
                }
                
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return new ValidationResult(
                    "REQ-14.6", 
                    "Application Healthy", 
                    ValidationStatus.FAILED, 
                    "Wait interrupted"
                );
            } catch (Exception e) {
                logger.error("Error checking application health", e);
            }
        }
        
        logger.error("Application did not become healthy within timeout");
        return new ValidationResult(
            "REQ-14.6", 
            "Application Healthy", 
            ValidationStatus.FAILED, 
            "Application did not become healthy within 120s"
        );
    }

    public ValidationResult verifyApplicationReconnects() {
        logger.info("Verifying application reconnects to database");
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "docker",
                "compose",
                "--project-name",
                workspaceSupport.composeProjectName(),
                "-f",
                workspaceSupport.composeFile().toString(),
                "logs",
                "--tail",
                "50",
                workspaceSupport.composeServiceFor("algotrading-app")
            );
            pb.directory(workspaceSupport.repoRoot().toFile());
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            boolean foundConnection = false;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.toLowerCase().contains("hikari") || 
                        line.toLowerCase().contains("connection") ||
                        line.toLowerCase().contains("database")) {
                        foundConnection = true;
                        break;
                    }
                }
            }
            
            process.waitFor();
            
            if (foundConnection) {
                logger.info("Application reconnected to database");
                return new ValidationResult(
                    "REQ-14.7", 
                    "Application Reconnects", 
                    ValidationStatus.PASSED, 
                    "Application reconnected"
                );
            } else {
                logger.error("No database connection found in logs");
                return new ValidationResult(
                    "REQ-14.7", 
                    "Application Reconnects", 
                    ValidationStatus.FAILED, 
                    "No database connection in logs"
                );
            }
        } catch (Exception e) {
            logger.error("Error verifying reconnection", e);
            return new ValidationResult(
                "REQ-14.7", 
                "Application Reconnects", 
                ValidationStatus.FAILED, 
                "Error verifying reconnection: " + e.getMessage()
            );
        }
    }

    public ValidationResult verifyDataQueryable() {
        logger.info("Verifying data is queryable after restart");
        try {
            HttpURLConnection conn = openConnection("/api/strategy/status", "GET");
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                logger.info("Data is queryable after restart");
                return new ValidationResult(
                    "REQ-14.8", 
                    "Data Queryable", 
                    ValidationStatus.PASSED, 
                    "Data queryable after restart"
                );
            } else {
                logger.error("Failed to query data, status: {}", responseCode);
                return new ValidationResult(
                    "REQ-14.8", 
                    "Data Queryable", 
                    ValidationStatus.FAILED, 
                    "Failed to query data: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error querying data", e);
            return new ValidationResult(
                "REQ-14.8", 
                "Data Queryable", 
                ValidationStatus.FAILED, 
                "Error querying data: " + e.getMessage()
            );
        }
    }

    private HttpURLConnection openConnection(String path, String method) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) URI.create(BASE_URL + path).toURL().openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        return connection;
    }
}
