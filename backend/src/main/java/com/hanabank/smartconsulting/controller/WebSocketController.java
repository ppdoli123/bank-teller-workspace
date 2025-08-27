package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController extends TextWebSocketHandler {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final SessionService sessionService;
    
    // 단순 WebSocket 세션 저장소
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    // STOMP 메시지 핸들러들
    @MessageMapping("/join-session")
    public void joinSession(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = (String) payload.get("sessionId");
        String userType = (String) payload.get("userType");
        String userId = (String) payload.get("userId");
        
        log.info("세션 참여 요청 - sessionId: {}, userType: {}, userId: {}", sessionId, userType, userId);
        
        // 세션 정보를 헤더에 저장
        try {
            Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes == null) {
                sessionAttributes = new HashMap<>();
                headerAccessor.setSessionAttributes(sessionAttributes);
                sessionAttributes = headerAccessor.getSessionAttributes(); // 재할당
            }
            if (sessionAttributes != null) {
                sessionAttributes.put("sessionId", sessionId);
                sessionAttributes.put("userType", userType);
                sessionAttributes.put("userId", userId);
            }
        } catch (Exception e) {
            log.warn("세션 속성 설정 실패: {}", e.getMessage());
        }
        
        // 태블릿이 세션에 참여하는 경우 SessionService 사용
        boolean joinSuccess = true;
        if ("customer-tablet".equals(userType)) {
            joinSuccess = sessionService.joinTabletToSession(sessionId);
        }
        
        // 세션 참여 결과 응답
        Map<String, Object> response = new HashMap<>();
        response.put("type", "session-joined");
        response.put("userType", userType);
        response.put("userId", userId != null ? userId : "anonymous");
        response.put("success", joinSuccess);
        response.put("sessionId", sessionId);
        
        if (joinSuccess) {
            // 성공한 경우 세션 참가자들에게 알림
            sessionService.notifyParticipants(sessionId, "participant-joined", response);
        } else {
            // 실패한 경우 해당 클라이언트에게만 응답
            messagingTemplate.convertAndSendToUser(
                headerAccessor.getSessionId(), 
                "/queue/reply", 
                response
            );
        }
    }
    
    @MessageMapping("/customer-info-update")
    public void customerInfoUpdate(@Payload Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        
        log.info("고객 정보 업데이트 - sessionId: {}", sessionId);
        
        // 고객 태블릿에 정보 전송
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
            "type", "customer-info-updated",
            "data", payload
        ));
    }
    
    @MessageMapping("/product-detail-sync")
    public void productDetailSync(@Payload Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        Object productData = payload.get("productData");
        
        log.info("상품 상세보기 동기화 - sessionId: {}", sessionId);
        
        // 고객 태블릿에 상품 상세 정보 전송
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
            "type", "product-detail-sync",
            "data", productData
        ));
    }
    
    @MessageMapping("/screen-sync")
    public void screenSync(@Payload Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        Object screenData = payload.get("screenData");
        
        log.info("화면 동기화 - sessionId: {}", sessionId);
        
        // 고객 화면에 동기화
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
            "type", "screen-updated",
            "data", screenData
        ));
    }
    
    @MessageMapping("/send-to-session")
    public void sendToSession(@Payload Map<String, Object> payload) {
        try {
            String sessionId = (String) payload.get("sessionId");
            String type = (String) payload.get("type");
            Object data = payload.get("data");
            
            log.info("=== 메시지 수신 ===");
            log.info("세션으로 데이터 전송 - sessionId: {}, type: {}", sessionId, type);
            log.info("전체 페이로드: {}", payload);
            
            if (sessionId == null || sessionId.trim().isEmpty()) {
                log.error("세션 ID가 없습니다!");
                return;
            }
            
            // 태블릿으로 데이터 전송
            Map<String, Object> response = new HashMap<>();
            response.put("type", type);
            response.put("data", data);
            response.put("timestamp", System.currentTimeMillis());
            
            String destination = "/topic/session/" + sessionId;
            log.info("메시지 전송 대상: {}", destination);
            
            messagingTemplate.convertAndSend(destination, response);
            log.info("메시지 전송 완료");
            
        } catch (Exception e) {
            log.error("메시지 처리 중 오류 발생: ", e);
        }
    }
    
    @MessageMapping("/send-message")
    public void sendMessage(@Payload Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        
        log.info("메시지 전송 - sessionId: {}", sessionId);
        
        // 세션 내 다른 참가자들에게 메시지 전송
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, Map.of(
            "type", "receive-message",
            "data", payload
        ));
    }

    // 단순 WebSocket 핸들러들 (STOMP 없이)
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("단순 WebSocket 연결 성공: {}", session.getId());
        sessions.put(session.getId(), session);
        
        // 연결 확인 메시지 전송
        session.sendMessage(new TextMessage("{\"type\":\"connection-established\",\"sessionId\":\"" + session.getId() + "\"}"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.info("단순 WebSocket 메시지 수신: {}", message.getPayload());
        
        try {
            // JSON 파싱 및 처리
            String payload = message.getPayload();
            
            // 간단한 응답 메시지 전송
            String response = "{\"type\":\"message-received\",\"originalMessage\":\"" + payload + "\",\"timestamp\":\"" + System.currentTimeMillis() + "\"}";
            session.sendMessage(new TextMessage(response));
            
            // 다른 세션들에게도 브로드캐스트 (옵션)
            for (WebSocketSession otherSession : sessions.values()) {
                if (!otherSession.getId().equals(session.getId()) && otherSession.isOpen()) {
                    otherSession.sendMessage(new TextMessage("{\"type\":\"broadcast\",\"message\":\"다른 클라이언트에서 메시지를 보냈습니다.\"}"));
                }
            }
            
        } catch (Exception e) {
            log.error("메시지 처리 오류", e);
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"메시지 처리 중 오류가 발생했습니다.\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        log.info("단순 WebSocket 연결 종료: {} - {}", session.getId(), status);
        sessions.remove(session.getId());
    }
}
