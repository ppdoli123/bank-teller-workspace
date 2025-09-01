package com.hanabank.smartconsulting.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
            EmbeddingRequest request = EmbeddingRequest.builder()
                    .input(text)
                    .model("text-embedding-3-small")
                    .build();
            
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
            log.info("Generating questions with OpenAI API...");
            log.debug("API Key configured: {}", apiKey != null && !apiKey.isEmpty());
            log.debug("API URL: {}", apiUrl);
            
            ChatRequest request = ChatRequest.builder()
                    .model("gpt-4o-mini")
                    .messages(List.of(
                            ChatMessage.builder().role("system").content("You are a helpful banking consultant assistant. Generate relevant questions based on customer information and employee notes. Return only the questions in a clear, structured format.").build(),
                            ChatMessage.builder().role("user").content(prompt).build()
                    ))
                    .maxTokens(1000)
                    .temperature(0.7)
                    .build();
            
            log.info("Sending request to OpenAI...");
            
            ChatResponse response = webClient.post()
                    .uri(apiUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ChatResponse.class)
                    .block();
            
            log.info("Received response from OpenAI: {}", response != null);
            
            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                String content = response.getChoices().get(0).getMessage().getContent();
                log.info("OpenAI response content length: {}", content != null ? content.length() : 0);
                return content;
            }
            
            log.warn("No valid response received from OpenAI");
            throw new RuntimeException("Failed to generate questions");
        } catch (Exception e) {
            log.error("Error generating questions: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate questions", e);
        }
    }
    
    // DTOs for OpenAI API
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmbeddingRequest {
        private String input;
        private String model;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmbeddingResponse {
        private List<EmbeddingData> data;
        private String model;
        private String object;
        private Map<String, Object> usage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmbeddingData {
        private List<Double> embedding;
        private int index;
        private String object;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private String model;
        private List<ChatMessage> messages;
        private Integer maxTokens;
        private Double temperature;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatResponse {
        private String id;
        private String object;
        private long created;
        private String model;
        private List<ChatChoice> choices;
        private Map<String, Object> usage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatChoice {
        private int index;
        private ChatMessage message;
        private String finishReason;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role;
        private String content;
    }
}
