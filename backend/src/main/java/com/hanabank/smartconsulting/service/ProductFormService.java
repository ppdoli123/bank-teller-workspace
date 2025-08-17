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

    public List<ProductFormDto> getAllActiveForms() {
        return productFormRepository.findByIsActive(true)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductFormDto> getFormsByTypeDto(String formType) {
        return productFormRepository.findByFormTypeAndIsActive(formType, true)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public String generateFilledForm(Long formId, Long productId) {
        ProductForm form = productFormRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("서식을 찾을 수 없습니다."));
        
        FinancialProduct product = financialProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        return fillFormTemplate(form.getFormTemplate(), product);
    }

    private String fillFormTemplate(String template, FinancialProduct product) {
        String filledTemplate = template;
        
        // 상품 정보로 템플릿 채우기
        filledTemplate = filledTemplate.replace("{{상품명}}", product.getProductName() != null ? product.getProductName() : "");
        filledTemplate = filledTemplate.replace("{{상품타입}}", product.getProductType() != null ? product.getProductType() : "");
        filledTemplate = filledTemplate.replace("{{기본금리}}", product.getInterestRate() != null ? product.getInterestRate() : "");
        filledTemplate = filledTemplate.replace("{{우대금리}}", product.getPreferentialRate() != null ? product.getPreferentialRate() : "");
        filledTemplate = filledTemplate.replace("{{가입조건}}", product.getEligibilityRequirements() != null ? product.getEligibilityRequirements() : "");
        filledTemplate = filledTemplate.replace("{{특징}}", product.getProductFeatures() != null ? product.getProductFeatures() : "");
        filledTemplate = filledTemplate.replace("{{가입금액}}", product.getDepositAmount() != null ? product.getDepositAmount() : "");
        filledTemplate = filledTemplate.replace("{{가입기간}}", product.getDepositPeriod() != null ? product.getDepositPeriod() : "");
        filledTemplate = filledTemplate.replace("{{세제혜택}}", product.getTaxBenefits() != null ? product.getTaxBenefits() : "");
        filledTemplate = filledTemplate.replace("{{유의사항}}", product.getNotes() != null ? product.getNotes() : "");
        
        return filledTemplate;
    }

    private ProductFormDto convertToDto(ProductForm form) {
        return ProductFormDto.builder()
                .id(form.getId())
                .formType(form.getFormType())
                .formName(form.getFormName())
                .formTemplate(form.getFormTemplate())
                .requiredFields(form.getRequiredFields())
                .description(form.getDescription())
                .isActive(form.getIsActive())
                .build();
    }

    // Entity 직접 반환하는 메소드들 추가
    public List<ProductForm> getFormsByType(String formType) {
        return productFormRepository.findByFormTypeAndIsActive(formType, true);
    }

    public List<ProductForm> getAllForms() {
        return productFormRepository.findByIsActive(true);
    }

    public ProductForm getFormById(Long id) {
        return productFormRepository.findById(id).orElse(null);
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
        
        List<ProductForm> processForms = productFormRepository.findByFormTypeAndIsActive("적금", true);
        
        // 프로세스 순서에 맞게 정렬 (formName 기준으로)
        return processForms.stream()
                .sorted((f1, f2) -> {
                    String[] order = {"상품설명서", "실명확인", "적금신청서", "자동이체신청서", "세무신고서"};
                    int index1 = getFormOrder(f1.getFormName(), order);
                    int index2 = getFormOrder(f2.getFormName(), order);
                    return Integer.compare(index1, index2);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 특정 상품의 문서들(약관, 설명서) 조회
     */
    public List<ProductForm> getProductDocuments(String productName) {
        return productFormRepository.findByFormTypeAndIsActive("적금", true)
                .stream()
                .filter(form -> form.getFormName().contains("상품설명서") || 
                               form.getFormName().contains("약관") ||
                               form.getFormName().contains("가입설명서"))
                .collect(Collectors.toList());
    }
    
    private int getFormOrder(String formName, String[] order) {
        for (int i = 0; i < order.length; i++) {
            if (formName.contains(order[i])) {
                return i;
            }
        }
        return Integer.MAX_VALUE; // 순서에 없는 서식은 맨 뒤로
    }
    
    /**
     * 컨트롤러에서 사용하는 프로세스 서식 조회 메소드
     */
    public List<ProductForm> getProcessForms(String productName) {
        if (productName.contains("적금")) {
            return getSavingsProcessForms(productName);
        }
        // 다른 상품 타입들도 추가 가능
        return getAllForms();
    }
}
