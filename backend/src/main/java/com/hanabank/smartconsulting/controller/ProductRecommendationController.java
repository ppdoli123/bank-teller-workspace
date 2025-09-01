package com.hanabank.smartconsulting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProductRecommendationController {
    
    @PostMapping("/products")
    public ResponseEntity<String> recommendProducts(@RequestBody String request) {
        System.out.println("상품 추천 요청 (임시): " + request);
        return ResponseEntity.ok("상품 추천이 완료되었습니다! (임시 구현)");
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("상품 추천 API가 정상적으로 작동합니다!");
    }
}

