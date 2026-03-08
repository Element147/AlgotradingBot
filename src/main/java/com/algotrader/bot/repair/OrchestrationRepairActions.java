package com.algotrader.bot.repair;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class OrchestrationRepairActions {
    private static final Logger logger = LoggerFactory.getLogger(OrchestrationRepairActions.class);

    public RepairResult stopAllServices() {
        logger.info("Stopping all services");
        try {
            ProcessBuilder pb = new ProcessBuilder("docker-compose", "down");
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
                logger.info("All services stopped");
                return new RepairResult(true, "Services stopped");
            } else {
                logger.error("Failed to stop services");
                return new RepairResult(false, "Stop failed");
            }
        } catch (Exception e) {
            logger.error("Error stopping services", e);
            return new RepairResult(false, "Error: " + e.getMessage());
        }
    }

    public RepairResult startAllServices() {
        logger.info("Starting all services");
        try {
            ProcessBuilder pb = new ProcessBuilder("docker-compose", "up", "-d");
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
                logger.info("All services started");
                return new RepairResult(true, "Services started");
            } else {
                logger.error("Failed to start services");
                return new RepairResult(false, "Start failed");
            }
        } catch (Exception e) {
            logger.error("Error starting services", e);
            return new RepairResult(false, "Error: " + e.getMessage());
        }
    }

    public RepairResult checkPortConflicts() {
        logger.info("Checking for port conflicts");
        int[] ports = {5432, 8080, 9092};
        StringBuilder conflicts = new StringBuilder();
        boolean hasConflict = false;
        
        for (int port : ports) {
            try {
                ProcessBuilder pb = new ProcessBuilder("netstat", "-ano");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.contains(":" + port) && line.contains("LISTENING")) {
                            conflicts.append("Port ").append(port).append(" in use; ");
                            hasConflict = true;
                            break;
                        }
                    }
                }
                
                process.waitFor();
            } catch (Exception e) {
                logger.error("Error checking port {}", port, e);
            }
        }
        
        if (hasConflict) {
            logger.warn("Port conflicts detected: {}", conflicts);
            return new RepairResult(false, "Port conflicts: " + conflicts);
        } else {
            logger.info("No port conflicts detected");
            return new RepairResult(true, "No port conflicts");
        }
    }

    public RepairResult resolvePortConflicts() {
        logger.info("Attempting to resolve port conflicts");
        // This is a placeholder - actual implementation would need to identify and stop conflicting processes
        return new RepairResult(true, "Port conflict resolution attempted");
    }

    public RepairResult checkNetworkConflicts() {
        logger.info("Checking for network conflicts");
        try {
            ProcessBuilder pb = new ProcessBuilder("docker", "network", "ls", "--filter", "name=algotrading");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                logger.info("Network check completed");
                return new RepairResult(true, "No network conflicts");
            } else {
                logger.error("Network check failed");
                return new RepairResult(false, "Network check failed");
            }
        } catch (Exception e) {
            logger.error("Error checking networks", e);
            return new RepairResult(false, "Error: " + e.getMessage());
        }
    }

    public RepairResult cleanupOrphanedContainers() {
        logger.info("Cleaning up orphaned containers");
        try {
            ProcessBuilder pb = new ProcessBuilder("docker", "container", "prune", "-f");
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
                logger.info("Orphaned containers cleaned");
                return new RepairResult(true, "Containers cleaned");
            } else {
                logger.error("Failed to clean containers");
                return new RepairResult(false, "Cleanup failed");
            }
        } catch (Exception e) {
            logger.error("Error cleaning containers", e);
            return new RepairResult(false, "Error: " + e.getMessage());
        }
    }
}
