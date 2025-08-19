package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.repository.ProductFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FormController {

    @Autowired
    private ProductFormRepository productFormRepository;

    @GetMapping("/product-forms/test")
    public String test() {
        System.out.println("🎯 FormController /test 엔드포인트 호출됨!");
        return "FormController 테스트 성공! 🎉";
    }

    @GetMapping("/product-forms/byType")
    public ResponseEntity<ApiResponse<?>> getFormsByType(@RequestParam String type) {
        try {
            System.out.println("📋 서식 조회 요청 - type: " + type);
            
            List<ProductForm> forms = productFormRepository.findByFormTypeAndIsActive(type, true);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/product-forms/all")
    public ResponseEntity<ApiResponse<?>> getAllForms() {
        try {
            System.out.println("📋 모든 서식 조회 요청");
            List<ProductForm> forms = productFormRepository.findByIsActive(true);
            System.out.println("✅ 전체 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("모든 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 모든 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("서식 조회 실패: " + e.getMessage()));
        }
    }
}
