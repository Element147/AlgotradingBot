package com.algotrader.bot.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for WebSocketHandler.
 * Tests connection management, subscriptions, and event publishing.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class WebSocketHandlerTest {

    @Mock
    private WebSocketSession session1;

    @Mock
    private WebSocketSession session2;

    private WebSocketHandler webSocketHandler;

    @BeforeEach
    void setUp() {
        webSocketHandler = new WebSocketHandler(new ObjectMapper().findAndRegisterModules());
        when(session1.getId()).thenReturn("session-1");
        when(session2.getId()).thenReturn("session-2");
    }

    @Test
    void testConnectionEstablished() throws Exception {
        // Act
        webSocketHandler.afterConnectionEstablished(session1);

        // Assert
        assertEquals(1, webSocketHandler.getActiveSessionCount());
    }

    @Test
    void testConnectionClosed() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        assertEquals(1, webSocketHandler.getActiveSessionCount());

        // Act
        webSocketHandler.afterConnectionClosed(session1, CloseStatus.NORMAL);

        // Assert
        assertEquals(0, webSocketHandler.getActiveSessionCount());
    }

    @Test
    void testMultipleConnections() throws Exception {
        // Act
        webSocketHandler.afterConnectionEstablished(session1);
        webSocketHandler.afterConnectionEstablished(session2);

        // Assert
        assertEquals(2, webSocketHandler.getActiveSessionCount());
    }

    @Test
    void testSubscribeToChannels() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        when(session1.isOpen()).thenReturn(true);
        String subscribeMessage = "{\"type\":\"subscribe\",\"channels\":[\"test.balance\",\"test.trades\"]}";

        // Act
        webSocketHandler.handleTextMessage(session1, new TextMessage(subscribeMessage));

        // Assert
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeastOnce()).sendMessage(messageCaptor.capture());
        
        // Verify acknowledgment was sent
        String ackMessage = messageCaptor.getValue().getPayload();
        assertTrue(ackMessage.contains("ack") || ackMessage.contains("subscribed"));
    }

    @Test
    void testUnsubscribeFromChannels() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        when(session1.isOpen()).thenReturn(true);
        String subscribeMessage = "{\"type\":\"subscribe\",\"channels\":[\"test.balance\"]}";
        webSocketHandler.handleTextMessage(session1, new TextMessage(subscribeMessage));
        
        String unsubscribeMessage = "{\"type\":\"unsubscribe\",\"channels\":[\"test.balance\"]}";

        // Act
        webSocketHandler.handleTextMessage(session1, new TextMessage(unsubscribeMessage));

        // Assert
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeastOnce()).sendMessage(messageCaptor.capture());
        
        // Verify acknowledgment was sent
        List<TextMessage> messages = messageCaptor.getAllValues();
        assertTrue(messages.size() >= 2); // Subscribe ack + Unsubscribe ack
    }

    @Test
    void testPublishEventToSubscribedSession() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        when(session1.isOpen()).thenReturn(true);
        String subscribeMessage = "{\"type\":\"subscribe\",\"channels\":[\"test.balance\"]}";
        webSocketHandler.handleTextMessage(session1, new TextMessage(subscribeMessage));

        Map<String, Object> event = new HashMap<>();
        event.put("type", "balance.updated");
        event.put("environment", "test");
        event.put("data", Map.of("total", "1000.00"));

        // Act
        webSocketHandler.publishEvent("test.balance", event);

        // Assert
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeastOnce()).sendMessage(messageCaptor.capture());
        
        // Verify event was sent (last message should be the event)
        List<TextMessage> messages = messageCaptor.getAllValues();
        String lastMessage = messages.get(messages.size() - 1).getPayload();
        assertTrue(lastMessage.contains("balance.updated"));
    }

    @Test
    void testPublishEventToUnsubscribedSession() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        // No subscription

        Map<String, Object> event = new HashMap<>();
        event.put("type", "balance.updated");
        event.put("environment", "test");
        event.put("data", Map.of("total", "1000.00"));

        // Act
        webSocketHandler.publishEvent("test.balance", event);

        // Assert
        // Session should not receive the event (no subscription)
        verify(session1, never()).sendMessage(any(TextMessage.class));
    }

    @Test
    void testPublishEventToMultipleSessions() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        webSocketHandler.afterConnectionEstablished(session2);
        when(session1.isOpen()).thenReturn(true);
        when(session2.isOpen()).thenReturn(true);
        
        String subscribeMessage = "{\"type\":\"subscribe\",\"channels\":[\"test.balance\"]}";
        webSocketHandler.handleTextMessage(session1, new TextMessage(subscribeMessage));
        webSocketHandler.handleTextMessage(session2, new TextMessage(subscribeMessage));

        Map<String, Object> event = new HashMap<>();
        event.put("type", "balance.updated");
        event.put("environment", "test");
        event.put("data", Map.of("total", "1000.00"));

        // Act
        webSocketHandler.publishEvent("test.balance", event);

        // Assert
        verify(session1, atLeastOnce()).sendMessage(any(TextMessage.class));
        verify(session2, atLeastOnce()).sendMessage(any(TextMessage.class));
    }

    @Test
    void testInvalidMessageFormat() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        when(session1.isOpen()).thenReturn(true);
        String invalidMessage = "invalid json";

        // Act
        webSocketHandler.handleTextMessage(session1, new TextMessage(invalidMessage));

        // Assert
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session1, atLeastOnce()).sendMessage(messageCaptor.capture());
        
        // Verify error message was sent
        String errorMessage = messageCaptor.getValue().getPayload();
        assertTrue(errorMessage.contains("error") || errorMessage.contains("Invalid"));
    }

    @Test
    void testUnknownMessageType() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        when(session1.isOpen()).thenReturn(true);
        String unknownMessage = "{\"type\":\"unknown\",\"data\":{}}";

        // Act
        webSocketHandler.handleTextMessage(session1, new TextMessage(unknownMessage));

        // Assert - should handle gracefully without error
        verify(session1, never()).sendMessage(argThat((TextMessage msg) -> {
            String payload = msg.getPayload();
            return payload != null && payload.contains("error");
        }));
    }

    @Test
    void testPublishEventToClosedSession() throws Exception {
        // Arrange
        webSocketHandler.afterConnectionEstablished(session1);
        when(session1.isOpen()).thenReturn(true);
        String subscribeMessage = "{\"type\":\"subscribe\",\"channels\":[\"test.balance\"]}";
        webSocketHandler.handleTextMessage(session1, new TextMessage(subscribeMessage));
        
        when(session1.isOpen()).thenReturn(false); // Simulate closed session

        Map<String, Object> event = new HashMap<>();
        event.put("type", "balance.updated");
        event.put("environment", "test");
        event.put("data", Map.of("total", "1000.00"));

        // Act
        webSocketHandler.publishEvent("test.balance", event);

        // Assert
        // Should not attempt to send to closed session
        verify(session1, atMost(1)).sendMessage(any(TextMessage.class)); // Only the subscribe ack
    }
}
