package com.hanabank.smartconsulting.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiQuestionRequest {
    @NotBlank
    private String customerId;           // 내부 고객 식별자

    @Size(max = 2000)
    private String employeeNotes;        // 행원이 자유롭게 입력한 요구/메모

    @Size(max = 4000)
    private String customerSnapshotJson; // 기본 고객 정보 스냅샷(JSON 문자열)
}


