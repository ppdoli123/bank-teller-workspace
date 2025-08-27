package com.hanabank.smartconsulting.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.Map;

@Configuration
@EnableWebSocket
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer, WebSocketConfigurer {

    @Value("${websocket.allowed.origins}")
    private String allowedOrigins;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트에서 구독할 수 있는 경로 설정
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트에서 메시지를 보낼 때 사용할 경로 설정
        config.setApplicationDestinationPrefixes("/app");

        // STOMP 설정 개선 - React Native 환경 대응
        config.setPreservePublishOrder(true);
        
        // STOMP 버전 설정 명시
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS WebSocket 엔드포인트 (React Native용)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // 개발 중이므로 모든 오리진 허용
                .withSockJS()
                .setHeartbeatTime(30000) // 하트비트 시간 증가
                .setDisconnectDelay(10000) // 연결 해제 지연 시간 증가
                .setHttpMessageCacheSize(2000) // 메시지 캐시 크기 증가
                .setWebSocketEnabled(true)
                .setSessionCookieNeeded(false)
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js")
                .setStreamBytesLimit(512 * 1024) // 스트림 바이트 제한 증가
                .setHttpMessageCacheSize(2000) // HTTP 메시지 캐시 크기 증가
                .setDisconnectDelay(30 * 1000); // 연결 해제 지연 시간 증가

        // 네이티브 WebSocket 엔드포인트 (웹 브라우저용)
        registry.addEndpoint("/websocket")
                .setAllowedOriginPatterns("*"); // SockJS 없이 순수 WebSocket
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        // WebSocket 전송 설정 개선 - React Native 환경 대응
        registration.setMessageSizeLimit(128 * 1024) // 128KB로 증가
                   .setSendBufferSizeLimit(1024 * 1024) // 1MB로 증가
                   .setSendTimeLimit(30000) // 30초로 증가
                   .setTimeToFirstMessage(30000); // 첫 메시지까지 대기 시간 증가
    }

    // WebSocketConfigurer 구현 - 단순 WebSocket 핸들러 등록
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SimpleWebSocketHandler(messagingTemplate, objectMapper), "/simple-ws")
                .setAllowedOriginPatterns("*");
    }

    // 단순 WebSocket 메시지 핸들러
    public static class SimpleWebSocketHandler extends TextWebSocketHandler {
        
        private final SimpMessagingTemplate messagingTemplate;
        private final ObjectMapper objectMapper;

        public SimpleWebSocketHandler(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
            this.messagingTemplate = messagingTemplate;
            this.objectMapper = objectMapper;
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            try {
                String payload = message.getPayload();
                System.out.println("단순 WebSocket 메시지 수신: " + payload);
                
                JsonNode jsonNode = objectMapper.readTree(payload);
                String type = jsonNode.get("type").asText();
                String sessionId = jsonNode.get("sessionId").asText();
                
                switch (type) {
                    case "join-session":
                        // 세션 참여 처리
                        String userType = jsonNode.get("userType").asText();
                        System.out.println("세션 참여: " + sessionId + ", 사용자 타입: " + userType);
                        
                        // 세션 참여 성공 메시지 전송
                        String response = objectMapper.writeValueAsString(Map.of(
                            "type", "session-joined",
                            "sessionId", sessionId,
                            "userType", userType,
                            "success", true
                        ));
                        session.sendMessage(new TextMessage(response));
                        break;
                        
                    case "start-consultation":
                        // 상담 시작 처리
                        System.out.println("상담 시작: " + sessionId);
                        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
                            "type", "consultation-started",
                            "sessionId", sessionId
                        ));
                        break;
                        
                    case "customer-info-confirmed":
                        // 고객 정보 확인 처리
                        System.out.println("고객 정보 확인: " + sessionId);
                        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
                            "type", "customer-info-confirmed",
                            "sessionId", sessionId
                        ));
                        break;
                        
                    case "FIELD_INPUT_COMPLETED":
                        // 필드 입력 완료 처리
                        System.out.println("필드 입력 완료: " + sessionId);
                        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
                            "type", "field-input-completed",
                            "sessionId", sessionId,
                            "field", jsonNode.get("field")
                        ));
                        break;
                        
                    default:
                        System.out.println("알 수 없는 메시지 타입: " + type);
                        break;
                }
                
            } catch (Exception e) {
                System.err.println("단순 WebSocket 메시지 처리 오류: " + e.getMessage());
                e.printStackTrace();
            }
        }

        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            System.out.println("단순 WebSocket 연결 성공: " + session.getId());
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
            System.out.println("단순 WebSocket 연결 종료: " + session.getId() + ", 상태: " + status);
        }
    }
}
