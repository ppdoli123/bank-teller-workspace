import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Webcam from 'react-webcam';

import ProductExplorer from './ProductExplorer';
import SimulationPanel from './SimulationPanel';
import CustomerInfo from './CustomerInfo';
import FormSelector from './FormSelector';

const DashboardContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  background-color: var(--hana-gray);
`;

const Sidebar = styled.div`
  width: 300px;
  background: var(--hana-white);
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  background: var(--hana-white);
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-mint-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const SessionStatus = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  background: ${props => props.active ? 'var(--hana-success)' : 'var(--hana-dark-gray)'};
  color: white;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Section = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
`;

const SectionTitle = styled.h3`
  color: var(--hana-mint);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  width: 100%;
  
  &.primary {
    background: var(--hana-mint);
    color: white;
    
    &:hover {
      background: var(--hana-mint-dark);
    }
  }
  
  &.secondary {
    background: var(--hana-white);
    color: var(--hana-mint);
    border: 1px solid var(--hana-mint);
    
    &:hover {
      background: var(--hana-mint);
      color: white;
    }
  }
`;

const CameraContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
`;

const CameraOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 2;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 0.75rem 1.5rem;
  background: var(--hana-mint);
  color: white;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: var(--hana-mint-dark);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: var(--hana-white);
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? 'var(--hana-mint)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--hana-mint)'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--hana-mint-dark)' : 'rgba(0, 132, 133, 0.1)'};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: auto;
`;

// 고객 정보 표시 컴포넌트
const CustomerInfoDisplay = ({ customer, detailed = false }) => {
  if (!customer) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <h3>고객 정보 없음</h3>
        <p>신분증을 업로드하거나 테스트 고객을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--hana-mint) 0%, #20b2aa 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
          {customer.Name} 고객님
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>
              <strong>연락처:</strong> {customer.Phone}
            </p>
            <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>
              <strong>나이:</strong> {customer.Age}세
            </p>
          </div>
          <div>
            <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>
              <strong>고객 ID:</strong> {customer.CustomerID}
            </p>
            <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>
              <strong>주소:</strong> {customer.Address}
            </p>
          </div>
        </div>
      </div>

      {detailed && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>💰 재정 정보</h4>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>연소득:</strong> {customer.Income?.toLocaleString()}원
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>총 자산:</strong> {customer.Assets?.toLocaleString()}원
            </p>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ color: 'var(--hana-mint)', marginBottom: '0.5rem' }}>🎯 투자 성향</h4>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>투자 목적:</strong> {customer.InvestmentGoal}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>위험 성향:</strong> {customer.RiskTolerance}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>투자 기간:</strong> {customer.InvestmentPeriod}개월
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [activeTab, setActiveTab] = useState('customer');
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testCustomers, setTestCustomers] = useState([]);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 로그인된 직원 정보 확인
    const employeeData = localStorage.getItem('employee');
    if (!employeeData) {
      navigate('/employee/login');
      return;
    }
    
    setEmployee(JSON.parse(employeeData));
    
    // STOMP WebSocket 연결
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
      connectHeaders: {},
      debug: function (str) {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
      console.log('STOMP 연결 성공:', frame);
      setStompClient(client);

      // 태블릿과 같은 세션 ID 사용
      const sharedSessionId = 'tablet_main';
      setSessionId(sharedSessionId);

      // 세션 참여
      client.publish({
        destination: '/app/join-session',
        body: JSON.stringify({
          sessionId: sharedSessionId,
          userType: 'employee',
          userId: JSON.parse(employeeData).employeeId
        })
      });
      
      console.log('직원 세션 참여:', sharedSessionId);
    };

    client.onStompError = function (frame) {
      console.error('STOMP 오류:', frame.headers['message']);
    };

    client.activate();
    
    // 테스트 고객 목록 가져오기
    fetchTestCustomers();
    
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [navigate]);

  const fetchTestCustomers = async () => {
    console.log('테스트 고객 데이터를 로드합니다...');
    
    // 직접 테스트 데이터 설정 (API 호출 없이)
    const testCustomerData = [
      { 
        customer_id: 'C001', 
        name: '김철수', 
        age: 35, 
        phone: '010-1234-5678', 
        address: '서울시 강남구 역삼동', 
        income: 50000000, 
        assets: 100000000,
        investment_goal: '주택 구매',
        risk_tolerance: 'medium',
        investment_period: 60,
        id_number: '850315-1******'
      },
      { 
        customer_id: 'C002', 
        name: '이영희', 
        age: 28, 
        phone: '010-2345-6789', 
        address: '서울시 서초구 서초동', 
        income: 40000000, 
        assets: 50000000,
        investment_goal: '결혼 자금',
        risk_tolerance: 'low',
        investment_period: 36,
        id_number: '960712-2******'
      },
      { 
        customer_id: 'C003', 
        name: '박민수', 
        age: 42, 
        phone: '010-3456-7890', 
        address: '경기도 성남시 분당구', 
        income: 80000000, 
        assets: 200000000,
        investment_goal: '자녀 교육비',
        risk_tolerance: 'high',
        investment_period: 120,
        id_number: '820428-1******'
      },
      { 
        customer_id: 'C004', 
        name: '최지연', 
        age: 31, 
        phone: '010-4567-8901', 
        address: '부산시 해운대구', 
        income: 45000000, 
        assets: 80000000,
        investment_goal: '노후 준비',
        risk_tolerance: 'medium',
        investment_period: 240,
        id_number: '930825-2******'
      },
      { 
        customer_id: 'C005', 
        name: '정태호', 
        age: 26, 
        phone: '010-5678-9012', 
        address: '대구시 수성구', 
        income: 35000000, 
        assets: 30000000,
        investment_goal: '창업 자금',
        risk_tolerance: 'high',
        investment_period: 24,
        id_number: '980203-1******'
      }
    ];
    
    setTestCustomers(testCustomerData);
    console.log('테스트 고객 데이터 로드 완료:', testCustomerData.length, '명');
  };

  const selectTestCustomer = async (customerId) => {
    setLoading(true);
    try {
      // 임시로 클라이언트에서 직접 고객 데이터 생성
      const selectedCustomer = testCustomers.find(customer => customer.customer_id === customerId);
      
      if (selectedCustomer) {
        // OCR 결과와 같은 형태로 변환
        const customerData = {
          CustomerID: selectedCustomer.customer_id,
          Name: selectedCustomer.name,
          Phone: selectedCustomer.phone,
          Age: selectedCustomer.age,
          Address: selectedCustomer.address,
          IdNumber: selectedCustomer.id_number || '******-*******',
          Income: selectedCustomer.income,
          Assets: selectedCustomer.assets,
          InvestmentGoal: selectedCustomer.investment_goal,
          RiskTolerance: selectedCustomer.risk_tolerance,
          InvestmentPeriod: selectedCustomer.investment_period
        };
        
        setCurrentCustomer(customerData);
        setShowCustomerSelect(false);
        
        console.log('선택된 고객:', customerData.Name);
        console.log('STOMP 상태:', stompClient ? '연결됨' : '연결안됨');
        console.log('세션 ID:', sessionId);
        
        // Socket을 통해 고객 태블릿에 정보 전송
        if (stompClient && sessionId && stompClient.active) {
          console.log('고객 정보를 태블릿에 전송합니다...');
          
          // 고객 정보 업데이트 이벤트 전송
          stompClient.publish({
            destination: '/app/customer-info-update',
            body: JSON.stringify({
              sessionId: sessionId,
              ...customerData
            })
          });
          
          // OCR 결과 이벤트도 전송 (호환성을 위해)
          stompClient.publish({
            destination: '/app/send-message',
            body: JSON.stringify({
              sessionId: sessionId,
              customerData: customerData
            })
          });
        } else {
          console.error('Socket 또는 세션 ID가 없습니다!');
        }
        
        await createConsultationSession(customerData.CustomerID);
      } else {
        alert('고객 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('테스트 고객 선택 오류:', error);
      alert('고객 선택에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employee');
    if (stompClient && stompClient.active) stompClient.deactivate();
    navigate('/employee/login');
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Base64를 Blob으로 변환
      const byteCharacters = atob(imageSrc.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      processOCR(blob);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processOCR(file);
    }
  };

  const processOCR = async (imageFile) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('idCard', imageFile);
      
      const response = await axios.post('http://localhost:8080/api/ocr/id-card', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.customer) {
        setCurrentCustomer(response.data.customer);
        
        // Socket을 통해 고객 태블릿에 정보 전송
        if (stompClient && sessionId && stompClient.active) {
          stompClient.publish({
            destination: '/app/send-message',
            body: JSON.stringify({
              sessionId: sessionId,
              customerData: response.data.customer
            })
          });
        }
        
        await createConsultationSession(response.data.customer.CustomerID);
      } else {
        alert('등록되지 않은 고객입니다. 신규 고객 등록이 필요합니다.');
      }
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      alert('신분증 인식에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setCameraActive(false);
    }
  };

  const createConsultationSession = async (customerId) => {
    try {
      const response = await axios.post('http://localhost:8080/api/consultation/sessions', {
        employeeId: employee.employeeId,
        customerId: customerId
      });
      
      if (response.data.success) {
        const sharedSessionId = 'tablet_main';
        setSessionId(sharedSessionId);
        
        // STOMP에 세션 참여
        stompClient.publish({
          destination: '/app/join-session',
          body: JSON.stringify({
            sessionId: sharedSessionId,
            userType: 'employee',
            userId: employee.employeeId
          })
        });
        
        // 고객 상세 정보 조회
        const customerResponse = await axios.get(`http://localhost:8080/api/customers/${customerId}`);
        setCurrentCustomer(customerResponse.data.data);
      }
    } catch (error) {
      console.error('세션 생성 오류:', error);
      alert('상담 세션 생성에 실패했습니다.');
    }
  };

  const syncScreenToCustomer = (screenData) => {
    if (stompClient && sessionId && stompClient.active) {
      // 상품 상세보기 동기화
      if (screenData.type === 'product-detail-sync') {
        stompClient.publish({
          destination: '/app/product-detail-sync',
          body: JSON.stringify({
            sessionId: sessionId,
            productData: screenData.data
          })
        });
      } else {
        stompClient.publish({
          destination: '/app/screen-sync',
          body: JSON.stringify({
            sessionId,
            screenData
          })
        });
      }
    }
  };

  if (!employee) {
    return <div>로딩 중...</div>;
  }

  return (
    <DashboardContainer>
      <Sidebar>
        <Section>
          <SectionTitle>고객 인식</SectionTitle>
          
          {!cameraActive ? (
            <div>
              <Button 
                className="primary" 
                onClick={() => setCameraActive(true)}
              >
                📷 카메라로 신분증 스캔
              </Button>
              
              <FileInputLabel htmlFor="file-upload">
                📁 파일에서 신분증 업로드
              </FileInputLabel>
              <FileInput
                id="file-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              <Button 
                className="secondary" 
                onClick={() => setShowCustomerSelect(true)}
                style={{ marginTop: '0.5rem' }}
              >
                🧪 테스트 고객 선택
              </Button>
            </div>
          ) : (
            <CameraContainer>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height={200}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button className="primary" onClick={capturePhoto}>
                  📸 촬영
                </Button>
                <Button className="secondary" onClick={() => setCameraActive(false)}>
                  취소
                </Button>
              </div>
            </CameraContainer>
          )}
          
          {loading && <div>신분증 인식 중...</div>}
        </Section>

        {currentCustomer && (
          <Section>
            <CustomerInfoDisplay customer={currentCustomer} />
          </Section>
        )}
      </Sidebar>

      <MainContent>
        <TopBar>
          <EmployeeInfo>
            <Avatar>{employee.name.charAt(0)}</Avatar>
            <div>
              <div><strong>{employee.name}</strong> {employee.position}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--hana-dark-gray)' }}>
                {employee.department}
              </div>
            </div>
          </EmployeeInfo>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <SessionStatus active={!!sessionId}>
              {sessionId ? `세션 활성: ${sessionId.slice(-8)}` : '대기 중'}
            </SessionStatus>
            <Button className="secondary" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </TopBar>

        <TabContainer>
          <Tab 
            active={activeTab === 'customer'} 
            onClick={() => setActiveTab('customer')}
          >
            고객 정보
          </Tab>
          <Tab 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
          >
            상품 탐색
          </Tab>
          <Tab 
            active={activeTab === 'forms'} 
            onClick={() => setActiveTab('forms')}
          >
            서식 선택
          </Tab>
          <Tab 
            active={activeTab === 'simulation'} 
            onClick={() => setActiveTab('simulation')}
          >
            혜택 시뮬레이션
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === 'customer' && currentCustomer && (
            <CustomerInfoDisplay customer={currentCustomer} detailed />
          )}
          
          {activeTab === 'products' && (
            <ProductExplorer 
              onScreenSync={syncScreenToCustomer}
              onProductSelected={setSelectedProduct}
              customerId={currentCustomer?.CustomerID}
            />
          )}
          
          {activeTab === 'forms' && (
            <FormSelector
              selectedProduct={selectedProduct}
              onFormSelected={setSelectedForm}
              sessionId={sessionId}
              stompClient={stompClient}
            />
          )}
          
          {activeTab === 'simulation' && currentCustomer && (
            <SimulationPanel 
              customer={currentCustomer}
              onScreenSync={syncScreenToCustomer}
              sessionId={sessionId}
            />
          )}
        </TabContent>
      </MainContent>

      {/* 테스트 고객 선택 모달 */}
      {showCustomerSelect && (
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
            maxWidth: '600px',
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
              <h2 style={{ color: 'var(--hana-mint)', margin: 0 }}>테스트 고객 선택</h2>
              <button
                onClick={() => setShowCustomerSelect(false)}
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
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {testCustomers.map(customer => (
                <div
                  key={customer.customer_id}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.borderColor = 'var(--hana-mint)'}
                  onMouseOut={(e) => e.target.style.borderColor = '#e9ecef'}
                  onClick={() => selectTestCustomer(customer.customer_id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--hana-mint)' }}>
                        {customer.name} ({customer.age}세)
                      </h3>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        📞 {customer.phone}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        📍 {customer.address}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        💰 연소득: {customer.income?.toLocaleString()}원
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        🎯 목표: {customer.investment_goal}
                      </p>
                    </div>
                    <div style={{
                      background: 'var(--hana-mint)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>
                      {customer.customer_id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {testCustomers.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                등록된 테스트 고객이 없습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default EmployeeDashboard; 