const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, run } = require('../config/database');

const router = express.Router();

// 직원 로그인
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    if (!employeeId || !password) {
      return res.status(400).json({
        error: '직원 ID와 비밀번호를 입력해주세요.'
      });
    }
    
    // 직원 정보 조회
    const result = await query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: '존재하지 않는 직원 ID입니다.'
      });
    }
    
    const employee = result.rows[0];
    
    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, employee.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: '비밀번호가 올바르지 않습니다.'
      });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      {
        employeeId: employee.employee_id,
        name: employee.name,
        department: employee.department,
        position: employee.position
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '8h' }
    );
    
    // 마지막 로그인 시간 업데이트
    await run(
      'UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?',
      [employeeId]
    );
    
    res.json({
      success: true,
      token,
      employee: {
        employeeId: employee.employee_id,
        name: employee.name,
        department: employee.department,
        position: employee.position
      }
    });
    
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({
      error: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
});

// 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: '접근 권한이 없습니다.'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        error: '유효하지 않은 토큰입니다.'
      });
    }
    req.user = user;
    next();
  });
};

// 토큰 유효성 검사
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    employee: req.user
  });
});

// 직원 정보 조회
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT employee_id, name, department, position, created_at FROM employees WHERE employee_id = ?',
      [req.user.employeeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '직원 정보를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      employee: result.rows[0]
    });
    
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    res.status(500).json({
      error: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = { router, authenticateToken };