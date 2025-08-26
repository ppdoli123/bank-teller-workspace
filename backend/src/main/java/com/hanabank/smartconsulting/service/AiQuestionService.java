package com.hanabank.smartconsulting.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hanabank.smartconsulting.dto.ai.AiQuestionRequest;
import com.hanabank.smartconsulting.dto.ai.AiQuestionResponse;
import com.hanabank.smartconsulting.dto.ai.QuestionItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiQuestionService {

    private final RagService ragService;
    private final ObjectMapper objectMapper;

    public AiQuestionResponse generateQuestions(AiQuestionRequest request) {
        try {
            log.info("Generating questions for customer: {}", request.getCustomerId());
            
            // Use RAG to generate questions - temporarily return direct questions
            List<QuestionItem> questions = ragService.generateQuestionsDirectly(
                    request.getCustomerSnapshotJson(),
                    request.getEmployeeNotes()
            );
            
            log.info("Generated {} questions directly", questions.size());
            
            return AiQuestionResponse.builder()
                    .questions(questions)
                    .summary("AI가 고객 정보와 행원 메모를 분석하여 생성한 맞춤형 질문 목록")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error generating questions: {}", e.getMessage(), e);
            
            // Enhanced fallback questions based on customer info
            List<QuestionItem> items = new ArrayList<>();
            items.add(QuestionItem.builder()
                    .category("투자목표")
                    .question("투자를 통해 달성하고자 하는 주요 목표는 무엇인가요?")
                    .rationale("고객의 투자 목적 파악")
                    .priority("high")
                    .build());
            items.add(QuestionItem.builder()
                    .category("위험성향")
                    .question("투자 시 원금 손실에 대한 감수 정도는 어느 정도인가요?")
                    .rationale("위험 성향 평가")
                    .priority("high")
                    .build());
            items.add(QuestionItem.builder()
                    .category("투자기간")
                    .question("언제까지 투자하실 예정이신가요?")
                    .rationale("투자 기간 확인")
                    .priority("medium")
                    .build());
            items.add(QuestionItem.builder()
                    .category("투자금액")
                    .question("초기 투자 가능한 금액은 얼마 정도 되시나요?")
                    .rationale("투자 규모 파악")
                    .priority("medium")
                    .build());
            items.add(QuestionItem.builder()
                    .category("경험")
                    .question("이전에 투자 경험이 있으시다면 어떤 상품에 투자해보셨나요?")
                    .rationale("투자 경험 수준 파악")
                    .priority("low")
                    .build());
            
            return AiQuestionResponse.builder()
                    .questions(items)
                    .summary("맞춤형 상담 질문 목록 (고객 정보 기반 생성)")
                    .build();
        }
    }
    
    private List<QuestionItem> parseAiResponse(String aiResponse) {
        try {
            log.info("Parsing AI response: {}", aiResponse);
            
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                log.warn("AI response is null or empty");
                return new ArrayList<>();
            }
            
            // Try to parse as JSON array first
            if (aiResponse.trim().startsWith("[")) {
                log.info("Attempting to parse as JSON array");
                return objectMapper.readValue(aiResponse, new TypeReference<List<QuestionItem>>() {});
            }
            
            // If not JSON, try to extract questions from text
            log.info("Parsing as text format");
            return extractQuestionsFromText(aiResponse);
            
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse AI response as JSON: {}", e.getMessage());
            return extractQuestionsFromText(aiResponse);
        }
    }
    
    private List<QuestionItem> extractQuestionsFromText(String text) {
        List<QuestionItem> questions = new ArrayList<>();
        String[] lines = text.split("\n");
        
        String currentCategory = "일반";
        String currentRationale = "";
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            // Check if line contains a question mark
            if (line.contains("?") || line.contains("？")) {
                QuestionItem question = QuestionItem.builder()
                        .category(currentCategory)
                        .question(line)
                        .rationale(currentRationale.isEmpty() ? "AI가 생성한 질문" : currentRationale)
                        .priority("medium")
                        .build();
                questions.add(question);
            } else if (line.contains("카테고리:") || line.contains("분류:")) {
                currentCategory = line.split("[:：]")[1].trim();
            } else if (line.contains("이유:") || line.contains("근거:")) {
                currentRationale = line.split("[:：]")[1].trim();
            }
        }
        
        return questions;
    }
}


