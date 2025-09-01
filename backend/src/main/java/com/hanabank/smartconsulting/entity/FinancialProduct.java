package com.hanabank.smartconsulting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "launchdate")
    private LocalDate launchDate;
    
    @Column(name = "salesstatus")
    private String salesStatus;
    
    @Column(name = "minamount", precision = 15, scale = 2)
    private BigDecimal minAmount;
    
    @Column(name = "maxamount", precision = 15, scale = 2)
    private BigDecimal maxAmount;
    
    @Column(name = "baserate", precision = 5, scale = 2)
    private BigDecimal baseRate;
}
