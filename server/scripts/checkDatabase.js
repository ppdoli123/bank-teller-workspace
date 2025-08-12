const { query } = require('../config/database');

async function checkDatabase() {
  try {
    console.log('데이터베이스 상태를 확인합니다...');
    
    // 직원 테이블 확인
    const employees = await query('SELECT * FROM employees');
    console.log('\n=== 직원 정보 ===');
    if (employees.rows.length === 0) {
      console.log('❌ 직원 데이터가 없습니다!');
    } else {
      console.log(`✅ 총 ${employees.rows.length}명의 직원이 등록되어 있습니다:`);
      employees.rows.forEach(emp => {
        console.log(`- ID: ${emp.employee_id}, 이름: ${emp.name}, 부서: ${emp.department}`);
      });
    }
    
    // 금융상품 테이블 확인
    const products = await query('SELECT COUNT(*) as count FROM financial_products');
    console.log('\n=== 금융상품 정보 ===');
    console.log(`✅ 총 ${products.rows[0].count}개의 금융상품이 등록되어 있습니다.`);
    
    // 테이블 구조 확인
    console.log('\n=== 테이블 구조 확인 ===');
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('생성된 테이블들:');
    tables.rows.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류 발생:', error);
  }
}

checkDatabase();

