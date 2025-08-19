package com.hanabank.smartconsulting.config;

import com.hanabank.smartconsulting.entity.FinancialProduct;
import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.entity.Employee;
import com.hanabank.smartconsulting.entity.Customer;
import com.hanabank.smartconsulting.repository.ProductFormRepository;
import com.hanabank.smartconsulting.repository.FinancialProductRepository;
import com.hanabank.smartconsulting.repository.EmployeeRepository;
import com.hanabank.smartconsulting.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final FinancialProductRepository financialProductRepository;
    private final ProductFormRepository productFormRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        initializeEmployees();
        initializeProducts();
        initializeProductForms();
        initializeCustomers();
    }

    private void initializeProducts() {
        if (financialProductRepository.count() == 0) {
            log.info("상품 데이터 생성 시작...");

            // 적금 상품들
            FinancialProduct savings369 = FinancialProduct.builder()
                    .productName("하나 3.6.9 적금")
                    .productType("적금")
                    .productFeatures("매월 일정금액을 적립하여 목돈을 마련하는 정기적금, 최고 연 3.69% 금리")
                    .targetCustomers("만 14세 이상 개인")
                    .eligibilityRequirements("만 14세 이상 개인")
                    .depositAmount("월 10,000원 이상 ~ 월 3,000,000원 이하")
                    .depositPeriod("12개월 ~ 36개월")
                    .interestRate("연 3.60%")
                    .preferentialRate("최대 연 0.90% 추가")
                    .build();

            FinancialProduct savings5Plus = FinancialProduct.builder()
                    .productName("하나 5Plus 적금")
                    .productType("적금")
                    .productFeatures("더 높은 금리로 목돈마련이 가능한 프리미엄 적금, 최고 연 5.50% 금리")
                    .targetCustomers("만 19세 이상 개인")
                    .eligibilityRequirements("만 19세 이상 개인")
                    .depositAmount("월 50,000원 이상 ~ 월 5,000,000원 이하")
                    .depositPeriod("12개월 ~ 24개월")
                    .interestRate("연 4.20%")
                    .preferentialRate("최대 연 1.30% 추가")
                    .build();

            // 예금 상품들
            FinancialProduct deposit2Year = FinancialProduct.builder()
                    .productName("하나 정기예금 2년")
                    .productType("예금")
                    .productFeatures("안정적인 수익을 원하는 고객을 위한 정기예금, 예금자보호, 안정적 금리")
                    .targetCustomers("만 14세 이상 개인 및 법인")
                    .eligibilityRequirements("만 14세 이상 개인 및 법인")
                    .depositAmount("1,000,000원 이상 ~ 100,000,000원 이하")
                    .depositPeriod("12개월 ~ 24개월")
                    .interestRate("연 3.20%")
                    .preferentialRate("최대 연 0.50% 추가")
                    .build();

            // 대출 상품들
            FinancialProduct personalLoan = FinancialProduct.builder()
                    .productName("하나 개인신용대출")
                    .productType("대출")
                    .productFeatures("신용도에 따른 무담보 개인대출, 무담보, 빠른 심사")
                    .targetCustomers("만 19세 이상, 소득증빙 가능자")
                    .eligibilityRequirements("만 19세 이상, 소득증빙 가능자")
                    .depositAmount("1,000,000원 이상 ~ 100,000,000원 이하")
                    .depositPeriod("12개월 ~ 60개월")
                    .interestRate("연 5.80%")
                    .preferentialRate("최대 연 2.00% 감면")
                    .build();

            // 투자 상품들
            FinancialProduct fundInvestment = FinancialProduct.builder()
                    .productName("하나 글로벌 펀드")
                    .productType("투자")
                    .productFeatures("해외 주식시장에 투자하는 글로벌 펀드, 글로벌 분산투자, 높은 수익 가능성")
                    .targetCustomers("만 19세 이상, 투자위험 이해자")
                    .eligibilityRequirements("만 19세 이상, 투자위험 이해자")
                    .depositAmount("100,000원 이상 ~ 50,000,000원 이하")
                    .depositPeriod("6개월 ~ 12개월")
                    .interestRate("예상 연 8.50%")
                    .preferentialRate("시장 상황에 따라 변동")
                    .build();

            financialProductRepository.save(savings369);
            financialProductRepository.save(savings5Plus);
            financialProductRepository.save(deposit2Year);
            financialProductRepository.save(personalLoan);
            financialProductRepository.save(fundInvestment);

            log.info("상품 데이터 생성 완료: 5개");
        }
    }

    private void initializeProductForms() {
        if (productFormRepository.count() == 0) {
            createRealBankForms();
        }
    }
    
    private void createRealBankForms() {
        log.info("실제 은행 서식 생성 시작...");
        
        // 1. 예금 서식
        ProductForm depositForm = ProductForm.builder()
                .formType("deposit")
                .formName("정기예금 신청서")
                .formTemplate(createDepositFormTemplate())
                .requiredFields("[\"고객명\", \"주민번호\", \"휴대폰\", \"주소\", \"상품명\", \"예치금액\", \"예금기간\", \"신청일\"]")
                .description("정기예금 상품 가입을 위한 신청서입니다.")
                .isActive(true)
                .build();

        // 2. 적금 서식
        ProductForm savingsForm = ProductForm.builder()
                .formType("savings")
                .formName("적금 가입신청서")
                .formTemplate(createSavingsFormTemplate())
                .requiredFields("[\"고객명\", \"주민번호\", \"휴대폰\", \"주소\", \"상품명\", \"월납입액\", \"납입기간\", \"신청일\"]")
                .description("적금 상품 가입을 위한 신청서입니다.")
                .isActive(true)
                .build();

        // 3. 대출 서식
        ProductForm loanForm = ProductForm.builder()
                .formType("loan")
                .formName("대출 신청서")
                .formTemplate(createLoanFormTemplate())
                .requiredFields("[\"고객명\", \"주민번호\", \"휴대폰\", \"주소\", \"상품명\", \"대출금액\", \"대출기간\", \"직업\", \"연소득\", \"신청일\"]")
                .description("대출 상품 신청을 위한 신청서입니다.")
                .isActive(true)
                .build();

        // 4. 투자 서식
        ProductForm investmentForm = ProductForm.builder()
                .formType("investment")
                .formName("투자상품 가입신청서")
                .formTemplate(createInvestmentFormTemplate())
                .requiredFields("[\"고객명\", \"주민번호\", \"휴대폰\", \"주소\", \"상품명\", \"투자금액\", \"투자기간\", \"신청일\"]")
                .description("투자 상품 가입을 위한 신청서입니다.")
                .isActive(true)
                .build();

        // 5. 자동이체 신청서
        ProductForm autoTransferForm = ProductForm.builder()
                .formType("auto-transfer")
                .formName("자동이체 신청서")
                .formTemplate(createAutoTransferFormTemplate())
                .requiredFields("[\"출금은행\", \"출금계좌\", \"예금주\", \"이체금액\", \"이체일\", \"이체기간\"]")
                .description("적금 납입을 위한 자동이체 신청서입니다.")
                .isActive(true)
                .build();

        // 6. 실명확인서
        ProductForm identityForm = ProductForm.builder()
                .formType("identity-verification")
                .formName("실명확인서")
                .formTemplate(createIdentityFormTemplate())
                .requiredFields("[\"고객명\", \"주민번호\", \"국적\", \"확인방법\", \"휴대폰\", \"주소\"]")
                .description("금융실명제에 따른 실명확인서입니다.")
                .isActive(true)
                .build();

        // 모든 서식 저장
        productFormRepository.save(depositForm);
        productFormRepository.save(savingsForm);
        productFormRepository.save(loanForm);
        productFormRepository.save(investmentForm);
        productFormRepository.save(autoTransferForm);
        productFormRepository.save(identityForm);
        
        log.info("실제 은행 서식 생성 완료: 6개 서식");
    }

    private String createDepositFormTemplate() {
        return "<style>" +
                ".bank-form { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                ".form-header { text-align: center; border-bottom: 3px solid #008485; padding-bottom: 15px; margin-bottom: 30px; }" +
                ".form-header h1 { color: #008485; margin: 0; font-size: 24px; }" +
                ".form-section { margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; background: #fafafa; }" +
                ".section-title { background: #008485; color: white; padding: 8px 12px; margin: -15px -15px 15px -15px; font-weight: bold; }" +
                ".form-row { display: flex; margin-bottom: 10px; align-items: center; }" +
                ".form-row label { min-width: 120px; font-weight: bold; color: #333; }" +
                ".form-row input, .form-row select { padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-width: 200px; }" +
                ".required { color: red; }" +
                "</style>" +
                "<div class='bank-form'>" +
                "<div class='form-header'>" +
                "<h1>🏦 정기예금 신청서</h1>" +
                "<p>Fixed Deposit Application</p>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>👤 신청인 정보</div>" +
                "<div class='form-row'>" +
                "<label>성명<span class='required'>*</span>:</label>" +
                "<input type='text' name='고객명' placeholder='홍길동' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주민등록번호<span class='required'>*</span>:</label>" +
                "<input type='text' name='주민번호' placeholder='123456-1234567' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>휴대폰번호<span class='required'>*</span>:</label>" +
                "<input type='tel' name='휴대폰' placeholder='010-1234-5678' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주소<span class='required'>*</span>:</label>" +
                "<input type='text' name='주소' placeholder='서울시 강남구 테헤란로 123' required />" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>💰 예금 정보</div>" +
                "<div class='form-row'>" +
                "<label>상품명<span class='required'>*</span>:</label>" +
                "<input type='text' name='상품명' placeholder='하나 정기예금 2년' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>예치금액<span class='required'>*</span>:</label>" +
                "<input type='number' name='예치금액' placeholder='10000000' min='1000000' required /> 원" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>예금기간<span class='required'>*</span>:</label>" +
                "<select name='예금기간' required>" +
                "<option>12개월</option>" +
                "<option>24개월</option>" +
                "<option>36개월</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>신청일자<span class='required'>*</span>:</label>" +
                "<input type='date' name='신청일' required />" +
                "</div>" +
                "</div>" +
                "</div>";
    }

    private String createSavingsFormTemplate() {
        return "<style>" +
                ".bank-form { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                ".form-header { text-align: center; border-bottom: 3px solid #28a745; padding-bottom: 15px; margin-bottom: 30px; }" +
                ".form-header h1 { color: #28a745; margin: 0; font-size: 24px; }" +
                ".form-section { margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; background: #fafafa; }" +
                ".section-title { background: #28a745; color: white; padding: 8px 12px; margin: -15px -15px 15px -15px; font-weight: bold; }" +
                ".form-row { display: flex; margin-bottom: 10px; align-items: center; }" +
                ".form-row label { min-width: 120px; font-weight: bold; color: #333; }" +
                ".form-row input, .form-row select { padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-width: 200px; }" +
                ".required { color: red; }" +
                ".benefit-box { background: #e8f8f5; border: 1px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 5px; }" +
                "</style>" +
                "<div class='bank-form'>" +
                "<div class='form-header'>" +
                "<h1>💰 적금 가입신청서</h1>" +
                "<p>Savings Account Application</p>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>👤 신청인 정보</div>" +
                "<div class='form-row'>" +
                "<label>성명<span class='required'>*</span>:</label>" +
                "<input type='text' name='고객명' placeholder='홍길동' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주민등록번호<span class='required'>*</span>:</label>" +
                "<input type='text' name='주민번호' placeholder='123456-1234567' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>휴대폰번호<span class='required'>*</span>:</label>" +
                "<input type='tel' name='휴대폰' placeholder='010-1234-5678' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주소<span class='required'>*</span>:</label>" +
                "<input type='text' name='주소' placeholder='서울시 강남구 테헤란로 123' required />" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>💳 적금 정보</div>" +
                "<div class='form-row'>" +
                "<label>상품명<span class='required'>*</span>:</label>" +
                "<input type='text' name='상품명' placeholder='하나 3.6.9 적금' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>월 납입액<span class='required'>*</span>:</label>" +
                "<input type='number' name='월납입액' placeholder='300000' min='10000' max='3000000' required /> 원" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>납입기간<span class='required'>*</span>:</label>" +
                "<select name='납입기간' required>" +
                "<option>12개월</option>" +
                "<option>24개월</option>" +
                "<option>36개월</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>신청일자<span class='required'>*</span>:</label>" +
                "<input type='date' name='신청일' required />" +
                "</div>" +
                "</div>" +
                "<div class='benefit-box'>" +
                "<h4>🎁 우대조건</h4>" +
                "<p>• 급여이체: +0.3%</p>" +
                "<p>• 카드사용실적: +0.2%</p>" +
                "<p>• 인터넷뱅킹: +0.1%</p>" +
                "</div>" +
                "</div>";
    }

    private String createLoanFormTemplate() {
        return "<style>" +
                ".bank-form { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                ".form-header { text-align: center; border-bottom: 3px solid #dc3545; padding-bottom: 15px; margin-bottom: 30px; }" +
                ".form-header h1 { color: #dc3545; margin: 0; font-size: 24px; }" +
                ".form-section { margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; background: #fafafa; }" +
                ".section-title { background: #dc3545; color: white; padding: 8px 12px; margin: -15px -15px 15px -15px; font-weight: bold; }" +
                ".form-row { display: flex; margin-bottom: 10px; align-items: center; }" +
                ".form-row label { min-width: 120px; font-weight: bold; color: #333; }" +
                ".form-row input, .form-row select { padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-width: 200px; }" +
                ".required { color: red; }" +
                ".warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px; }" +
                "</style>" +
                "<div class='bank-form'>" +
                "<div class='form-header'>" +
                "<h1>💳 대출 신청서</h1>" +
                "<p>Loan Application Form</p>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>👤 신청인 정보</div>" +
                "<div class='form-row'>" +
                "<label>성명<span class='required'>*</span>:</label>" +
                "<input type='text' name='고객명' placeholder='홍길동' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주민등록번호<span class='required'>*</span>:</label>" +
                "<input type='text' name='주민번호' placeholder='123456-1234567' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>휴대폰번호<span class='required'>*</span>:</label>" +
                "<input type='tel' name='휴대폰' placeholder='010-1234-5678' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주소<span class='required'>*</span>:</label>" +
                "<input type='text' name='주소' placeholder='서울시 강남구 테헤란로 123' required />" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>💼 대출 정보</div>" +
                "<div class='form-row'>" +
                "<label>상품명<span class='required'>*</span>:</label>" +
                "<input type='text' name='상품명' placeholder='하나 개인신용대출' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>대출금액<span class='required'>*</span>:</label>" +
                "<input type='number' name='대출금액' placeholder='10000000' min='1000000' max='100000000' required /> 원" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>대출기간<span class='required'>*</span>:</label>" +
                "<select name='대출기간' required>" +
                "<option>12개월</option>" +
                "<option>24개월</option>" +
                "<option>36개월</option>" +
                "<option>48개월</option>" +
                "<option>60개월</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>직업<span class='required'>*</span>:</label>" +
                "<select name='직업' required>" +
                "<option>회사원</option>" +
                "<option>공무원</option>" +
                "<option>자영업</option>" +
                "<option>전문직</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>연소득<span class='required'>*</span>:</label>" +
                "<input type='number' name='연소득' placeholder='50000000' min='12000000' required /> 원" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>신청일자<span class='required'>*</span>:</label>" +
                "<input type='date' name='신청일' required />" +
                "</div>" +
                "</div>" +
                "<div class='warning-box'>" +
                "<h4>⚠️ 주의사항</h4>" +
                "<p>• 대출 승인은 개인 신용도에 따라 결정됩니다.</p>" +
                "<p>• 연체 시 신용등급이 하락할 수 있습니다.</p>" +
                "</div>" +
                "</div>";
    }

    private String createInvestmentFormTemplate() {
        return "<style>" +
                ".bank-form { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                ".form-header { text-align: center; border-bottom: 3px solid #6f42c1; padding-bottom: 15px; margin-bottom: 30px; }" +
                ".form-header h1 { color: #6f42c1; margin: 0; font-size: 24px; }" +
                ".form-section { margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; background: #fafafa; }" +
                ".section-title { background: #6f42c1; color: white; padding: 8px 12px; margin: -15px -15px 15px -15px; font-weight: bold; }" +
                ".form-row { display: flex; margin-bottom: 10px; align-items: center; }" +
                ".form-row label { min-width: 120px; font-weight: bold; color: #333; }" +
                ".form-row input, .form-row select { padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-width: 200px; }" +
                ".required { color: red; }" +
                ".risk-box { background: #ffe6e6; border: 1px solid #ff9999; padding: 15px; margin: 10px 0; border-radius: 5px; }" +
                "</style>" +
                "<div class='bank-form'>" +
                "<div class='form-header'>" +
                "<h1>📈 투자상품 가입신청서</h1>" +
                "<p>Investment Product Application</p>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>👤 신청인 정보</div>" +
                "<div class='form-row'>" +
                "<label>성명<span class='required'>*</span>:</label>" +
                "<input type='text' name='고객명' placeholder='홍길동' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주민등록번호<span class='required'>*</span>:</label>" +
                "<input type='text' name='주민번호' placeholder='123456-1234567' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>휴대폰번호<span class='required'>*</span>:</label>" +
                "<input type='tel' name='휴대폰' placeholder='010-1234-5678' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주소<span class='required'>*</span>:</label>" +
                "<input type='text' name='주소' placeholder='서울시 강남구 테헤란로 123' required />" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>📊 투자 정보</div>" +
                "<div class='form-row'>" +
                "<label>상품명<span class='required'>*</span>:</label>" +
                "<input type='text' name='상품명' placeholder='하나 글로벌 펀드' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>투자금액<span class='required'>*</span>:</label>" +
                "<input type='number' name='투자금액' placeholder='5000000' min='100000' max='50000000' required /> 원" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>투자기간<span class='required'>*</span>:</label>" +
                "<select name='투자기간' required>" +
                "<option>6개월</option>" +
                "<option>12개월</option>" +
                "<option>24개월</option>" +
                "<option>36개월</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>신청일자<span class='required'>*</span>:</label>" +
                "<input type='date' name='신청일' required />" +
                "</div>" +
                "</div>" +
                "<div class='risk-box'>" +
                "<h4>⚠️ 투자위험고지</h4>" +
                "<p>• 투자원금의 손실 가능성이 있습니다.</p>" +
                "<p>• 과거 수익률이 미래 수익률을 보장하지 않습니다.</p>" +
                "</div>" +
                "</div>";
    }

    private String createAutoTransferFormTemplate() {
        return "<style>" +
                ".bank-form { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                ".form-header { text-align: center; border-bottom: 3px solid #17a2b8; padding-bottom: 15px; margin-bottom: 30px; }" +
                ".form-header h1 { color: #17a2b8; margin: 0; font-size: 24px; }" +
                ".form-section { margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; background: #fafafa; }" +
                ".section-title { background: #17a2b8; color: white; padding: 8px 12px; margin: -15px -15px 15px -15px; font-weight: bold; }" +
                ".form-row { display: flex; margin-bottom: 10px; align-items: center; }" +
                ".form-row label { min-width: 120px; font-weight: bold; color: #333; }" +
                ".form-row input, .form-row select { padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-width: 200px; }" +
                ".required { color: red; }" +
                "</style>" +
                "<div class='bank-form'>" +
                "<div class='form-header'>" +
                "<h1>🔄 자동이체 신청서</h1>" +
                "<p>Auto Transfer Application</p>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>💳 출금계좌 정보</div>" +
                "<div class='form-row'>" +
                "<label>출금은행<span class='required'>*</span>:</label>" +
                "<select name='출금은행' required>" +
                "<option>하나은행</option>" +
                "<option>국민은행</option>" +
                "<option>신한은행</option>" +
                "<option>우리은행</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>계좌번호<span class='required'>*</span>:</label>" +
                "<input type='text' name='출금계좌' placeholder='123-456789-012' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>예금주명<span class='required'>*</span>:</label>" +
                "<input type='text' name='예금주' placeholder='홍길동' required />" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>📅 이체 조건</div>" +
                "<div class='form-row'>" +
                "<label>이체금액<span class='required'>*</span>:</label>" +
                "<input type='number' name='이체금액' placeholder='300000' min='10000' required /> 원" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>이체일<span class='required'>*</span>:</label>" +
                "<select name='이체일' required>" +
                "<option>매월 5일</option>" +
                "<option>매월 10일</option>" +
                "<option>매월 15일</option>" +
                "<option>매월 20일</option>" +
                "<option>매월 25일</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>이체기간<span class='required'>*</span>:</label>" +
                "<select name='이체기간' required>" +
                "<option>12개월</option>" +
                "<option>24개월</option>" +
                "<option>36개월</option>" +
                "</select>" +
                "</div>" +
                "</div>" +
                "</div>";
    }

    private String createIdentityFormTemplate() {
        return "<style>" +
                ".bank-form { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                ".form-header { text-align: center; border-bottom: 3px solid #fd7e14; padding-bottom: 15px; margin-bottom: 30px; }" +
                ".form-header h1 { color: #fd7e14; margin: 0; font-size: 24px; }" +
                ".form-section { margin-bottom: 25px; border: 1px solid #ddd; padding: 15px; background: #fafafa; }" +
                ".section-title { background: #fd7e14; color: white; padding: 8px 12px; margin: -15px -15px 15px -15px; font-weight: bold; }" +
                ".form-row { display: flex; margin-bottom: 10px; align-items: center; }" +
                ".form-row label { min-width: 140px; font-weight: bold; color: #333; }" +
                ".form-row input, .form-row select { padding: 5px; border: 1px solid #ccc; border-radius: 3px; min-width: 200px; }" +
                ".required { color: red; }" +
                ".verification-methods { display: flex; flex-direction: column; gap: 10px; }" +
                ".verification-methods label { min-width: auto; }" +
                "</style>" +
                "<div class='bank-form'>" +
                "<div class='form-header'>" +
                "<h1>🆔 실명확인서</h1>" +
                "<p>Identity Verification Form</p>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>👤 고객 기본정보</div>" +
                "<div class='form-row'>" +
                "<label>성명(한글)<span class='required'>*</span>:</label>" +
                "<input type='text' name='고객명' placeholder='홍길동' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주민등록번호<span class='required'>*</span>:</label>" +
                "<input type='text' name='주민번호' placeholder='123456-1234567' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>국적<span class='required'>*</span>:</label>" +
                "<select name='국적' required>" +
                "<option>대한민국</option>" +
                "<option>기타</option>" +
                "</select>" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>📱 확인 방법</div>" +
                "<div class='verification-methods'>" +
                "<label><input type='radio' name='확인방법' value='신분증' checked /> 신분증 확인</label>" +
                "<label><input type='radio' name='확인방법' value='휴대폰' /> 휴대폰 본인인증</label>" +
                "<label><input type='radio' name='확인방법' value='공인인증서' /> 공인인증서</label>" +
                "</div>" +
                "</div>" +
                "<div class='form-section'>" +
                "<div class='section-title'>📞 연락처 정보</div>" +
                "<div class='form-row'>" +
                "<label>휴대폰번호<span class='required'>*</span>:</label>" +
                "<input type='tel' name='휴대폰' placeholder='010-1234-5678' required />" +
                "</div>" +
                "<div class='form-row'>" +
                "<label>주소<span class='required'>*</span>:</label>" +
                "<input type='text' name='주소' placeholder='서울시 강남구 테헤란로 123' required />" +
                "</div>" +
                "</div>" +
                "</div>";
    }

    private void initializeEmployees() {
        if (employeeRepository.count() == 0) {
            log.info("직원 데이터 생성 시작...");

            Employee employee1 = Employee.builder()
                    .employeeId("1234")
                    .name("김직원")
                    .passwordHash("1234")
                    .department("개인금융부")
                    .position("상담원")
                    .build();

            Employee employee2 = Employee.builder()
                    .employeeId("1111")
                    .name("박상담사")
                    .passwordHash("1111")
                    .department("개인금융부")
                    .position("상담사")
                    .build();

            Employee employee3 = Employee.builder()
                    .employeeId("2222")
                    .name("이매니저")
                    .passwordHash("2222")
                    .department("기업금융부")
                    .position("매니저")
                    .build();

            Employee employee4 = Employee.builder()
                    .employeeId("admin")
                    .name("관리자")
                    .passwordHash("admin123")
                    .department("관리부")
                    .position("관리자")
                    .build();

            employeeRepository.save(employee1);
            employeeRepository.save(employee2);
            employeeRepository.save(employee3);
            employeeRepository.save(employee4);

            log.info("직원 데이터 생성 완료: 4명");
        } else {
            log.info("직원 데이터가 이미 존재합니다.");
        }
    }

    private void initializeCustomers() {
        if (customerRepository.count() == 0) {
            log.info("고객 데이터 생성 시작...");

            Customer customer1 = Customer.builder()
                    .customerId("C001")
                    .name("김철수")
                    .phone("010-1234-5678")
                    .address("서울시 강남구 테헤란로 123")
                    .age(35)
                    .income(50000000L)
                    .assets(100000000L)
                    .investmentGoal("목돈마련")
                    .investmentPeriod(24)
                    .riskTolerance("보통")
                    .idNumber("851234-1234567")
                    .build();

            Customer customer2 = Customer.builder()
                    .customerId("C002")
                    .name("이영희")
                    .phone("010-2345-6789")
                    .address("서울시 서초구 서초대로 456")
                    .age(28)
                    .income(40000000L)
                    .assets(50000000L)
                    .investmentGoal("주택구입자금")
                    .investmentPeriod(36)
                    .riskTolerance("안전")
                    .idNumber("960415-2123456")
                    .build();

            Customer customer3 = Customer.builder()
                    .customerId("C003")
                    .name("박민수")
                    .phone("010-3456-7890")
                    .address("경기도 성남시 분당구 정자로 789")
                    .age(42)
                    .income(70000000L)
                    .assets(200000000L)
                    .investmentGoal("노후자금")
                    .investmentPeriod(60)
                    .riskTolerance("적극")
                    .idNumber("821015-1987654")
                    .build();

            customerRepository.save(customer1);
            customerRepository.save(customer2);
            customerRepository.save(customer3);

            log.info("고객 데이터 생성 완료: 3명");
        } else {
            log.info("고객 데이터가 이미 존재합니다.");
        }
    }
}
