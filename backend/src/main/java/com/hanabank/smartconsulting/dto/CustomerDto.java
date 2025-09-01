package com.hanabank.smartconsulting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    
    private String customerId;
    private String name;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String address;
    private String gender;
    private LocalDateTime registrationDate;
    
    // 계산된 필드들 (UI 편의용)
    private Integer age; // dateOfBirth로부터 계산
    private String phone; // contactNumber의 별칭
}


