package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/consultation")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ConsultationController {
    
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createSession(@RequestBody Map<String, Object> request) {
        try {
            String employeeId = (String) request.get("employeeId");
            String customerId = (String) request.get("customerId");
            
            log.info("상담 세션 생성 요청 - employeeId: {}, customerId: {}", employeeId, customerId);
            
            // 세션 ID 생성 (간단한 구현)
            String sessionId = "session_" + employeeId + "_" + customerId + "_" + System.currentTimeMillis();
            
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("sessionId", sessionId);
            sessionData.put("employeeId", employeeId);
            sessionData.put("customerId", customerId);
            sessionData.put("createdAt", LocalDateTime.now());
            sessionData.put("status", "active");
            
            return ResponseEntity.ok(ApiResponse.success("상담 세션이 생성되었습니다.", sessionData));
            
        } catch (Exception e) {
            log.error("상담 세션 생성 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상담 세션 생성에 실패했습니다.")
            );
        }
    }
    
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSession(@PathVariable String sessionId) {
        try {
            log.info("상담 세션 조회 요청 - sessionId: {}", sessionId);
            
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("sessionId", sessionId);
            sessionData.put("status", "active");
            sessionData.put("createdAt", LocalDateTime.now());
            
            return ResponseEntity.ok(ApiResponse.success("상담 세션 조회 성공", sessionData));
            
        } catch (Exception e) {
            log.error("상담 세션 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상담 세션 조회에 실패했습니다.")
            );
        }
    }
    
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<String>> endSession(@PathVariable String sessionId) {
        try {
            log.info("상담 세션 종료 요청 - sessionId: {}", sessionId);
            
            return ResponseEntity.ok(ApiResponse.success("상담 세션이 종료되었습니다.", sessionId));
            
        } catch (Exception e) {
            log.error("상담 세션 종료 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("상담 세션 종료에 실패했습니다.")
            );
        }
    }
}
