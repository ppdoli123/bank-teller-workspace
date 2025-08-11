const express = require('express');
const { query, run } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 고객 정보 조회
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // 고객 기본 정보 조회
    const customerResult = await query('SELECT * FROM customers WHERE customer_id = ?', [customerId]);
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        error: '고객을 찾을 수 없습니다.'
      });
    }
    
    const customer = customerResult.rows[0];
    
    res.json({
      success: true,
      customer: {
        id: customer.customer_id,
        name: customer.name,
        phone: customer.phone,
        age: customer.age,
        income: customer.income,
        assets: customer.assets,
        investmentGoal: customer.investment_goal,
        riskTolerance: customer.risk_tolerance,
        investmentPeriod: customer.investment_period
      }
    });
    
  } catch (error) {
    console.error('고객 조회 에러:', error);
    res.status(500).json({
      error: '고객 조회 중 오류가 발생했습니다.'
    });
  }
});

// 고객 보유 상품 조회
router.get('/:customerId/products', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const products = await query(`
      SELECT 
        id, product_name, product_type, balance, monthly_payment,
        interest_rate, start_date, maturity_date, status
      FROM customer_products 
      WHERE customer_id = ? AND status = 'active'
      ORDER BY 
        CASE product_type 
          WHEN '예금' THEN 1 
          WHEN '적금' THEN 2 
          WHEN '청약' THEN 3 
          WHEN '대출' THEN 4 
          ELSE 5 
        END,
        product_name
    `, [customerId]);
    
    // 자산/부채 요약 계산
    let totalAssets = 0;
    let totalDebts = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    
    products.rows.forEach(product => {
      if (product.balance >= 0) {
        totalAssets += product.balance;
      } else {
        totalDebts += Math.abs(product.balance);
      }
      
      if (product.monthly_payment >= 0) {
        monthlyIncome += product.monthly_payment;
      } else {
        monthlyExpense += Math.abs(product.monthly_payment);
      }
    });
    
    res.json({
      success: true,
      products: products.rows,
      summary: {
        totalAssets: totalAssets,
        totalDebts: totalDebts,
        netAssets: totalAssets - totalDebts,
        monthlyIncome: monthlyIncome,
        monthlyExpense: monthlyExpense,
        monthlyNet: monthlyIncome - monthlyExpense,
        productCount: products.rows.length
      }
    });
    
  } catch (error) {
    console.error('고객 보유 상품 조회 에러:', error);
    res.status(500).json({
      error: '고객 보유 상품 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
