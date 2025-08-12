package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    
    private final FinancialProductRepository financialProductRepository;
    
    public Page<FinancialProduct> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return financialProductRepository.findAll(pageable);
    }
    
    public List<FinancialProduct> getAllProducts() {
        return financialProductRepository.findAll();
    }
    
    public Optional<FinancialProduct> getProductById(Long id) {
        return financialProductRepository.findById(id);
    }
    
    public List<FinancialProduct> getProductsByType(String productType) {
        return financialProductRepository.findByProductType(productType);
    }
    
    public Page<FinancialProduct> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return financialProductRepository.findByKeyword(keyword, pageable);
    }
    
    public List<String> getAllProductTypes() {
        return financialProductRepository.findAllProductTypes();
    }
    
    public FinancialProduct saveProduct(FinancialProduct product) {
        return financialProductRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        financialProductRepository.deleteById(id);
    }
}
