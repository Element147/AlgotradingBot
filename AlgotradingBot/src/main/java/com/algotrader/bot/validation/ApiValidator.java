package com.algotrader.bot.validation;

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

public class ApiValidator {
    private static final Logger logger = LoggerFactory.getLogger(ApiValidator.class);
    private static final String BASE_URL = "http://localhost:8080";
    private static final int TIMEOUT_MS = 10000;

    public ValidationResult validateHealthEndpoint() {
        logger.info("Validating health endpoint");
        try {
            HttpURLConnection conn = openConnection("/actuator/health", "GET");
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                in.close();
                
                return validateHealthResponse(response.toString());
            } else {
                logger.error("Health endpoint returned status: {}", responseCode);
                return new ValidationResult(
                    "REQ-9.1", 
                    "Health Endpoint", 
                    ValidationStatus.FAILED, 
                    "Health endpoint returned status: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error calling health endpoint", e);
            return new ValidationResult(
                "REQ-9.1", 
                "Health Endpoint", 
                ValidationStatus.FAILED, 
                "Error calling health endpoint: " + e.getMessage()
            );
        }
    }

    public ValidationResult validateHealthResponse(String response) {
        logger.info("Validating health response");
        if (response.contains("\"status\":\"UP\"") || response.contains("\"status\": \"UP\"")) {
            logger.info("Health response contains status: UP");
            return new ValidationResult(
                "REQ-9.2", 
                "Health Response", 
                ValidationStatus.PASSED, 
                "Health status is UP"
            );
        } else {
            logger.error("Health response does not contain status: UP");
            return new ValidationResult(
                "REQ-9.2", 
                "Health Response", 
                ValidationStatus.FAILED, 
                "Health status is not UP"
            );
        }
    }

    public ValidationResult validateStrategyStatus() {
        logger.info("Validating strategy status endpoint");
        try {
            HttpURLConnection conn = openConnection("/api/strategy/status", "GET");
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                in.close();
                
                // Validate JSON
                String responseStr = response.toString();
                if (responseStr.startsWith("{") && responseStr.endsWith("}")) {
                    logger.info("Strategy status endpoint returned valid JSON");
                    return new ValidationResult(
                        "REQ-9.3", 
                        "Strategy Status", 
                        ValidationStatus.PASSED, 
                        "Strategy status endpoint working"
                    );
                } else {
                    logger.error("Strategy status response is not valid JSON");
                    return new ValidationResult(
                        "REQ-9.3", 
                        "Strategy Status", 
                        ValidationStatus.FAILED, 
                        "Response is not valid JSON"
                    );
                }
            } else {
                logger.error("Strategy status endpoint returned status: {}", responseCode);
                return new ValidationResult(
                    "REQ-9.3", 
                    "Strategy Status", 
                    ValidationStatus.FAILED, 
                    "Strategy status returned status: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error calling strategy status endpoint", e);
            return new ValidationResult(
                "REQ-9.3", 
                "Strategy Status", 
                ValidationStatus.FAILED, 
                "Error calling strategy status: " + e.getMessage()
            );
        }
    }

    public ValidationResult validateStrategyLifecycle() {
        logger.info("Validating strategy lifecycle (start/stop)");
        
        // Test start
        ValidationResult startResult = validateStrategyStart();
        if (startResult.isFailed()) {
            return startResult;
        }
        
        // Wait a bit
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Test stop
        return validateStrategyStop();
    }

    public ValidationResult validateStrategyStart() {
        logger.info("Validating strategy start");
        try {
            HttpURLConnection conn = openConnection("/api/strategy/start", "POST");
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            conn.setDoOutput(true);
            
            String jsonInput = "{\"symbol\":\"BTCUSDT\",\"initialBalance\":100.0}";
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200 || responseCode == 201) {
                logger.info("Strategy start successful");
                return new ValidationResult(
                    "REQ-9.5", 
                    "Strategy Start", 
                    ValidationStatus.PASSED, 
                    "Strategy started successfully"
                );
            } else {
                logger.error("Strategy start returned status: {}", responseCode);
                return new ValidationResult(
                    "REQ-9.5", 
                    "Strategy Start", 
                    ValidationStatus.FAILED, 
                    "Strategy start returned status: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error starting strategy", e);
            return new ValidationResult(
                "REQ-9.5", 
                "Strategy Start", 
                ValidationStatus.FAILED, 
                "Error starting strategy: " + e.getMessage()
            );
        }
    }

    public ValidationResult validateStrategyStop() {
        logger.info("Validating strategy stop");
        try {
            HttpURLConnection conn = openConnection("/api/strategy/stop", "POST");
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == 200) {
                logger.info("Strategy stop successful");
                return new ValidationResult(
                    "REQ-9.7", 
                    "Strategy Stop", 
                    ValidationStatus.PASSED, 
                    "Strategy stopped successfully"
                );
            } else {
                logger.error("Strategy stop returned status: {}", responseCode);
                return new ValidationResult(
                    "REQ-9.7", 
                    "Strategy Stop", 
                    ValidationStatus.FAILED, 
                    "Strategy stop returned status: " + responseCode
                );
            }
        } catch (Exception e) {
            logger.error("Error stopping strategy", e);
            return new ValidationResult(
                "REQ-9.7", 
                "Strategy Stop", 
                ValidationStatus.FAILED, 
                "Error stopping strategy: " + e.getMessage()
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
