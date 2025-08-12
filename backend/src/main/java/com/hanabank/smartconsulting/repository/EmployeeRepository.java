package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmployeeId(String employeeId);
    
    boolean existsByEmployeeId(String employeeId);
}
