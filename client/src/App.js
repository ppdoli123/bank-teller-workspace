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
  background-color: var(--hana-gray);
`;

const Header = styled.header`
  background: linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-mint-dark) 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 132, 133, 0.2);
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

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;

  &::before {
    content: '🏦';
    margin-right: 0.5rem;
    font-size: 2rem;
  }
`;

const SystemTitle = styled.h1`
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.9;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderContent>
            <div>
              <Logo>하나은행</Logo>
              <SystemTitle>지능형 금융 컨설팅 시뮬레이션 시스템</SystemTitle>
            </div>
          </HeaderContent>
        </Header>
        
        <Routes>
          {/* 메인 페이지 - 직원 로그인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/employee/login" replace />} />
          
          {/* 직원 관련 라우트 */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          
          {/* 고객 인터페이스 */}
          <Route path="/customer/:sessionId" element={<CustomerInterface />} />
          
          {/* 고객 태블릿 (창구용) */}
          <Route path="/tablet" element={<CustomerTablet />} />
          
          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App; 