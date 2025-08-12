const { query } = require('../config/database');

async function checkCustomers() {
  try {
    console.log('고객 테이블 확인 중...');
    
    // 테이블 존재 확인
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'");
    
    if (tables.rows.length === 0) {
      console.log('❌ customers 테이블이 존재하지 않습니다.');
      
      // 테이블 생성
      console.log('customers 테이블을 생성합니다...');
      await query(`
        CREATE TABLE customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          age INTEGER,
          address TEXT,
          id_number TEXT,
          income INTEGER,
          assets INTEGER,
          investment_goal TEXT,
          risk_tolerance TEXT,
          investment_period INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ customers 테이블이 생성되었습니다.');
    } else {
      console.log('✅ customers 테이블이 존재합니다.');
    }
    
    // 고객 데이터 확인
    const customers = await query('SELECT * FROM customers');
    console.log(`현재 등록된 고객 수: ${customers.rows.length}`);
    
    if (customers.rows.length === 0) {
      console.log('테스트 고객 데이터를 추가합니다...');
      
      const testCustomers = [
        ['C001', '김철수', '010-1234-5678', 35, '서울시 강남구 역삼동', '850315-1******', 50000000, 100000000, '주택 구매', 'medium', 60],
        ['C002', '이영희', '010-2345-6789', 28, '서울시 서초구 서초동', '960712-2******', 40000000, 50000000, '결혼 자금', 'low', 36],
        ['C003', '박민수', '010-3456-7890', 42, '경기도 성남시 분당구', '820428-1******', 80000000, 200000000, '자녀 교육비', 'high', 120],
        ['C004', '최지연', '010-4567-8901', 31, '부산시 해운대구', '930825-2******', 45000000, 80000000, '노후 준비', 'medium', 240],
        ['C005', '정태호', '010-5678-9012', 26, '대구시 수성구', '980203-1******', 35000000, 30000000, '창업 자금', 'high', 24]
      ];
      
      for (const customer of testCustomers) {
        try {
          await query(`
            INSERT INTO customers (
              customer_id, name, phone, age, address, id_number,
              income, assets, investment_goal, risk_tolerance, investment_period
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, customer);
          console.log(`✅ ${customer[1]} 추가 완료`);
        } catch (error) {
          console.log(`⚠️ ${customer[1]} 추가 실패: ${error.message}`);
        }
      }
    }
    
    // 최종 확인
    const finalCustomers = await query('SELECT customer_id, name, age, phone FROM customers ORDER BY customer_id');
    console.log('\n=== 등록된 고객 목록 ===');
    finalCustomers.rows.forEach(customer => {
      console.log(`${customer.customer_id}: ${customer.name} (${customer.age}세) - ${customer.phone}`);
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

checkCustomers().then(() => {
  console.log('완료!');
  process.exit(0);
}).catch(error => {
  console.error('실패:', error);
  process.exit(1);
});

