package com.hanabank.smartconsulting.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiService {
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${openai.api.key}")
    private String apiKey;
    
    @Value("${openai.api.url:https://api.openai.com/v1}")
    private String apiUrl;
    
    public List<Double> createEmbedding(String text) {
        try {
            EmbeddingRequest request = new EmbeddingRequest();
            request.setInput(text);
            request.setModel("text-embedding-3-small");
            
            EmbeddingResponse response = webClient.post()
                    .uri(apiUrl + "/embeddings")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(EmbeddingResponse.class)
                    .block();
            
            if (response != null && response.getData() != null && !response.getData().isEmpty()) {
                return response.getData().get(0).getEmbedding();
            }
            
            throw new RuntimeException("Failed to create embedding");
        } catch (Exception e) {
            log.error("Error creating embedding: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create embedding", e);
        }
    }
    
    public String generateQuestions(String prompt) {
        try {
            ChatRequest request = new ChatRequest();
            request.setModel("gpt-4o-mini");
            request.setMessages(List.of(
                    new ChatMessage("system", "You are a helpful banking consultant assistant. Generate relevant questions based on customer information and employee notes. Return only the questions in a clear, structured format."),
                    new ChatMessage("user", prompt)
            ));
            request.setMaxTokens(1000);
            request.setTemperature(0.7);
            
            ChatResponse response = webClient.post()
                    .uri(apiUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ChatResponse.class)
                    .block();
            
            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                return response.getChoices().get(0).getMessage().getContent();
            }
            
            throw new RuntimeException("Failed to generate questions");
        } catch (Exception e) {
            log.error("Error generating questions: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate questions", e);
        }
    }
    
    // DTOs for OpenAI API
    @Data
    public static class EmbeddingRequest {
        private String input;
        private String model;
    }
    
    @Data
    public static class EmbeddingResponse {
        private List<EmbeddingData> data;
        private String model;
        private String object;
        private Map<String, Object> usage;
    }
    
    @Data
    public static class EmbeddingData {
        private List<Double> embedding;
        private int index;
        private String object;
    }
    
    @Data
    public static class ChatRequest {
        private String model;
        private List<ChatMessage> messages;
        private Integer maxTokens;
        private Double temperature;
    }
    
    @Data
    public static class ChatResponse {
        private String id;
        private String object;
        private long created;
        private String model;
        private List<ChatChoice> choices;
        private Map<String, Object> usage;
    }
    
    @Data
    public static class ChatChoice {
        private int index;
        private ChatMessage message;
        private String finishReason;
    }
    
    @Data
    public static class ChatMessage {
        private String role;
        private String content;
        
        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }
}
