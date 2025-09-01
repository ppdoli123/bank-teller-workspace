-- Supabase PostgreSQL용 employee 테이블 생성 및 데이터 삽입

-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS employee CASCADE;

-- employee 테이블 생성
CREATE TABLE employee (
    id BIGSERIAL PRIMARY KEY,
    employeeid VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    position VARCHAR(50),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 테스트 직원 데이터 삽입
INSERT INTO employee (employeeid, name, passwordhash, department, position) VALUES
('admin', '관리자', 'admin123', '관리부', '관리자'),
('1234', '김직원', '1234', '개인금융부', '상담원'),
('1111', '박상담사', '1111', '개인금융부', '상담사'),
('2222', '이매니저', '2222', '기업금융부', '매니저');

-- 인덱스 생성
CREATE INDEX idx_employee_employeeid ON employee(employeeid);

-- 테이블 확인
SELECT * FROM employee;
