package com.hanabank.smartconsulting.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${websocket.allowed.origins}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트에서 구독할 수 있는 경로 설정
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트에서 메시지를 보낼 때 사용할 경로 설정
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS WebSocket 엔드포인트 (웹 브라우저용)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // 개발 중이므로 모든 오리진 허용
                .withSockJS();
                
        // 네이티브 WebSocket 엔드포인트 (React Native용)
        registry.addEndpoint("/websocket")
                .setAllowedOriginPatterns("*"); // SockJS 없이 순수 WebSocket
    }
}
