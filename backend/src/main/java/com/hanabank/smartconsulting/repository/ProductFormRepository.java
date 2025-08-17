package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.ProductForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFormRepository extends JpaRepository<ProductForm, Long> {
    List<ProductForm> findByFormTypeAndIsActive(String formType, Boolean isActive);
    List<ProductForm> findByIsActive(Boolean isActive);
}
