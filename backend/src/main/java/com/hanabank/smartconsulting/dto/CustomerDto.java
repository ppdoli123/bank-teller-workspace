package com.hanabank.smartconsulting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    
    private Long id;
    private String customerId;
    private String name;
    private String phone;
    private Integer age;
    private String address;
    private String idNumber;
    private Long income;
    private Long assets;
    private String investmentGoal;
    private String riskTolerance;
    private Integer investmentPeriod;
}


