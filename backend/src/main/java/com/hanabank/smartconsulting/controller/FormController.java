package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.service.ProductFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://192.168.123.9:3000", "http://192.168.123.9:3001"})
@RequiredArgsConstructor
public class FormController {

    private final ProductFormService productFormService;

    @GetMapping("/test")
    public String test() {
        System.out.println("🎯 FormController /test 엔드포인트 호출됨!");
        return "FormController 테스트 성공! 🎉";
    }

    @GetMapping("/byType")
    public ResponseEntity<ApiResponse<?>> getFormsByType(@RequestParam String type) {
        try {
            System.out.println("📋 서식 조회 요청 - type: " + type);
            
            List<ProductForm> forms = productFormService.getFormsByType(type);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<?>> getAllForms() {
        try {
            System.out.println("📋 모든 서식 조회 요청");
            List<ProductForm> forms = productFormService.getAllForms();
            System.out.println("✅ 전체 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("모든 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 모든 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/byProductType/{productType}")
    public ResponseEntity<ApiResponse<?>> getFormsByProductType(@PathVariable String productType) {
        try {
            System.out.println("📋 상품 타입별 서식 조회 요청 - productType: " + productType);
            
            List<ProductForm> forms = productFormService.getFormsByProductType(productType);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("상품 타입별 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 상품 타입별 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("상품 타입별 서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/byProductId/{productId}")
    public ResponseEntity<ApiResponse<?>> getFormsByProductId(@PathVariable String productId) {
        try {
            System.out.println("📋 상품 ID별 서식 조회 요청 - productId: " + productId);
            
            List<ProductForm> forms = productFormService.getFormsByProductId(productId);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("상품 ID별 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 상품 ID별 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("상품 ID별 서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/process/savings")
    public ResponseEntity<ApiResponse<?>> getSavingsProcessForms(@RequestParam String productName) {
        try {
            System.out.println("📋 적금 프로세스 서식 조회 요청 - productName: " + productName);
            
            List<ProductForm> forms = productFormService.getSavingsProcessForms(productName);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("적금 프로세스 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 적금 프로세스 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("적금 프로세스 서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/process/deposit")
    public ResponseEntity<ApiResponse<?>> getDepositProcessForms(@RequestParam String productName) {
        try {
            System.out.println("📋 예금 프로세스 서식 조회 요청 - productName: " + productName);
            
            List<ProductForm> forms = productFormService.getDepositProcessForms(productName);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("예금 프로세스 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 예금 프로세스 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("예금 프로세스 서식 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/process/loan")
    public ResponseEntity<ApiResponse<?>> getLoanProcessForms(@RequestParam String productName) {
        try {
            System.out.println("📋 대출 프로세스 서식 조회 요청 - productName: " + productName);
            
            List<ProductForm> forms = productFormService.getLoanProcessForms(productName);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("대출 프로세스 서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 대출 프로세스 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("대출 프로세스 서식 조회 실패: " + e.getMessage()));
        }
    }
}
