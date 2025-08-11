const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 모든 금융상품 조회
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        id, product_name, product_type, product_features,
        target_customers, interest_rate, preferential_rate,
        created_at
      FROM financial_products
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      sql += ` AND (product_name LIKE ? OR product_features LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (type) {
      sql += ` AND product_type = ?`;
      params.push(type);
    }
    
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    // 전체 개수 조회
    let countSql = 'SELECT COUNT(*) as count FROM financial_products WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countSql += ` AND (product_name LIKE ? OR product_features LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (type) {
      countSql += ` AND product_type = ?`;
      countParams.push(type);
    }
    
    const countResult = await query(countSql, countParams);
    const totalCount = countResult.rows[0].count;
    
    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('상품 목록 조회 에러:', error);
    res.status(500).json({
      error: '상품 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 금융상품 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM financial_products WHERE id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      product: result.rows[0]
    });
    
  } catch (error) {
    console.error('상품 상세 조회 에러:', error);
    res.status(500).json({
      error: '상품 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 상품 추천 (고객 정보 기반)
router.post('/recommend', authenticateToken, async (req, res) => {
  try {
    const {
      age,
      income,
      assets,
      investmentGoal,
      riskTolerance,
      investmentPeriod
    } = req.body;
    
    let sql = `
      SELECT 
        id, product_name, product_type, product_features,
        target_customers, interest_rate, preferential_rate,
        eligibility_requirements
      FROM financial_products
      WHERE 1=1
    `;
    
    const params = [];
    
    // 나이 기반 필터링 (예: 청년 상품)
    if (age <= 34) {
      sql += ` AND (target_customers LIKE '%청년%' OR target_customers LIKE '%만 19세%' OR target_customers LIKE '%만 34세%')`;
    }
    
    // 투자 목표 기반 필터링
    if (investmentGoal) {
      if (investmentGoal.includes('주택')) {
        sql += ` AND (product_name LIKE '%주택%' OR product_features LIKE '%주택%')`;
      } else if (investmentGoal.includes('적금')) {
        sql += ` AND (product_name LIKE '%적금%' OR product_type = '적금')`;
      } else if (investmentGoal.includes('예금')) {
        sql += ` AND (product_name LIKE '%예금%' OR product_type = '예금')`;
      }
    }
    
    // 위험도 기반 필터링
    if (riskTolerance === 'low') {
      sql += ` AND (product_name LIKE '%적금%' OR product_name LIKE '%예금%')`;
    }
    
    sql += ` ORDER BY 
      CASE 
        WHEN product_name LIKE '%청년%' AND ? <= 34 THEN 1
        ELSE 2 
      END,
      id DESC
      LIMIT 5
    `;
    
    params.push(age);
    
    const result = await query(sql, params);
    
    // 추천 이유 생성
    const recommendations = result.rows.map((product, index) => ({
      ...product,
      priority_order: index + 1,
      recommendation_reason: generateRecommendationReason(product, {
        age, income, assets, investmentGoal, riskTolerance, investmentPeriod
      })
    }));
    
    res.json({
      success: true,
      recommendations
    });
    
  } catch (error) {
    console.error('상품 추천 에러:', error);
    res.status(500).json({
      error: '상품 추천 중 오류가 발생했습니다.'
    });
  }
});

// 상품 타입 목록 조회
router.get('/types/list', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT product_type 
      FROM financial_products 
      WHERE product_type IS NOT NULL AND product_type != ''
      ORDER BY product_type
    `);
    
    res.json({
      success: true,
      types: result.rows.map(row => row.product_type)
    });
    
  } catch (error) {
    console.error('상품 타입 조회 에러:', error);
    res.status(500).json({
      error: '상품 타입 조회 중 오류가 발생했습니다.'
    });
  }
});

// 추천 이유 생성 함수
function generateRecommendationReason(product, customerInfo) {
  const reasons = [];
  
  // 나이 기반 추천 이유
  if (customerInfo.age <= 34 && product.product_name.includes('청년')) {
    reasons.push('청년 대상 우대 상품으로 특별 혜택을 받을 수 있습니다');
  }
  
  // 투자 목표 기반 추천 이유
  if (customerInfo.investmentGoal?.includes('주택') && product.product_name.includes('주택')) {
    reasons.push('주택 마련 목표에 적합한 상품입니다');
  }
  
  // 위험도 기반 추천 이유
  if (customerInfo.riskTolerance === 'low' && (product.product_name.includes('적금') || product.product_name.includes('예금'))) {
    reasons.push('안전한 투자를 선호하시는 분께 적합합니다');
  }
  
  // 금리 기반 추천 이유
  if (product.preferential_rate) {
    reasons.push('우대금리 혜택을 받을 수 있습니다');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : '고객님의 투자 성향에 적합한 상품입니다';
}

module.exports = router;