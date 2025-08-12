package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.dto.CustomerDto;
import com.hanabank.smartconsulting.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ocr")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class OcrController {
    
    private final CustomerService customerService;
    
    @PostMapping("/id-card")
    public ResponseEntity<ApiResponse<CustomerDto>> processIdCard(@RequestParam("idCard") MultipartFile file) {
        log.info("신분증 OCR 처리 요청 - 파일명: {}", file.getOriginalFilename());
        
        try {
            // 실제 OCR 처리 대신 테스트용 고객 데이터 반환
            // 파일명이나 다른 조건에 따라 다른 고객 반환 가능
            String fileName = file.getOriginalFilename();
            String testCustomerId = determineTestCustomerId(fileName);
            
            Optional<CustomerDto> customer = customerService.getCustomerById(testCustomerId);
            
            if (customer.isPresent()) {
                log.info("OCR 처리 성공 - 고객: {}", customer.get().getName());
                return ResponseEntity.ok(ApiResponse.success("신분증 인식 성공", customer.get()));
            } else {
                log.warn("OCR 처리 실패 - 등록되지 않은 고객");
                return ResponseEntity.status(404).body(
                    ApiResponse.error("등록되지 않은 고객입니다.")
                );
            }
        } catch (Exception e) {
            log.error("OCR 처리 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("신분증 인식 중 오류가 발생했습니다.")
            );
        }
    }
    
    @GetMapping("/test-customers")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getTestCustomers() {
        log.info("테스트 고객 목록 조회 요청");
        
        try {
            List<String> testCustomerIds = Arrays.asList("C001", "C002", "C003", "C004", "C005");
            List<CustomerDto> testCustomers = testCustomerIds.stream()
                .map(customerService::getCustomerById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
            
            return ResponseEntity.ok(ApiResponse.success("테스트 고객 목록 조회 성공", testCustomers));
        } catch (Exception e) {
            log.error("테스트 고객 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("테스트 고객 목록 조회 중 오류가 발생했습니다.")
            );
        }
    }
    
    private String determineTestCustomerId(String fileName) {
        // 파일명에 따라 다른 테스트 고객 ID 반환
        if (fileName != null) {
            if (fileName.contains("kim") || fileName.contains("김")) return "C001";
            if (fileName.contains("lee") || fileName.contains("이")) return "C002";
            if (fileName.contains("park") || fileName.contains("박")) return "C003";
            if (fileName.contains("choi") || fileName.contains("최")) return "C004";
            if (fileName.contains("jung") || fileName.contains("정")) return "C005";
        }
        
        // 기본값으로 첫 번째 테스트 고객 반환
        return "C001";
    }
}
