import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { getProductInterestRates, getBestRateForPeriod } from '../../utils/interestRateUtils';
import { getApiUrl } from '../../config/api';

const SimulationContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow: auto;
`;

const SimulationHeader = styled.div`
  background: linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-mint-dark) 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '🎯';
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 4rem;
    opacity: 0.3;
  }
`;

const SimulationTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const SimulationSubtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`;

const SimulationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProductSelector = styled.div`
  background: var(--hana-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ConditionsPanel = styled.div`
  background: var(--hana-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  color: var(--hana-mint);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProductSelect = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--hana-mint);
  }
`;

const ConditionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConditionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--hana-gray);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &.active {
    background: rgba(0, 132, 133, 0.1);
    border: 2px solid var(--hana-mint);
  }
`;

const ConditionInfo = styled.div`
  flex: 1;
`;

const ConditionName = styled.div`
  font-weight: 600;
  color: var(--hana-black);
  margin-bottom: 0.25rem;
`;

const ConditionDescription = styled.div`
  font-size: 0.9rem;
  color: var(--hana-dark-gray);
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  ${ToggleInput}:checked + & {
    background-color: var(--hana-mint);
  }

  ${ToggleInput}:checked + &:before {
    transform: translateX(26px);
  }
`;

const ResultsPanel = styled.div`
  background: var(--hana-white);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ResultCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--hana-mint-light) 0%, var(--hana-mint) 100%);
  color: white;
  border-radius: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/api/placeholder/pattern') repeat;
    opacity: 0.1;
  }
`;

const ResultLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const ResultValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
`;

const BenefitsList = styled.div`
  margin-top: 1.5rem;
`;

const BenefitItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--hana-gray);
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const BenefitName = styled.div`
  font-weight: 500;
  color: var(--hana-black);
`;

const BenefitValue = styled.div`
  font-weight: 600;
  color: var(--hana-mint);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--hana-mint);
    color: white;
    
    &:hover {
      background: var(--hana-mint-dark);
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: var(--hana-white);
    color: var(--hana-mint);
    border: 2px solid var(--hana-mint);
    
    &:hover {
      background: var(--hana-mint);
      color: white;
    }
  }
`;

const IntelligentCommandBar = styled.div`
  background: var(--hana-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CommandInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--hana-mint);
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 132, 133, 0.1);
  }
`;

const CommandButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--hana-mint);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background: var(--hana-mint-dark);
  }
`;

const formatRate = (rate) => {
  return rate ? rate.toFixed(2) + '%' : '0.00%';
};

