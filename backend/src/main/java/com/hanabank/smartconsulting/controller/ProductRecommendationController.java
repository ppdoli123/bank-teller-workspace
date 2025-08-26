package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ProductRecommendationRequest;
import com.hanabank.smartconsulting.dto.ProductRecommendationResponse;
import com.hanabank.smartconsulting.service.ProductRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ProductRecommendationController {
    
    private final ProductRecommendationService productRecommendationService;
    
    @PostMapping("/products")
    public ResponseEntity<ProductRecommendationResponse> recommendProducts(
            @RequestBody ProductRecommendationRequest request) {
        
        log.info("상품 추천 요청: 고객 ID={}", request.getCustomerId());
        
        try {
            ProductRecommendationResponse response = productRecommendationService.recommendProducts(request);
            
            // 성공 플래그 설정
            response.setSuccess(true);
            response.setMessage("상품 추천이 완료되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("상품 추천 중 오류 발생", e);
            
            ProductRecommendationResponse errorResponse = ProductRecommendationResponse.builder()
                    .success(false)
                    .message("상품 추천 중 오류가 발생했습니다: " + e.getMessage())
                    .totalProducts(0)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("상품 추천 API가 정상적으로 작동합니다!");
    }
}

