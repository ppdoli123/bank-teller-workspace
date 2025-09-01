package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.ProductRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRateRepository extends JpaRepository<ProductRate, String> {
    
    List<ProductRate> findByProductId(String productId);
    
    @Query("SELECT pr FROM ProductRate pr WHERE pr.productId = :productId ORDER BY pr.period")
    List<ProductRate> findByProductIdOrderByPeriod(@Param("productId") String productId);
    
    @Query("SELECT pr FROM ProductRate pr WHERE pr.productId = :productId AND pr.period = :period")
    List<ProductRate> findByProductIdAndPeriod(@Param("productId") String productId, @Param("period") String period);
}
