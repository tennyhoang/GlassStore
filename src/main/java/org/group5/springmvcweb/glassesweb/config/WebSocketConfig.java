package org.group5.springmvcweb.glassesweb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket dùng STOMP protocol.
 *
 * Flow:
 *   Client connect → ws://localhost:8080/ws
 *   Client subscribe → /user/queue/notifications (nhận notification riêng)
 *   Server push → SimpMessagingTemplate.convertAndSendToUser(username, "/queue/notifications", data)
 *
 * Frontend dùng SockJS + STOMP.js để kết nối.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Điều chỉnh theo CORS config thực tế
                .withSockJS();                  // SockJS fallback cho browser không hỗ trợ WebSocket
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix cho message broker in-memory
        config.enableSimpleBroker("/queue", "/topic");

        // Prefix cho message từ client gửi lên server (nếu cần)
        config.setApplicationDestinationPrefixes("/app");

        // Prefix cho message gửi đến từng user cụ thể
        config.setUserDestinationPrefix("/user");
    }
}
