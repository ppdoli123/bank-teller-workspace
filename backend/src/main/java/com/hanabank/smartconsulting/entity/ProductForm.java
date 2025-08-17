package com.hanabank.smartconsulting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_forms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductForm {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String formType; // 예금, 대출, 적금 등
    
    @Column(nullable = false)
    private String formName; // 서식명
    
    @Column(columnDefinition = "TEXT")
    private String formTemplate; // 서식 HTML 템플릿
    
    @Column(columnDefinition = "TEXT")
    private String requiredFields; // 필요한 필드들 JSON 형태
    
    @Column
    private String description; // 서식 설명
    
    @Column
    private Boolean isActive = true; // 활성화 여부
}
