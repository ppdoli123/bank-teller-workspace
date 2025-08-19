import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// 한글-영어 매핑
const FORM_TYPE_MAPPING = {
  '예금': 'deposit',
  '적금': 'savings', 
  '대출': 'loan',
  '투자': 'investment'
};

const FormSelectorContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  color: var(--hana-mint);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const FormTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormTypeCard = styled.div`
  border: 2px solid ${props => props.selected ? 'var(--hana-mint)' : '#e9ecef'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  background: ${props => props.selected ? 'var(--hana-mint-light)' : 'white'};

  &:hover {
    border-color: var(--hana-mint);
    background: var(--hana-mint-light);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--hana-mint);
  }

  .title {
    font-weight: 600;
    color: var(--hana-dark-gray);
  }
`;

const FormList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
`;

const FormItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid ${props => props.selected ? 'var(--hana-mint)' : '#e9ecef'};
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background: ${props => props.selected ? 'var(--hana-mint-light)' : 'white'};
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--hana-mint);
    background: var(--hana-mint-light);
  }

  .form-info {
    flex: 1;

    .form-name {
      font-weight: 600;
      color: var(--hana-dark-gray);
      margin-bottom: 0.25rem;
    }

    .form-description {
      font-size: 0.9rem;
      color: #666;
    }
  }
`;

const ActionButton = styled.button`
  background: var(--hana-mint);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--hana-mint-dark);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const FormSelector = ({ selectedProduct, onFormSelected, sessionId, stompClient }) => {
  const [formTypes] = useState([
    { type: '예금', icon: '💰', name: '예금 서식' },
    { type: '적금', icon: '🏦', name: '적금 서식' },
    { type: '대출', icon: '💳', name: '대출 서식' },
    { type: '투자', icon: '📈', name: '투자 서식' }
  ]);

  const [selectedFormType, setSelectedFormType] = useState('');
  const [availableForms, setAvailableForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(false);

  // 서식 타입별 목록 조회
  const fetchFormsByType = async (formType) => {
    try {
      setLoading(true);
      // 한글을 영어로 변환
      const englishType = FORM_TYPE_MAPPING[formType] || formType;
      const response = await axios.get(`http://localhost:8080/api/test-forms/by-type?type=${englishType}`);
      if (response.data.success) {
        setAvailableForms(response.data.data);
      } else {
        // 응답이 배열인 경우 (success 없이)
        setAvailableForms(response.data);
      }
    } catch (error) {
      console.error('서식 목록 조회 실패:', error);
      setAvailableForms([]);
    } finally {
      setLoading(false);
    }
  };

  // 서식 타입 선택
  const handleFormTypeSelect = (formType) => {
    setSelectedFormType(formType);
    setSelectedForm(null);
    fetchFormsByType(formType);
  };

  // 서식 선택
  const handleFormSelect = (form) => {
    setSelectedForm(form);
  };

  // 서식 적용
  const handleApplyForm = async () => {
    if (!selectedForm) {
      alert('서식을 선택해주세요.');
      return;
    }

    console.log('서식 전송 시작:', {
      selectedForm,
      selectedProduct,
      sessionId,
      stompClient: !!stompClient
    });

    try {
      setLoading(true);
      
      // 서식 데이터 준비 (상품 정보 없이도 가능)
      const formData = {
        formType: selectedFormType,
        formName: selectedForm.formName,
        formTemplate: selectedForm.formTemplate,
        description: selectedForm.description,
        productInfo: selectedProduct || null // 상품이 선택되지 않아도 null로 전송
      };

      // 태블릿으로 서식 전송
      if (stompClient && sessionId) {
        console.log('WebSocket으로 서식 전송:', formData);
        
        stompClient.publish({
          destination: '/app/send-to-session',
          body: JSON.stringify({
            sessionId: sessionId,
            type: 'form-display',
            data: formData
          })
        });

        alert('서식이 태블릿으로 전송되었습니다.');
      } else {
        console.error('WebSocket 연결 또는 세션 ID가 없습니다:', {
          stompClient: !!stompClient,
          sessionId
        });
        alert('WebSocket 연결이 필요합니다.');
      }

      if (onFormSelected) {
        onFormSelected({
          form: selectedForm,
          filledContent: selectedForm.formTemplate,
          productInfo: selectedProduct
        });
      }

    } catch (error) {
      console.error('서식 전송 실패:', error);
      alert('서식 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSelectorContainer>
      <SectionTitle>📋 서식 선택</SectionTitle>
      
      {/* 서식 타입 선택 */}
      <FormTypeGrid>
        {formTypes.map((formType) => (
          <FormTypeCard
            key={formType.type}
            selected={selectedFormType === formType.type}
            onClick={() => handleFormTypeSelect(formType.type)}
          >
            <div className="icon">{formType.icon}</div>
            <div className="title">{formType.name}</div>
          </FormTypeCard>
        ))}
      </FormTypeGrid>

      {/* 선택된 타입의 서식 목록 */}
      {selectedFormType && (
        <>
          <SectionTitle>{selectedFormType} 서식 목록</SectionTitle>
          <FormList>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                서식을 불러오는 중...
              </div>
            ) : availableForms.length > 0 ? (
              availableForms.map((form) => (
                <FormItem
                  key={form.id}
                  selected={selectedForm?.id === form.id}
                  onClick={() => handleFormSelect(form)}
                >
                  <div className="form-info">
                    <div className="form-name">{form.formName}</div>
                    <div className="form-description">{form.description}</div>
                  </div>
                </FormItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                해당 타입의 서식이 없습니다.
              </div>
            )}
          </FormList>

          <ActionButton
            onClick={handleApplyForm}
            disabled={!selectedForm || loading}
          >
            {loading ? '처리 중...' : '서식 태블릿으로 전송'}
          </ActionButton>
        </>
      )}

      {!selectedProduct && (
        <div style={{ 
          background: '#e3f2fd', 
          border: '1px solid #90caf9', 
          borderRadius: '6px',
          padding: '1rem',
          marginTop: '1rem',
          textAlign: 'center',
          color: '#1565c0'
        }}>
          💡 상품을 선택하면 더 자세한 서식 정보를 제공할 수 있습니다.
        </div>
      )}
    </FormSelectorContainer>
  );
};

export default FormSelector;
