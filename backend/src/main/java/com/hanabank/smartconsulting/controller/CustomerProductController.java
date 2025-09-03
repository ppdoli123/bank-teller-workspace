package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.service.CustomerProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class CustomerProductController {

    @Autowired
    private CustomerProductService customerProductService;

    @GetMapping("/customers/{customerId}/products")
    public ResponseEntity<Map<String, Object>> getCustomerProducts(@PathVariable String customerId) {
        try {
            var products = customerProductService.getCustomerProducts(customerId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products,
                "message", "고객 상품 정보 조회 성공"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "고객 상품 정보 조회 실패: " + e.getMessage()
            ));
        }
    }
}
