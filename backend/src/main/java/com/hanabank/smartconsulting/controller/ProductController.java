package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 상품 API 테스트 엔드포인트
     */
    @GetMapping("/api-test")
    public ResponseEntity<ApiResponse<String>> testEndpoint() {
        log.info("상품 API 테스트 요청");
        return ResponseEntity.ok(ApiResponse.success("상품 API가 정상적으로 작동합니다.", "OK"));
    }

    /**
     * 모든 상품 카테고리 조회
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCategories() {
        log.info("상품 카테고리 조회 요청");
        try {
            String sql = "SELECT * FROM bank_teller_product_categories ORDER BY category_name";
            List<Map<String, Object>> categories = jdbcTemplate.queryForList(sql);
            log.info("카테고리 조회 결과: {} 개", categories.size());
            return ResponseEntity.ok(ApiResponse.success("상품 카테고리 조회 성공", categories));
        } catch (Exception e) {
            log.error("상품 카테고리 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 카테고리 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 모든 상품 조회
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String searchKeyword) {
        log.info("상품 조회 요청 - categoryId: {}, searchKeyword: {}", categoryId, searchKeyword);
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT p.*, pc.category_name ");
            sql.append("FROM bank_teller_products p ");
            sql.append("LEFT JOIN bank_teller_product_categories pc ON p.category_id = pc.category_id ");
            sql.append("WHERE p.is_active = 'Y' ");

            if (categoryId != null && !categoryId.isEmpty()) {
                sql.append("AND p.category_id = ? ");
            }
            if (searchKeyword != null && !searchKeyword.isEmpty()) {
                sql.append("AND (p.product_name LIKE ? OR p.product_features LIKE ?) ");
            }
            sql.append("ORDER BY p.product_name");

            List<Map<String, Object>> products;
            if (categoryId != null && !categoryId.isEmpty() && searchKeyword != null && !searchKeyword.isEmpty()) {
                products = jdbcTemplate.queryForList(sql.toString(), 
                    categoryId, "%" + searchKeyword + "%", "%" + searchKeyword + "%");
            } else if (categoryId != null && !categoryId.isEmpty()) {
                products = jdbcTemplate.queryForList(sql.toString(), categoryId);
            } else if (searchKeyword != null && !searchKeyword.isEmpty()) {
                products = jdbcTemplate.queryForList(sql.toString(), 
                    "%" + searchKeyword + "%", "%" + searchKeyword + "%");
            } else {
                products = jdbcTemplate.queryForList(sql.toString());
            }

            return ResponseEntity.ok(ApiResponse.success("상품 조회 성공", products));
        } catch (Exception e) {
            log.error("상품 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상품 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 상품 상세 정보 조회
     */
    @GetMapping("/{productId}")
    public ApiResponse<Map<String, Object>> getProductDetail(@PathVariable String productId) {
        log.info("상품 상세 정보 조회 요청 - productId: {}", productId);
        try {
            // 기본 상품 정보 조회
            String productSql = "SELECT p.*, pc.category_name " +
                               "FROM bank_teller_products p " +
                               "LEFT JOIN bank_teller_product_categories pc ON p.category_id = pc.category_id " +
                               "WHERE p.product_id = ? AND p.is_active = 'Y'";
            
            List<Map<String, Object>> products = jdbcTemplate.queryForList(productSql, productId);
            if (products.isEmpty()) {
                return ApiResponse.error("상품을 찾을 수 없습니다.");
            }

            Map<String, Object> product = products.get(0);

            // 금리 정보 조회
            String ratesSql = "SELECT * FROM bank_teller_product_rates WHERE product_id = ? ORDER BY period";
            List<Map<String, Object>> rates = jdbcTemplate.queryForList(ratesSql, productId);
            product.put("rates", rates);

            // 상세 정보 조회
            String detailsSql = "SELECT field_name, field_value, field_order " +
                               "FROM bank_teller_product_details " +
                               "WHERE product_id = ? ORDER BY field_order";
            List<Map<String, Object>> details = jdbcTemplate.queryForList(detailsSql, productId);
            product.put("details", details);

            return ApiResponse.success("상품 상세 정보 조회 성공", product);
        } catch (Exception e) {
            log.error("상품 상세 정보 조회 중 오류 발생", e);
            return ApiResponse.error("상품 상세 정보 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 상품 요약 정보 조회 (뷰 사용)
     */
    @GetMapping("/summary")
    public ApiResponse<List<Map<String, Object>>> getProductSummary() {
        log.info("상품 요약 정보 조회 요청");
        try {
            String sql = "SELECT * FROM bank_teller_product_summary WHERE is_active = 'Y' ORDER BY product_name";
            List<Map<String, Object>> products = jdbcTemplate.queryForList(sql);
            return ApiResponse.success("상품 요약 정보 조회 성공", products);
        } catch (Exception e) {
            log.error("상품 요약 정보 조회 중 오류 발생", e);
            return ApiResponse.error("상품 요약 정보 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 최신 금리 정보 조회 (뷰 사용)
     */
    @GetMapping("/latest-rates")
    public ApiResponse<List<Map<String, Object>>> getLatestRates() {
        log.info("최신 금리 정보 조회 요청");
        try {
            String sql = "SELECT * FROM bank_teller_latest_rates ORDER BY product_name";
            List<Map<String, Object>> rates = jdbcTemplate.queryForList(sql);
            return ApiResponse.success("최신 금리 정보 조회 성공", rates);
        } catch (Exception e) {
            log.error("최신 금리 정보 조회 중 오류 발생", e);
            return ApiResponse.error("최신 금리 정보 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 카테고리별 상품 수 조회
     */
    @GetMapping("/categories/count")
    public ApiResponse<List<Map<String, Object>>> getProductCountByCategory() {
        log.info("카테고리별 상품 수 조회 요청");
        try {
            String sql = "SELECT pc.category_name, COUNT(p.product_id) as product_count " +
                         "FROM bank_teller_product_categories pc " +
                         "LEFT JOIN bank_teller_products p ON pc.category_id = p.category_id AND p.is_active = 'Y' " +
                         "GROUP BY pc.category_id, pc.category_name " +
                         "ORDER BY pc.category_name";
            List<Map<String, Object>> counts = jdbcTemplate.queryForList(sql);
            return ApiResponse.success("카테고리별 상품 수 조회 성공", counts);
        } catch (Exception e) {
            log.error("카테고리별 상품 수 조회 중 오류 발생", e);
            return ApiResponse.error("카테고리별 상품 수 조회 중 오류가 발생했습니다.");
        }
    }
}


