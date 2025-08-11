const { db, run } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    console.log('데이터베이스 초기화를 시작합니다...');
    
    // 테이블 삭제 (순서 중요 - 외래키 제약조건 때문에)
    await run('DROP TABLE IF EXISTS consultation_sessions');
    await run('DROP TABLE IF EXISTS product_recommendations');
    await run('DROP TABLE IF EXISTS financial_products');
    await run('DROP TABLE IF EXISTS employees');
    
    console.log('기존 테이블을 삭제했습니다.');
    
    // 직원 테이블 생성
    await run(`
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        department TEXT,
        position TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 금융상품 테이블 생성
    await run(`
      CREATE TABLE financial_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        product_type TEXT,
        product_features TEXT,
        target_customers TEXT,
        eligibility_requirements TEXT,
        deposit_amount TEXT,
        deposit_period TEXT,
        interest_rate TEXT,
        preferential_rate TEXT,
        tax_benefits TEXT,
        withdrawal_conditions TEXT,
        notes TEXT,
        deposit_protection TEXT,
        interest_rate_table TEXT,
        product_guide_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 상담 세션 테이블 생성
    await run(`
      CREATE TABLE consultation_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        employee_id TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        customer_age INTEGER,
        customer_income INTEGER,
        customer_assets INTEGER,
        investment_goal TEXT,
        risk_tolerance TEXT,
        investment_period INTEGER,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
      )
    `);
    
    // 상품 추천 테이블 생성
    await run(`
      CREATE TABLE product_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        product_id INTEGER,
        recommendation_reason TEXT,
        priority_order INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id),
        FOREIGN KEY (product_id) REFERENCES financial_products(id)
      )
    `);
    
    console.log('테이블을 생성했습니다.');
    
    // 기본 직원 데이터 삽입
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    await run(`
      INSERT INTO employees (employee_id, name, password_hash, department, position)
      VALUES (?, ?, ?, ?, ?)
    `, ['admin', '관리자', hashedPassword, 'IT', '시스템관리자']);
    
    console.log('기본 직원 데이터를 삽입했습니다.');
    
    console.log('데이터베이스 초기화가 완료되었습니다.');
    
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
    throw error;
  }
}

// JSON 데이터를 데이터베이스에 삽입하는 함수
async function insertProductData() {
  try {
    console.log('금융상품 데이터를 삽입합니다...');
    
    // JSON 파일 읽기
    const jsonPath = path.join(__dirname, '../../데이터_크롤링/hana_products_with_pdf.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const products = JSON.parse(jsonData);
    
    let insertedCount = 0;
    
    for (const product of products) {
      try {
        await run(`
          INSERT INTO financial_products (
            product_name, product_type, product_features, target_customers,
            eligibility_requirements, deposit_amount, deposit_period,
            interest_rate, preferential_rate, tax_benefits,
            withdrawal_conditions, notes, deposit_protection,
            interest_rate_table, product_guide_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.상품명 || '',
          product.상품특징 ? '적금' : '예금', // 상품 타입 추정
          product.상품특징 || '',
          product.가입대상 || '',
          product.가입기간 || product.저축기간 || '',
          product.가입금액 || product.납입금액 || '',
          product.가입기간 || product.저축기간 || '',
          product.금리 || '',
          product.우대금리 || product['우대금리(쿠폰)'] || '',
          product.세제혜택 || product.비과세 || '',
          product.일부해지 || product['주택청약 당첨시 일부인출'] || '',
          product.유의사항 || '',
          product['예금자 보호'] || '',
          JSON.stringify(product.금리표 || []),
          product.상품설명서_경로 || ''
        ]);
        insertedCount++;
      } catch (productError) {
        console.error(`상품 "${product.상품명}" 삽입 중 오류:`, productError.message);
      }
    }
    
    console.log(`총 ${insertedCount}개의 금융상품 데이터를 삽입했습니다.`);
    
  } catch (error) {
    console.error('상품 데이터 삽입 중 오류 발생:', error);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    await initDatabase();
    await insertProductData();
    console.log('모든 초기화 작업이 완료되었습니다.');
    
    // 데이터베이스 연결 종료
    db.close((err) => {
      if (err) {
        console.error('데이터베이스 종료 중 오류:', err);
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('초기화 실패:', error);
    db.close();
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = { initDatabase, insertProductData };