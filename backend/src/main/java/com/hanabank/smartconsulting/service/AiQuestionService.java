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
            // Use RAG to generate questions
            String aiResponse = ragService.generateQuestionsWithRag(
                    request.getCustomerSnapshotJson(),
                    request.getEmployeeNotes()
            );
            
            // Parse AI response to extract questions
            List<QuestionItem> questions = parseAiResponse(aiResponse);
            
            return AiQuestionResponse.builder()
                    .questions(questions)
                    .summary("AI가 고객 정보와 행원 메모를 분석하여 생성한 맞춤형 질문 목록")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error generating questions: {}", e.getMessage(), e);
            
            // Fallback to default questions
            List<QuestionItem> items = new ArrayList<>();
            items.add(QuestionItem.builder()
                    .category("목표")
                    .question("이번 상담의 최우선 목표가 무엇인지 다시 확인해도 될까요?")
                    .rationale("행원 메모와 기본 스냅샷을 기반으로 우선순위 정렬")
                    .priority("high")
                    .build());
            items.add(QuestionItem.builder()
                    .category("현금흐름")
                    .question("월 평균 수입과 지출에서 변동 항목이 있는지요?")
                    .rationale("상환여력/투자여력 판단")
                    .priority("medium")
                    .build());
            
            return AiQuestionResponse.builder()
                    .questions(items)
                    .summary("기본 질문 목록 (AI 생성 실패)")
                    .build();
        }
    }
    
    private List<QuestionItem> parseAiResponse(String aiResponse) {
        try {
            // Try to parse as JSON array first
            if (aiResponse.trim().startsWith("[")) {
                return objectMapper.readValue(aiResponse, new TypeReference<List<QuestionItem>>() {});
            }
            
            // If not JSON, try to extract questions from text
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


