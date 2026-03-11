package com.algotrader.bot.websocket;

import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket handler for real-time updates.
 * Manages connections, subscriptions, and event publishing.
 */
@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Store active sessions
    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    
    // Store subscriptions per session (sessionId -> Set<channel>)
    private final Map<String, Set<String>> subscriptions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("WebSocket connection established: {}", session.getId());
        sessions.add(session);
        subscriptions.put(session.getId(), new CopyOnWriteArraySet<>());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("WebSocket connection closed: {}, status: {}", session.getId(), status);
        sessions.remove(session);
        subscriptions.remove(session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        logger.debug("Received message from {}: {}", session.getId(), payload);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String type = (String) data.get("type");

            if ("subscribe".equals(type)) {
                handleSubscribe(session, data);
            } else if ("unsubscribe".equals(type)) {
                handleUnsubscribe(session, data);
            } else {
                logger.warn("Unknown message type: {}", type);
            }
        } catch (Exception e) {
            logger.error("Error processing WebSocket message", e);
            sendError(session, "Invalid message format");
        }
    }

    /**
     * Handle subscription request.
     * Expected format: {"type": "subscribe", "channels": ["test.balance", "test.trades"]}
     */
    private void handleSubscribe(WebSocketSession session, Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        java.util.List<String> channels = (java.util.List<String>) data.get("channels");
        
        if (channels != null) {
            Set<String> sessionSubs = subscriptions.get(session.getId());
            sessionSubs.addAll(channels);
            logger.info("Session {} subscribed to channels: {}", session.getId(), channels);
            
            sendAck(session, "subscribed", channels);
        }
    }

    /**
     * Handle unsubscribe request.
     * Expected format: {"type": "unsubscribe", "channels": ["test.balance"]}
     */
    private void handleUnsubscribe(WebSocketSession session, Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        java.util.List<String> channels = (java.util.List<String>) data.get("channels");
        
        if (channels != null) {
            Set<String> sessionSubs = subscriptions.get(session.getId());
            sessionSubs.removeAll(channels);
            logger.info("Session {} unsubscribed from channels: {}", session.getId(), channels);
            
            sendAck(session, "unsubscribed", channels);
        }
    }

    /**
     * Publish event to all subscribed sessions.
     * Event format: {"type": "balance.updated", "environment": "test", "timestamp": "...", "data": {...}}
     *
     * @param channel the channel name (e.g., "test.balance", "live.trades")
     * @param event the event data
     */
    public void publishEvent(String channel, Map<String, Object> event) {
        logger.debug("Publishing event to channel {}: {}", channel, event);

        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                Set<String> sessionSubs = subscriptions.get(session.getId());
                if (sessionSubs != null && sessionSubs.contains(channel)) {
                    try {
                        String json = objectMapper.writeValueAsString(event);
                        session.sendMessage(new TextMessage(json));
                    } catch (IOException e) {
                        logger.error("Error sending message to session {}", session.getId(), e);
                    }
                }
            }
        }
    }

    /**
     * Send acknowledgment message to session.
     */
    private void sendAck(WebSocketSession session, String action, java.util.List<String> channels) {
        try {
            Map<String, Object> ack = Map.of(
                    "type", "ack",
                    "action", action,
                    "channels", channels
            );
            String json = objectMapper.writeValueAsString(ack);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            logger.error("Error sending ack to session {}", session.getId(), e);
        }
    }

    /**
     * Send error message to session.
     */
    private void sendError(WebSocketSession session, String errorMessage) {
        try {
            Map<String, Object> error = Map.of(
                    "type", "error",
                    "message", errorMessage
            );
            String json = objectMapper.writeValueAsString(error);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            logger.error("Error sending error message to session {}", session.getId(), e);
        }
    }

    /**
     * Get count of active sessions.
     */
    public int getActiveSessionCount() {
        return sessions.size();
    }
}
