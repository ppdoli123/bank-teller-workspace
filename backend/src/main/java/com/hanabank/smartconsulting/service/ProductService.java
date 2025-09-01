package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.entity.ProductRate;
import com.hanabank.smartconsulting.entity.LoanRate;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import com.hanabank.smartconsulting.repository.ProductRateRepository;
import com.hanabank.smartconsulting.repository.LoanRateRepository;
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
    private final ProductRateRepository productRateRepository;
    private final LoanRateRepository loanRateRepository;
    
    public Page<FinancialProduct> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return financialProductRepository.findAll(pageable);
    }
    
    public List<FinancialProduct> getAllProducts() {
        return financialProductRepository.findAll();
    }
    
    public Optional<FinancialProduct> getProductById(String productId) {
        return financialProductRepository.findById(productId);
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
    
    public void deleteProduct(String productId) {
        financialProductRepository.deleteById(productId);
    }
    
    // ProductRate 관련 메서드
    public List<ProductRate> getProductRates(String productId) {
        return productRateRepository.findByProductId(productId);
    }
    
    public List<ProductRate> getProductRatesByPeriod(String productId, String period) {
        return productRateRepository.findByProductIdAndPeriod(productId, period);
    }
    
    // LoanRate 관련 메서드
    public List<LoanRate> getLoanRates(String productId) {
        return loanRateRepository.findByProductId(productId);
    }
    
    public List<LoanRate> getLoanRatesByType(String productId, String rateType) {
        return loanRateRepository.findByProductIdAndRateType(productId, rateType);
    }
}


