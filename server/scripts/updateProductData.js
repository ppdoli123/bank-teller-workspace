const { db, query } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// JSON 데이터를 제대로 파싱해서 DB에 삽입하는 함수
async function updateProductData() {
  try {
    console.log('금융상품 데이터를 업데이트합니다...');
    
    // 기존 상품 데이터 삭제
    await query('DELETE FROM financial_products');
    console.log('기존 상품 데이터를 삭제했습니다.');
    
    // JSON 파일 읽기
    const jsonPath = path.join(__dirname, '../../데이터_크롤링/hana_products_with_pdf.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const products = JSON.parse(jsonData);
    
    let insertedCount = 0;
    
    for (const product of products) {
      try {
        // 상품 타입 결정 로직 개선
        let productType = '기타';
        const productName = product.상품명 || '';
        if (productName.includes('적금') || productName.includes('저축')) {
          productType = '적금';
        } else if (productName.includes('예금') || productName.includes('통장')) {
          productType = '예금';
        } else if (productName.includes('대출') || productName.includes('론')) {
          productType = '대출';
        } else if (productName.includes('청약') || productName.includes('주택')) {
          productType = '청약';
        } else if (productName.includes('펀드') || productName.includes('투자')) {
          productType = '투자';
        }

        // 금리 정보 정리 (숫자만 추출)
        const extractRate = (rateText) => {
          if (!rateText) return '';
          // 첫 번째 나오는 숫자.숫자% 패턴을 찾음
          const match = rateText.match(/(\d+\.?\d*)\s*%/);
          return match ? `${match[1]}%` : '';
        };

        // 가입금액 정리
        const cleanAmount = (amountText) => {
          if (!amountText) return '';
          // 간단한 금액 정보만 추출
          if (amountText.includes('만원') || amountText.includes('원')) {
            const match = amountText.match(/([\d,]+\s*만원|[\d,]+\s*원)/);
            return match ? match[1] : amountText.substring(0, 100);
          }
          return amountText.substring(0, 100);
        };

        // 기간 정보 정리
        const cleanPeriod = (periodText) => {
          if (!periodText) return '';
          if (periodText.includes('개월') || periodText.includes('년')) {
            const match = periodText.match(/([\d~\s]*개월|[\d~\s]*년)/);
            return match ? match[1] : periodText.substring(0, 50);
          }
          return periodText.substring(0, 50);
        };

        await query(`
          INSERT INTO financial_products (
            product_name, product_type, product_features, target_customers,
            eligibility_requirements, deposit_amount, deposit_period,
            interest_rate, preferential_rate, tax_benefits,
            withdrawal_conditions, notes, deposit_protection,
            interest_rate_table, product_guide_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          productName,
          productType,
          (product.상품특징 || '').substring(0, 500),
          (product.가입대상 || '').substring(0, 500),
          (product.가입기간 || product.저축기간 || product.준비서류 || '').substring(0, 200),
          cleanAmount(product.가입금액 || product.납입금액 || ''),
          cleanPeriod(product.가입기간 || product.저축기간 || ''),
          extractRate(product.금리),
          extractRate(product.우대금리 || product['우대금리(쿠폰)']),
          (product.세제혜택 || product.비과세 || product.소득공제 || '').substring(0, 300),
          (product.일부해지 || product['주택청약 당첨시 일부인출'] || '').substring(0, 300),
          (product.유의사항 || '').substring(0, 500),
          (product['예금자 보호'] || '').substring(0, 200),
          JSON.stringify(product.금리표 || []),
          product.상품설명서_경로 || ''
        ]);
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`${insertedCount}개 상품 처리 완료...`);
        }
      } catch (productError) {
        console.error(`상품 "${product.상품명}" 삽입 중 오류:`, productError.message);
      }
    }
    
    console.log(`총 ${insertedCount}개의 금융상품 데이터를 업데이트했습니다.`);
    
    // 상품 타입별 개수 확인
    const typeStats = await query(`
      SELECT product_type, COUNT(*) as count 
      FROM financial_products 
      GROUP BY product_type 
      ORDER BY count DESC
    `);
    
    console.log('\n=== 상품 타입별 통계 ===');
    typeStats.rows.forEach(stat => {
      console.log(`${stat.product_type}: ${stat.count}개`);
    });
    
    // 샘플 데이터 확인
    const sampleProducts = await query(`
      SELECT product_name, product_type, deposit_amount, interest_rate 
      FROM financial_products 
      WHERE interest_rate != '' AND deposit_amount != ''
      LIMIT 5
    `);
    
    console.log('\n=== 샘플 상품 데이터 ===');
    sampleProducts.rows.forEach(product => {
      console.log(`${product.product_name} (${product.product_type})`);
      console.log(`  가입금액: ${product.deposit_amount}`);
      console.log(`  금리: ${product.interest_rate}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('상품 데이터 업데이트 중 오류 발생:', error);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    await updateProductData();
    console.log('상품 데이터 업데이트가 완료되었습니다.');
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('업데이트 실패:', error);
    db.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateProductData };
