-- Oracle DinkDB용 데이터 초기화 스크립트 (bank_teller_ 테이블)

-- 고객 데이터 초기화
INSERT INTO bank_teller_customers (customer_id, name, phone, age, address, id_number, income, assets, investment_goal, risk_tolerance, investment_period, created_at) VALUES
('C001', '김철수', '010-1234-5678', 35, '서울시 강남구 테헤란로 123', '850315-1234567', 50000000, 100000000, '주택 구매', '보통', 24, SYSDATE);

INSERT INTO bank_teller_customers (customer_id, name, phone, age, address, id_number, income, assets, investment_goal, risk_tolerance, investment_period, created_at) VALUES
('C002', '이영희', '010-2345-6789', 28, '서울시 서초구 서초대로 456', '960512-2345678', 35000000, 50000000, '목돈마련', '보수적', 12, SYSDATE);

INSERT INTO bank_teller_customers (customer_id, name, phone, age, address, id_number, income, assets, investment_goal, risk_tolerance, investment_period, created_at) VALUES
('C003', '박민수', '010-3456-7890', 42, '서울시 송파구 올림픽로 789', '820830-3456789', 70000000, 200000000, '자녀교육', '적극적', 36, SYSDATE);

-- 고객 상품 테이블 데이터 초기화
INSERT INTO bank_teller_customer_products (customer_id, product_name, product_type, balance, monthly_payment, interest_rate, start_date, maturity_date, status, created_at) VALUES
('C001', '하나 프리미엄 적금', '적금', 5000000, 500000, 3.5, DATE '2024-01-15', DATE '2025-01-15', 'active', SYSDATE);

INSERT INTO bank_teller_customer_products (customer_id, product_name, product_type, balance, monthly_payment, interest_rate, start_date, maturity_date, status, created_at) VALUES
('C001', '하나 프리미엄 예금', '예금', 10000000, 0, 2.8, DATE '2024-02-01', DATE '2024-08-01', 'active', SYSDATE);

INSERT INTO bank_teller_customer_products (customer_id, product_name, product_type, balance, monthly_payment, interest_rate, start_date, maturity_date, status, created_at) VALUES
('C001', '하나 프리미엄 대출', '대출', -20000000, 500000, 4.2, DATE '2024-03-01', DATE '2027-03-01', 'active', SYSDATE);

INSERT INTO bank_teller_customer_products (customer_id, product_name, product_type, balance, monthly_payment, interest_rate, start_date, maturity_date, status, created_at) VALUES
('C002', '하나 프리미엄 적금', '적금', 3000000, 300000, 3.5, DATE '2024-01-20', DATE '2025-01-20', 'active', SYSDATE);

INSERT INTO bank_teller_customer_products (customer_id, product_name, product_type, balance, monthly_payment, interest_rate, start_date, maturity_date, status, created_at) VALUES
('C003', '하나 프리미엄 예금', '예금', 15000000, 0, 2.8, DATE '2024-02-10', DATE '2024-08-10', 'active', SYSDATE);

-- 직원 데이터 초기화
INSERT INTO bank_teller_employees (employee_id, name, password_hash, department, position, created_at, updated_at) VALUES
('E001', '김은행', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '개인금융팀', '팀장', SYSDATE, SYSDATE);

INSERT INTO bank_teller_employees (employee_id, name, password_hash, department, position, created_at, updated_at) VALUES
('E002', '이상담', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '개인금융팀', '대리', SYSDATE, SYSDATE);

-- 금융 상품 데이터 초기화
INSERT INTO bank_teller_financial_products (product_name, product_type, product_features, target_customers, eligibility_requirements, deposit_amount, deposit_period, interest_rate, preferential_rate, tax_benefits, withdrawal_conditions, notes, deposit_protection, interest_rate_table, product_guide_path, created_at, updated_at) VALUES
('하나 프리미엄 적금', '적금', '월 납입 방식, 복리 계산', '직장인, 자영업자', '만 19세 이상, 소득증빙서류', '10만원~500만원', '12개월~36개월', '3.5%', '4.0%', '비과세', '만기 해지 시 이자 지급', '하나은행 대표 적금 상품', '예금자보호', '연 3.5% (12개월)', '/products/savings-guide.pdf', SYSDATE, SYSDATE);

