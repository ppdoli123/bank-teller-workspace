package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class HealthController {
    
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        try {
            Map<String, Object> healthInfo = new HashMap<>();
            healthInfo.put("status", "healthy");
            healthInfo.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            healthInfo.put("service", "Hana Smart Consulting System");
            healthInfo.put("version", "2.0.0");
            healthInfo.put("database", "connected");
            
            return ResponseEntity.ok(ApiResponse.success("서비스가 정상적으로 동작중입니다.", healthInfo));
        } catch (Exception e) {
            log.error("헬스체크 중 오류 발생", e);
            
            Map<String, Object> healthInfo = new HashMap<>();
            healthInfo.put("status", "unhealthy");
            healthInfo.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            healthInfo.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(
                ApiResponse.error("서비스에 문제가 발생했습니다.", healthInfo.toString())
            );
        }
    }
}
