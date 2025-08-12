const { run } = require('../config/database');
const bcrypt = require('bcrypt');

async function addNumericEmployees() {
  try {
    console.log('숫자 ID 직원들을 추가합니다...');
    
    const saltRounds = 10;
    
    // 직원 1234 추가
    const hashedPassword1 = await bcrypt.hash('1234', saltRounds);
    await run(`
      INSERT OR REPLACE INTO employees (employee_id, name, password_hash, department, position)
      VALUES (?, ?, ?, ?, ?)
    `, ['1234', '김직원', hashedPassword1, '영업부', '대리']);
    
    // 직원 1111 추가
    const hashedPassword2 = await bcrypt.hash('1111', saltRounds);
    await run(`
      INSERT OR REPLACE INTO employees (employee_id, name, password_hash, department, position)
      VALUES (?, ?, ?, ?, ?)
    `, ['1111', '박상담사', hashedPassword2, '상담부', '과장']);
    
    // 직원 2222 추가
    const hashedPassword3 = await bcrypt.hash('2222', saltRounds);
    await run(`
      INSERT OR REPLACE INTO employees (employee_id, name, password_hash, department, position)
      VALUES (?, ?, ?, ?, ?)
    `, ['2222', '이매니저', hashedPassword3, '관리부', '차장']);
    
    // 직원 3333 추가
    const hashedPassword4 = await bcrypt.hash('3333', saltRounds);
    await run(`
      INSERT OR REPLACE INTO employees (employee_id, name, password_hash, department, position)
      VALUES (?, ?, ?, ?, ?)
    `, ['3333', '최팀장', hashedPassword4, '기획부', '팀장']);
    
    console.log('숫자 ID 직원들이 성공적으로 추가되었습니다!');
    console.log('로그인 가능한 계정들:');
    console.log('- ID: 1234, PW: 1234 (김직원)');
    console.log('- ID: 1111, PW: 1111 (박상담사)');
    console.log('- ID: 2222, PW: 2222 (이매니저)');
    console.log('- ID: 3333, PW: 3333 (최팀장)');
    console.log('- ID: admin, PW: admin123 (관리자)');
    
  } catch (error) {
    console.error('직원 추가 중 오류 발생:', error);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    await addNumericEmployees();
    process.exit(0);
  } catch (error) {
    console.error('실행 실패:', error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = { addNumericEmployees };

