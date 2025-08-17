-- 서식 데이터 초기화
INSERT INTO product_forms (form_type, form_name, form_template, is_active, required_fields, created_at, updated_at) VALUES 
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
'["customerName", "phoneNumber", "address", "productName", "depositAmount", "depositPeriod", "interestRate"]',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

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
'["customerName", "phoneNumber", "address", "productName", "depositAmount", "depositPeriod", "interestRate"]',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

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
'["customerName", "phoneNumber", "occupation", "annualIncome", "productName", "loanAmount", "loanPeriod", "interestRate"]',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);