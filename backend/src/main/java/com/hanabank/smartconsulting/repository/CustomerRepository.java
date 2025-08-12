package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByCustomerId(String customerId);
    
    Optional<Customer> findByName(String name);
    
    Optional<Customer> findByIdNumber(String idNumber);
    
    boolean existsByCustomerId(String customerId);
}
