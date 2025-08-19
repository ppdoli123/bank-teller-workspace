import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ErrorMessage = styled.div`
  background: var(--hana-error-light);
  border: 2px solid var(--hana-error);
  color: var(--hana-error);
  padding: var(--hana-space-4);
  border-radius: var(--hana-radius-md);
  margin-bottom: var(--hana-space-4);
  font-size: var(--hana-font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--hana-space-2);
  
  &::before {
    content: '⚠️';
    font-size: var(--hana-font-size-lg);
  }
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: var(--hana-space-8);
  background: linear-gradient(135deg, var(--hana-bg-gray), var(--hana-primary-light));
  font-family: var(--hana-font-family);
`;

const LoginCard = styled.div`
  background: var(--hana-white);
  border-radius: var(--hana-radius-xl);
  box-shadow: var(--hana-shadow-heavy);
  padding: var(--hana-space-12);
  width: 100%;
  max-width: 480px;
  text-align: center;
  border: var(--hana-border-light);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, var(--hana-primary), var(--hana-mint), var(--hana-orange));
  }
`;

const HanaLogoSection = styled.div`
  margin-bottom: var(--hana-space-8);
  
  .logo-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
    border-radius: var(--hana-radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--hana-font-size-4xl);
    font-weight: 900;
    color: var(--hana-white);
    margin: 0 auto var(--hana-space-4);
    box-shadow: var(--hana-shadow-medium);
  }
  
  .logo-text {
    font-size: var(--hana-font-size-lg);
    font-weight: 700;
    color: var(--hana-primary);
    margin-bottom: var(--hana-space-1);
  }
  
  .logo-subtitle {
    font-size: var(--hana-font-size-sm);
    color: var(--hana-gray);
    font-weight: 500;
  }
`;

const LoginTitle = styled.h2`
  color: var(--hana-primary);
  margin-bottom: var(--hana-space-2);
  font-size: var(--hana-font-size-3xl);
  font-weight: 900;
`;

const LoginSubtitle = styled.p`
  color: var(--hana-gray);
  margin-bottom: var(--hana-space-8);
  font-size: var(--hana-font-size-base);
  font-weight: 500;
`;

const FormGroup = styled.div`
  margin-bottom: var(--hana-space-6);
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--hana-space-2);
  font-weight: 700;
  color: var(--hana-primary);
  font-size: var(--hana-font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: var(--hana-space-4);
  border: 2px solid var(--hana-light-gray);
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-base);
  font-family: var(--hana-font-family);
  transition: all var(--hana-transition-base);
  background: var(--hana-white);
  
  &:focus {
    outline: none;
    border-color: var(--hana-primary);
    box-shadow: 0 0 0 3px rgba(0, 133, 122, 0.1);
    background: var(--hana-primary-light);
  }
  
  &::placeholder {
    color: var(--hana-gray);
    font-weight: 500;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: var(--hana-space-5);
  background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
  color: var(--hana-white);
  border: none;
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-lg);
  font-weight: 700;
  font-family: var(--hana-font-family);
  cursor: pointer;
  transition: all var(--hana-transition-base);
  margin-top: var(--hana-space-4);
  box-shadow: var(--hana-shadow-light);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left var(--hana-transition-slow);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--hana-shadow-heavy);
    background: linear-gradient(135deg, var(--hana-primary-dark), var(--hana-primary));
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmployeeLogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeId.trim()) {
      setError('직원 ID를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        employeeId: employeeId.trim(),
        password: password.trim()
      });

      if (response.data.success) {
        // 로그인 성공 시 직원 정보를 localStorage에 저장
        localStorage.setItem('employee', JSON.stringify(response.data.employee));
        navigate('/employee/dashboard');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      if (error.response && error.response.status === 404) {
        setError('존재하지 않는 직원 ID입니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <HanaLogoSection>
          <div className="logo-icon">하</div>
          <div className="logo-text">하나금융그룹</div>
          <div className="logo-subtitle">Hana Financial Group</div>
        </HanaLogoSection>
        
        <LoginTitle>직원 로그인</LoginTitle>
        <LoginSubtitle>지능형 금융 컨설팅 시스템</LoginSubtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="employeeId">👤 직원 ID</Label>
            <Input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="직원 ID를 입력하세요 (예: 1234, admin)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">🔒 비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </FormGroup>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? '🔄 로그인 중...' : '🚪 로그인'}
          </LoginButton>
        </form>
        
        <div style={{ 
          marginTop: 'var(--hana-space-8)', 
          fontSize: 'var(--hana-font-size-sm)', 
          color: 'var(--hana-gray)',
          background: 'var(--hana-primary-light)',
          padding: 'var(--hana-space-4)',
          borderRadius: 'var(--hana-radius-md)',
          border: '1px solid var(--hana-light-gray)'
        }}>
          <p style={{ fontWeight: '700', color: 'var(--hana-primary)', marginBottom: 'var(--hana-space-2)' }}>
            📋 테스트용 로그인 계정
          </p>
          <p>• ID: 1234, PW: 1234 (김직원)</p>
          <p>• ID: 1111, PW: 1111 (박상담사)</p>
          <p>• ID: 2222, PW: 2222 (이매니저)</p>
          <p>• ID: admin, PW: admin123 (관리자)</p>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default EmployeeLogin; 