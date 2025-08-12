package com.hanabank.smartconsulting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "customer_id")
    private Customer customer;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "product_type")
    private String productType;
    
    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Long balance;
    
    @Column(name = "monthly_payment", columnDefinition = "INTEGER DEFAULT 0")
    private Long monthlyPayment;
    
    @Column(name = "interest_rate", columnDefinition = "REAL DEFAULT 0")
    private Double interestRate;
    
    @Column(name = "start_date")
    private String startDate;
    
    @Column(name = "maturity_date")
    private String maturityDate;
    
    @Column(columnDefinition = "TEXT DEFAULT 'active'")
    private String status;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
