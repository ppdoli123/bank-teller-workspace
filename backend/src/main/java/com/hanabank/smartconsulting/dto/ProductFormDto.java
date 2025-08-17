package com.hanabank.smartconsulting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFormDto {
    private Long id;
    private String formType;
    private String formName;
    private String formTemplate;
    private String requiredFields;
    private String description;
    private Boolean isActive;
}
