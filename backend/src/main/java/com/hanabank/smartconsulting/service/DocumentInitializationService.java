package com.hanabank.smartconsulting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
// import com.hanabank.smartconsulting.entity.Embedding;
// import com.hanabank.smartconsulting.repository.EmbeddingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentInitializationService {
    
    private final SupabaseStorageService supabaseStorageService;
    private final OpenAiService openAiService;
    // private final EmbeddingRepository embeddingRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 애플리케이션 시작 시 Supabase PDF 문서들을 임베딩
     * 현재는 비활성화 상태 - 필요시 활성화
     */
    // @PostConstruct
    public void initializeDocuments() {
        // 별도 스레드에서 실행 (애플리케이션 시작 속도를 위해)
        new Thread(() -> {
            try {
                Thread.sleep(5000); // 애플리케이션 완전 시작 후 실행
                processAllPdfDocuments();
            } catch (Exception e) {
                log.error("문서 초기화 중 오류", e);
            }
        }).start();
    }
    
    /**
     * 모든 PDF 문서 처리
     */
    @Transactional
    public void processAllPdfDocuments() {
        try {
            log.info("=== Supabase Storage PDF 문서 임베딩 시작 ===");
            
            // 기존 임베딩 데이터가 있는지 확인 (비활성화)
            // long existingCount = embeddingRepository.count();
            // if (existingCount > 0) {
            //     log.info("이미 {} 개의 임베딩이 존재합니다. 스킵합니다.", existingCount);
            //     return;
            // }
            
            // Supabase Storage에서 모든 PDF 파일 가져오기
            List<String> pdfFiles = supabaseStorageService.getAllPdfFiles();
            log.info("처리할 PDF 파일 개수: {}", pdfFiles.size());
            
            if (pdfFiles.isEmpty()) {
                log.warn("Supabase Storage에서 PDF 파일을 찾을 수 없습니다.");
                // createSampleEmbeddings(); // 샘플 데이터 생성 비활성화
                return;
            }
            
            int processedCount = 0;
            for (String filePath : pdfFiles) {
                try {
                    processDocument(filePath);
                    processedCount++;
                    log.info("진행률: {}/{} - {}", processedCount, pdfFiles.size(), filePath);
                    
                    // API 호출 제한을 위한 딜레이
                    Thread.sleep(1000);
                    
                } catch (Exception e) {
                    log.error("문서 처리 실패: {}", filePath, e);
                }
            }
            
            log.info("=== PDF 문서 임베딩 완료: {} 개 파일 처리 ===", processedCount);
            
        } catch (Exception e) {
            log.error("PDF 문서 처리 중 전체 오류", e);
            // createSampleEmbeddings(); // 실패 시 샘플 데이터 생성 비활성화
        }
    }
    
    /**
     * 개별 PDF 문서 처리
     */
    private void processDocument(String filePath) throws Exception {
        log.info("문서 처리 시작: {}", filePath);
        
        // 1. Supabase Storage에서 PDF 다운로드
        byte[] pdfContent = supabaseStorageService.downloadFile(filePath);
        if (pdfContent == null) {
            throw new RuntimeException("PDF 다운로드 실패: " + filePath);
        }
        
        // 2. PDF에서 텍스트 추출
        String text = extractTextFromPdf(pdfContent);
        if (text.trim().isEmpty()) {
            log.warn("PDF에서 텍스트를 추출할 수 없습니다: {}", filePath);
            return;
        }
        
        // 3. 텍스트를 청크로 분할
        List<String> chunks = splitIntoChunks(text, 1000, 200);
        log.info("문서 청크 개수: {} - {}", chunks.size(), filePath);
        
        // 4. 각 청크를 임베딩 (비활성화)
        /*
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            
            // OpenAI API로 임베딩 생성
            List<Double> embedding = openAiService.createEmbedding(chunk);
            
            // 메타데이터 생성
            Map<String, Object> metadata = Map.of(
                "file_path", filePath,
                "chunk_index", i,
                "total_chunks", chunks.size(),
                "product_type", extractProductType(filePath),
                "chunk_length", chunk.length()
            );
            
            // 데이터베이스에 저장
            Embedding embeddingEntity = Embedding.builder()
                    .documentId(filePath)
                    .chunkId(filePath + "_chunk_" + i)
                    .content(chunk)
                    .embedding(embedding.toString())
                    .metadata(objectMapper.writeValueAsString(metadata))
                    .build();
            
            embeddingRepository.save(embeddingEntity);
        }
        */
        
        log.info("문서 처리 완료: {} ({} 청크)", filePath, chunks.size());
    }
    
    /**
     * PDF에서 텍스트 추출
     */
    private String extractTextFromPdf(byte[] pdfContent) throws Exception {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfContent))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
    
    /**
     * 텍스트를 청크로 분할
     */
    private List<String> splitIntoChunks(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            
            // 문장 경계에서 분할 시도
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
    
    /**
     * 파일 경로에서 상품 유형 추출
     */
    private String extractProductType(String filePath) {
        if (filePath.contains("savings")) return "적금";
        if (filePath.contains("deposits")) return "예금";
        if (filePath.contains("loans")) return "대출";
        if (filePath.contains("funds")) return "펀드";
        if (filePath.contains("insurance")) return "보험";
        return "기타";
    }
    
    /**
     * Supabase 연결 실패 시 샘플 임베딩 데이터 생성 (비활성화)
     */
    /*
    private void createSampleEmbeddings() {
        try {
            log.info("샘플 임베딩 데이터 생성 시작...");
            
            String[] sampleDocuments = {
                "하나 3.6.9 적금은 매월 일정금액을 적립하여 목돈을 마련하는 정기적금입니다. 최고 연 3.69% 금리를 제공하며, 만 14세 이상 개인이 가입 가능합니다.",
                "하나 5Plus 적금은 더 높은 금리로 목돈마련이 가능한 프리미엄 적금상품입니다. 최고 연 5.50% 금리를 제공하며, 만 19세 이상 개인이 가입할 수 있습니다.",
                "하나 정기예금은 목돈을 안전하게 보관하면서 확정금리를 받을 수 있는 예금상품입니다. 예금자보호법에 의해 원금과 이자가 보호됩니다.",
                "하나 주택담보대출은 주택 구입 또는 전세자금 마련을 위한 대출상품입니다. 경쟁력 있는 금리와 다양한 상환방법을 제공합니다.",
                "하나 글로벌 펀드는 해외 주식시장에 투자하는 글로벌 분산투자 상품입니다. 높은 수익 가능성과 함께 투자위험이 존재합니다."
            };
            
            for (int i = 0; i < sampleDocuments.length; i++) {
                String content = sampleDocuments[i];
                List<Double> embedding = openAiService.createEmbedding(content);
                
                Map<String, Object> metadata = Map.of(
                    "sample_data", true,
                    "document_index", i,
                    "product_type", i < 2 ? "적금" : i == 2 ? "예금" : i == 3 ? "대출" : "펀드"
                );
                
                Embedding embeddingEntity = Embedding.builder()
                        .documentId("sample_doc_" + i)
                        .chunkId("sample_chunk_" + i)
                        .content(content)
                        .embedding(embedding.toString())
                        .metadata(objectMapper.writeValueAsString(metadata))
                        .build();
                
                embeddingRepository.save(embeddingEntity);
                Thread.sleep(500); // API 호출 제한
            }
            
            log.info("샘플 임베딩 데이터 생성 완료: {} 개", sampleDocuments.length);
            
        } catch (Exception e) {
            log.error("샘플 데이터 생성 실패", e);
        }
    }
    */
}

