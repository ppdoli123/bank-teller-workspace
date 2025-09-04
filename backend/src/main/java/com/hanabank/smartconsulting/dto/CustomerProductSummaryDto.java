package com.hanabank.smartconsulting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProductSummaryDto {
    
    private Long totalAssets = 0L;
    private Long totalDebts = 0L;
    private Long netAssets = 0L;
    private Integer totalProducts = 0;
    
    // 추가 정보
    private Integer totalDepositProducts = 0;  // 총 적금/예금 상품 수
    private Integer totalLoanProducts = 0;     // 총 대출 상품 수
    private Integer totalInvestmentProducts = 0; // 총 투자 상품 수
    private Double averageInterestRate = 0.0;   // 평균 이자율
    private Long totalMonthlyPayment = 0L;     // 총 월납입금
}
