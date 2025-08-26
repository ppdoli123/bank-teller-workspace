package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {
    
    Optional<ConsultationSession> findBySessionId(String sessionId);
    
    List<ConsultationSession> findByEmployeeId(String employeeId);
    
    List<ConsultationSession> findByStatus(String status);
    
    List<ConsultationSession> findByEmployeeIdAndStatus(String employeeId, String status);
}


