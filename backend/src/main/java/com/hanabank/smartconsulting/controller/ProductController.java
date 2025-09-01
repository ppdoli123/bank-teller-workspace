package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.entity.ProductRate;
import com.hanabank.smartconsulting.entity.LoanRate;
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

@Slf4j
@RestController
@RequestMapping("/api/employee/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 상품 API 테스트 엔드포인트
     */
    @GetMapping("/api-test")
    public ResponseEntity<ApiResponse<String>> testEndpoint() {
        log.info("상품 API 테스트 요청");
        return ResponseEntity.ok(ApiResponse.success("상품 API가 정상적으로 작동합니다.", "OK"));
    }

    /**
     * 모든 상품 조회 (페이징)
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Page<FinancialProduct>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("상품 조회 요청 - page: {}, size: {}", page, size);
        try {
            Page<FinancialProduct> products = productService.getAllProducts(page, size);
            return ResponseEntity.ok(ApiResponse.success("상품 조회 성공", products));
        } catch (Exception e) {
            log.error("상품 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 모든 상품 조회 (전체)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FinancialProduct>>> getAllProductsList() {
        log.info("전체 상품 조회 요청");
        try {
            List<FinancialProduct> products = productService.getAllProducts();
            return ResponseEntity.ok(ApiResponse.success("전체 상품 조회 성공", products));
        } catch (Exception e) {
            log.error("전체 상품 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("전체 상품 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 상품 타입별 조회
     */
    @GetMapping("/type/{productType}")
    public ResponseEntity<ApiResponse<List<FinancialProduct>>> getProductsByType(
            @PathVariable String productType) {
        log.info("상품 타입별 조회 요청 - productType: {}", productType);
        try {
            List<FinancialProduct> products = productService.getProductsByType(productType);
            return ResponseEntity.ok(ApiResponse.success("상품 타입별 조회 성공", products));
        } catch (Exception e) {
            log.error("상품 타입별 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 타입별 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 상품 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FinancialProduct>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("상품 검색 요청 - keyword: {}, page: {}, size: {}", keyword, page, size);
        try {
            Page<FinancialProduct> products = productService.searchProducts(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("상품 검색 성공", products));
        } catch (Exception e) {
            log.error("상품 검색 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 검색 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 상품 상세 정보 조회
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductDetail(@PathVariable String productId) {
        log.info("상품 상세 정보 조회 요청 - productId: {}", productId);
        try {
            Optional<FinancialProduct> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                    ApiResponse.error("상품을 찾을 수 없습니다.")
                );
            }

            FinancialProduct product = productOpt.get();
            Map<String, Object> result = new HashMap<>();
            result.put("product", product);

            // 상품 타입에 따라 금리 정보 추가
            if ("예금".equals(product.getProductType()) || "적금".equals(product.getProductType())) {
                List<ProductRate> productRates = productService.getProductRates(productId);
                result.put("rates", productRates);
            } else if ("대출".equals(product.getProductType())) {
                List<LoanRate> loanRates = productService.getLoanRates(productId);
                result.put("rates", loanRates);
            }

            return ResponseEntity.ok(ApiResponse.success("상품 상세 정보 조회 성공", result));
        } catch (Exception e) {
            log.error("상품 상세 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 상세 정보 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 상품 금리 정보 조회 (예금/적금)
     */
    @GetMapping("/{productId}/rates")
    public ResponseEntity<ApiResponse<List<ProductRate>>> getProductRates(@PathVariable String productId) {
        log.info("상품 금리 정보 조회 요청 - productId: {}", productId);
        try {
            List<ProductRate> rates = productService.getProductRates(productId);
            return ResponseEntity.ok(ApiResponse.success("상품 금리 정보 조회 성공", rates));
        } catch (Exception e) {
            log.error("상품 금리 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 금리 정보 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 대출 금리 정보 조회
     */
    @GetMapping("/{productId}/loan-rates")
    public ResponseEntity<ApiResponse<List<LoanRate>>> getLoanRates(@PathVariable String productId) {
        log.info("대출 금리 정보 조회 요청 - productId: {}", productId);
        try {
            List<LoanRate> rates = productService.getLoanRates(productId);
            return ResponseEntity.ok(ApiResponse.success("대출 금리 정보 조회 성공", rates));
        } catch (Exception e) {
            log.error("대출 금리 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("대출 금리 정보 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 모든 상품 타입 조회
     */
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<String>>> getAllProductTypes() {
        log.info("모든 상품 타입 조회 요청");
        try {
            List<String> types = productService.getAllProductTypes();
            return ResponseEntity.ok(ApiResponse.success("상품 타입 조회 성공", types));
        } catch (Exception e) {
            log.error("상품 타입 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 타입 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 상품 가입 시 필요한 EForm 목록 조회
     */
    @GetMapping("/{productId}/forms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductForms(@PathVariable String productId) {
        log.info("상품 가입 시 필요한 EForm 목록 조회 요청 - productId: {}", productId);
        try {
            Optional<FinancialProduct> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                    ApiResponse.error("상품을 찾을 수 없습니다.")
                );
            }

            FinancialProduct product = productOpt.get();
            Map<String, Object> result = new HashMap<>();
            result.put("product", product);

            // 상품 타입에 따른 공통 서식 + 상품별 특정 서식 조회
            List<Map<String, Object>> forms = productService.getProductForms(productId, product.getProductType());
            result.put("forms", forms);

            return ResponseEntity.ok(ApiResponse.success("상품 가입 시 필요한 EForm 목록 조회 성공", result));
        } catch (Exception e) {
            log.error("상품 가입 시 필요한 EForm 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 가입 시 필요한 EForm 목록 조회 중 오류가 발생했습니다.")
            );
        }
    }
}


