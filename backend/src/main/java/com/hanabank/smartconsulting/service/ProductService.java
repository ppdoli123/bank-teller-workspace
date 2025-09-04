package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.entity.ProductRate;
import com.hanabank.smartconsulting.entity.LoanRate;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import com.hanabank.smartconsulting.repository.ProductRateRepository;
import com.hanabank.smartconsulting.repository.LoanRateRepository;
import com.hanabank.smartconsulting.repository.ProductFormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    
    private final FinancialProductRepository financialProductRepository;
    private final ProductRateRepository productRateRepository;
    private final LoanRateRepository loanRateRepository;
    private final ProductFormRepository productFormRepository;
    private final JdbcTemplate jdbcTemplate;
    
    public Page<FinancialProduct> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return financialProductRepository.findAll(pageable);
    }
    
    public List<FinancialProduct> getAllProducts() {
        return financialProductRepository.findAll();
    }
    
    public Optional<FinancialProduct> getProductById(String productId) {
        try {
            String sql = "SELECT * FROM product WHERE productid = ?";
            List<FinancialProduct> products = jdbcTemplate.query(sql, new Object[]{productId}, new RowMapper<FinancialProduct>() {
                @Override
                public FinancialProduct mapRow(ResultSet rs, int rowNum) throws SQLException {
                    FinancialProduct product = new FinancialProduct();
                    product.setProductId(rs.getString("productid"));
                    product.setProductName(rs.getString("productname"));
                    product.setProductType(rs.getString("producttype"));
                    product.setBaseRate(rs.getBigDecimal("baserate"));
                    product.setMinAmount(rs.getBigDecimal("minamount"));
                    product.setMaxAmount(rs.getBigDecimal("maxamount"));
                    product.setDescription(rs.getString("description"));
                    product.setLaunchDate(rs.getDate("launchdate") != null ? rs.getDate("launchdate").toLocalDate() : null);
                    product.setSalesStatus(rs.getString("salesstatus"));
                    return product;
                }
            });
            
            return products.isEmpty() ? Optional.empty() : Optional.of(products.get(0));
        } catch (Exception e) {
            log.error("상품 조회 중 오류 발생: {}", e.getMessage(), e);
            return Optional.empty();
        }
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

    /**
     * 상품 가입 시 필요한 EForm 목록 조회 (DB 기반)
     * 1. 상품 타입별 공통 서식
     * 2. 상품별 특정 서식
     */
    public List<Map<String, Object>> getProductForms(String productId, String productType) {
        // 결과를 formId 기준으로 중복 제거하며 보존
        Map<String, Map<String, Object>> formIdToMap = new HashMap<>();

        // 1) 타입별 공통 서식
        try {
            productFormRepository.findByProductType(productType).forEach(form -> {
                Map<String, Object> formMap = new HashMap<>();
                formMap.put("formId", form.getFormId());
                formMap.put("formName", form.getFormName());
                formMap.put("formType", form.getFormType());
                formMap.put("formTemplatePath", form.getFormTemplatePath());
                formMap.put("formSchema", form.getFormSchema());
                formMap.put("description", form.getDescription());
                formMap.put("versionNumber", form.getVersionNumber());
                formMap.put("isCommon", true);
                formIdToMap.put(form.getFormId(), formMap);
            });
        } catch (Exception e) {
            log.warn("공통 서식 조회 중 오류: {}", e.getMessage());
        }

        // 2) 상품별 특정 서식
        try {
            productFormRepository.findByProductId(productId).forEach(form -> {
                Map<String, Object> formMap = new HashMap<>();
                formMap.put("formId", form.getFormId());
                formMap.put("formName", form.getFormName());
                formMap.put("formType", form.getFormType());
                formMap.put("formTemplatePath", form.getFormTemplatePath());
                formMap.put("formSchema", form.getFormSchema());
                formMap.put("description", form.getDescription());
                formMap.put("versionNumber", form.getVersionNumber());
                formMap.put("isCommon", false);
                formIdToMap.put(form.getFormId(), formMap);
            });
        } catch (Exception e) {
            log.warn("상품별 서식 조회 중 오류: {}", e.getMessage());
        }

        return new ArrayList<>(formIdToMap.values());
    }
}