const SimulationPanel = ({ customer, onScreenSync, sessionId }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commandText, setCommandText] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchConditions();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('상품 조회 오류:', error);
    }
  };

  const fetchConditions = async () => {
    try {
      // 실제로는 조건 API가 있어야 하지만, 여기서는 더미 데이터 사용
      const dummyConditions = [
        { ConditionID: 1, ConditionName: '급여이체', Description: '월 급여이체 100만원 이상' },
        { ConditionID: 2, ConditionName: '카드사용실적', Description: '월 카드사용실적 30만원 이상' },
        { ConditionID: 3, ConditionName: '적금납입', Description: '월 적금납입 10만원 이상' },
        { ConditionID: 4, ConditionName: '예금잔액유지', Description: '예금잔액 500만원 이상 유지' },
        { ConditionID: 5, ConditionName: '신규고객', Description: '최근 3개월 내 신규 가입고객' },
        { ConditionID: 6, ConditionName: 'VIP고객', Description: '총 자산 1억원 이상' },
        { ConditionID: 7, ConditionName: '청년고객', Description: '만 34세 이하 청년고객' },
        { ConditionID: 8, ConditionName: '타행이체', Description: '월 타행이체 5회 이상' }
      ];
      setConditions(dummyConditions);
    } catch (error) {
      console.error('조건 조회 오류:', error);
    }
  };

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.ProductID === productId);
    setSelectedProduct(product);
    setSimulationResult(null);
  };

  const handleConditionToggle = (conditionId) => {
    setSelectedConditions(prev => {
      const newConditions = prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId];
      
      // 조건이 변경되면 자동으로 시뮬레이션 실행
      if (selectedProduct) {
        runSimulation(selectedProduct.ProductID, newConditions);
      }
      
      return newConditions;
    });
  };

  // 실제 금리 계산 함수
  const calculateActualInterestRate = (productName, periodMonths = 12) => {
    const rateInfo = getBestRateForPeriod(productName, periodMonths);
    return rateInfo ? rateInfo.interestRate : null;
  };

  // 시뮬레이션 결과에 실제 금리 반영
  const enhanceSimulationWithActualRates = (result, productName, periodMonths) => {
    const actualRate = calculateActualInterestRate(productName, periodMonths);
    
    if (actualRate) {
      return {
        ...result,
        baseInterestRate: actualRate,
        actualRateUsed: true,
        rateSource: '실시간 시장금리'
      };
    }
    
    return result;
  };

  const runSimulation = async (productId, conditionIds) => {
    if (!productId) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(getApiUrl('/api/simulation/benefits'), {
        customerId: customer.CustomerID,
        productId: productId,
        selectedConditions: conditionIds
      });
      
      // 실제 금리로 강화된 시뮬레이션 결과
      const productName = selectedProduct?.ProductName || selectedProduct?.product_name;
      const enhancedResult = enhanceSimulationWithActualRates(
        response.data, 
        productName, 
        12 // 기본 12개월
      );
      
      setSimulationResult(enhancedResult);
      
      // 고객 화면에 시뮬레이션 결과 동기화
      onScreenSync({
        type: 'simulation-result',
        data: {
          product: selectedProduct,
          result: enhancedResult
        }
      });
    } catch (error) {
      console.error('시뮬레이션 오류:', error);
      
      // API 오류 시 프론트엔드에서 기본 시뮬레이션 제공
      if (selectedProduct) {
        const productName = selectedProduct.ProductName || selectedProduct.product_name;
        const actualRate = calculateActualInterestRate(productName);
        
        const fallbackResult = {
          baseInterestRate: actualRate || 2.5,
          preferentialRate: selectedConditions.length * 0.1,
          totalInterestRate: (actualRate || 2.5) + (selectedConditions.length * 0.1),
          estimatedReturn: 1000000, // 임시 값
          actualRateUsed: actualRate ? true : false,
          rateSource: actualRate ? '실시간 시장금리' : '기본 금리',
          fallbackMode: true
        };
        
        setSimulationResult(fallbackResult);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIntelligentCommand = async () => {
    if (!commandText.trim()) return;
    
    // LLM 기반 자연어 처리 (실제로는 OpenAI API 등 사용)
    // 여기서는 간단한 키워드 매칭으로 구현
    const keywords = {
      '급여이체': [1],
      '카드': [2],
      '적금': [3],
      '예금': [4],
      '신규': [5],
      'VIP': [6],
      '청년': [7],
      '타행': [8]
    };
    
    let suggestedConditions = [];
    Object.entries(keywords).forEach(([keyword, conditionIds]) => {
      if (commandText.includes(keyword)) {
        suggestedConditions = [...suggestedConditions, ...conditionIds];
      }
    });
    
    if (suggestedConditions.length > 0) {
      setSelectedConditions(suggestedConditions);
      if (selectedProduct) {
        runSimulation(selectedProduct.ProductID, suggestedConditions);
      }
    }
    
    setCommandText('');
  };

  const handleApplyToCustomer = () => {
    if (simulationResult && selectedProduct) {
      onScreenSync({
        type: 'show-application-form',
        data: {
          product: selectedProduct,
          simulation: simulationResult,
          sessionId: sessionId
        }
      });
    }
  };

  return (
    <SimulationContainer>
      <SimulationHeader>
        <SimulationTitle>통합 혜택 시뮬레이터</SimulationTitle>
        <SimulationSubtitle>
          {customer.Name}님의 조건에 맞는 최적의 금융 혜택을 시뮬레이션해보세요
        </SimulationSubtitle>
      </SimulationHeader>

      <IntelligentCommandBar>
        <SectionTitle>🤖 지능형 커맨드 바</SectionTitle>
        <CommandInput
          type="text"
          placeholder="예: 급여이체와 카드 사용실적이 있는 청년 고객"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleIntelligentCommand()}
        />
        <CommandButton onClick={handleIntelligentCommand}>
          조건 분석하기
        </CommandButton>
      </IntelligentCommandBar>

      <SimulationGrid>
        <ProductSelector>
          <SectionTitle>🏦 상품 선택</SectionTitle>
          <ProductSelect
            value={selectedProduct?.ProductID || ''}
            onChange={handleProductChange}
          >
            <option value="">상품을 선택하세요</option>
            {products.map(product => (
              <option key={product.ProductID} value={product.ProductID}>
                {product.ProductName} ({product.ProductType})
              </option>
            ))}
          </ProductSelect>
          
          {selectedProduct && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--hana-gray)', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                {selectedProduct.ProductName}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--hana-dark-gray)' }}>
                기본 금리: {(() => {
                  const productName = selectedProduct.ProductName || selectedProduct.product_name;
                  const actualRate = calculateActualInterestRate(productName);
                  if (actualRate) {
                    return `${actualRate.toFixed(2)}% (실시간 금리)`;
                  }
                  return formatRate(selectedProduct.BaseInterestRate);
                })()}
              </div>
              {(() => {
                const productName = selectedProduct.ProductName || selectedProduct.product_name;
                const rates = getProductInterestRates(productName);
                if (rates.length > 0) {
                  return (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '4px',
                      border: '1px solid #4caf50'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2e7d32', marginBottom: '4px' }}>
                        📈 실시간 금리 정보
                      </div>
                      {rates.slice(0, 3).map((rate, idx) => (
                        <div key={idx} style={{
                          fontSize: '0.75rem',
                          color: '#333',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{rate.period}</span>
                          <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{rate.rateDisplay}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </ProductSelector>

        <ConditionsPanel>
          <SectionTitle>⚙️ 조건 설정</SectionTitle>
          <ConditionsList>
            {conditions.map(condition => (
              <ConditionItem
                key={condition.ConditionID}
                className={selectedConditions.includes(condition.ConditionID) ? 'active' : ''}
              >
                <ConditionInfo>
                  <ConditionName>{condition.ConditionName}</ConditionName>
                  <ConditionDescription>{condition.Description}</ConditionDescription>
                </ConditionInfo>
                <ToggleSwitch>
                  <ToggleInput
                    type="checkbox"
                    checked={selectedConditions.includes(condition.ConditionID)}
                    onChange={() => handleConditionToggle(condition.ConditionID)}
                  />
                  <ToggleSlider />
                </ToggleSwitch>
              </ConditionItem>
            ))}
          </ConditionsList>
        </ConditionsPanel>
      </SimulationGrid>

      {simulationResult && (
        <ResultsPanel>
          <SectionTitle>📊 시뮬레이션 결과</SectionTitle>
          
          <ResultsGrid>
            <ResultCard>
              <ResultLabel>기본 금리</ResultLabel>
              <ResultValue>{formatRate(simulationResult.baseInterestRate)}</ResultValue>
              {simulationResult.actualRateUsed && (
                <div style={{
                  fontSize: '0.7rem',
                  color: '#4caf50',
                  fontWeight: 'bold',
                  marginTop: '4px'
                }}>
                  🔄 {simulationResult.rateSource}
                </div>
              )}
            </ResultCard>
            <ResultCard>
              <ResultLabel>최종 금리</ResultLabel>
              <ResultValue>{formatRate(simulationResult.totalInterestRate)}</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>우대 혜택</ResultLabel>
              <ResultValue>
                +{formatRate(simulationResult.totalInterestRate - simulationResult.baseInterestRate)}
              </ResultValue>
            </ResultCard>
          </ResultsGrid>

          {simulationResult.benefits && simulationResult.benefits.length > 0 && (
            <div>
              <h4 style={{ color: 'var(--hana-mint)', marginBottom: '1rem' }}>적용된 혜택</h4>
              <BenefitsList>
                {simulationResult.benefits.map((benefit, index) => (
                  <BenefitItem key={index}>
                    <BenefitName>{benefit.BenefitName}</BenefitName>
                    <BenefitValue>
                      {benefit.BenefitType === 'Interest Rate' && `+${benefit.ApplicableValue}%`}
                      {benefit.BenefitType === 'Fee Discount' && '수수료 면제'}
                      {benefit.BenefitType === 'Points' && `${benefit.ApplicableValue}P`}
                      {benefit.BenefitType === 'Cashback' && `${benefit.ApplicableValue}% 캐시백`}
                    </BenefitValue>
                  </BenefitItem>
                ))}
              </BenefitsList>
            </div>
          )}

          <ActionButtons>
            <ActionButton 
              className="secondary"
              onClick={() => onScreenSync({
                type: 'show-detailed-simulation',
                data: simulationResult
              })}
            >
              상세 분석 보기
            </ActionButton>
            <ActionButton 
              className="primary"
              onClick={handleApplyToCustomer}
            >
              고객에게 제안하기
            </ActionButton>
          </ActionButtons>
        </ResultsPanel>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
          <p>시뮬레이션 실행 중...</p>
        </div>
      )}
    </SimulationContainer>
  );
};

export default SimulationPanel; 