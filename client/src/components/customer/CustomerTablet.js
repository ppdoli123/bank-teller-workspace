import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import io from 'socket.io-client';

const TabletContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 90%;
`;

const Title = styled.h1`
  color: var(--hana-mint);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StatusCard = styled.div`
  background: ${props => props.connected ? '#e8f5e8' : '#fff3e0'};
  border: 2px solid ${props => props.connected ? '#4caf50' : '#ff9800'};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const StatusText = styled.p`
  color: ${props => props.connected ? '#2e7d32' : '#f57c00'};
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
`;

const SessionInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  
  h3 {
    color: var(--hana-mint);
    margin-bottom: 1rem;
  }
  
  p {
    margin: 0.5rem 0;
    color: #333;
  }
`;

const ActionButton = styled.button`
  background: var(--hana-mint);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--hana-mint-dark);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const CustomerTablet = () => {
  const [sessionId, setSessionId] = useState('');
  const [connected, setConnected] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isWaitingForEmployee, setIsWaitingForEmployee] = useState(true);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [productSummary, setProductSummary] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  useEffect(() => {
    // URL에서 세션 ID 추출 또는 기본 태블릿 세션 사용
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session') || 'tablet_main';
    setSessionId(urlSessionId);

    // Socket.IO 연결
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    // 태블릿 세션 참여
    newSocket.emit('join-tablet-session', {
      sessionId: urlSessionId,
      userType: 'customer-tablet'
    });

    // 활성 직원 세션 확인 요청
    newSocket.emit('check-active-employees');
    
    // 활성 직원 목록 수신
    newSocket.on('active-employees', (employees) => {
      if (employees.length > 0) {
        const firstEmployee = employees[0];
        setConnected(true);
        setEmployeeName(firstEmployee.userId);
        setIsWaitingForEmployee(false);
        
        // 해당 직원 세션에 참여
        newSocket.emit('join-tablet-session', {
          sessionId: firstEmployee.sessionId,
          userType: 'customer-tablet'
        });
        setSessionId(firstEmployee.sessionId);
      }
    });

    // 직원 연결 이벤트 수신
    newSocket.on('employee-connected', (data) => {
      setConnected(true);
      setEmployeeName(data.employeeName);
      setIsWaitingForEmployee(false);
    });

    // 고객 정보 업데이트 수신
    newSocket.on('customer-info-updated', (customerData) => {
      setCurrentCustomer(customerData);
      fetchCustomerProducts(customerData.CustomerID);
    });

    // 상품 상세보기 수신 (직원이 상품 상세보기를 눌렀을 때)
    newSocket.on('product-detail-sync', (productData) => {
      setSelectedProductDetail(productData);
    });

    // 세션 상태 업데이트 수신
    newSocket.on('session-status', (status) => {
      if (status.connected) {
        setConnected(true);
        setEmployeeName(status.employeeName);
        setIsWaitingForEmployee(false);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchCustomerProducts = async (customerId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/customers/${customerId}/products`);
      if (response.data.success) {
        setCustomerProducts(response.data.data.products);
        setProductSummary(response.data.data.summary);
        console.log('고객 보유 상품 로드:', response.data.data.products.length, '개');
      }
    } catch (error) {
      console.error('고객 보유 상품 조회 실패:', error);
    }
  };

  const handleStartConsultation = () => {
    if (socket) {
      socket.emit('start-consultation', {
        sessionId: sessionId,
        ready: true
      });
    }
  };

  const handleCustomerInfoConfirm = () => {
    if (socket && currentCustomer) {
      socket.emit('customer-info-confirmed', {
        sessionId: sessionId,
        customerData: currentCustomer
      });
    }
  };

  return (
    <TabletContainer>
      <WelcomeCard>
        <Title>🏦 하나은행</Title>
        <Subtitle>스마트 금융 상담 시스템</Subtitle>
        
        <StatusCard connected={connected}>
          <StatusText connected={connected}>
            {connected 
              ? `✅ ${employeeName} 직원과 연결되었습니다` 
              : '⏳ 직원 연결을 기다리는 중...'}
          </StatusText>
        </StatusCard>

        {sessionId && (
          <SessionInfo>
            <h3>세션 정보</h3>
            <p><strong>세션 ID:</strong> {sessionId}</p>
            <p><strong>상태:</strong> {connected ? '연결됨' : '대기중'}</p>
          </SessionInfo>
        )}

        {currentCustomer && (
          <>
            <SessionInfo>
              <h3>고객 정보 확인</h3>
              <p><strong>성함:</strong> {currentCustomer.Name}</p>
              <p><strong>연락처:</strong> {currentCustomer.Phone}</p>
              <p><strong>나이:</strong> {currentCustomer.Age}세</p>
              <ActionButton onClick={handleCustomerInfoConfirm}>
                정보 확인 완료
              </ActionButton>
            </SessionInfo>

            {productSummary && (
              <SessionInfo>
                <h3>💰 보유 상품 현황</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e8', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>총 자산</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                      {productSummary.totalAssets.toLocaleString()}원
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#ffebee', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>총 부채</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c62828' }}>
                      {productSummary.totalDebts.toLocaleString()}원
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f3e5f5', borderRadius: '8px', margin: '1rem 0' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>순자산</div>
                  <div style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold', 
                    color: productSummary.netAssets >= 0 ? '#2e7d32' : '#c62828' 
                  }}>
                    {productSummary.netAssets.toLocaleString()}원
                  </div>
                </div>
              </SessionInfo>
            )}

            {customerProducts.length > 0 && (
              <SessionInfo>
                <h3>📋 보유 상품 목록 ({customerProducts.length}개)</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {customerProducts.map((product, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1rem',
                        margin: '0.5rem 0',
                        background: product.balance >= 0 ? '#f8fff8' : '#fff8f8'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--hana-mint)' }}>
                            {product.product_name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {product.product_type} | {product.interest_rate}%
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: product.balance >= 0 ? '#2e7d32' : '#c62828' 
                          }}>
                            {product.balance >= 0 ? '+' : ''}{product.balance.toLocaleString()}원
                          </div>
                          {product.monthly_payment !== 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              월 {product.monthly_payment >= 0 ? '+' : ''}{product.monthly_payment.toLocaleString()}원
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SessionInfo>
            )}
          </>
        )}

        {connected && !currentCustomer && (
          <div>
            <p style={{ color: '#666', margin: '1rem 0' }}>
              직원이 신분증을 확인하는 동안 잠시 기다려 주세요.
            </p>
            <ActionButton onClick={handleStartConsultation}>
              상담 준비 완료
            </ActionButton>
          </div>
        )}

        {isWaitingForEmployee && (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ color: '#888' }}>
              직원이 시스템에 접속하면 자동으로 연결됩니다.
            </p>
          </div>
        )}

        {/* 상품 상세보기 모달 */}
        {selectedProductDetail && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80%',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #f1f3f4',
                paddingBottom: '1rem'
              }}>
                <h2 style={{ color: 'var(--hana-mint)', margin: 0 }}>
                  {selectedProductDetail.product_name}
                </h2>
                <button
                  onClick={() => setSelectedProductDetail(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>상품 타입</h4>
                <p style={{ margin: 0, color: '#333' }}>{selectedProductDetail.product_type}</p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>상품 특징</h4>
                <p style={{ margin: 0, color: '#333', lineHeight: 1.6 }}>
                  {selectedProductDetail.product_features || '정보 없음'}
                </p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>가입 금액</h4>
                <p style={{ margin: 0, color: '#333' }}>
                  {selectedProductDetail.deposit_amount || '정보 없음'}
                </p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>기본 금리</h4>
                <p style={{ margin: 0, color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {selectedProductDetail.interest_rate || '정보 없음'}
                </p>
              </div>
              
              {selectedProductDetail.preferential_rate && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>우대 금리</h4>
                  <p style={{ margin: 0, color: '#e65100', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {selectedProductDetail.preferential_rate}
                  </p>
                </div>
              )}
              
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginTop: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: 'var(--hana-mint)', fontWeight: 'bold' }}>
                  💡 직원과 함께 상품에 대해 상담받아보세요!
                </p>
              </div>
            </div>
          </div>
        )}
      </WelcomeCard>
    </TabletContainer>
  );
};

export default CustomerTablet;
