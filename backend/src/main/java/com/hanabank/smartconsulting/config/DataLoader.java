package com.hanabank.smartconsulting.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hanabank.smartconsulting.entity.*;
import com.hanabank.smartconsulting.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {
    
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final CustomerProductRepository customerProductRepository;
    private final FinancialProductRepository financialProductRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void run(String... args) throws Exception {
        log.info("데이터 로더 시작...");
        
        // 기본 직원 데이터 생성
        initializeEmployees();
        
        // 테스트 고객 데이터 생성
        initializeCustomers();
        
        // 고객 보유 상품 데이터 생성
        initializeCustomerProducts();
        
        // 금융 상품 데이터 로드
        loadFinancialProducts();
        
        log.info("데이터 로더 완료");
    }
    
    private void initializeEmployees() {
        if (employeeRepository.count() == 0) {
            log.info("기본 직원 데이터 생성 중...");
            
            List<Employee> employees = List.of(
                Employee.builder()
                    .employeeId("admin")
                    .name("관리자")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .department("IT")
                    .position("시스템관리자")
                    .build(),
                Employee.builder()
                    .employeeId("1234")
                    .name("김직원")
                    .passwordHash(passwordEncoder.encode("1234"))
                    .department("영업부")
                    .position("대리")
                    .build(),
                Employee.builder()
                    .employeeId("1111")
                    .name("박상담사")
                    .passwordHash(passwordEncoder.encode("1111"))
                    .department("상담부")
                    .position("주임")
                    .build(),
                Employee.builder()
                    .employeeId("2222")
                    .name("이매니저")
                    .passwordHash(passwordEncoder.encode("2222"))
                    .department("영업부")
                    .position("과장")
                    .build()
            );
            
            employeeRepository.saveAll(employees);
            log.info("기본 직원 데이터 생성 완료: {} 명", employees.size());
        }
    }
    
    private void initializeCustomers() {
        if (customerRepository.count() == 0) {
            log.info("테스트 고객 데이터 생성 중...");
            
            List<Customer> customers = List.of(
                Customer.builder()
                    .customerId("C001")
                    .name("김철수")
                    .phone("010-1234-5678")
                    .age(35)
                    .address("서울시 강남구 역삼동")
                    .idNumber("850315-1******")
                    .income(50000000L)
                    .assets(100000000L)
                    .investmentGoal("주택 구매")
                    .riskTolerance("medium")
                    .investmentPeriod(60)
                    .build(),
                Customer.builder()
                    .customerId("C002")
                    .name("이영희")
                    .phone("010-2345-6789")
                    .age(28)
                    .address("서울시 서초구 서초동")
                    .idNumber("960712-2******")
                    .income(40000000L)
                    .assets(50000000L)
                    .investmentGoal("결혼 자금")
                    .riskTolerance("low")
                    .investmentPeriod(36)
                    .build(),
                Customer.builder()
                    .customerId("C003")
                    .name("박민수")
                    .phone("010-3456-7890")
                    .age(42)
                    .address("경기도 성남시 분당구")
                    .idNumber("820428-1******")
                    .income(80000000L)
                    .assets(200000000L)
                    .investmentGoal("자녀 교육비")
                    .riskTolerance("high")
                    .investmentPeriod(120)
                    .build(),
                Customer.builder()
                    .customerId("C004")
                    .name("최지연")
                    .phone("010-4567-8901")
                    .age(31)
                    .address("부산시 해운대구")
                    .idNumber("930825-2******")
                    .income(45000000L)
                    .assets(80000000L)
                    .investmentGoal("노후 준비")
                    .riskTolerance("medium")
                    .investmentPeriod(240)
                    .build(),
                Customer.builder()
                    .customerId("C005")
                    .name("정태호")
                    .phone("010-5678-9012")
                    .age(26)
                    .address("대구시 수성구")
                    .idNumber("980203-1******")
                    .income(35000000L)
                    .assets(30000000L)
                    .investmentGoal("창업 자금")
                    .riskTolerance("high")
                    .investmentPeriod(24)
                    .build()
            );
            
            customerRepository.saveAll(customers);
            log.info("테스트 고객 데이터 생성 완료: {} 명", customers.size());
        }
    }
    
    private void initializeCustomerProducts() {
        if (customerProductRepository.count() == 0) {
            log.info("고객 보유 상품 데이터 생성 중...");
            
            // 각 고객별로 보유 상품 생성
            createCustomerProductsForCustomer("C001", List.of(
                createCustomerProduct("하나 주거래 통장", "예금", 5000000L, 0L, 0.1, "2023-01-15", null),
                createCustomerProduct("하나 정기예금", "예금", 20000000L, 0L, 3.2, "2023-06-01", "2024-06-01"),
                createCustomerProduct("주택청약종합저축", "청약", 3600000L, 300000L, 1.8, "2022-03-10", null)
            ));
            
            createCustomerProductsForCustomer("C002", List.of(
                createCustomerProduct("하나 주거래 통장", "예금", 2500000L, 0L, 0.1, "2023-03-01", null),
                createCustomerProduct("내맘 적금", "적금", 4800000L, 200000L, 2.5, "2023-01-01", "2025-01-01"),
                createCustomerProduct("하나 카드론", "대출", -3000000L, -150000L, 15.9, "2023-08-15", "2025-08-15")
            ));
            
            createCustomerProductsForCustomer("C003", List.of(
                createCustomerProduct("하나 주거래 통장", "예금", 8000000L, 0L, 0.1, "2020-01-01", null),
                createCustomerProduct("하나 정기예금", "예금", 50000000L, 0L, 3.5, "2023-01-01", "2024-01-01"),
                createCustomerProduct("교육비 적금", "적금", 12000000L, 500000L, 2.8, "2022-01-01", "2025-01-01"),
                createCustomerProduct("하나 주택담보대출", "대출", -150000000L, -800000L, 4.2, "2021-05-01", "2041-05-01")
            ));
            
            createCustomerProductsForCustomer("C004", List.of(
                createCustomerProduct("하나 주거래 통장", "예금", 3500000L, 0L, 0.1, "2022-01-01", null),
                createCustomerProduct("연금저축", "적금", 8400000L, 300000L, 3.0, "2021-01-01", null),
                createCustomerProduct("IRP 개인형퇴직연금", "적금", 15000000L, 500000L, 2.5, "2020-03-01", null)
            ));
            
            createCustomerProductsForCustomer("C005", List.of(
                createCustomerProduct("하나 주거래 통장", "예금", 1200000L, 0L, 0.1, "2023-05-01", null),
                createCustomerProduct("청년희망적금", "적금", 2400000L, 200000L, 2.3, "2023-01-01", "2025-01-01"),
                createCustomerProduct("하나 신용대출", "대출", -5000000L, -250000L, 12.5, "2023-07-01", "2025-07-01")
            ));
            
            log.info("고객 보유 상품 데이터 생성 완료");
        }
    }
    
    private void createCustomerProductsForCustomer(String customerId, List<CustomerProduct> products) {
        Customer customer = customerRepository.findByCustomerId(customerId).orElse(null);
        if (customer != null) {
            products.forEach(product -> {
                product.setCustomer(customer);
                customerProductRepository.save(product);
            });
        }
    }
    
    private CustomerProduct createCustomerProduct(String productName, String productType, Long balance, 
                                                 Long monthlyPayment, Double interestRate, String startDate, String maturityDate) {
        return CustomerProduct.builder()
                .productName(productName)
                .productType(productType)
                .balance(balance)
                .monthlyPayment(monthlyPayment)
                .interestRate(interestRate)
                .startDate(startDate)
                .maturityDate(maturityDate)
                .status("active")
                .build();
    }
    
    private void loadFinancialProducts() {
        if (financialProductRepository.count() == 0) {
            log.info("금융 상품 데이터 로드 중...");
            
            try {
                ClassPathResource resource = new ClassPathResource("data/hana_products_with_pdf.json");
                InputStream inputStream = resource.getInputStream();
                
                JsonNode rootNode = objectMapper.readTree(inputStream);
                
                int count = 0;
                for (JsonNode productNode : rootNode) {
                    try {
                        String productName = getTextValue(productNode, "product_name");
                        
                        // product_name이 null이면 건너뛰기
                        if (productName == null || productName.trim().isEmpty()) {
                            log.warn("상품명이 없는 데이터 건너뛰기");
                            continue;
                        }
                        
                        FinancialProduct product = FinancialProduct.builder()
                                .productName(productName)
                                .productType(getTextValue(productNode, "product_type"))
                                .productFeatures(getTextValue(productNode, "product_features"))
                                .targetCustomers(getTextValue(productNode, "target_customers"))
                                .eligibilityRequirements(getTextValue(productNode, "eligibility_requirements"))
                                .depositAmount(getTextValue(productNode, "deposit_amount"))
                                .depositPeriod(getTextValue(productNode, "deposit_period"))
                                .interestRate(getTextValue(productNode, "interest_rate"))
                                .preferentialRate(getTextValue(productNode, "preferential_rate"))
                                .taxBenefits(getTextValue(productNode, "tax_benefits"))
                                .withdrawalConditions(getTextValue(productNode, "withdrawal_conditions"))
                                .notes(getTextValue(productNode, "notes"))
                                .depositProtection(getTextValue(productNode, "deposit_protection"))
                                .interestRateTable(getTextValue(productNode, "interest_rate_table"))
                                .productGuidePath(getTextValue(productNode, "product_guide_path"))
                                .build();
                        
                        financialProductRepository.save(product);
                        count++;
                    } catch (Exception e) {
                        log.warn("상품 데이터 처리 중 오류: {}", e.getMessage());
                    }
                }
                
                log.info("금융 상품 데이터 로드 완료: {} 개", count);
            } catch (Exception e) {
                log.error("금융 상품 데이터 로드 중 오류 발생", e);
            }
        }
    }
    
    private String getTextValue(JsonNode node, String fieldName) {
        JsonNode fieldNode = node.get(fieldName);
        if (fieldNode != null && !fieldNode.isNull()) {
            return fieldNode.asText();
        }
        return null;
    }
}
