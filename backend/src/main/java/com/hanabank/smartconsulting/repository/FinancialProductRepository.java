package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.FinancialProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialProductRepository extends JpaRepository<FinancialProduct, String> {
    
    List<FinancialProduct> findByProductType(String productType);
    
    @Query("SELECT fp FROM FinancialProduct fp WHERE " +
           "LOWER(fp.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(fp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<FinancialProduct> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT DISTINCT fp.productType FROM FinancialProduct fp WHERE fp.productType IS NOT NULL")
    List<String> findAllProductTypes();
}


