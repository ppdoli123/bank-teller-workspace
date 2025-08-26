package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.Customer;
import com.hanabank.smartconsulting.entity.CustomerProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerProductRepository extends JpaRepository<CustomerProduct, Long> {
    
    List<CustomerProduct> findByCustomer(Customer customer);
    
    @Query("SELECT cp FROM CustomerProduct cp WHERE cp.customer.customerId = :customerId")
    List<CustomerProduct> findByCustomerCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT COALESCE(SUM(cp.balance), 0) FROM CustomerProduct cp WHERE cp.customer.customerId = :customerId AND cp.balance > 0")
    Long getTotalAssetsByCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT COALESCE(SUM(ABS(cp.balance)), 0) FROM CustomerProduct cp WHERE cp.customer.customerId = :customerId AND cp.balance < 0")
    Long getTotalDebtsByCustomerId(@Param("customerId") String customerId);
}


