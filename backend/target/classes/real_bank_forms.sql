-- 하나은행 실제 서식 구조를 반영한 서식 템플릿
-- 은행거래신청서 기반 템플릿

INSERT INTO product_forms (form_type, form_name, form_template, required_fields, description, is_active, created_at, updated_at) VALUES
-- 예금 가입 메인 서식
('예금', '은행거래신청서', 
'<div class="hana-form-container">
  <div class="form-header">
    <img src="/images/hana-logo.png" alt="하나은행" class="bank-logo">
    <h1 class="form-title">은행거래신청서</h1>
    <div class="form-info">
      <span class="branch-info">접수점: ________________</span>
      <span class="date-info">접수일자: ___________</span>
    </div>
  </div>

  <div class="applicant-section">
    <h2>신청인 정보</h2>
    <div class="form-grid">
      <div class="form-row">
        <label class="required">성명</label>
        <input type="text" name="고객명" placeholder="{{고객명}}" readonly>
        <label>생년월일</label>
        <input type="text" name="생년월일" placeholder="예: 19900101">
      </div>
      <div class="form-row">
        <label class="required">주민등록번호</label>
        <input type="text" name="주민번호" placeholder="000000-0000000">
        <label>연락처</label>
        <input type="text" name="연락처" placeholder="{{고객전화}}">
      </div>
      <div class="form-row full-width">
        <label class="required">주소</label>
        <input type="text" name="주소" placeholder="{{고객주소}}" class="full-width">
      </div>
    </div>
  </div>

  <div class="product-section">
    <h2>상품 정보</h2>
    <div class="product-info-box">
      <div class="product-row">
        <label>상품명</label>
        <span class="product-value">{{상품명}}</span>
      </div>
      <div class="product-row">
        <label>상품종류</label>
        <span class="product-value">{{상품타입}}</span>
      </div>
      <div class="product-row">
        <label>기본금리</label>
        <span class="product-value">{{기본금리}}</span>
      </div>
      <div class="product-row">
        <label>우대금리</label>
        <span class="product-value">{{우대금리}}</span>
      </div>
    </div>
  </div>

  <div class="account-section">
    <h2>계좌 개설 정보</h2>
    <div class="form-grid">
      <div class="form-row">
        <label class="required">입금액</label>
        <input type="number" name="입금액" placeholder="원">
        <label>만기일</label>
        <input type="date" name="만기일">
      </div>
      <div class="form-row">
        <label>비밀번호 (4자리)</label>
        <input type="password" name="계좌비밀번호" maxlength="4" placeholder="****">
      </div>
    </div>
  </div>

  <div class="agreement-section">
    <h2>약관 동의</h2>
    <div class="agreement-list">
      <label class="agreement-item">
        <input type="checkbox" name="개인정보동의" required>
        <span>개인(신용)정보 수집·이용·제공 동의 (필수)</span>
      </label>
      <label class="agreement-item">
        <input type="checkbox" name="상품약관동의" required>
        <span>{{상품명}} 상품약관 동의 (필수)</span>
      </label>
      <label class="agreement-item">
        <input type="checkbox" name="예금자보호법동의" required>
        <span>예금자보호법 안내 확인 (필수)</span>
      </label>
      <label class="agreement-item">
        <input type="checkbox" name="마케팅동의">
        <span>마케팅 정보 수신 동의 (선택)</span>
      </label>
    </div>
  </div>

  <div class="signature-section">
    <h2>서명</h2>
    <div class="signature-grid">
      <div class="signature-box">
        <label>신청인 서명</label>
        <div class="signature-pad" id="customerSignature">
          <canvas width="300" height="150"></canvas>
          <button type="button" class="clear-btn" onclick="clearSignature(''customerSignature'')">지우기</button>
        </div>
      </div>
      <div class="signature-box">
        <label>직인</label>
        <div class="seal-area">
          <span class="seal-text">하나은행</span>
        </div>
      </div>
    </div>
  </div>

  <div class="form-footer">
    <div class="footer-text">
      <p>본인은 위 기재사항이 사실임을 확인하며, 관련 약관 및 상품설명서를 충분히 이해하고 동의합니다.</p>
      <p class="date-signature">
        신청일자: <span id="currentDate"></span>
        신청인: _________________ (서명 또는 인)
      </p>
    </div>
  </div>
</div>

<style>
.hana-form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  font-family: ''Noto Sans KR'', sans-serif;
  line-height: 1.6;
  color: #333;
}

.form-header {
  text-align: center;
  padding: 20px;
  border-bottom: 2px solid #00B2A9;
  margin-bottom: 30px;
}

.bank-logo {
  height: 40px;
  margin-bottom: 10px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #00B2A9;
  margin: 10px 0;
}

.form-info {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
}

.applicant-section, .product-section, .account-section, .agreement-section, .signature-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
}

.applicant-section h2, .product-section h2, .account-section h2, .agreement-section h2, .signature-section h2 {
  background: #00B2A9;
  color: white;
  margin: -20px -20px 15px -20px;
  padding: 12px 20px;
  font-size: 18px;
  border-radius: 8px 8px 0 0;
}

.form-grid {
  display: grid;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 120px 1fr 120px 1fr;
  align-items: center;
  gap: 10px;
}

