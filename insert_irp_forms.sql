-- P033_아이_꿈하나_적금 상품에 연관된 서식 추가

-- 1. 적금 가입신청서
INSERT INTO eform (formid, formname, formtype, productid, producttype, description, formschema, formtemplatepath, versionnumber) 
VALUES (
    'FORM-IRP-001', 
    '아이 꿈하나 적금 가입신청서', 
    'deposit', 
    'P033_아이_꿈하나_적금', 
    '적금', 
    '아이 꿈하나 적금 상품 가입을 위한 기본 신청서', 
    '{"fields": [
        {"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, 
        {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, 
        {"id": "phone_number", "name": "phoneNumber", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, 
        {"id": "address", "name": "address", "type": "text", "label": "주소", "required": true, "placeholder": "주소를 입력하세요"}, 
        {"id": "monthly_amount", "name": "monthlyAmount", "type": "number", "label": "월 적금 금액", "required": true, "placeholder": "월 적금 금액을 입력하세요"}, 
        {"id": "deposit_period", "name": "depositPeriod", "type": "select", "label": "적금 기간", "required": true, "options": ["12개월", "24개월", "36개월", "48개월", "60개월"]}, 
        {"id": "account_number", "name": "accountNumber", "type": "text", "label": "입금계좌번호", "required": true, "placeholder": "입금계좌번호를 입력하세요"}
    ]}', 
    '/forms/irp-001.pdf', 
    1.0
);

-- 2. 자동이체 신청서
INSERT INTO eform (formid, formname, formtype, productid, producttype, description, formschema, formtemplatepath, versionnumber) 
VALUES (
    'FORM-IRP-002', 
    '아이 꿈하나 적금 자동이체 신청서', 
    'deposit', 
    'P033_아이_꿈하나_적금', 
    '적금', 
    '월 적금 자동이체 설정을 위한 신청서', 
    '{"fields": [
        {"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, 
        {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, 
        {"id": "auto_transfer_date", "name": "autoTransferDate", "type": "select", "label": "자동이체일", "required": true, "options": ["매월 1일", "매월 15일", "매월 말일"]}, 
        {"id": "transfer_amount", "name": "transferAmount", "type": "number", "label": "이체금액", "required": true, "placeholder": "월 이체금액을 입력하세요"}, 
        {"id": "source_account", "name": "sourceAccount", "type": "text", "label": "출금계좌번호", "required": true, "placeholder": "출금계좌번호를 입력하세요"}, 
        {"id": "start_month", "name": "startMonth", "type": "date", "label": "시작월", "required": true, "placeholder": "자동이체 시작월을 선택하세요"}
    ]}', 
    '/forms/irp-002.pdf', 
    1.0
);

-- 3. 개인신용정보 수집이용동의서
INSERT INTO eform (formid, formname, formtype, productid, producttype, description, formschema, formtemplatepath, versionnumber) 
VALUES (
    'FORM-IRP-003', 
    '개인신용정보 수집이용동의서(아이 꿈하나 적금)', 
    'deposit', 
    'P033_아이_꿈하나_적금', 
    '적금', 
    '개인신용정보 수집 및 이용에 대한 동의서', 
    '{"fields": [
        {"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, 
        {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, 
        {"id": "consent_date", "name": "consentDate", "type": "date", "label": "동의일자", "required": true, "placeholder": "동의일자를 선택하세요"}, 
        {"id": "consent_purpose", "name": "consentPurpose", "type": "text", "label": "수집목적", "required": true, "value": "아이 꿈하나 적금 상품 가입 및 운영", "readonly": true}, 
        {"id": "consent_period", "name": "consentPeriod", "type": "text", "label": "보유기간", "required": true, "value": "상품 만기 후 5년", "readonly": true}, 
        {"id": "signature", "name": "signature", "type": "signature", "label": "서명", "required": true, "placeholder": "서명해주세요"}
    ]}', 
    '/forms/irp-003.pdf', 
    1.0
);

-- 4. 비과세종합저축 한도확인서
INSERT INTO eform (formid, formname, formtype, productid, producttype, description, formschema, formtemplatepath, versionnumber) 
VALUES (
    'FORM-IRP-004', 
    '비과세종합저축 한도확인서', 
    'deposit', 
    'P033_아이_꿈하나_적금', 
    '적금', 
    '비과세종합저축 한도 확인 및 신청서', 
    '{"fields": [
        {"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, 
        {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, 
        {"id": "current_limit", "name": "currentLimit", "type": "number", "label": "현재 사용한도", "required": true, "placeholder": "현재 사용한도를 입력하세요"}, 
        {"id": "available_limit", "name": "availableLimit", "type": "number", "label": "사용가능한도", "required": true, "placeholder": "사용가능한도를 입력하세요"}, 
        {"id": "requested_amount", "name": "requestedAmount", "type": "number", "label": "신청금액", "required": true, "placeholder": "신청금액을 입력하세요"}, 
        {"id": "other_accounts", "name": "otherAccounts", "type": "textarea", "label": "타 금융기관 계좌", "required": false, "placeholder": "타 금융기관의 비과세 계좌 정보를 입력하세요"}
    ]}', 
    '/forms/irp-004.pdf', 
    1.0
);

-- 5. 적금 해지신청서
INSERT INTO eform (formid, formname, formtype, productid, producttype, description, formschema, formtemplatepath, versionnumber) 
VALUES (
    'FORM-IRP-005', 
    '아이 꿈하나 적금 해지신청서', 
    'deposit', 
    'P033_아이_꿈하나_적금', 
    '적금', 
    '적금 중도해지를 위한 신청서', 
    '{"fields": [
        {"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, 
        {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, 
        {"id": "account_number", "name": "accountNumber", "type": "text", "label": "적금계좌번호", "required": true, "placeholder": "해지할 적금계좌번호를 입력하세요"}, 
        {"id": "withdrawal_amount", "name": "withdrawalAmount", "type": "number", "label": "해지금액", "required": true, "placeholder": "해지금액을 입력하세요"}, 
        {"id": "withdrawal_reason", "name": "withdrawalReason", "type": "select", "label": "해지사유", "required": true, "options": ["자금 필요", "다른 상품 가입", "만기 전 해지", "기타"]}, 
        {"id": "refund_account", "name": "refundAccount", "type": "text", "label": "환불계좌번호", "required": true, "placeholder": "환불받을 계좌번호를 입력하세요"}, 
        {"id": "signature", "name": "signature", "type": "signature", "label": "서명", "required": true, "placeholder": "서명해주세요"}
    ]}', 
    '/forms/irp-005.pdf', 
    1.0
);

-- 서식 추가 완료 확인
SELECT formid, formname, productid, producttype FROM eform WHERE productid = 'P033_아이_꿈하나_적금';
