const { query } = require('../config/database');

async function addCustomerProducts() {
  try {
    console.log('고객 보유 상품 테이블을 생성합니다...');
    
    // 고객 보유 상품 테이블 생성
    await query(`
      CREATE TABLE IF NOT EXISTS customer_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_type TEXT,
        balance INTEGER DEFAULT 0,
        monthly_payment INTEGER DEFAULT 0,
        interest_rate REAL DEFAULT 0,
        start_date TEXT,
        maturity_date TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `);
    
    // 기존 데이터 삭제
    await query('DELETE FROM customer_products');
    
    // 각 테스트 고객별 보유 상품 추가
    const customerProducts = [
      // 김철수 (C001) - 35세, 주택 구매 목표
      { customer_id: 'C001', product_name: '하나 주거래 통장', product_type: '예금', balance: 5000000, monthly_payment: 0, interest_rate: 0.1, start_date: '2023-01-15', maturity_date: null, status: 'active' },
      { customer_id: 'C001', product_name: '하나 정기예금', product_type: '예금', balance: 20000000, monthly_payment: 0, interest_rate: 3.2, start_date: '2023-06-01', maturity_date: '2024-06-01', status: 'active' },
      { customer_id: 'C001', product_name: '주택청약종합저축', product_type: '청약', balance: 3600000, monthly_payment: 300000, interest_rate: 1.8, start_date: '2022-03-10', maturity_date: null, status: 'active' },
      
      // 이영희 (C002) - 28세, 결혼 자금
      { customer_id: 'C002', product_name: '하나 주거래 통장', product_type: '예금', balance: 2500000, monthly_payment: 0, interest_rate: 0.1, start_date: '2023-03-01', maturity_date: null, status: 'active' },
      { customer_id: 'C002', product_name: '내맘 적금', product_type: '적금', balance: 4800000, monthly_payment: 200000, interest_rate: 2.5, start_date: '2023-01-01', maturity_date: '2025-01-01', status: 'active' },
      { customer_id: 'C002', product_name: '하나 카드론', product_type: '대출', balance: -3000000, monthly_payment: -150000, interest_rate: 15.9, start_date: '2023-08-15', maturity_date: '2025-08-15', status: 'active' },
      
      // 박민수 (C003) - 42세, 자녀 교육비
      { customer_id: 'C003', product_name: '하나 주거래 통장', product_type: '예금', balance: 8000000, monthly_payment: 0, interest_rate: 0.1, start_date: '2020-01-01', maturity_date: null, status: 'active' },
      { customer_id: 'C003', product_name: '하나 정기예금', product_type: '예금', balance: 50000000, monthly_payment: 0, interest_rate: 3.5, start_date: '2023-01-01', maturity_date: '2024-01-01', status: 'active' },
      { customer_id: 'C003', product_name: '교육비 적금', product_type: '적금', balance: 12000000, monthly_payment: 500000, interest_rate: 2.8, start_date: '2022-01-01', maturity_date: '2025-01-01', status: 'active' },
      { customer_id: 'C003', product_name: '하나 주택담보대출', product_type: '대출', balance: -150000000, monthly_payment: -800000, interest_rate: 4.2, start_date: '2021-05-01', maturity_date: '2041-05-01', status: 'active' },
      
      // 최지연 (C004) - 31세, 노후 준비
      { customer_id: 'C004', product_name: '하나 주거래 통장', product_type: '예금', balance: 3500000, monthly_payment: 0, interest_rate: 0.1, start_date: '2022-01-01', maturity_date: null, status: 'active' },
      { customer_id: 'C004', product_name: '연금저축', product_type: '적금', balance: 8400000, monthly_payment: 300000, interest_rate: 3.0, start_date: '2021-01-01', maturity_date: null, status: 'active' },
      { customer_id: 'C004', product_name: 'IRP 개인형퇴직연금', product_type: '적금', balance: 15000000, monthly_payment: 500000, interest_rate: 2.5, start_date: '2020-03-01', maturity_date: null, status: 'active' },
      
      // 정태호 (C005) - 26세, 창업 자금
      { customer_id: 'C005', product_name: '하나 주거래 통장', product_type: '예금', balance: 1200000, monthly_payment: 0, interest_rate: 0.1, start_date: '2023-05-01', maturity_date: null, status: 'active' },
      { customer_id: 'C005', product_name: '청년 희망적금', product_type: '적금', balance: 2400000, monthly_payment: 100000, interest_rate: 3.5, start_date: '2023-01-01', maturity_date: '2025-01-01', status: 'active' },
      { customer_id: 'C005', product_name: '신용대출', product_type: '대출', balance: -10000000, monthly_payment: -300000, interest_rate: 12.5, start_date: '2023-09-01', maturity_date: '2026-09-01', status: 'active' }
    ];
    
    let insertedCount = 0;
    for (const product of customerProducts) {
      try {
        await query(`
          INSERT INTO customer_products (
            customer_id, product_name, product_type, balance, monthly_payment,
            interest_rate, start_date, maturity_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.customer_id,
          product.product_name,
          product.product_type,
          product.balance,
          product.monthly_payment,
          product.interest_rate,
          product.start_date,
          product.maturity_date,
          product.status
        ]);
        insertedCount++;
      } catch (error) {
        console.error(`상품 "${product.product_name}" 추가 실패:`, error.message);
      }
    }
    
    console.log(`총 ${insertedCount}개의 고객 보유 상품을 추가했습니다.`);
    
    // 고객별 보유 상품 확인
    const customers = ['C001', 'C002', 'C003', 'C004', 'C005'];
    const customerNames = ['김철수', '이영희', '박민수', '최지연', '정태호'];
    
    for (let i = 0; i < customers.length; i++) {
      const products = await query(`
        SELECT product_name, product_type, balance, monthly_payment, interest_rate
        FROM customer_products 
        WHERE customer_id = ? AND status = 'active'
        ORDER BY product_type, product_name
      `, [customers[i]]);
      
      console.log(`\n=== ${customerNames[i]} (${customers[i]}) 보유 상품 ===`);
      let totalAssets = 0;
      let totalDebts = 0;
      
      products.rows.forEach(product => {
        const balanceStr = product.balance >= 0 
          ? `+${product.balance.toLocaleString()}원` 
          : `${product.balance.toLocaleString()}원`;
        const monthlyStr = product.monthly_payment !== 0 
          ? ` (월 ${product.monthly_payment.toLocaleString()}원)` 
          : '';
        
        console.log(`  ${product.product_name} (${product.product_type}): ${balanceStr}${monthlyStr} ${product.interest_rate}%`);
        
        if (product.balance >= 0) {
          totalAssets += product.balance;
        } else {
          totalDebts += Math.abs(product.balance);
        }
      });
      
      console.log(`  총 자산: ${totalAssets.toLocaleString()}원`);
      console.log(`  총 부채: ${totalDebts.toLocaleString()}원`);
      console.log(`  순자산: ${(totalAssets - totalDebts).toLocaleString()}원`);
    }
    
  } catch (error) {
    console.error('고객 보유 상품 추가 중 오류 발생:', error);
    throw error;
  }
}

async function main() {
  try {
    await addCustomerProducts();
    console.log('\n고객 보유 상품 데이터 추가가 완료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addCustomerProducts };
