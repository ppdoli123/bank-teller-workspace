package com.hanabank.smartconsulting.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customerproduct")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customerproductid")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerid", referencedColumnName = "customerid")
    @JsonBackReference
    private Customer customer;
    
    @Column(name = "productname", nullable = false)
    private String productName;
    
    @Column(name = "producttype")
    private String productType;
    
    @Column(name = "balance", columnDefinition = "INTEGER DEFAULT 0")
    private Long balance;
    
    @Column(name = "monthlypayment", columnDefinition = "INTEGER DEFAULT 0")
    private Long monthlyPayment;
    
    @Column(name = "interestrate", columnDefinition = "REAL DEFAULT 0")
    private Double interestRate;
    
    @Column(name = "startdate")
    private String startDate;
    
    @Column(name = "maturitydate")
    private String maturityDate;
    
    @Column(name = "status", columnDefinition = "TEXT DEFAULT 'active'")
    private String status;
    
    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
}
