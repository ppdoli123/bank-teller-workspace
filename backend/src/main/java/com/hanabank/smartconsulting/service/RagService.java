package com.hanabank.smartconsulting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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

@Service
@RequiredArgsConstructor
@Slf4j
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
            // Search for relevant document chunks
            String searchQuery = customerInfo + " " + employeeNotes;
            List<String> relevantChunks = searchSimilarChunks(searchQuery, 5);
            
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
            
            return openAiService.generateQuestions(prompt.toString());
            
        } catch (Exception e) {
            log.error("Error generating questions with RAG: {}", e.getMessage(), e);
            return "질문 생성 중 오류가 발생했습니다.";
        }
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
