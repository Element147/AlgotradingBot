package com.algotrader.bot.repair;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class RepairWorkspaceSupport {

    private static final List<Integer> MANAGED_PORTS = List.of(5432, 8080, 5173, 9092);

    private final Path repoRoot;
    private final Path backendDir;
    private final Path composeFile;
    private final Path pidDirectory;

    private RepairWorkspaceSupport(Path repoRoot) {
        this.repoRoot = repoRoot;
        this.backendDir = repoRoot.resolve("AlgotradingBot");
        this.composeFile = backendDir.resolve("compose.yaml");
        this.pidDirectory = repoRoot.resolve(".pids");
    }

    static RepairWorkspaceSupport detect() {
        Path current = Paths.get("").toAbsolutePath().normalize();
        Path cursor = current;
        while (cursor != null) {
            if (Files.exists(cursor.resolve("run.ps1")) && Files.exists(cursor.resolve("AlgotradingBot").resolve("compose.yaml"))) {
                return new RepairWorkspaceSupport(cursor);
            }
            cursor = cursor.getParent();
        }

        throw new IllegalStateException("Unable to locate repository root for repair automation from " + current);
    }

    Path repoRoot() {
        return repoRoot;
    }

    Path backendDir() {
        return backendDir;
    }

    Path pidFile(String name) {
        return pidDirectory.resolve(name + ".pid");
    }

    List<String> scriptCommand(String scriptName) {
        return List.of(
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            repoRoot.resolve(scriptName).toString()
        );
    }

    List<String> dockerComposeCommand(String... args) {
        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("compose");
        command.add("-f");
        command.add(composeFile.toString());
        command.addAll(List.of(args));
        return command;
    }

    List<String> dockerCommand(String... args) {
        List<String> command = new ArrayList<>();
        command.add("docker");
        command.addAll(List.of(args));
        return command;
    }

    List<Integer> managedPorts() {
        return MANAGED_PORTS;
    }

    String containerNameFor(String serviceName) {
        return switch (serviceName) {
            case "postgres" -> "algotrading-postgres";
            case "kafka" -> "algotrading-kafka";
            case "algotrading-app", "app", "backend" -> "algotrading-app";
            default -> "algotrading-" + serviceName;
        };
    }

    Map<Integer, String> findListeningProcesses(List<Integer> ports) {
        Map<Integer, String> conflicts = new LinkedHashMap<>();
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("cmd", "/c", "netstat -ano -p tcp");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            List<String> lines = new ArrayList<>();
            try (var reader = process.inputReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    lines.add(line);
                }
            }
            process.waitFor();

            for (Integer port : ports) {
                String portToken = ":" + port;
                for (String line : lines) {
                    if (line.contains(portToken) && line.contains("LISTENING")) {
                        String[] tokens = line.trim().split("\\s+");
                        if (tokens.length >= 5) {
                            conflicts.put(port, "pid=" + tokens[tokens.length - 1]);
                        } else {
                            conflicts.put(port, "in-use");
                        }
                        break;
                    }
                }
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to inspect listening ports: " + ex.getMessage(), ex);
        }

        return conflicts;
    }

    void stopPidIfPresent(Path pidFile) throws IOException, InterruptedException {
        if (!Files.exists(pidFile)) {
            return;
        }

        String pidValue = Files.readString(pidFile).trim();
        if (pidValue.isBlank()) {
            return;
        }

        Process process = new ProcessBuilder("cmd", "/c", "taskkill /PID " + pidValue + " /F")
            .redirectErrorStream(true)
            .start();
        process.waitFor();
    }
}
