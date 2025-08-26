package com.hanabank.smartconsulting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    
    private boolean success;
    private String message;
    private String token;
    private EmployeeDto employee;
    private String sessionId;  // WebSocket 세션 ID 추가
}


