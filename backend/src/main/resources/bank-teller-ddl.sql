-- Oracle DinkDB용 테이블 생성 DDL문

-- 기존 테이블 삭제 (역순으로)
DROP TABLE bank_teller_session_participants CASCADE CONSTRAINTS;
DROP TABLE bank_teller_consultation_sessions CASCADE CONSTRAINTS;
DROP TABLE bank_teller_product_forms CASCADE CONSTRAINTS;
DROP TABLE bank_teller_customer_products CASCADE CONSTRAINTS;
DROP TABLE bank_teller_financial_products CASCADE CONSTRAINTS;
DROP TABLE bank_teller_employees CASCADE CONSTRAINTS;
DROP TABLE bank_teller_customers CASCADE CONSTRAINTS;

-- 고객 테이블
CREATE TABLE bank_teller_customers (
    customer_id VARCHAR2(10) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(20),
    age NUMBER(3),
    address VARCHAR2(200),
    id_number VARCHAR2(20),
    income NUMBER(15),
    assets NUMBER(15),
    investment_goal VARCHAR2(100),
    risk_tolerance VARCHAR2(20),
    investment_period NUMBER(3),
    created_at TIMESTAMP DEFAULT SYSDATE
);

-- 직원 테이블
CREATE TABLE bank_teller_employees (
    employee_id VARCHAR2(10) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    department VARCHAR2(50),
    position VARCHAR2(50),
    created_at TIMESTAMP DEFAULT SYSDATE,
    updated_at TIMESTAMP DEFAULT SYSDATE
);

-- 금융 상품 테이블
CREATE TABLE bank_teller_financial_products (
    product_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR2(100) NOT NULL,
    product_type VARCHAR2(50),
    product_features CLOB,
    target_customers VARCHAR2(200),
    eligibility_requirements VARCHAR2(500),
    deposit_amount VARCHAR2(100),
    deposit_period VARCHAR2(100),
    interest_rate VARCHAR2(20),
    preferential_rate VARCHAR2(20),
    tax_benefits VARCHAR2(100),
    withdrawal_conditions VARCHAR2(500),
    notes CLOB,
    deposit_protection VARCHAR2(100),
    interest_rate_table VARCHAR2(200),
    product_guide_path VARCHAR2(200),
    created_at TIMESTAMP DEFAULT SYSDATE,
    updated_at TIMESTAMP DEFAULT SYSDATE
);

-- 고객 상품 테이블
CREATE TABLE bank_teller_customer_products (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id VARCHAR2(10) NOT NULL,
    product_name VARCHAR2(100) NOT NULL,
    product_type VARCHAR2(50),
    balance NUMBER(15),
    monthly_payment NUMBER(15),
    interest_rate NUMBER(5,2),
    start_date DATE,
    maturity_date DATE,
    status VARCHAR2(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT SYSDATE,
    CONSTRAINT fk_customer_products_customer 
        FOREIGN KEY (customer_id) REFERENCES bank_teller_customers(customer_id)
);

-- 상품 서식 테이블
CREATE TABLE bank_teller_product_forms (
    form_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_type VARCHAR2(50) NOT NULL,
    form_name VARCHAR2(100) NOT NULL,
    form_template CLOB,
    is_active NUMBER(1) DEFAULT 1,
    required_fields CLOB
);

-- 상담 세션 테이블
CREATE TABLE bank_teller_consultation_sessions (
    session_id VARCHAR2(50) PRIMARY KEY,
    customer_id VARCHAR2(10),
    employee_id VARCHAR2(10),
    status VARCHAR2(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT SYSDATE,
    updated_at TIMESTAMP DEFAULT SYSDATE,
    CONSTRAINT fk_consultation_customer 
        FOREIGN KEY (customer_id) REFERENCES bank_teller_customers(customer_id),
    CONSTRAINT fk_consultation_employee 
        FOREIGN KEY (employee_id) REFERENCES bank_teller_employees(employee_id)
);

-- 세션 참가자 테이블
CREATE TABLE bank_teller_session_participants (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id VARCHAR2(50) NOT NULL,
    participant_id VARCHAR2(50) NOT NULL,
    participant_type VARCHAR2(20) NOT NULL,
    joined_at TIMESTAMP DEFAULT SYSDATE,
    CONSTRAINT fk_participants_session 
        FOREIGN KEY (session_id) REFERENCES bank_teller_consultation_sessions(session_id)
);

-- 인덱스 생성
CREATE INDEX idx_customer_products_customer_id ON bank_teller_customer_products(customer_id);
CREATE INDEX idx_consultation_customer_id ON bank_teller_consultation_sessions(customer_id);
CREATE INDEX idx_consultation_employee_id ON bank_teller_consultation_sessions(employee_id);
CREATE INDEX idx_participants_session_id ON bank_teller_session_participants(session_id);
