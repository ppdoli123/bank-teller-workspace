const express = require('express');
const { query, run } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 새 상담 세션 생성
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { sessionId, customerId } = req.body;
    const employeeId = req.user.employeeId;
    
    // 세션 ID가 제공되지 않으면 자동 생성
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 새 세션 생성 (기존 세션이 있어도 새로 생성)
    const result = await run(`
      INSERT INTO consultation_sessions (session_id, employee_id, status)
      VALUES (?, ?, 'active')
    `, [finalSessionId, employeeId]);
    
    // 생성된 세션 조회
    const sessionResult = await query(
      'SELECT * FROM consultation_sessions WHERE id = ?',
      [result.lastID]
    );
    
    res.json({
      success: true,
      sessionId: finalSessionId,
      session: sessionResult.rows[0]
    });
    
  } catch (error) {
    console.error('세션 생성 에러:', error);
    res.status(500).json({
      error: '세션 생성 중 오류가 발생했습니다.'
    });
  }
});

// 상담 세션 정보 조회
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await query(`
      SELECT 
        cs.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM consultation_sessions cs
      LEFT JOIN employees e ON cs.employee_id = e.employee_id
      WHERE cs.session_id = ?
    `, [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '세션을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      session: result.rows[0]
    });
    
  } catch (error) {
    console.error('세션 조회 에러:', error);
    res.status(500).json({
      error: '세션 조회 중 오류가 발생했습니다.'
    });
  }
});

// 고객 정보 업데이트
router.put('/sessions/:sessionId/customer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      customerName,
      customerPhone,
      customerAge,
      customerIncome,
      customerAssets,
      investmentGoal,
      riskTolerance,
      investmentPeriod
    } = req.body;
    
    await run(`
      UPDATE consultation_sessions 
      SET 
        customer_name = ?,
        customer_phone = ?,
        customer_age = ?,
        customer_income = ?,
        customer_assets = ?,
        investment_goal = ?,
        risk_tolerance = ?,
        investment_period = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `, [
      customerName,
      customerPhone,
      customerAge,
      customerIncome,
      customerAssets,
      investmentGoal,
      riskTolerance,
      investmentPeriod,
      sessionId
    ]);
    
    // 업데이트된 세션 조회
    const result = await query(
      'SELECT * FROM consultation_sessions WHERE session_id = ?',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '세션을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      session: result.rows[0]
    });
    
  } catch (error) {
    console.error('고객 정보 업데이트 에러:', error);
    res.status(500).json({
      error: '고객 정보 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 상품 추천 저장
router.post('/sessions/:sessionId/recommendations', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { recommendations } = req.body;
    
    if (!recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({
        error: '추천 상품 목록이 필요합니다.'
      });
    }
    
    // 기존 추천 삭제
    await run(
      'DELETE FROM product_recommendations WHERE session_id = ?',
      [sessionId]
    );
    
    // 새 추천 저장
    for (const recommendation of recommendations) {
      await run(`
        INSERT INTO product_recommendations (
          session_id, product_id, recommendation_reason, priority_order
        ) VALUES (?, ?, ?, ?)
      `, [
        sessionId,
        recommendation.id,
        recommendation.recommendation_reason,
        recommendation.priority_order
      ]);
    }
    
    res.json({
      success: true,
      message: '상품 추천이 저장되었습니다.'
    });
    
  } catch (error) {
    console.error('추천 저장 에러:', error);
    res.status(500).json({
      error: '추천 저장 중 오류가 발생했습니다.'
    });
  }
});

// 저장된 상품 추천 조회
router.get('/sessions/:sessionId/recommendations', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await query(`
      SELECT 
        pr.*,
        fp.product_name,
        fp.product_type,
        fp.product_features,
        fp.interest_rate,
        fp.preferential_rate
      FROM product_recommendations pr
      JOIN financial_products fp ON pr.product_id = fp.id
      WHERE pr.session_id = ?
      ORDER BY pr.priority_order
    `, [sessionId]);
    
    res.json({
      success: true,
      recommendations: result.rows
    });
    
  } catch (error) {
    console.error('추천 조회 에러:', error);
    res.status(500).json({
      error: '추천 조회 중 오류가 발생했습니다.'
    });
  }
});

// 직원의 상담 세션 목록 조회
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        cs.*,
        (SELECT COUNT(*) FROM product_recommendations pr WHERE pr.session_id = cs.session_id) as recommendation_count
      FROM consultation_sessions cs
      WHERE cs.employee_id = ?
    `;
    
    const params = [employeeId];
    
    if (status) {
      sql += ` AND cs.status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY cs.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      sessions: result.rows
    });
    
  } catch (error) {
    console.error('세션 목록 조회 에러:', error);
    res.status(500).json({
      error: '세션 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 상담 세션 상태 업데이트
router.put('/sessions/:sessionId/status', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: '올바른 상태값이 필요합니다. (active, completed, cancelled)'
      });
    }
    
    await run(`
      UPDATE consultation_sessions 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `, [status, sessionId]);
    
    // 업데이트된 세션 조회
    const result = await query(
      'SELECT * FROM consultation_sessions WHERE session_id = ?',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '세션을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      session: result.rows[0]
    });
    
  } catch (error) {
    console.error('세션 상태 업데이트 에러:', error);
    res.status(500).json({
      error: '세션 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;