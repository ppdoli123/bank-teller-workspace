import React from 'react';
import styled from 'styled-components';

const FormDisplayContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--hana-mint);
`;

const FormTitle = styled.h1`
  color: var(--hana-mint);
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const FormSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const FormContent = styled.div`
  line-height: 1.8;
  font-size: 1rem;
  
  h2, h3, h4 {
    color: var(--hana-mint);
    margin: 1.5rem 0 1rem 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.75rem;
      text-align: left;
    }
    
    th {
      background: var(--hana-mint-light);
      color: var(--hana-mint);
      font-weight: 600;
    }
  }
  
  .highlight {
    background: #fff9c4;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-weight: 600;
  }
  
  .section {
    margin: 1.5rem 0;
    padding: 1rem;
    border-left: 4px solid var(--hana-mint);
    background: #f8f9fa;
  }
`;

const ProductInfo = styled.div`
  background: var(--hana-mint-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  h3 {
    color: var(--hana-mint);
    margin-bottom: 1rem;
  }
  
  .product-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0, 132, 133, 0.2);
      
      .label {
        font-weight: 600;
        color: var(--hana-mint);
      }
      
      .value {
        color: #333;
      }
    }
  }
`;

const FormDisplay = ({ formData }) => {
  if (!formData) return null;

  return (
    <FormDisplayContainer>
      <FormHeader>
        <FormTitle>{formData.formName}</FormTitle>
        <FormSubtitle>{formData.formType} 가입 신청서</FormSubtitle>
      </FormHeader>

      {formData.productInfo && (
        <ProductInfo>
          <h3>🎯 선택된 상품 정보</h3>
          <div className="product-details">
            <div className="detail-item">
              <span className="label">상품명</span>
              <span className="value">{formData.productInfo.productName}</span>
            </div>
            <div className="detail-item">
              <span className="label">상품타입</span>
              <span className="value">{formData.productInfo.productType}</span>
            </div>
            <div className="detail-item">
              <span className="label">기본금리</span>
              <span className="value">{formData.productInfo.interestRate}</span>
            </div>
            <div className="detail-item">
              <span className="label">우대금리</span>
              <span className="value">{formData.productInfo.preferentialRate}</span>
            </div>
            <div className="detail-item">
              <span className="label">가입금액</span>
              <span className="value">{formData.productInfo.depositAmount}</span>
            </div>
            <div className="detail-item">
              <span className="label">가입기간</span>
              <span className="value">{formData.productInfo.depositPeriod}</span>
            </div>
          </div>
        </ProductInfo>
      )}

      <FormContent
        dangerouslySetInnerHTML={{ 
          __html: formData.formContent || '서식 내용을 불러오는 중입니다...' 
        }}
      />
    </FormDisplayContainer>
  );
};

export default FormDisplay;
