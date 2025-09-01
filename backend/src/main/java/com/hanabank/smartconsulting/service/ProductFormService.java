package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.dto.ProductFormDto;
import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import com.hanabank.smartconsulting.repository.ProductFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductFormService {

    @Autowired
    private ProductFormRepository productFormRepository;

    @Autowired
    private FinancialProductRepository financialProductRepository;

    public List<ProductFormDto> getAllFormsDto() {
        return productFormRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductFormDto> getFormsByTypeDto(String formType) {
        return productFormRepository.findByFormType(formType)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public String generateFilledForm(String formId, String productId) {
        ProductForm form = productFormRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("서식을 찾을 수 없습니다."));
        
        FinancialProduct product = financialProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        return fillFormTemplate(form.getFormTemplatePath(), product);
    }

    private String fillFormTemplate(String templatePath, FinancialProduct product) {
        // 실제 구현에서는 템플릿 파일을 읽어서 처리
        String filledTemplate = "상품명: " + product.getProductName() + "\n";
        filledTemplate += "상품타입: " + product.getProductType() + "\n";
        filledTemplate += "기본금리: " + product.getInterestRate() + "\n";
        filledTemplate += "우대금리: " + product.getPreferentialRate() + "\n";
        filledTemplate += "가입조건: " + product.getEligibilityRequirements() + "\n";
        filledTemplate += "특징: " + product.getProductFeatures() + "\n";
        filledTemplate += "가입금액: " + product.getDepositAmount() + "\n";
        filledTemplate += "가입기간: " + product.getDepositPeriod() + "\n";
        filledTemplate += "세제혜택: " + product.getTaxBenefits() + "\n";
        filledTemplate += "유의사항: " + product.getNotes() + "\n";
        
        return filledTemplate;
    }

    private ProductFormDto convertToDto(ProductForm form) {
        return ProductFormDto.builder()
                .id(form.getFormId())
                .formType(form.getFormType())
                .formName(form.getFormName())
                .formTemplate(form.getFormTemplatePath())
                .description(form.getDescription())
                .build();
    }

    // Entity 직접 반환하는 메소드들
    public List<ProductForm> getFormsByType(String formType) {
        return productFormRepository.findByFormType(formType);
    }

    public List<ProductForm> getAllForms() {
        return productFormRepository.findAll();
    }

    public ProductForm getFormById(String formId) {
        return productFormRepository.findById(formId).orElse(null);
    }

    // ProductType으로 서식 조회
    public List<ProductForm> getFormsByProductType(String productType) {
        return productFormRepository.findByProductType(productType);
    }

    // ProductId로 서식 조회
    public List<ProductForm> getFormsByProductId(String productId) {
        return productFormRepository.findByProductId(productId);
    }

    // ProductType 또는 ProductId로 서식 조회
    public List<ProductForm> getFormsByProductTypeOrProductId(String productType, String productId) {
        return productFormRepository.findByProductTypeOrProductId(productType, productId);
    }

    // FormType과 ProductType/ProductId로 서식 조회
    public List<ProductForm> getFormsByFormTypeAndProductTypeOrProductId(String formType, String productType, String productId) {
        return productFormRepository.findByFormTypeAndProductTypeOrProductId(formType, productType, productId);
    }

    /**
     * 적금 가입 프로세스에 필요한 서식들을 순서대로 반환
     */
    public List<ProductForm> getSavingsProcessForms(String productName) {
        // 적금 가입 프로세스 순서:
        // 1. 상품설명서/약관
        // 2. 실명확인
        // 3. 적금신청서
        // 4. 자동이체신청서
        // 5. 세무신고서
        return productFormRepository.findByFormType("적금");
    }

    /**
     * 예금 가입 프로세스에 필요한 서식들을 순서대로 반환
     */
    public List<ProductForm> getDepositProcessForms(String productName) {
        // 예금 가입 프로세스 순서:
        // 1. 상품설명서/약관
        // 2. 실명확인
        // 3. 예금신청서
        // 4. 자동이체신청서
        return productFormRepository.findByFormType("예금");
    }

    /**
     * 대출 신청 프로세스에 필요한 서식들을 순서대로 반환
     */
    public List<ProductForm> getLoanProcessForms(String productName) {
        // 대출 신청 프로세스 순서:
        // 1. 상품설명서/약관
        // 2. 실명확인
        // 3. 대출신청서
        // 4. 소득증빙서류
        // 5. 담보서류
        return productFormRepository.findByFormType("대출");
    }
}
