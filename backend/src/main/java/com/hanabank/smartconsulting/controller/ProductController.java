package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String type) {
        
        log.info("상품 조회 요청 - page: {}, limit: {}, type: {}", page, limit, type);
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            if (type != null && !type.isEmpty()) {
                List<FinancialProduct> products = productService.getProductsByType(type);
                response.put("products", products);
                response.put("total", products.size());
                response.put("page", 0);
                response.put("totalPages", 1);
            } else if (limit > 100) {
                // limit이 큰 경우 전체 조회
                List<FinancialProduct> products = productService.getAllProducts();
                response.put("products", products);
                response.put("total", products.size());
                response.put("page", 0);
                response.put("totalPages", 1);
            } else {
                Page<FinancialProduct> productPage = productService.getAllProducts(page, limit);
                response.put("products", productPage.getContent());
                response.put("total", productPage.getTotalElements());
                response.put("page", productPage.getNumber());
                response.put("totalPages", productPage.getTotalPages());
            }
            
            return ResponseEntity.ok(ApiResponse.success("상품 조회 성공", response));
        } catch (Exception e) {
            log.error("상품 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 조회 중 오류가 발생했습니다.")
            );
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialProduct>> getProduct(@PathVariable Long id) {
        log.info("상품 상세 조회 요청: {}", id);
        
        Optional<FinancialProduct> product = productService.getProductById(id);
        
        if (product.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("상품 조회 성공", product.get()));
        } else {
            return ResponseEntity.status(404).body(
                ApiResponse.error("상품을 찾을 수 없습니다.")
            );
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("상품 검색 요청 - keyword: {}, page: {}, size: {}", keyword, page, size);
        
        try {
            Page<FinancialProduct> productPage = productService.searchProducts(keyword, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("products", productPage.getContent());
            response.put("total", productPage.getTotalElements());
            response.put("page", productPage.getNumber());
            response.put("totalPages", productPage.getTotalPages());
            
            return ResponseEntity.ok(ApiResponse.success("상품 검색 성공", response));
        } catch (Exception e) {
            log.error("상품 검색 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 검색 중 오류가 발생했습니다.")
            );
        }
    }
    
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<String>>> getProductTypes() {
        log.info("상품 타입 조회 요청");
        
        try {
            List<String> productTypes = productService.getAllProductTypes();
            return ResponseEntity.ok(ApiResponse.success("상품 타입 조회 성공", productTypes));
        } catch (Exception e) {
            log.error("상품 타입 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 타입 조회 중 오류가 발생했습니다.")
            );
        }
    }
}
