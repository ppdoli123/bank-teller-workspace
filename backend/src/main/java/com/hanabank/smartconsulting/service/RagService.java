package com.hanabank.smartconsulting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hanabank.smartconsulting.dto.ai.QuestionItem;
import com.hanabank.smartconsulting.entity.Embedding;
import com.hanabank.smartconsulting.entity.ProductDocument;
import com.hanabank.smartconsulting.repository.EmbeddingRepository;
import com.hanabank.smartconsulting.repository.ProductDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// @Slf4j
public class RagService {
    
    private final OpenAiService openAiService;
    private final EmbeddingRepository embeddingRepository;
    private final ProductDocumentRepository productDocumentRepository;
    private final ObjectMapper objectMapper;
    
    @Transactional
    public void processDocument(byte[] pdfContent, String documentName, String storagePath) {
        try {
            // Create document record
            ProductDocument document = ProductDocument.builder()
                    .documentName(documentName)
                    .storagePath(storagePath)
                    .fileSize((long) pdfContent.length)
                    .contentType("application/pdf")
                    .status(ProductDocument.DocumentStatus.PROCESSING)
                    .build();
            
            document = productDocumentRepository.save(document);
            
            // Extract text from PDF
            String text = extractTextFromPdf(pdfContent);
            
            // Split into chunks
            List<String> chunks = splitIntoChunks(text, 1000, 200);
            
            // Create embeddings for each chunk
            for (int i = 0; i < chunks.size(); i++) {
                String chunk = chunks.get(i);
                List<Double> embedding = openAiService.createEmbedding(chunk);
                
                // Create metadata map
                Map<String, Object> metadataMap = Map.of(
                        "chunk_index", i,
                        "document_name", documentName,
                        "storage_path", storagePath
                );
                
                // Convert metadata to JSON string
                String metadataJson = objectMapper.writeValueAsString(metadataMap);
                
                Embedding embeddingEntity = Embedding.builder()
                        .documentId(documentName)
                        .chunkId(documentName + "_chunk_" + i)
                        .content(chunk)
                        .embedding(embedding.toString()) // Convert to string for storage
                        .metadata(metadataJson)
                        .build();
                
                embeddingRepository.save(embeddingEntity);
            }
            
            // Update document status
            document.setStatus(ProductDocument.DocumentStatus.COMPLETED);
            productDocumentRepository.save(document);
            
            log.info("Successfully processed document: {} with {} chunks", documentName, chunks.size());
            
        } catch (Exception e) {
            log.error("Error processing document: {}", documentName, e);
            
            // Update document status to error
            ProductDocument document = productDocumentRepository.findByDocumentName(documentName);
            if (document != null) {
                document.setStatus(ProductDocument.DocumentStatus.ERROR);
                productDocumentRepository.save(document);
            }
            
            throw new RuntimeException("Failed to process document: " + documentName, e);
        }
    }
    
