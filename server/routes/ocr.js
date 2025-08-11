const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('./auth');

const router = express.Router();

// multer 설정 (메모리 저장)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB 제한
});

// 테스트 고객 목록 조회
router.get('/test-customers', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/database');
    const customers = await query('SELECT * FROM customers ORDER BY customer_id');
    
    res.json({
      success: true,
      customers: customers.rows
    });
  } catch (error) {
    console.error('테스트 고객 조회 에러:', error);
    res.status(500).json({
      error: '고객 데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

// 테스트 고객 선택 (신분증 OCR 대신)
router.post('/select-test-customer', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({
        error: '고객 ID가 필요합니다.'
      });
    }
    
    const { query } = require('../config/database');
    const result = await query('SELECT * FROM customers WHERE customer_id = ?', [customerId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '해당 고객을 찾을 수 없습니다.'
      });
    }
    
    const customer = result.rows[0];
    
    // OCR 결과와 같은 형태로 반환
    const customerData = {
      CustomerID: customer.customer_id,
      Name: customer.name,
      Phone: customer.phone,
      Age: customer.age,
      Address: customer.address,
      IdNumber: customer.id_number,
      Income: customer.income,
      Assets: customer.assets,
      InvestmentGoal: customer.investment_goal,
      RiskTolerance: customer.risk_tolerance,
      InvestmentPeriod: customer.investment_period
    };
    
    console.log('테스트 고객 선택:', customerData.Name);
    
    res.json({
      success: true,
      customer: customerData
    });
    
  } catch (error) {
    console.error('테스트 고객 선택 에러:', error);
    res.status(500).json({
      error: '고객 선택 중 오류가 발생했습니다.'
    });
  }
});

// 신분증 OCR 처리 (실제 파일 업로드용 - 향후 확장)
router.post('/id-card', authenticateToken, upload.single('idCard'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: '신분증 이미지가 필요합니다.'
      });
    }
    
    // 실제 OCR 처리 대신 랜덤 테스트 고객 반환
    const { query } = require('../config/database');
    const customers = await query('SELECT * FROM customers ORDER BY RANDOM() LIMIT 1');
    
    if (customers.rows.length === 0) {
      return res.status(404).json({
        error: '등록된 테스트 고객이 없습니다.'
      });
    }
    
    const customer = customers.rows[0];
    const customerData = {
      CustomerID: customer.customer_id,
      Name: customer.name,
      Phone: customer.phone,
      Age: customer.age,
      Address: customer.address,
      IdNumber: customer.id_number,
      Income: customer.income,
      Assets: customer.assets,
      InvestmentGoal: customer.investment_goal,
      RiskTolerance: customer.risk_tolerance,
      InvestmentPeriod: customer.investment_period
    };
    
    console.log('신분증 OCR 처리 완료 (테스트):', customerData.Name);
    
    res.json({
      success: true,
      customer: customerData
    });
    
  } catch (error) {
    console.error('OCR 처리 에러:', error);
    res.status(500).json({
      error: 'OCR 처리 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
