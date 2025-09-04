package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.dto.CustomerDto;
import com.hanabank.smartconsulting.dto.CustomerProductDto;
import com.hanabank.smartconsulting.dto.CustomerProductSummaryDto;
import com.hanabank.smartconsulting.entity.Customer;
import com.hanabank.smartconsulting.entity.CustomerProduct;
import com.hanabank.smartconsulting.repository.CustomerProductRepository;
import com.hanabank.smartconsulting.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerProductRepository customerProductRepository;
    
    // Repository 접근을 위한 getter 메서드
    public CustomerRepository getCustomerRepository() {
        return customerRepository;
    }
    
    public Optional<CustomerDto> getCustomerById(String customerId) {
        log.info("고객 정보 조회 시작: {}", customerId);
        
                        return customerRepository.findByCustomerId(customerId)
                .map(customer -> {
                    log.info("고객 정보 찾음: {}", customer.getName());
                    CustomerDto customerDto = convertToDto(customer);
                    
                    // 고객 보유 상품 정보 조회
                    log.info("고객 상품 정보 조회 시작");
                    try {
                        List<CustomerProduct> products = customerProductRepository.findByCustomerCustomerId(customerId);
                        log.info("조회된 상품 수: {}", products.size());
                        
                        List<CustomerProductDto> productDtos = products.stream()
                                .map(this::convertToProductDto)
                                .toList();
                        customerDto.setProducts(productDtos);
                        log.info("상품 DTO 설정 완료: {}", productDtos.size());
                        
                        // 상품 요약 정보 조회
                        log.info("상품 요약 정보 조회 시작");
                        Map<String, Object> summary = getCustomerProductSummary(customerId);
                        CustomerProductSummaryDto summaryDto = CustomerProductSummaryDto.builder()
                                .totalAssets((Long) summary.get("totalAssets"))
                                .totalDebts((Long) summary.get("totalDebts"))
                                .netAssets((Long) summary.get("netAssets"))
                                .totalProducts(productDtos.size())
                                .totalDepositProducts((Integer) summary.get("totalDepositProducts"))
                                .totalLoanProducts((Integer) summary.get("totalLoanProducts"))
                                .totalInvestmentProducts((Integer) summary.get("totalInvestmentProducts"))
                                .averageInterestRate((Double) summary.get("averageInterestRate"))
                                .totalMonthlyPayment((Long) summary.get("totalMonthlyPayment"))
                                .build();
                        customerDto.setProductSummary(summaryDto);
                        log.info("상품 요약 DTO 설정 완료: {}", summaryDto);
                        
                        log.info("고객 정보 조회 완료: 상품 {}개, 총자산: {}", productDtos.size(), summaryDto.getTotalAssets());
                        log.info("최종 CustomerDto: products={}, summary={}", customerDto.getProducts(), customerDto.getProductSummary());
                    } catch (Exception e) {
                        log.error("상품 정보 조회 중 오류 발생: {}", e.getMessage(), e);
                        // 기본값 설정
                        customerDto.setProducts(new ArrayList<>());
                        customerDto.setProductSummary(CustomerProductSummaryDto.builder()
                                .totalAssets(0L)
                                .totalDebts(0L)
                                .netAssets(0L)
                                .totalProducts(0)
                                .totalDepositProducts(0)
                                .totalLoanProducts(0)
                                .totalInvestmentProducts(0)
                                .averageInterestRate(0.0)
                                .totalMonthlyPayment(0L)
                                .build());
                    }
                    
                    return customerDto;
                });
    }
    
    public Optional<CustomerDto> getCustomerByName(String name) {
        return customerRepository.findByName(name)
                .map(this::convertToDto);
    }
    
    public Optional<CustomerDto> getCustomerByContactNumber(String contactNumber) {
        return customerRepository.findByContactNumber(contactNumber)
                .map(this::convertToDto);
    }
    
    public List<CustomerDto> getAllCustomers() {
        try {
            log.info("모든 고객 조회 시작");
            
            // 기본 findAll 메서드로 조회
            List<Customer> customers = customerRepository.findAll();
            log.info("DB에서 조회된 고객 수: {}", customers.size());
            
            if (customers.isEmpty()) {
                log.info("고객이 없습니다. 빈 리스트 반환");
                return new ArrayList<>();
            }
            
            List<CustomerDto> customerDtos = new ArrayList<>();
            int successCount = 0;
            int errorCount = 0;
            
            for (Customer customer : customers) {
                try {
                    log.debug("고객 {} 변환 시작", customer.getCustomerId());
                    
                    // 기본 정보만 변환 (상품 정보 제외)
                    CustomerDto dto = new CustomerDto();
                    dto.setCustomerId(customer.getCustomerId());
                    dto.setName(customer.getName());
                    dto.setDateOfBirth(customer.getDateOfBirth());
                    dto.setContactNumber(customer.getContactNumber());
                    dto.setAddress(customer.getAddress());
                    dto.setGender(customer.getGender());
                    dto.setRegistrationDate(customer.getRegistrationDate());
                    
                    // 계산된 필드들
                    dto.setPhone(customer.getContactNumber()); // 별칭
                    if (customer.getDateOfBirth() != null) {
                        dto.setAge(java.time.Period.between(customer.getDateOfBirth(), java.time.LocalDate.now()).getYears());
                    }
                    
                    // 상품 정보는 빈 값으로 설정
                    dto.setProducts(new ArrayList<>());
                    dto.setProductSummary(CustomerProductSummaryDto.builder()
                            .totalAssets(0L)
                            .totalDebts(0L)
                            .netAssets(0L)
                            .totalProducts(0)
                            .totalDepositProducts(0)
                            .totalLoanProducts(0)
                            .totalInvestmentProducts(0)
                            .averageInterestRate(0.0)
                            .totalMonthlyPayment(0L)
                            .build());
                    
                    customerDtos.add(dto);
                    successCount++;
                    log.debug("고객 {} 변환 성공", customer.getCustomerId());
                    
                } catch (Exception e) {
                    errorCount++;
                    log.error("고객 {} 변환 중 오류: {} - {}", customer.getCustomerId(), e.getClass().getSimpleName(), e.getMessage());
                    // 오류가 발생한 고객은 건너뛰고 계속 진행
                    continue;
                }
            }
            
            log.info("고객 목록 조회 완료: 성공 {}개, 오류 {}개, 총 {}개", successCount, errorCount, customerDtos.size());
            return customerDtos;
            
        } catch (Exception e) {
            log.error("모든 고객 조회 중 치명적 오류 발생: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("고객 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    public List<CustomerProduct> getCustomerProducts(String customerId) {
        log.info("고객 상품 조회 시작: {}", customerId);
        List<CustomerProduct> products = customerProductRepository.findByCustomerCustomerId(customerId);
        log.info("조회된 상품 수: {}", products.size());
        if (products.isEmpty()) {
            log.warn("고객 {}에 대한 상품이 없습니다", customerId);
        } else {
            products.forEach(product -> log.info("상품: {} - {}", product.getProductName(), product.getProductType()));
        }
        return products;
    }
    
    public Map<String, Object> getCustomerProductSummary(String customerId) {
        Long totalAssets = customerProductRepository.getTotalAssetsByCustomerId(customerId);
        Long totalDebts = customerProductRepository.getTotalDebtsByCustomerId(customerId);
        Long netAssets = totalAssets - totalDebts;
        
        // 상품별 통계 계산
        List<CustomerProduct> products = customerProductRepository.findByCustomerCustomerId(customerId);
        
        int totalDepositProducts = 0;
        int totalLoanProducts = 0;
        int totalInvestmentProducts = 0;
        double totalInterestRate = 0.0;
        long totalMonthlyPayment = 0L;
        int validInterestRateCount = 0;
        
        for (CustomerProduct product : products) {
            if (product.getProductType() != null) {
                if (product.getProductType().contains("적금") || product.getProductType().contains("예금")) {
                    totalDepositProducts++;
                } else if (product.getProductType().contains("대출")) {
                    totalLoanProducts++;
                } else if (product.getProductType().contains("펀드") || product.getProductType().contains("투자")) {
                    totalInvestmentProducts++;
                }
            }
            
            if (product.getInterestRate() != null) {
                totalInterestRate += product.getInterestRate();
                validInterestRateCount++;
            }
            
            if (product.getMonthlyPayment() != null) {
                totalMonthlyPayment += product.getMonthlyPayment();
            }
        }
        
        double averageInterestRate = validInterestRateCount > 0 ? totalInterestRate / validInterestRateCount : 0.0;
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAssets", totalAssets != null ? totalAssets : 0L);
        summary.put("totalDebts", totalDebts != null ? totalDebts : 0L);
        summary.put("netAssets", netAssets);
        summary.put("totalDepositProducts", totalDepositProducts);
        summary.put("totalLoanProducts", totalLoanProducts);
        summary.put("totalInvestmentProducts", totalInvestmentProducts);
        summary.put("averageInterestRate", Math.round(averageInterestRate * 100.0) / 100.0);
        summary.put("totalMonthlyPayment", totalMonthlyPayment);
        
        return summary;
    }
    
    public CustomerDto saveCustomer(CustomerDto customerDto) {
        Customer customer = convertToEntity(customerDto);
        Customer savedCustomer = customerRepository.save(customer);
        return convertToDto(savedCustomer);
    }
    
    private CustomerDto convertToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setCustomerId(customer.getCustomerId());
        dto.setName(customer.getName());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setContactNumber(customer.getContactNumber());
        dto.setAddress(customer.getAddress());
        dto.setGender(customer.getGender());
        dto.setRegistrationDate(customer.getRegistrationDate());
        dto.setSalaryAccount(customer.getSalaryAccount());
        
        // 포트폴리오 시각화 필드들
        dto.setTotalAssets(customer.getTotalAssets());
        dto.setMonthlyIncome(customer.getMonthlyIncome());
        dto.setInvestmentGoal(customer.getInvestmentGoal());
        dto.setRiskTolerance(customer.getRiskTolerance());
        dto.setInvestmentPeriod(customer.getInvestmentPeriod());
        dto.setPortfolioAllocation(customer.getPortfolioAllocation());
        dto.setFinancialHealthScore(customer.getFinancialHealthScore());
        dto.setLastPortfolioUpdate(customer.getLastPortfolioUpdate());
        
        // 계산된 필드들
        dto.setPhone(customer.getContactNumber()); // 별칭
        if (customer.getDateOfBirth() != null) {
            dto.setAge(java.time.Period.between(customer.getDateOfBirth(), java.time.LocalDate.now()).getYears());
        }
        
        return dto;
    }
    
    private Customer convertToEntity(CustomerDto customerDto) {
        Customer customer = new Customer();
        customer.setCustomerId(customerDto.getCustomerId());
        customer.setName(customerDto.getName());
        customer.setDateOfBirth(customerDto.getDateOfBirth());
        customer.setContactNumber(customerDto.getContactNumber());
        customer.setAddress(customerDto.getAddress());
        customer.setGender(customerDto.getGender());
        customer.setRegistrationDate(customerDto.getRegistrationDate());
        // salaryAccount는 @Transient 필드이므로 설정하지 않음
        return customer;
    }
    
    private CustomerProductDto convertToProductDto(CustomerProduct customerProduct) {
        return CustomerProductDto.builder()
                .id(customerProduct.getId())
                .customerId(customerProduct.getCustomerId())
                .productName(customerProduct.getProductName())
                .productType(customerProduct.getProductType())
                .balance(customerProduct.getBalance())
                .monthlyPayment(customerProduct.getMonthlyPayment())
                .interestRate(customerProduct.getInterestRate())
                .startDate(customerProduct.getStartDate())
                .maturityDate(customerProduct.getMaturityDate())
                .status(customerProduct.getStatus())
                .createdAt(customerProduct.getCreatedAt())
                .accountNumber(customerProduct.getAccountNumber())
                .enrollmentDate(customerProduct.getEnrollmentDate())
                .description(customerProduct.getDescription())
                .productId(customerProduct.getProductId())
                .build();
    }
}


