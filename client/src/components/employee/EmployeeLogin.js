import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: var(--hana-white);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 132, 133, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const LoginTitle = styled.h2`
  color: var(--hana-mint);
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
`;

const LoginSubtitle = styled.p`
  color: var(--hana-dark-gray);
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--hana-black);
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--hana-mint);
    box-shadow: 0 0 0 3px rgba(0, 132, 133, 0.1);
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-mint-dark) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 132, 133, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const CharacterIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
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
        <CharacterIcon>👨‍💼</CharacterIcon>
        <LoginTitle>직원 로그인</LoginTitle>
        <LoginSubtitle>하나은행 지능형 금융 컨설팅 시스템</LoginSubtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="employeeId">직원 ID</Label>
            <Input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="직원 ID를 입력하세요 (예: 1234, admin)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </FormGroup>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--hana-dark-gray)' }}>
          <p><strong>테스트용 로그인 계정:</strong></p>
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