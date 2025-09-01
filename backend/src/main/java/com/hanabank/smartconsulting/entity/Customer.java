package com.hanabank.smartconsulting.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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
    
    @Column(name = "dateofbirth")
    private LocalDate dateOfBirth;
    
    @Column(name = "contactnumber")
    private String contactNumber;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "registrationdate")
    private LocalDateTime registrationDate;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<CustomerProduct> customerProducts;
}
