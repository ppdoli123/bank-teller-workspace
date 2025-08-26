package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.entity.Embedding;
import com.hanabank.smartconsulting.repository.EmbeddingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VectorDatabaseService {
    
    private final EmbeddingRepository embeddingRepository;
    private final OpenAiService openAiService;
    
    /**
     * 벡터 유사도 검색 (코사인 유사도)
     */
    public List<String> searchSimilarDocuments(String query, int limit) {
        try {
            log.info("벡터 유사도 검색 시작: query={}, limit={}", query, limit);
            
            // 1. 쿼리를 임베딩으로 변환
            List<Double> queryEmbedding = openAiService.createEmbedding(query);
            
            // 2. 모든 저장된 임베딩과 유사도 계산
            List<Embedding> allEmbeddings = embeddingRepository.findAll();
            log.info("저장된 임베딩 개수: {}", allEmbeddings.size());
            
            // 3. 유사도 점수와 함께 정렬
            List<EmbeddingWithScore> scoredEmbeddings = allEmbeddings.stream()
                    .map(embedding -> {
                        List<Double> docEmbedding = parseEmbeddingString(embedding.getEmbedding());
                        double similarity = calculateCosineSimilarity(queryEmbedding, docEmbedding);
                        return new EmbeddingWithScore(embedding, similarity);
                    })
                    .sorted((a, b) -> Double.compare(b.score, a.score)) // 높은 점수부터
                    .limit(limit)
                    .collect(Collectors.toList());
            
            // 4. 상위 결과의 텍스트 내용 반환
            List<String> results = scoredEmbeddings.stream()
                    .map(item -> {
                        log.info("유사도: {:.4f}, 문서: {}", item.score, 
                                item.embedding.getDocumentId());
                        return item.embedding.getContent();
                    })
                    .collect(Collectors.toList());
            
            log.info("벡터 검색 완료: {} 개 결과 반환", results.size());
            return results;
            
        } catch (Exception e) {
            log.error("벡터 유사도 검색 실패", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 코사인 유사도 계산
     */
    private double calculateCosineSimilarity(List<Double> vectorA, List<Double> vectorB) {
        if (vectorA.size() != vectorB.size()) {
            log.warn("벡터 크기가 다름: {} vs {}", vectorA.size(), vectorB.size());
            return 0.0;
        }
        
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        
        for (int i = 0; i < vectorA.size(); i++) {
            dotProduct += vectorA.get(i) * vectorB.get(i);
            normA += Math.pow(vectorA.get(i), 2);
            normB += Math.pow(vectorB.get(i), 2);
        }
        
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    /**
     * 문자열로 저장된 임베딩을 List<Double>로 변환
     */
    private List<Double> parseEmbeddingString(String embeddingStr) {
        try {
            // "[0.1, 0.2, 0.3]" 형태의 문자열을 파싱
            embeddingStr = embeddingStr.trim();
            if (embeddingStr.startsWith("[") && embeddingStr.endsWith("]")) {
                embeddingStr = embeddingStr.substring(1, embeddingStr.length() - 1);
            }
            
            String[] parts = embeddingStr.split(",");
            List<Double> embedding = new ArrayList<>();
            
            for (String part : parts) {
                embedding.add(Double.parseDouble(part.trim()));
            }
            
            return embedding;
            
        } catch (Exception e) {
            log.error("임베딩 문자열 파싱 실패: {}", embeddingStr, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 임베딩과 유사도 점수를 함께 저장하는 내부 클래스
     */
    private static class EmbeddingWithScore {
        final Embedding embedding;
        final double score;
        
        EmbeddingWithScore(Embedding embedding, double score) {
            this.embedding = embedding;
            this.score = score;
        }
    }
}

