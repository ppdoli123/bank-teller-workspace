package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class FormController {

    @GetMapping("/test")
    public String test() {
        System.out.println("🎯 FormController /test 엔드포인트 호출됨!");
        return "FormController 테스트 성공! 🎉";
    }

    @GetMapping("/byType")
    public ResponseEntity<ApiResponse<?>> getFormsByType(@RequestParam String type) {
        System.out.println("📋 서식 조회 요청 - type: " + type);
        return ResponseEntity.ok(ApiResponse.success("서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2")));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<?>> getAllForms() {
        System.out.println("📋 모든 서식 조회 요청");
        return ResponseEntity.ok(ApiResponse.success("모든 서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2", "테스트 서식 3")));
    }

    @GetMapping("/byProductType/{productType}")
    public ResponseEntity<ApiResponse<?>> getFormsByProductType(@PathVariable String productType) {
        System.out.println("📋 상품 타입별 서식 조회 요청 - productType: " + productType);
        return ResponseEntity.ok(ApiResponse.success("상품 타입별 서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2")));
    }

    @GetMapping("/byProductId/{productId}")
    public ResponseEntity<ApiResponse<?>> getFormsByProductId(@PathVariable String productId) {
        System.out.println("📋 상품 ID별 서식 조회 요청 - productId: " + productId);
        return ResponseEntity.ok(ApiResponse.success("상품 ID별 서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2")));
    }

    @GetMapping("/process/savings")
    public ResponseEntity<ApiResponse<?>> getSavingsProcessForms(@RequestParam String productName) {
        System.out.println("📋 적금 프로세스 서식 조회 요청 - productName: " + productName);
        return ResponseEntity.ok(ApiResponse.success("적금 프로세스 서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2")));
    }

    @GetMapping("/process/deposit")
    public ResponseEntity<ApiResponse<?>> getDepositProcessForms(@RequestParam String productName) {
        System.out.println("📋 예금 프로세스 서식 조회 요청 - productName: " + productName);
        return ResponseEntity.ok(ApiResponse.success("예금 프로세스 서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2")));
    }

    @GetMapping("/process/loan")
    public ResponseEntity<ApiResponse<?>> getLoanProcessForms(@RequestParam String productName) {
        System.out.println("📋 대출 프로세스 서식 조회 요청 - productName: " + productName);
        return ResponseEntity.ok(ApiResponse.success("대출 프로세스 서식 조회 성공 (임시)", List.of("테스트 서식 1", "테스트 서식 2")));
    }
}
