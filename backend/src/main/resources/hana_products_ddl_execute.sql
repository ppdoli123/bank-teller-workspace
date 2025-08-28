-- 하나은행 상품 데이터 DDL문 실행 스크립트
-- Oracle DinkDB용 테이블 생성

-- 기존 테이블이 있다면 삭제 (주의: 데이터가 모두 삭제됩니다)
DROP TABLE bank_teller_product_documents CASCADE CONSTRAINTS;
DROP TABLE bank_teller_product_details CASCADE CONSTRAINTS;
DROP TABLE bank_teller_product_rates CASCADE CONSTRAINTS;
DROP TABLE bank_teller_products CASCADE CONSTRAINTS;
DROP TABLE bank_teller_product_categories CASCADE CONSTRAINTS;

-- 시퀀스 삭제
DROP SEQUENCE bank_teller_rate_seq;
DROP SEQUENCE bank_teller_detail_seq;
DROP SEQUENCE bank_teller_document_seq;

-- 뷰 삭제
DROP VIEW bank_teller_product_summary;
DROP VIEW bank_teller_latest_rates;

-- 1. 상품 카테고리 테이블
CREATE TABLE bank_teller_product_categories (
    category_id VARCHAR2(20) PRIMARY KEY,
    category_name VARCHAR2(100) NOT NULL,
    category_description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 2. 상품 기본 정보 테이블
CREATE TABLE bank_teller_products (
    product_id VARCHAR2(50) PRIMARY KEY,
    product_name VARCHAR2(200) NOT NULL,
    category_id VARCHAR2(20) REFERENCES bank_teller_product_categories(category_id),
    product_features CLOB,
    target_customers CLOB,
    subscription_period VARCHAR2(200),
    subscription_amount VARCHAR2(200),
    deposit_limit VARCHAR2(200),
    interest_payment_method VARCHAR2(200),
    deposit_method VARCHAR2(200),
    interest_rate CLOB,
    preferential_rate CLOB,
    preferential_rate_coupon CLOB,
    maturity_auto_redeposit CLOB,
    tax_benefits CLOB,
    partial_withdrawal CLOB,
    precautions CLOB,
    principal_interest_payment_restriction CLOB,
    illegal_contract_cancellation_right CLOB,
    product_content_changes CLOB,
    depositor_protection CLOB,
    pdf_path VARCHAR2(500),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 3. 상품 금리 테이블
CREATE TABLE bank_teller_product_rates (
    rate_id VARCHAR2(50) PRIMARY KEY,
    product_id VARCHAR2(50) REFERENCES bank_teller_products(product_id),
    period VARCHAR2(100),
    interest_rate VARCHAR2(50),
    rate_type VARCHAR2(50), -- 기본금리, 우대금리 등
    effective_date DATE,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 4. 상품 상세 정보 테이블 (추가 필드들)
CREATE TABLE bank_teller_product_details (
    detail_id VARCHAR2(50) PRIMARY KEY,
    product_id VARCHAR2(50) REFERENCES bank_teller_products(product_id),
    field_name VARCHAR2(100),
    field_value CLOB,
    field_order NUMBER(3),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 5. 상품 문서 테이블
CREATE TABLE bank_teller_product_documents (
    document_id VARCHAR2(50) PRIMARY KEY,
    product_id VARCHAR2(50) REFERENCES bank_teller_products(product_id),
    document_type VARCHAR2(50), -- 설명서, 약관 등
    document_path VARCHAR2(500),
    document_name VARCHAR2(200),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_products_category ON bank_teller_products(category_id);
CREATE INDEX idx_products_name ON bank_teller_products(product_name);
CREATE INDEX idx_rates_product ON bank_teller_product_rates(product_id);
CREATE INDEX idx_details_product ON bank_teller_product_details(product_id);
CREATE INDEX idx_documents_product ON bank_teller_product_documents(product_id);

-- 시퀀스 생성
CREATE SEQUENCE bank_teller_rate_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE bank_teller_detail_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE bank_teller_document_seq START WITH 1 INCREMENT BY 1;

-- 뷰 생성 (상품과 금리 정보를 조합)
CREATE VIEW bank_teller_product_summary AS
SELECT 
    p.product_id,
    p.product_name,
    pc.category_name,
    p.product_features,
    p.interest_rate,
    p.preferential_rate,
    p.is_active
FROM bank_teller_products p
LEFT JOIN bank_teller_product_categories pc ON p.category_id = pc.category_id;

-- 뷰 생성 (상품별 최신 금리 정보)
CREATE VIEW bank_teller_latest_rates AS
SELECT 
    p.product_id,
    p.product_name,
    r.period,
    r.interest_rate,
    r.rate_type,
    r.effective_date
FROM bank_teller_products p
LEFT JOIN bank_teller_product_rates r ON p.product_id = r.product_id
WHERE r.effective_date = (
    SELECT MAX(effective_date) 
    FROM bank_teller_product_rates 
    WHERE product_id = p.product_id
);

-- 코멘트 추가
COMMENT ON TABLE bank_teller_product_categories IS '상품 카테고리 정보';
COMMENT ON TABLE bank_teller_products IS '하나은행 상품 기본 정보';
COMMENT ON TABLE bank_teller_product_rates IS '상품별 금리 정보';
COMMENT ON TABLE bank_teller_product_details IS '상품 상세 정보 (동적 필드)';
COMMENT ON TABLE bank_teller_product_documents IS '상품 관련 문서 정보';

-- 성공 메시지
SELECT '하나은행 상품 테이블 생성 완료!' AS result FROM dual;
