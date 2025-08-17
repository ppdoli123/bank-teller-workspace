package com.hanabank.smartconsulting.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hanabank.smartconsulting.entity.Employee;
import com.hanabank.smartconsulting.entity.Customer;
import com.hanabank.smartconsulting.entity.CustomerProduct;
import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.repository.EmployeeRepository;
import com.hanabank.smartconsulting.repository.CustomerRepository;
import com.hanabank.smartconsulting.repository.CustomerProductRepository;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import com.hanabank.smartconsulting.repository.ProductFormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
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
    private final ProductFormRepository productFormRepository;
    
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
        
        // 서식 데이터 생성
        initializeProductForms();
        
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
                log.info("JSON 파일 로드 완료. 총 {} 개의 노드 발견", rootNode.size());
                
                int count = 0;
                int skipped = 0;
                for (JsonNode productNode : rootNode) {
                    try {
                        String productName = getTextValue(productNode, "상품명");
                        
                        // 상품명이 null이면 건너뛰기
                        if (productName == null || productName.trim().isEmpty()) {
                            List<String> fieldNames = new ArrayList<>();
                            productNode.fieldNames().forEachRemaining(fieldNames::add);
                            log.warn("상품명이 없는 데이터 건너뛰기. 사용 가능한 키: {}", 
                                     fieldNames.isEmpty() ? "없음" : String.join(", ", fieldNames));
                            skipped++;
                            continue;
                        }
                        
                        FinancialProduct product = FinancialProduct.builder()
                                .productName(productName)
                                .productType(getTextValue(productNode, "상품종류"))
                                .productFeatures(getTextValue(productNode, "상품특징"))
                                .targetCustomers(getTextValue(productNode, "가입대상"))
                                .eligibilityRequirements(getTextValue(productNode, "가입조건"))
                                .depositAmount(getTextValue(productNode, "가입금액"))
                                .depositPeriod(getTextValue(productNode, "가입기간"))
                                .interestRate(getTextValue(productNode, "금리"))
                                .preferentialRate(getTextValue(productNode, "우대금리"))
                                .taxBenefits(getTextValue(productNode, "세제혜택"))
                                .withdrawalConditions(getTextValue(productNode, "중도인출조건"))
                                .notes(getTextValue(productNode, "주의사항"))
                                .depositProtection(getTextValue(productNode, "예금자보호"))
                                .interestRateTable(getTextValue(productNode, "금리표"))
                                .productGuidePath(getTextValue(productNode, "상품가이드경로"))
                                .build();
                        
                        financialProductRepository.save(product);
                        count++;
                    } catch (Exception e) {
                        log.warn("상품 데이터 처리 중 오류: {}", e.getMessage());
                    }
                }
                
                log.info("금융 상품 데이터 로드 완료: {} 개 성공, {} 개 건너뜀", count, skipped);
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
    
    private void initializeProductForms() {
        if (productFormRepository.count() == 0) {
            log.info("서식 데이터 생성 중...");
            
            // 예금 서식
            ProductForm depositForm = ProductForm.builder()
                    .formType("예금")
                    .formName("예금 가입신청서")
                    .formTemplate("<div class=\"form-section\">" +
                            "<h2>📋 예금 가입신청서</h2>" +
                            "<p><strong>상품명:</strong> <span class=\"highlight\">{{상품명}}</span></p>" +
                            "<p><strong>상품타입:</strong> {{상품타입}}</p>" +
                            "<div class=\"section\">" +
                            "<h3>💰 금리 정보</h3>" +
                            "<p><strong>기본금리:</strong> <span class=\"highlight\">{{기본금리}}</span></p>" +
                            "<p><strong>우대금리:</strong> <span class=\"highlight\">{{우대금리}}</span></p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>💵 가입 조건</h3>" +
                            "<p><strong>가입금액:</strong> {{가입금액}}</p>" +
                            "<p><strong>가입기간:</strong> {{가입기간}}</p>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"상품명\", \"기본금리\", \"우대금리\", \"가입금액\", \"가입기간\"]")
                    .description("예금 상품 가입을 위한 기본 서식입니다.")
                    .isActive(true)
                    .build();
            
            // 적금 가입신청서 (메인 서식)
            ProductForm savingsForm = ProductForm.builder()
                    .formType("적금")
                    .formName("적금 가입신청서")
                    .formTemplate("<div class=\"form-section savings-form\">" +
                            "<h2>📋 적금 가입신청서</h2>" +
                            "<div class=\"product-info\">" +
                            "<p><strong>상품명:</strong> <span class=\"highlight\">{{상품명}}</span></p>" +
                            "<p><strong>상품타입:</strong> {{상품타입}}</p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>💰 금리 정보</h3>" +
                            "<p><strong>기본금리:</strong> <span class=\"highlight\">{{기본금리}}%</span></p>" +
                            "<p><strong>우대금리:</strong> <span class=\"highlight\">{{우대금리}}%</span></p>" +
                            "<p><strong>최고금리:</strong> <span class=\"max-rate\">{{최고금리}}%</span></p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>💵 적립 조건</h3>" +
                            "<p><strong>월 적립금액:</strong> {{가입금액}}</p>" +
                            "<p><strong>적립기간:</strong> {{가입기간}}</p>" +
                            "<p><strong>만기 예상금액:</strong> <span class=\"maturity-amount\">{{만기예상금액}}</span></p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📋 가입 조건</h3>" +
                            "<p><strong>가입자격:</strong> {{가입자격}}</p>" +
                            "<p><strong>예금보호:</strong> {{예금보호}}</p>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"상품명\", \"기본금리\", \"우대금리\", \"가입금액\", \"가입기간\", \"가입자격\", \"예금보호\"]")
                    .description("적금 상품 가입을 위한 메인 신청서입니다.")
                    .isActive(true)
                    .build();
            
            // 적금 본인확인서
            ProductForm savingsIdentityForm = ProductForm.builder()
                    .formType("적금")
                    .formName("본인확인서")
                    .formTemplate("<div class=\"form-section identity-form\">" +
                            "<h2>🆔 본인확인서</h2>" +
                            "<div class=\"section\">" +
                            "<h3>👤 고객 정보</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>성명: <input type=\"text\" name=\"고객명\" placeholder=\"홍길동\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>주민등록번호: <input type=\"text\" name=\"주민번호\" placeholder=\"123456-1234567\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>전화번호: <input type=\"tel\" name=\"전화번호\" placeholder=\"010-1234-5678\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>주소: <input type=\"text\" name=\"주소\" placeholder=\"서울시 강남구...\" /></label>" +
                            "</div>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📱 인증 방법</h3>" +
                            "<div class=\"auth-methods\">" +
                            "<label><input type=\"radio\" name=\"인증방법\" value=\"휴대폰\" /> 휴대폰 인증</label>" +
                            "<label><input type=\"radio\" name=\"인증방법\" value=\"신분증\" /> 신분증 확인</label>" +
                            "</div>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"고객명\", \"주민번호\", \"전화번호\", \"주소\", \"인증방법\"]")
                    .description("적금 가입을 위한 본인확인서입니다.")
                    .isActive(true)
                    .build();
            
            // 적금 약관동의서
            ProductForm savingsTermsForm = ProductForm.builder()
                    .formType("적금")
                    .formName("약관동의서")
                    .formTemplate("<div class=\"form-section terms-form\">" +
                            "<h2>📜 약관동의서</h2>" +
                            "<div class=\"section\">" +
                            "<h3>✅ 필수 약관 동의</h3>" +
                            "<div class=\"terms-item\">" +
                            "<label class=\"required\">" +
                            "<input type=\"checkbox\" name=\"예금약관\" required /> " +
                            "적금 약관 및 상품설명서 동의 (필수)" +
                            "</label>" +
                            "</div>" +
                            "<div class=\"terms-item\">" +
                            "<label class=\"required\">" +
                            "<input type=\"checkbox\" name=\"개인정보\" required /> " +
                            "개인정보 수집·이용 동의 (필수)" +
                            "</label>" +
                            "</div>" +
                            "<div class=\"terms-item\">" +
                            "<label class=\"required\">" +
                            "<input type=\"checkbox\" name=\"예금보험\" required /> " +
                            "예금보험공사 예금자보호 안내 확인 (필수)" +
                            "</label>" +
                            "</div>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>⚪ 선택 약관 동의</h3>" +
                            "<div class=\"terms-item\">" +
                            "<label>" +
                            "<input type=\"checkbox\" name=\"마케팅\" /> " +
                            "마케팅 정보 수신 동의 (선택)" +
                            "</label>" +
                            "</div>" +
                            "<div class=\"terms-item\">" +
                            "<label>" +
                            "<input type=\"checkbox\" name=\"제3자\" /> " +
                            "제3자 정보 제공 동의 (선택)" +
                            "</label>" +
                            "</div>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"예금약관\", \"개인정보\", \"예금보험\"]")
                    .description("적금 가입을 위한 약관동의서입니다.")
                    .isActive(true)
                    .build();
            
            // 대출 서식
            ProductForm loanForm = ProductForm.builder()
                    .formType("대출")
                    .formName("대출 신청서")
                    .formTemplate("<div class=\"form-section\">" +
                            "<h2>📋 대출 신청서</h2>" +
                            "<p><strong>상품명:</strong> <span class=\"highlight\">{{상품명}}</span></p>" +
                            "<p><strong>상품타입:</strong> {{상품타입}}</p>" +
                            "<div class=\"section\">" +
                            "<h3>💰 대출 조건</h3>" +
                            "<p><strong>대출금리:</strong> <span class=\"highlight\">{{기본금리}}</span></p>" +
                            "<p><strong>우대금리:</strong> <span class=\"highlight\">{{우대금리}}</span></p>" +
                            "<p><strong>대출한도:</strong> {{가입금액}}</p>" +
                            "<p><strong>대출기간:</strong> {{가입기간}}</p>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"상품명\", \"기본금리\", \"우대금리\", \"가입금액\", \"가입기간\"]")
                    .description("대출 상품 신청을 위한 기본 서식입니다.")
                    .isActive(true)
                    .build();
            
            // 투자 서식
            ProductForm investmentForm = ProductForm.builder()
                    .formType("투자")
                    .formName("투자상품 가입신청서")
                    .formTemplate("<div class=\"form-section\">" +
                            "<h2>📋 투자상품 가입신청서</h2>" +
                            "<p><strong>상품명:</strong> <span class=\"highlight\">{{상품명}}</span></p>" +
                            "<p><strong>상품타입:</strong> {{상품타입}}</p>" +
                            "<div class=\"section\">" +
                            "<h3>💹 투자 정보</h3>" +
                            "<p><strong>예상수익률:</strong> <span class=\"highlight\">{{기본금리}}</span></p>" +
                            "<p><strong>투자금액:</strong> {{가입금액}}</p>" +
                            "<p><strong>투자기간:</strong> {{가입기간}}</p>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"상품명\", \"기본금리\", \"우대금리\", \"가입금액\", \"가입기간\"]")
                    .description("투자 상품 가입을 위한 기본 서식입니다.")
                    .isActive(true)
                    .build();
            
            productFormRepository.save(depositForm);
            productFormRepository.save(savingsForm);
            productFormRepository.save(savingsIdentityForm);
            productFormRepository.save(savingsTermsForm);
            productFormRepository.save(loanForm);
            productFormRepository.save(investmentForm);
            
            // 3.6.9 적금 가입 프로세스 추가 서식들
            
            // 1. 상품설명서
            ProductForm savingsProductGuide = ProductForm.builder()
                    .formType("적금")
                    .formName("상품설명서")
                    .formTemplate("<div class=\"form-section product-guide\">" +
                            "<h2>📖 3.6.9 적금 상품설명서</h2>" +
                            "<div class=\"section\">" +
                            "<h3>🏆 상품 개요</h3>" +
                            "<p><strong>상품명:</strong> 하나 3.6.9 적금</p>" +
                            "<p><strong>상품특징:</strong> 매월 일정금액을 적립하여 목돈을 마련하는 정기적금</p>" +
                            "<p><strong>가입대상:</strong> 만 14세 이상 개인 (미성년자는 법정대리인 동의 필요)</p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>💰 금리 및 이자</h3>" +
                            "<p><strong>기본금리:</strong> 연 3.60%</p>" +
                            "<p><strong>우대금리:</strong> 최대 연 0.90% 추가</p>" +
                            "<p><strong>최고금리:</strong> 연 3.69% (세전)</p>" +
                            "<p><strong>이자지급방식:</strong> 만기일시지급</p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📅 가입조건</h3>" +
                            "<p><strong>가입금액:</strong> 월 1만원 이상 ~ 월 300만원 이하</p>" +
                            "<p><strong>가입기간:</strong> 12개월 ~ 36개월</p>" +
                            "<p><strong>납입방법:</strong> 매월 약정일 자동이체</p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>⚠️ 유의사항</h3>" +
                            "<p>• 중도해지 시 약정금리보다 낮은 금리 적용</p>" +
                            "<p>• 예금보험공사 예금자보호 (1인당 5천만원 한도)</p>" +
                            "<p>• 이자소득세 15.4% 분리과세 (지방소득세 포함)</p>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[]")
                    .description("3.6.9 적금 상품에 대한 상세 설명서입니다.")
                    .isActive(true)
                    .build();
            
            // 2. 자동이체 신청서
            ProductForm savingsAutoTransferForm = ProductForm.builder()
                    .formType("적금")
                    .formName("자동이체신청서")
                    .formTemplate("<div class=\"form-section auto-transfer-form\">" +
                            "<h2>🔄 자동이체 신청서</h2>" +
                            "<div class=\"section\">" +
                            "<h3>💳 출금계좌 정보</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>출금은행: <select name=\"출금은행\">" +
                            "<option>하나은행</option>" +
                            "<option>국민은행</option>" +
                            "<option>신한은행</option>" +
                            "<option>우리은행</option>" +
                            "<option>기타</option>" +
                            "</select></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>계좌번호: <input type=\"text\" name=\"출금계좌\" placeholder=\"123-456789-012\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>예금주명: <input type=\"text\" name=\"예금주\" placeholder=\"홍길동\" /></label>" +
                            "</div>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📅 이체 조건</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>이체금액: <input type=\"number\" name=\"이체금액\" placeholder=\"300000\" min=\"10000\" max=\"3000000\" /> 원</label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>이체일: 매월 <select name=\"이체일\">" +
                            "<option>5일</option>" +
                            "<option>10일</option>" +
                            "<option>15일</option>" +
                            "<option>20일</option>" +
                            "<option>25일</option>" +
                            "</select></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>이체기간: <select name=\"이체기간\">" +
                            "<option>12개월</option>" +
                            "<option>24개월</option>" +
                            "<option>36개월</option>" +
                            "</select></label>" +
                            "</div>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"출금은행\", \"출금계좌\", \"예금주\", \"이체금액\", \"이체일\", \"이체기간\"]")
                    .description("적금 납입을 위한 자동이체 신청서입니다.")
                    .isActive(true)
                    .build();
            
            // 3. 세무신고서
            ProductForm savingsTaxForm = ProductForm.builder()
                    .formType("적금")
                    .formName("세무신고서")
                    .formTemplate("<div class=\"form-section tax-form\">" +
                            "<h2>📋 금융소득 종합과세 신고서</h2>" +
                            "<div class=\"section\">" +
                            "<h3>👤 신고자 정보</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>성명: <input type=\"text\" name=\"신고자명\" placeholder=\"홍길동\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>주민등록번호: <input type=\"text\" name=\"주민번호\" placeholder=\"123456-1234567\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>주소: <input type=\"text\" name=\"주소\" placeholder=\"서울시 강남구...\" /></label>" +
                            "</div>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>💰 과세 구분</h3>" +
                            "<div class=\"tax-options\">" +
                            "<label><input type=\"radio\" name=\"과세구분\" value=\"분리과세\" checked /> 분리과세 (15.4%)</label>" +
                            "<label><input type=\"radio\" name=\"과세구분\" value=\"종합과세\" /> 종합과세 신청</label>" +
                            "</div>" +
                            "<p class=\"tax-note\">※ 연간 금융소득 합계액이 2천만원을 초과하는 경우 종합과세 대상</p>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📞 연락처</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>휴대폰: <input type=\"tel\" name=\"휴대폰\" placeholder=\"010-1234-5678\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>이메일: <input type=\"email\" name=\"이메일\" placeholder=\"hong@example.com\" /></label>" +
                            "</div>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"신고자명\", \"주민번호\", \"주소\", \"과세구분\", \"휴대폰\"]")
                    .description("적금 이자소득에 대한 세무신고서입니다.")
                    .isActive(true)
                    .build();
            
            // 4. 실명확인서 (개선된 버전)
            ProductForm savingsRealNameForm = ProductForm.builder()
                    .formType("적금")
                    .formName("실명확인서")
                    .formTemplate("<div class=\"form-section real-name-form\">" +
                            "<h2>🆔 실명확인서</h2>" +
                            "<div class=\"section\">" +
                            "<h3>👤 고객 기본정보</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>성명(한글): <input type=\"text\" name=\"고객명\" placeholder=\"홍길동\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>성명(영문): <input type=\"text\" name=\"영문명\" placeholder=\"HONG GIL DONG\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>주민등록번호: <input type=\"text\" name=\"주민번호\" placeholder=\"123456-1234567\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>국적: <select name=\"국적\">" +
                            "<option>대한민국</option>" +
                            "<option>기타</option>" +
                            "</select></label>" +
                            "</div>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📱 확인 방법</h3>" +
                            "<div class=\"verification-methods\">" +
                            "<label><input type=\"radio\" name=\"확인방법\" value=\"신분증\" checked /> 신분증 확인 (주민등록증, 운전면허증, 여권)</label>" +
                            "<label><input type=\"radio\" name=\"확인방법\" value=\"휴대폰\" /> 휴대폰 본인인증</label>" +
                            "<label><input type=\"radio\" name=\"확인방법\" value=\"공인인증서\" /> 공인인증서</label>" +
                            "</div>" +
                            "</div>" +
                            "<div class=\"section\">" +
                            "<h3>📞 연락처 정보</h3>" +
                            "<div class=\"form-row\">" +
                            "<label>휴대폰번호: <input type=\"tel\" name=\"휴대폰\" placeholder=\"010-1234-5678\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>자택전화: <input type=\"tel\" name=\"자택전화\" placeholder=\"02-123-4567\" /></label>" +
                            "</div>" +
                            "<div class=\"form-row\">" +
                            "<label>주소: <input type=\"text\" name=\"주소\" placeholder=\"서울시 강남구 테헤란로 123\" /></label>" +
                            "</div>" +
                            "</div>" +
                            "</div>")
                    .requiredFields("[\"고객명\", \"주민번호\", \"국적\", \"확인방법\", \"휴대폰\", \"주소\"]")
                    .description("금융실명제에 따른 실명확인서입니다.")
                    .isActive(true)
                    .build();
            
            // 추가 서식들 저장
            productFormRepository.save(savingsProductGuide);
            productFormRepository.save(savingsAutoTransferForm);
            productFormRepository.save(savingsTaxForm);
            productFormRepository.save(savingsRealNameForm);
            
            log.info("서식 데이터 생성 완료: 10개 (기본 6개 + 적금 프로세스 4개)");
        }
    }
}
