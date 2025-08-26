package com.hanabank.smartconsulting.dto;

import com.hanabank.smartconsulting.entity.FinancialProduct;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationResponse {
    
    private List<FinancialProduct> recommendedProducts;
    private String recommendationReason;
    private String searchQuery;
    private int totalProducts;
    private boolean success;
    private String message;
}

