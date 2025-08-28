package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.dto.ProductRecommendationRequest;
import com.hanabank.smartconsulting.dto.ProductRecommendationResponse;
import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationService {
    
    private final FinancialProductRepository financialProductRepository;
    // private final RagService ragService;
    private final OpenAiService openAiService;
    // private final VectorDatabaseService vectorDatabaseService;
    
    public ProductRecommendationResponse recommendProducts(ProductRecommendationRequest request) {
        try {
            log.info("상품 추천 요청: 고객 정보={}, 질문 답변={}", 
                    request.getCustomerInfo(), request.getAnswers().size());
            
            // 1. 고객 답변을 기반으로 검색 쿼리 생성
            String searchQuery = buildSearchQuery(request);
            log.info("생성된 검색 쿼리: {}", searchQuery);
            
            // 2. RAG를 사용해서 관련 상품 정보 검색 (비활성화)
            // List<String> relevantDocuments = ragService.searchSimilarChunks(searchQuery, 10);
            List<String> relevantDocuments = new ArrayList<>(); // 빈 리스트로 대체
            log.info("검색된 관련 문서 개수: {}", relevantDocuments.size());
            
            // 3. 현재 DB의 상품들과 매칭
            List<FinancialProduct> allProducts = financialProductRepository.findAll();
            List<FinancialProduct> recommendedProducts = filterAndRankProducts(
                    allProducts, request, relevantDocuments);
            
            // 4. AI를 사용해서 추천 이유 생성
            String recommendationReason = generateRecommendationReason(
                    request, recommendedProducts, relevantDocuments);
            
            return ProductRecommendationResponse.builder()
                    .recommendedProducts(recommendedProducts)
                    .recommendationReason(recommendationReason)
                    .searchQuery(searchQuery)
                    .totalProducts(recommendedProducts.size())
                    .build();
                    
        } catch (Exception e) {
            log.error("상품 추천 중 오류 발생", e);
            
            // Fallback: 기본 상품 추천
            List<FinancialProduct> fallbackProducts = getDefaultRecommendations(request);
            
            return ProductRecommendationResponse.builder()
                    .recommendedProducts(fallbackProducts)
                    .recommendationReason("고객님의 정보를 바탕으로 추천드리는 기본 상품입니다.")
                    .searchQuery("기본 추천")
                    .totalProducts(fallbackProducts.size())
                    .build();
        }
    }
    
    private String buildSearchQuery(ProductRecommendationRequest request) {
        StringBuilder query = new StringBuilder();
        
        // 고객 기본 정보 추가
        if (request.getCustomerInfo() != null) {
            query.append(request.getCustomerInfo()).append(" ");
        }
        
        // 질문 답변들을 분석해서 키워드 추출
        for (ProductRecommendationRequest.QuestionAnswer answer : request.getAnswers()) {
            String question = answer.getQuestion();
            String response = answer.getAnswer();
            
            // 투자 관련 키워드 추출
            if (question.contains("목표") || question.contains("투자")) {
                query.append("투자목표 ").append(response).append(" ");
            }
            
            if (question.contains("위험") || question.contains("손실")) {
                query.append("위험성향 ").append(response).append(" ");
            }
            
            if (question.contains("기간")) {
                query.append("투자기간 ").append(response).append(" ");
            }
            
            if (question.contains("금액") || question.contains("소득")) {
                query.append("투자금액 ").append(response).append(" ");
            }
            
            // 상품 타입 키워드 추출
            if (response.contains("적금") || response.contains("저축")) {
                query.append("적금 정기적금 ");
            }
            
            if (response.contains("예금")) {
                query.append("예금 정기예금 ");
            }
            
            if (response.contains("펀드") || response.contains("투자")) {
                query.append("펀드 투자상품 ");
            }
            
            if (response.contains("대출")) {
                query.append("대출 신용대출 ");
            }
        }
        
        return query.toString().trim();
    }
    
    private List<FinancialProduct> filterAndRankProducts(
            List<FinancialProduct> allProducts,
            ProductRecommendationRequest request,
            List<String> relevantDocuments) {
        
        // 간단한 키워드 매칭으로 상품 필터링 및 순위 결정
        List<FinancialProduct> filtered = new ArrayList<>();
        
        String searchQuery = buildSearchQuery(request).toLowerCase();
        
        for (FinancialProduct product : allProducts) {
            int score = calculateProductScore(product, searchQuery, request);
            
            if (score > 0) {
                // score를 기반으로 정렬하기 위해 임시로 저장 (실제로는 별도 DTO 사용 권장)
                filtered.add(product);
            }
        }
        
        // 최대 5개 상품 추천
        return filtered.stream()
                .limit(5)
                .collect(Collectors.toList());
    }
    
    private int calculateProductScore(FinancialProduct product, String searchQuery, 
                                    ProductRecommendationRequest request) {
        int score = 0;
        
        String productInfo = (product.getProductName() + " " + 
                            product.getProductType() + " " + 
                            product.getProductFeatures() + " " +
                            product.getTargetCustomers()).toLowerCase();
        
        // 키워드 매칭 점수
        if (searchQuery.contains("적금") && productInfo.contains("적금")) {
            score += 10;
        }
        
        if (searchQuery.contains("예금") && productInfo.contains("예금")) {
            score += 10;
        }
        
        if (searchQuery.contains("투자") && (productInfo.contains("투자") || productInfo.contains("펀드"))) {
            score += 10;
        }
        
        if (searchQuery.contains("대출") && productInfo.contains("대출")) {
            score += 10;
        }
        
        // 위험성향 매칭
        if (searchQuery.contains("안전") && productInfo.contains("적금")) {
            score += 5;
        }
        
        if (searchQuery.contains("적극") && productInfo.contains("투자")) {
            score += 5;
        }
        
        return score;
    }
    
    private String generateRecommendationReason(
            ProductRecommendationRequest request,
            List<FinancialProduct> products,
            List<String> relevantDocuments) {
        
        try {
            StringBuilder prompt = new StringBuilder();
            prompt.append("고객 정보: ").append(request.getCustomerInfo()).append("\n\n");
            
            prompt.append("고객 답변:\n");
            for (ProductRecommendationRequest.QuestionAnswer answer : request.getAnswers()) {
                prompt.append("Q: ").append(answer.getQuestion()).append("\n");
                prompt.append("A: ").append(answer.getAnswer()).append("\n\n");
            }
            
            prompt.append("추천 상품:\n");
            for (FinancialProduct product : products) {
                prompt.append("- ").append(product.getProductName())
                      .append(" (").append(product.getProductType()).append(")\n");
            }
            
            prompt.append("\n위 정보를 바탕으로 왜 이 상품들을 추천하는지 친근하고 전문적인 톤으로 설명해주세요. ");
            prompt.append("고객의 답변과 상품의 특징을 연결해서 설명하고, 3-4문장으로 간결하게 작성해주세요.");
            
            return openAiService.generateQuestions(prompt.toString());
            
        } catch (Exception e) {
            log.error("추천 이유 생성 중 오류", e);
            return "고객님의 투자 성향과 목표를 고려하여 선별한 상품들입니다. " +
                   "안정적인 수익과 리스크 관리를 균형있게 고려한 추천입니다.";
        }
    }
    
    private List<FinancialProduct> getDefaultRecommendations(ProductRecommendationRequest request) {
        // 기본 추천: 적금 상품들 위주로
        return financialProductRepository.findAll().stream()
                .filter(p -> p.getProductType().contains("적금"))
                .limit(3)
                .collect(Collectors.toList());
    }
}
