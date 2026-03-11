package com.algotrader.bot.service;

import com.algotrader.bot.controller.OperatorAuditEventResponse;
import com.algotrader.bot.entity.OperatorAuditEvent;
import com.algotrader.bot.repository.OperatorAuditEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class OperatorAuditService {

    private static final Logger logger = LoggerFactory.getLogger(OperatorAuditService.class);
    private static final int DEFAULT_LIMIT = 100;
    private static final int MAX_LIMIT = 500;
    private static final int MAX_DETAILS_LENGTH = 2000;

    private final OperatorAuditEventRepository operatorAuditEventRepository;

    public OperatorAuditService(OperatorAuditEventRepository operatorAuditEventRepository) {
        this.operatorAuditEventRepository = operatorAuditEventRepository;
    }

    @Transactional
    public void recordSuccess(
        String action,
        String environment,
        String targetType,
        String targetId,
        String details
    ) {
        persistEvent(action, environment, targetType, targetId, "SUCCESS", details);
    }

    @Transactional
    public void recordFailure(
        String action,
        String environment,
        String targetType,
        String targetId,
        String details
    ) {
        persistEvent(action, environment, targetType, targetId, "FAILED", details);
    }

    @Transactional(readOnly = true)
    public List<OperatorAuditEventResponse> listEvents(int requestedLimit) {
        int limit = sanitizeLimit(requestedLimit);
        return operatorAuditEventRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)).stream()
            .map(event -> new OperatorAuditEventResponse(
                event.getId(),
                event.getActor(),
                event.getAction(),
                event.getEnvironment(),
                event.getTargetType(),
                event.getTargetId(),
                event.getOutcome(),
                event.getDetails(),
                event.getCreatedAt()
            ))
            .toList();
    }

    private void persistEvent(
        String action,
        String environment,
        String targetType,
        String targetId,
        String outcome,
        String details
    ) {
        try {
            OperatorAuditEvent event = new OperatorAuditEvent();
            event.setActor(resolveActor());
            event.setAction(normalize(action, "UNKNOWN_ACTION"));
            event.setEnvironment(normalizeEnvironment(environment));
            event.setTargetType(normalize(targetType, "UNKNOWN_TARGET"));
            event.setTargetId(trimToNull(targetId));
            event.setOutcome(normalize(outcome, "UNKNOWN"));
            event.setDetails(trimToMax(details, MAX_DETAILS_LENGTH));

            operatorAuditEventRepository.save(event);
        } catch (Exception exception) {
            logger.warn("Unable to persist operator audit event for action {}", action, exception);
        }
    }

    private String resolveActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return "system";
        }
        String name = authentication.getName();
        if (name == null || name.isBlank()) {
            return "system";
        }
        return name;
    }

    private int sanitizeLimit(int requestedLimit) {
        if (requestedLimit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(requestedLimit, MAX_LIMIT);
    }

    private String normalizeEnvironment(String environment) {
        String normalized = normalize(environment, "test").toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "paper", "live", "test" -> normalized;
            default -> "test";
        };
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String trimToMax(String value, int maxLength) {
        String sanitized = trimToNull(value);
        if (sanitized == null) {
            return null;
        }
        if (sanitized.length() <= maxLength) {
            return sanitized;
        }
        return sanitized.substring(0, maxLength);
    }
}
