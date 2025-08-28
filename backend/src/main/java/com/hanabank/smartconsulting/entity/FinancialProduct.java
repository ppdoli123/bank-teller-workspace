package com.hanabank.smartconsulting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bank_teller_financial_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "product_type")
    private String productType;
    
    @Column(name = "product_features", columnDefinition = "TEXT")
    private String productFeatures;
    
    @Column(name = "target_customers", columnDefinition = "TEXT")
    private String targetCustomers;
    
    @Column(name = "eligibility_requirements", columnDefinition = "TEXT")
    private String eligibilityRequirements;
    
    @Column(name = "deposit_amount")
    private String depositAmount;
    
    @Column(name = "deposit_period")
    private String depositPeriod;
    
    @Column(name = "interest_rate")
    private String interestRate;
    
    @Column(name = "preferential_rate")
    private String preferentialRate;
    
    @Column(name = "tax_benefits", columnDefinition = "TEXT")
    private String taxBenefits;
    
    @Column(name = "withdrawal_conditions", columnDefinition = "TEXT")
    private String withdrawalConditions;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "deposit_protection")
    private String depositProtection;
    
    @Column(name = "interest_rate_table", columnDefinition = "TEXT")
    private String interestRateTable;
    
    @Column(name = "product_guide_path")
    private String productGuidePath;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