.form-row.full-width {
  grid-template-columns: 120px 1fr;
}

.form-row label {
  font-weight: 500;
  color: #333;
}

.form-row label.required::after {
  content: " *";
  color: #e74c3c;
}

.form-row input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-row input:focus {
  outline: none;
  border-color: #00B2A9;
  box-shadow: 0 0 0 2px rgba(0, 178, 169, 0.2);
}

.product-info-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.product-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.product-row:last-child {
  border-bottom: none;
}

.product-row label {
  font-weight: 500;
  color: #495057;
}

.product-value {
  font-weight: 600;
  color: #00B2A9;
}

.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agreement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
}

.agreement-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.signature-box {
  text-align: center;
}

.signature-box label {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
}

.signature-pad {
  border: 2px solid #ddd;
  border-radius: 6px;
  position: relative;
  background: white;
}

.signature-pad canvas {
  display: block;
  cursor: crosshair;
}

.clear-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.seal-area {
  width: 100px;
  height: 100px;
  border: 2px solid #00B2A9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: linear-gradient(45deg, #00B2A9, #00a396);
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.form-footer {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.footer-text p {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.8;
}

.date-signature {
  margin-top: 30px !important;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .signature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-info {
    flex-direction: column;
    gap: 5px;
  }
}
</style>

<script>
// 현재 날짜 설정
document.addEventListener(''DOMContentLoaded'', function() {
  const today = new Date().toLocaleDateString(''ko-KR'');
  const dateElement = document.getElementById(''currentDate'');
  if (dateElement) {
    dateElement.textContent = today;
  }
});

// 서명 기능
function clearSignature(canvasId) {
  const canvas = document.querySelector(`#${canvasId} canvas`);
  const ctx = canvas.getContext(''2d'');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
</script>',
'["고객명", "주민번호", "연락처", "주소", "입금액", "계좌비밀번호", "개인정보동의", "상품약관동의", "예금자보호법동의"]',
'하나은행 실제 서식을 기반으로 한 은행거래신청서입니다. 예금 상품 가입 시 사용됩니다.',
true,
NOW(),
NOW()),

-- 자동이체 신청서
('예금', '자동이체신청서',
'<div class="hana-form-container">
  <div class="form-header">
    <img src="/images/hana-logo.png" alt="하나은행" class="bank-logo">
    <h1 class="form-title">자동이체신청서</h1>
  </div>

  <div class="transfer-info-section">
    <h2>이체 정보</h2>
    <div class="form-grid">
      <div class="form-row">
        <label class="required">출금계좌번호</label>
        <input type="text" name="출금계좌" placeholder="000-000000-00000">
        <label class="required">이체금액</label>
        <input type="number" name="이체금액" placeholder="원">
      </div>
      <div class="form-row">
        <label class="required">이체일자</label>
        <select name="이체일자" required>
          <option value="">선택하세요</option>
          <option value="5">매월 5일</option>
          <option value="10">매월 10일</option>
          <option value="15">매월 15일</option>
          <option value="20">매월 20일</option>
          <option value="25">매월 25일</option>
        </select>
        <label class="required">이체기간</label>
        <select name="이체기간" required>
          <option value="">선택하세요</option>
          <option value="12">12개월</option>
          <option value="24">24개월</option>
          <option value="36">36개월</option>
        </select>
      </div>
    </div>
  </div>

  <div class="deposit-account-section">
    <h2>입금계좌 정보</h2>
    <div class="account-info-box">
      <div class="account-row">
        <label>상품명</label>
        <span class="account-value">{{상품명}}</span>
      </div>
      <div class="account-row">
        <label>계좌번호</label>
        <span class="account-value">신규 개설 예정</span>
      </div>
    </div>
  </div>

  <div class="agreement-section">
    <h2>자동이체 약관 동의</h2>
    <div class="agreement-content">
      <div class="agreement-text">
        <h4>자동이체 서비스 이용약관</h4>
        <ul>
          <li>자동이체는 지정된 날짜에 지정된 금액이 자동으로 이체됩니다.</li>
          <li>출금계좌의 잔액 부족 시 이체가 실행되지 않습니다.</li>
          <li>이체 실패 시 다음 이체일에 재시도하지 않습니다.</li>
          <li>자동이체 해지는 영업점 방문 또는 인터넷뱅킹을 통해 가능합니다.</li>
        </ul>
      </div>
      <label class="agreement-checkbox">
        <input type="checkbox" name="자동이체약관동의" required>
        <span>위 약관을 충분히 이해하였으며 이에 동의합니다.</span>
      </label>
    </div>
  </div>

  <div class="signature-section">
    <h2>신청인 서명</h2>
    <div class="signature-area">
      <div class="signature-pad" id="autoTransferSignature">
        <canvas width="400" height="120"></canvas>
        <button type="button" class="clear-btn" onclick="clearSignature(''autoTransferSignature'')">지우기</button>
      </div>
    </div>
  </div>
</div>',
'["출금계좌", "이체금액", "이체일자", "이체기간", "자동이체약관동의"]',
'적금 상품 가입 시 자동이체를 신청하는 서식입니다.',
true,
NOW(),
NOW());
