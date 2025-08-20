import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// 컴포넌트 import
import EmployeeLogin from './components/employee/EmployeeLogin';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import CustomerInterface from './components/customer/CustomerInterface';
import CustomerTablet from './components/customer/CustomerTablet';
import NotFound from './components/common/NotFound';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--hana-bg-gray);
  font-family: var(--hana-font-family);
`;

const Header = styled.header`
  background: linear-gradient(135deg, var(--hana-primary) 0%, var(--hana-mint) 100%);
  color: var(--hana-white);
  padding: var(--hana-space-6) var(--hana-space-8);
  box-shadow: var(--hana-shadow-medium);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px
    );
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--hana-font-size-2xl);
  font-weight: 900;
  gap: var(--hana-space-4);
  
  .logo-icon {
    width: 56px;
    height: 56px;
    background: var(--hana-white);
    border-radius: var(--hana-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--hana-shadow-medium);
    
    img {
      width: 48px;
      height: 48px;
      border-radius: var(--hana-radius-md);
    }
  }
  
  .logo-text {
    display: flex;
    flex-direction: column;
    
    .main-title {
      font-size: var(--hana-font-size-2xl);
      font-weight: 900;
      line-height: 1.2;
      color: var(--hana-white);
    }
    
    .sub-title {
      font-size: var(--hana-font-size-base);
      font-weight: 500;
      opacity: 0.9;
      color: var(--hana-white);
      margin-top: var(--hana-space-1);
    }
  }
`;

const SystemTitle = styled.h1`
  font-size: var(--hana-font-size-lg);
  font-weight: 500;
  opacity: 0.95;
  margin: 0;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderContent>
            <div>
              <Logo>
                <div className="logo-icon">
                  <img src="/hana-logo.svg" alt="하나금융그룹" />
                </div>
                <div className="logo-text">
                  <div className="main-title">하나금융그룹</div>
                  <div className="sub-title">지능형 금융 컨설팅 시뮬레이션 시스템</div>
                </div>
              </Logo>
            </div>
          </HeaderContent>
        </Header>
        
        <Routes>
          {/* 메인 페이지 - 직원 로그인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/employee/login" replace />} />
          
          {/* 직원 관련 라우트 */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
          
          {/* 고객 인터페이스 */}
          <Route path="/customer/:sessionId" element={<CustomerInterface />} />
          
          {/* 고객 태블릿 (창구용) - /customer와 /tablet 모두 지원 */}
          <Route path="/customer" element={<CustomerTablet />} />
          <Route path="/tablet" element={<CustomerTablet />} />
          
          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App; 