const { db, query } = require('../config/database');

async function addTestCustomers() {
  try {
    console.log('테스트 고객 데이터를 추가합니다...');
    
    // 고객 테이블 생성 (이미 있으면 무시)
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
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
    
    // 테스트 고객 데이터
    const testCustomers = [
      {
        customer_id: 'C001',
        name: '김철수',
        phone: '010-1234-5678',
        age: 35,
        address: '서울시 강남구 역삼동',
        id_number: '850315-1******',
        income: 50000000,
        assets: 100000000,
        investment_goal: '주택 구매',
        risk_tolerance: 'medium',
        investment_period: 60
      },
      {
        customer_id: 'C002',
        name: '이영희',
        phone: '010-2345-6789',
        age: 28,
        address: '서울시 서초구 서초동',
        id_number: '960712-2******',
        income: 40000000,
        assets: 50000000,
        investment_goal: '결혼 자금',
        risk_tolerance: 'low',
        investment_period: 36
      },
      {
        customer_id: 'C003',
        name: '박민수',
        phone: '010-3456-7890',
        age: 42,
        address: '경기도 성남시 분당구',
        id_number: '820428-1******',
        income: 80000000,
        assets: 200000000,
        investment_goal: '자녀 교육비',
        risk_tolerance: 'high',
        investment_period: 120
      },
      {
        customer_id: 'C004',
        name: '최지연',
        phone: '010-4567-8901',
        age: 31,
        address: '부산시 해운대구',
        id_number: '930825-2******',
        income: 45000000,
        assets: 80000000,
        investment_goal: '노후 준비',
        risk_tolerance: 'medium',
        investment_period: 240
      },
      {
        customer_id: 'C005',
        name: '정태호',
        phone: '010-5678-9012',
        age: 26,
        address: '대구시 수성구',
        id_number: '980203-1******',
        income: 35000000,
        assets: 30000000,
        investment_goal: '창업 자금',
        risk_tolerance: 'high',
        investment_period: 24
      }
    ];
    
    // 기존 테스트 고객 데이터 삭제
    await query('DELETE FROM customers WHERE customer_id LIKE "C%"');
    
    let insertedCount = 0;
    for (const customer of testCustomers) {
      try {
        await query(`
          INSERT INTO customers (
            customer_id, name, phone, age, address, id_number,
            income, assets, investment_goal, risk_tolerance, investment_period
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          customer.customer_id,
          customer.name,
          customer.phone,
          customer.age,
          customer.address,
          customer.id_number,
          customer.income,
          customer.assets,
          customer.investment_goal,
          customer.risk_tolerance,
          customer.investment_period
        ]);
        insertedCount++;
        console.log(`✅ ${customer.name} (${customer.customer_id}) 추가 완료`);
      } catch (error) {
        console.error(`❌ ${customer.name} 추가 실패:`, error.message);
      }
    }
    
    console.log(`\n총 ${insertedCount}명의 테스트 고객을 추가했습니다.`);
    
    // 추가된 고객 확인
    const customers = await query('SELECT * FROM customers ORDER BY customer_id');
    console.log('\n=== 등록된 테스트 고객 목록 ===');
    customers.rows.forEach(customer => {
      console.log(`${customer.customer_id}: ${customer.name} (${customer.age}세) - ${customer.phone}`);
    });
    
  } catch (error) {
    console.error('테스트 고객 추가 중 오류 발생:', error);
    throw error;
  }
}

async function main() {
  try {
    await addTestCustomers();
    console.log('\n테스트 고객 데이터 추가가 완료되었습니다.');
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('실패:', error);
    db.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addTestCustomers };

