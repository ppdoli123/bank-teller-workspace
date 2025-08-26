package com.hanabank.smartconsulting.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationRequest {
    
    private String customerId;
    private String customerInfo;
    private List<QuestionAnswer> answers;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionAnswer {
        private String category;
        private String question;
        private String answer;
        private String priority;
    }
}

