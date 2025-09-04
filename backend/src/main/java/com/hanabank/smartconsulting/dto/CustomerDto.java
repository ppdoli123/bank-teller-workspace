package com.hanabank.smartconsulting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.hanabank.smartconsulting.dto.CustomerProductDto;
import com.hanabank.smartconsulting.dto.CustomerProductSummaryDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class CustomerDto {
    
    private String customerId;
    private String name;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String address;
    private String gender;
    private LocalDateTime registrationDate;
    
    // 급여통장 여부
    private Boolean salaryAccount;
    
    // 포트폴리오 시각화를 위한 필드들
    private BigDecimal totalAssets;
    private BigDecimal monthlyIncome;
    private String investmentGoal;
    private String riskTolerance;
    private Integer investmentPeriod;
    private String portfolioAllocation;
    private Integer financialHealthScore;
    private LocalDateTime lastPortfolioUpdate;
    
    // 계산된 필드들 (UI 편의용)
    private Integer age; // dateOfBirth로부터 계산
    private String phone; // contactNumber의 별칭
    
    // 고객 보유 상품 정보
    @JsonProperty("products")
    private List<CustomerProductDto> products = new ArrayList<>();
    
    // 상품 요약 정보
    @JsonProperty("productSummary")
    private CustomerProductSummaryDto productSummary = new CustomerProductSummaryDto();
    
    // Getter and Setter methods for products
    public List<CustomerProductDto> getProducts() {
        return products;
    }
    
    public void setProducts(List<CustomerProductDto> products) {
        this.products = products;
    }
    
    // Getter and Setter methods for productSummary
    public CustomerProductSummaryDto getProductSummary() {
        return productSummary;
    }
    
    public void setProductSummary(CustomerProductSummaryDto productSummary) {
        this.productSummary = productSummary;
    }
}


