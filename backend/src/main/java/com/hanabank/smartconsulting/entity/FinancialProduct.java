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
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialProduct {
    
    @Id
    @Column(name = "productid", nullable = false)
    private String productId;
    
    @Column(name = "productname", nullable = false)
    private String productName;
    
    @Column(name = "producttype")
    private String productType;
    
    @Column(name = "productfeatures", columnDefinition = "TEXT")
    private String productFeatures;
    
    @Column(name = "targetcustomers", columnDefinition = "TEXT")
    private String targetCustomers;
    
    @Column(name = "eligibilityrequirements", columnDefinition = "TEXT")
    private String eligibilityRequirements;
    
    @Column(name = "depositamount")
    private String depositAmount;
    
    @Column(name = "depositperiod")
    private String depositPeriod;
    
    @Column(name = "interestrate")
    private String interestRate;
    
    @Column(name = "preferentialrate")
    private String preferentialRate;
    
    @Column(name = "taxbenefits", columnDefinition = "TEXT")
    private String taxBenefits;
    
    @Column(name = "withdrawalconditions", columnDefinition = "TEXT")
    private String withdrawalConditions;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "depositprotection")
    private String depositProtection;
    
    @Column(name = "interestratetable", columnDefinition = "TEXT")
    private String interestRateTable;
    
    @Column(name = "productguidepath")
    private String productGuidePath;
    
    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}
