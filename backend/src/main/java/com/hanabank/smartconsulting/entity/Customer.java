package com.hanabank.smartconsulting.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    
    @Id
    @Column(name = "customerid", unique = true, nullable = false)
    private String customerId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "age")
    private Integer age;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "idnumber")
    private String idNumber;
    
    @Column(name = "income")
    private Long income;
    
    @Column(name = "assets")
    private Long assets;
    
    @Column(name = "investmentgoal")
    private String investmentGoal;
    
    @Column(name = "risktolerance")
    private String riskTolerance;
    
    @Column(name = "investmentperiod")
    private Integer investmentPeriod;
    
    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<CustomerProduct> customerProducts;
}
