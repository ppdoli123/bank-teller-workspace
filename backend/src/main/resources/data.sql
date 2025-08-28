-- 고객 데이터 초기화 (먼저 삽입)
INSERT INTO customers (customer_id, name, phone, age, address, id_number, income, assets, investment_goal, risk_tolerance, investment_period, created_at) VALUES
('C001', '김철수', '010-1234-5678', 35, '서울시 강남구 테헤란로 123', '850315-1234567', 50000000, 100000000, '주택 구매', '보통', 24, CURRENT_TIMESTAMP),
('C002', '이영희', '010-2345-6789', 28, '서울시 서초구 서초대로 456', '960512-2345678', 35000000, 50000000, '목돈마련', '보수적', 12, CURRENT_TIMESTAMP),
('C003', '박민수', '010-3456-7890', 42, '서울시 송파구 올림픽로 789', '820830-3456789', 70000000, 200000000, '자녀교육', '적극적', 36, CURRENT_TIMESTAMP);

-- 고객 상품 테이블 데이터 초기화
INSERT INTO customer_products (customer_id, product_name, product_type, balance, monthly_payment, interest_rate, start_date, maturity_date, status, created_at) VALUES
('C001', '하나 프리미엄 적금', '적금', 5000000, 500000, 3.5, '2024-01-15', '2025-01-15', 'active', CURRENT_TIMESTAMP),
('C001', '하나 프리미엄 예금', '예금', 10000000, 0, 2.8, '2024-02-01', '2024-08-01', 'active', CURRENT_TIMESTAMP),
('C001', '하나 프리미엄 대출', '대출', -20000000, 500000, 4.2, '2024-03-01', '2027-03-01', 'active', CURRENT_TIMESTAMP),
('C002', '하나 프리미엄 적금', '적금', 3000000, 300000, 3.5, '2024-01-20', '2025-01-20', 'active', CURRENT_TIMESTAMP),
('C003', '하나 프리미엄 예금', '예금', 15000000, 0, 2.8, '2024-02-10', '2024-08-10', 'active', CURRENT_TIMESTAMP);

-- 서식 데이터 초기화
INSERT INTO product_forms (form_type, form_name, form_template, is_active, required_fields) VALUES 
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
true, 
'["customerName", "phoneNumber", "address", "productName", "depositAmount", "depositPeriod", "interestRate"]'),

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
true,
'["customerName", "phoneNumber", "address", "productName", "depositAmount", "depositPeriod", "interestRate"]'),

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
true,
'["customerName", "phoneNumber", "occupation", "annualIncome", "productName", "loanAmount", "loanPeriod", "interestRate"]');