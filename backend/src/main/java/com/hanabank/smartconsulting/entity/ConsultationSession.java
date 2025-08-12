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
@Table(name = "consultation_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id", unique = true, nullable = false)
    private String sessionId;
    
    @Column(name = "employee_id")
    private String employeeId;
    
    @Column(name = "customer_name")
    private String customerName;
    
    @Column(name = "customer_phone")
    private String customerPhone;
    
    @Column(name = "customer_age")
    private Integer customerAge;
    
    @Column(name = "customer_income")
    private Long customerIncome;
    
    @Column(name = "customer_assets")
    private Long customerAssets;
    
    @Column(name = "investment_goal")
    private String investmentGoal;
    
    @Column(name = "risk_tolerance")
    private String riskTolerance;
    
    @Column(name = "investment_period")
    private Integer investmentPeriod;
    
    @Column(columnDefinition = "TEXT DEFAULT 'active'")
    private String status;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