INSERT INTO bank_teller_financial_products (product_name, product_type, product_features, target_customers, eligibility_requirements, deposit_amount, deposit_period, interest_rate, preferential_rate, tax_benefits, withdrawal_conditions, notes, deposit_protection, interest_rate_table, product_guide_path, created_at, updated_at) VALUES
('하나 프리미엄 예금', '예금', '단리 계산, 자유 입출금', '전체 고객', '만 19세 이상', '100만원~', '6개월~24개월', '2.8%', '3.2%', '과세', '자유 입출금', '하나은행 대표 예금 상품', '예금자보호', '연 2.8% (12개월)', '/products/deposit-guide.pdf', SYSDATE, SYSDATE);

-- 서식 데이터 초기화
INSERT INTO bank_teller_product_forms (form_type, form_name, form_template, is_active, required_fields) VALUES
('적금', '하나 적금 신청서', 
'<div class="form-container">
  <h2>하나은행 적금 신청서</h2>
  <div class="form-section">
    <h3>고객 정보</h3>
    <div class="form-row">
      <label>고객명: {{customerName}}</label>
    </div>
    <div class="form-row">
      <label>연락처: {{phoneNumber}}</label>
    </div>
    <div class="form-row">
      <label>주소: {{address}}</label>
    </div>
  </div>
  <div class="form-section">
    <h3>상품 정보</h3>
    <div class="form-row">
      <label>상품명: {{productName}}</label>
    </div>
    <div class="form-row">
      <label>가입금액: {{depositAmount}}</label>
    </div>
    <div class="form-row">
      <label>적금기간: {{depositPeriod}}</label>
    </div>
    <div class="form-row">
      <label>금리: {{interestRate}}</label>
    </div>
  </div>
</div>',
1, 
'["customerName", "phoneNumber", "address", "productName", "depositAmount", "depositPeriod", "interestRate"]');

INSERT INTO bank_teller_product_forms (form_type, form_name, form_template, is_active, required_fields) VALUES
('예금', '하나 예금 신청서',
'<div class="form-container">
  <h2>하나은행 예금 신청서</h2>
  <div class="form-section">
    <h3>고객 정보</h3>
    <div class="form-row">
      <label>고객명: {{customerName}}</label>
    </div>
    <div class="form-row">
      <label>연락처: {{phoneNumber}}</label>
    </div>
    <div class="form-row">
      <label>주소: {{address}}</label>
    </div>
  </div>
  <div class="form-section">
    <h3>상품 정보</h3>
    <div class="form-row">
      <label>상품명: {{productName}}</label>
    </div>
    <div class="form-row">
      <label>예치금액: {{depositAmount}}</label>
    </div>
    <div class="form-row">
      <label>예치기간: {{depositPeriod}}</label>
    </div>
    <div class="form-row">
      <label>금리: {{interestRate}}</label>
    </div>
  </div>
</div>',
1,
'["customerName", "phoneNumber", "address", "productName", "depositAmount", "depositPeriod", "interestRate"]');

INSERT INTO bank_teller_product_forms (form_type, form_name, form_template, is_active, required_fields) VALUES
('대출', '하나 대출 신청서',
'<div class="form-container">
  <h2>하나은행 대출 신청서</h2>
  <div class="form-section">
    <h3>고객 정보</h3>
    <div class="form-row">
      <label>고객명: {{customerName}}</label>
    </div>
    <div class="form-row">
      <label>연락처: {{phoneNumber}}</label>
    </div>
    <div class="form-row">
      <label>직업: {{occupation}}</label>
    </div>
    <div class="form-row">
      <label>연소득: {{annualIncome}}</label>
    </div>
  </div>
  <div class="form-section">
    <h3>상품 정보</h3>
    <div class="form-row">
      <label>상품명: {{productName}}</label>
    </div>
    <div class="form-row">
      <label>대출금액: {{loanAmount}}</label>
    </div>
    <div class="form-row">
      <label>대출기간: {{loanPeriod}}</label>
    </div>
    <div class="form-row">
      <label>금리: {{interestRate}}</label>
    </div>
  </div>
</div>',
1,
'["customerName", "phoneNumber", "occupation", "annualIncome", "productName", "loanAmount", "loanPeriod", "interestRate"]');
