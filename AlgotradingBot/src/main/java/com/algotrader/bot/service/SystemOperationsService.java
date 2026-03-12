package com.algotrader.bot.service;

import com.algotrader.bot.controller.BackupResponse;
import com.algotrader.bot.controller.SystemInfoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.BuildProperties;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class SystemOperationsService {

    private static final Logger logger = LoggerFactory.getLogger(SystemOperationsService.class);
    private static final DateTimeFormatter BACKUP_FILE_TS = DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss");

    private final DataSource dataSource;
    private final BuildProperties buildProperties;
    private final String kafkaBootstrapServers;
    private final Path backupDirectory;
    private final OperatorAuditService operatorAuditService;
    private final LocalDateTime appStartTime = LocalDateTime.now();

    public SystemOperationsService(
        Optional<DataSource> dataSource,
        Optional<BuildProperties> buildProperties,
        @Value("${spring.kafka.bootstrap-servers:}") String kafkaBootstrapServers,
        @Value("${algotrading.system.backup-dir:backups}") String backupDirectory,
        OperatorAuditService operatorAuditService
    ) {
        this.dataSource = dataSource.orElse(null);
        this.buildProperties = buildProperties.orElse(null);
        this.kafkaBootstrapServers = kafkaBootstrapServers;
        this.backupDirectory = Paths.get(backupDirectory);
        this.operatorAuditService = operatorAuditService;
    }

    public SystemInfoResponse getSystemInfo() {
        String version = buildProperties != null ? buildProperties.getVersion() : "local-dev";
        String deploymentDate = buildProperties != null && buildProperties.getTime() != null
            ? buildProperties.getTime().atOffset(ZoneOffset.UTC).toString()
            : appStartTime.toString();

        return new SystemInfoResponse(
            version,
            deploymentDate,
            getDatabaseStatus(),
            getKafkaStatus()
        );
    }

    public BackupResponse triggerBackup() {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(BACKUP_FILE_TS);
        Path backupFile = backupDirectory.resolve("backup_" + timestamp + ".sql");

        try {
            Files.createDirectories(backupDirectory);
            String content = "-- Local metadata backup\n"
                + "-- generatedAt=" + OffsetDateTime.now(ZoneOffset.UTC) + "\n"
                + "-- note=Use pg_dump for full PostgreSQL logical backup in runtime environments.\n";
            Files.writeString(backupFile, content, StandardCharsets.UTF_8);
            long sizeBytes = Files.size(backupFile);
            operatorAuditService.recordSuccess(
                "SYSTEM_BACKUP_TRIGGERED",
                "test",
                "SYSTEM_BACKUP",
                backupFile.toAbsolutePath().toString(),
                "sizeBytes=" + sizeBytes
            );
            return new BackupResponse(backupFile.toAbsolutePath().toString(), sizeBytes + " bytes");
        } catch (IOException ex) {
            logger.error("Failed to create backup file", ex);
            operatorAuditService.recordFailure(
                "SYSTEM_BACKUP_TRIGGERED",
                "test",
                "SYSTEM_BACKUP",
                null,
                ex.getMessage()
            );
            throw new IllegalStateException("Unable to create backup file", ex);
        }
    }

    private String getDatabaseStatus() {
        if (dataSource == null) {
            return "unavailable";
        }
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2) ? "UP" : "DOWN";
        } catch (SQLException ex) {
            logger.warn("Database connectivity check failed: {}", ex.getMessage());
            return "DOWN";
        }
    }

    private String getKafkaStatus() {
        if (kafkaBootstrapServers == null || kafkaBootstrapServers.isBlank()) {
            return "not-configured";
        }

        String firstServer = kafkaBootstrapServers.split(",")[0].trim();
        String[] hostPort = firstServer.split(":");
        if (hostPort.length != 2) {
            return "configured";
        }

        String host = hostPort[0];
        int port;
        try {
            port = Integer.parseInt(hostPort[1]);
        } catch (NumberFormatException ex) {
            return "configured";
        }

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 750);
            return "UP";
        } catch (IOException ex) {
            return "DOWN (optional in local mode)";
        }
    }
}
