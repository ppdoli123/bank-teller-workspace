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
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @Column(name = "employeeid", unique = true, nullable = false)
    private String employeeId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "passwordhash", nullable = false)
    private String passwordHash;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "position")
    private String position;
    
    @CreationTimestamp
    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updatedat")
    private LocalDateTime updatedAt;
}
