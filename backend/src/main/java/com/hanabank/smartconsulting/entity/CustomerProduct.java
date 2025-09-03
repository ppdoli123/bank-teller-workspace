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
    
    // 고객 ID를 직접 접근할 수 있도록 추가
    @Transient
    public String getCustomerId() {
        return customer != null ? customer.getCustomerId() : null;
    }
    
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
    
    // 계좌번호 필드 추가
    @Column(name = "accountnumber")
    private String accountNumber;
    
    // 가입일 필드 추가
    @Column(name = "enrollmentdate")
    private String enrollmentDate;
    
    // 상품 설명 필드 추가
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    // Product ID 필드 추가
    @Column(name = "productid")
    private String productId;
}