    public List<String> searchSimilarChunks(String query, int limit) {
        try {
            // Create embedding for the query
            List<Double> queryEmbedding = openAiService.createEmbedding(query);
            
            // For now, return a simple search result
            // In a real implementation, you would use vector similarity search
            List<Embedding> allEmbeddings = embeddingRepository.findAll();
            
            // Simple cosine similarity calculation (simplified)
            return allEmbeddings.stream()
                    .limit(limit)
                    .map(Embedding::getContent)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error searching similar chunks: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    public String generateQuestionsWithRag(String customerInfo, String employeeNotes) {
        try {
            log.info("Starting RAG question generation...");
            
            // Search for relevant document chunks
            String searchQuery = customerInfo + " " + employeeNotes;
            List<String> relevantChunks = searchSimilarChunks(searchQuery, 5);
            
            log.info("Found {} relevant chunks", relevantChunks.size());
            
            // Build prompt with context
            StringBuilder prompt = new StringBuilder();
            prompt.append("고객 정보: ").append(customerInfo).append("\n\n");
            prompt.append("행원 메모: ").append(employeeNotes).append("\n\n");
            
            if (!relevantChunks.isEmpty()) {
                prompt.append("관련 상품 정보:\n");
                for (int i = 0; i < relevantChunks.size(); i++) {
                    prompt.append(i + 1).append(". ").append(relevantChunks.get(i)).append("\n");
                }
                prompt.append("\n");
            }
            
            prompt.append("위 정보를 바탕으로 고객에게 물어볼 핵심 질문들을 생성해주세요. ");
            prompt.append("각 질문은 다음 형식으로 JSON 배열로 응답해주세요:\n");
            prompt.append("[{\"category\": \"카테고리\", \"question\": \"질문내용\", \"rationale\": \"질문 이유\", \"priority\": \"high|medium|low\"}]");
            
            log.info("Calling OpenAI with prompt length: {}", prompt.length());
            
            // Temporary: Return mock response for testing
            String mockResponse = "[" +
                "{\"category\": \"투자목표\", \"question\": \"이번 투자의 주요 목적은 무엇인가요?\", \"rationale\": \"투자 목적 명확화\", \"priority\": \"high\"}," +
                "{\"category\": \"위험성향\", \"question\": \"투자 시 손실 가능성에 대해 어떻게 생각하시나요?\", \"rationale\": \"위험 감수 능력 파악\", \"priority\": \"high\"}," +
                "{\"category\": \"투자기간\", \"question\": \"투자 자금을 언제까지 유지하실 계획인가요?\", \"rationale\": \"투자 기간 설정\", \"priority\": \"medium\"}" +
                "]";
            
            log.info("Returning mock response for testing");
            return mockResponse;
            
            // TODO: Uncomment this when OpenAI API is working
            // return openAiService.generateQuestions(prompt.toString());
            
        } catch (Exception e) {
            log.error("Error generating questions with RAG: {}", e.getMessage(), e);
            return "질문 생성 중 오류가 발생했습니다.";
        }
    }
    
    public List<QuestionItem> generateQuestionsDirectly(String customerInfo, String employeeNotes) {
        log.info("Generating questions directly based on customer info and notes");
        
        List<QuestionItem> questions = new ArrayList<>();
        
        // Analyze customer info and employee notes to generate relevant questions
        if (customerInfo.contains("투자") || employeeNotes.contains("투자")) {
            questions.add(QuestionItem.builder()
                    .category("투자목표")
                    .question("이번 투자를 통해 달성하고자 하는 주요 목표는 무엇인가요?")
                    .rationale("고객의 투자 목적과 기대 수익 파악")
                    .priority("high")
                    .build());
            
            questions.add(QuestionItem.builder()
                    .category("위험성향")
                    .question("투자 시 원금 손실 가능성에 대해 어느 정도까지 감수하실 수 있나요?")
                    .rationale("위험 감수 능력 평가")
                    .priority("high")
                    .build());
        }
        
        if (customerInfo.contains("직장인") || customerInfo.contains("소득")) {
            questions.add(QuestionItem.builder()
                    .category("재정상황")
                    .question("현재 월 평균 소득과 지출 규모는 어느 정도 되시나요?")
                    .rationale("투자 가능 자금 규모 파악")
                    .priority("medium")
                    .build());
        }
        
        if (customerInfo.contains("경험 없음") || customerInfo.contains("초보")) {
            questions.add(QuestionItem.builder()
                    .category("투자경험")
                    .question("투자가 처음이시라면 어떤 상품부터 시작하고 싶으신가요?")
                    .rationale("투자 경험 수준에 맞는 상품 추천")
                    .priority("medium")
                    .build());
        }
        
        questions.add(QuestionItem.builder()
                .category("투자기간")
                .question("투자하신 자금을 언제까지 유지하실 예정이신가요?")
                .rationale("투자 기간에 따른 상품 선택")
                .priority("medium")
                .build());
        
        questions.add(QuestionItem.builder()
                .category("추가상담")
                .question("다른 궁금한 사항이나 우려되는 부분이 있으신가요?")
                .rationale("고객의 추가 니즈 파악")
                .priority("low")
                .build());
        
        log.info("Generated {} direct questions", questions.size());
        return questions;
    }
    
    private String extractTextFromPdf(byte[] pdfContent) throws IOException {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfContent))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
    
    private List<String> splitIntoChunks(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            
            // Try to break at sentence boundary
            if (end < text.length()) {
                int lastPeriod = text.lastIndexOf('.', end);
                int lastNewline = text.lastIndexOf('\n', end);
                int breakPoint = Math.max(lastPeriod, lastNewline);
                
                if (breakPoint > start + chunkSize / 2) {
                    end = breakPoint + 1;
                }
            }
            
            String chunk = text.substring(start, end).trim();
            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }
            
            start = end - overlap;
            if (start >= text.length()) break;
        }
        
        return chunks;
    }
}
