import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Webcam from "react-webcam";
import SessionQRCode from "./SessionQRCode";

import ProductExplorer from "./ProductExplorer";
import SimulationPanel from "./SimulationPanel";
import CustomerInfo from "./CustomerInfo";
import FormSelector from "./FormSelector";
import PDFFormManager from "./PDFFormManager";
import AiQuestionGenerator from "./AiQuestionGenerator";

const DashboardContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  background-color: var(--hana-bg-gray);
  font-family: var(--hana-font-family);
`;

const Sidebar = styled.div`
  width: 320px;
  background: var(--hana-white);
  border-right: var(--hana-border-light);
  display: flex;
  flex-direction: column;
  box-shadow: var(--hana-shadow-light);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
  padding: var(--hana-space-6) var(--hana-space-8);
  border-bottom: var(--hana-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--hana-white);
  box-shadow: var(--hana-shadow-light);
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--hana-space-4);
`;

const HanaLogo = styled.div`
  display: flex;
  align-items: center;
  margin-right: var(--hana-space-8);

  .logo-icon {
    width: 40px;
    height: 40px;
    background: var(--hana-white);
    border-radius: var(--hana-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--hana-space-3);
    box-shadow: var(--hana-shadow-light);

    img {
      width: 32px;
      height: 32px;
      border-radius: var(--hana-radius-sm);
    }
  }

  .logo-text {
    font-size: var(--hana-font-size-lg);
    font-weight: 700;
    color: var(--hana-white);
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--hana-radius-full);
  background: linear-gradient(
    135deg,
    var(--hana-white),
    rgba(255, 255, 255, 0.8)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hana-primary);
  font-weight: 700;
  font-size: var(--hana-font-size-lg);
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--hana-shadow-light);
`;

const EmployeeDetails = styled.div`
  .name {
    font-size: var(--hana-font-size-lg);
    font-weight: 700;
    margin-bottom: var(--hana-space-1);
  }

  .role {
    font-size: var(--hana-font-size-sm);
    opacity: 0.9;
    font-weight: 500;
  }
`;

const SessionStatus = styled.div`
  padding: var(--hana-space-3) var(--hana-space-5);
  border-radius: var(--hana-radius-full);
  font-size: var(--hana-font-size-base);
  font-weight: 700;
  background: ${(props) =>
    props.active ? "var(--hana-success)" : "rgba(255, 255, 255, 0.2)"};
  color: var(--hana-white);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: var(--hana-space-3);
  min-width: 180px;
  justify-content: center;

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) =>
      props.active ? "var(--hana-white)" : "rgba(255, 255, 255, 0.6)"};
    animation: ${(props) => (props.active ? "pulse 2s infinite" : "none")};
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Section = styled.div`
  padding: var(--hana-space-6);
  border-bottom: var(--hana-border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  color: var(--hana-primary);
  margin-bottom: var(--hana-space-4);
  font-size: var(--hana-font-size-xl);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--hana-space-2);

  &::before {
    content: "";
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
    border-radius: var(--hana-radius-sm);
  }
`;

const Button = styled.button`
  padding: var(--hana-space-3) var(--hana-space-6);
  border: none;
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--hana-transition-base);
  margin-bottom: var(--hana-space-3);
  width: 100%;
  font-family: var(--hana-font-family);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left var(--hana-transition-slow);
  }

  &:hover::before {
    left: 100%;
  }

  &.primary {
    background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
    color: var(--hana-white);
    box-shadow: var(--hana-shadow-light);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--hana-shadow-medium);
      background: linear-gradient(
        135deg,
        var(--hana-primary-dark),
        var(--hana-primary)
      );
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.secondary {
    background: var(--hana-white);
    color: var(--hana-primary);
    border: 2px solid var(--hana-primary);

    &:hover {
      background: var(--hana-primary-light);
      transform: translateY(-1px);
    }
  }

  &.outlined {
    background: transparent;
    color: var(--hana-primary);
    border: 1px solid var(--hana-light-gray);

    &:hover {
      border-color: var(--hana-primary);
      background: var(--hana-primary-light);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;

    &:hover {
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: var(--hana-white);
  border-bottom: var(--hana-border-light);
  box-shadow: var(--hana-shadow-light);
`;

const Tab = styled.button`
  flex: 1;
  padding: var(--hana-space-4) var(--hana-space-6);
  border: none;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))"
      : "transparent"};
  color: ${(props) =>
    props.active ? "var(--hana-white)" : "var(--hana-gray)"};
  font-size: var(--hana-font-size-base);
  font-weight: ${(props) => (props.active ? "700" : "500")};
  cursor: pointer;
  transition: all var(--hana-transition-base);
  border-bottom: 3px solid
    ${(props) => (props.active ? "transparent" : "transparent")};
  font-family: var(--hana-font-family);
  position: relative;

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))"
        : "var(--hana-primary-light)"};
    color: ${(props) =>
      props.active ? "var(--hana-white)" : "var(--hana-primary)"};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) =>
      props.active ? "var(--hana-orange)" : "transparent"};
    transition: all var(--hana-transition-base);
  }
`;

const CustomerCard = styled.div`
  background: var(--hana-white);
  border: var(--hana-border-light);
  border-radius: var(--hana-radius-lg);
  padding: var(--hana-space-4);
  margin-bottom: var(--hana-space-3);
  cursor: pointer;
  transition: all var(--hana-transition-base);
  box-shadow: var(--hana-shadow-light);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--hana-shadow-medium);
    border-color: var(--hana-primary);
  }

  &.selected {
    border-color: var(--hana-primary);
    background: var(--hana-primary-light);
    box-shadow: var(--hana-shadow-medium);
  }
`;

const CustomerName = styled.div`
  font-size: var(--hana-font-size-lg);
  font-weight: 700;
  color: var(--hana-black);
  margin-bottom: var(--hana-space-1);
`;

const CustomerDetails = styled.div`
  font-size: var(--hana-font-size-sm);
  color: var(--hana-gray);
  display: flex;
  flex-direction: column;
  gap: var(--hana-space-1);

  .customer-id {
    font-weight: 600;
    color: var(--hana-primary);
  }

  .customer-phone {
    color: var(--hana-dark-gray);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--hana-space-1) var(--hana-space-3);
  font-size: var(--hana-font-size-xs);
  font-weight: 600;
  border-radius: var(--hana-radius-full);
  margin-top: var(--hana-space-2);

  &.waiting {
    background: var(--hana-orange-light);
    color: var(--hana-orange);
  }

  &.in-progress {
    background: var(--hana-mint-light);
    color: var(--hana-primary);
  }

  &.completed {
    background: var(--hana-success-light);
    color: var(--hana-success);
  }
`;

const CameraContainer = styled.div`
  position: relative;
  margin-bottom: var(--hana-space-4);
  border-radius: var(--hana-radius-lg);
  overflow: hidden;
  background: var(--hana-black);
  box-shadow: var(--hana-shadow-medium);
`;

const CameraOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--hana-white);
  text-align: center;
  z-index: 2;
  background: rgba(0, 0, 0, 0.8);
  padding: var(--hana-space-4);
  border-radius: var(--hana-radius-md);
  backdrop-filter: blur(4px);
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 0.75rem 1.5rem;
  background: var(--hana-mint);
  color: white;
  border-radius: var(--hana-radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--hana-transition-base);
  margin-bottom: var(--hana-space-3);
  padding: var(--hana-space-4);
  background: var(--hana-white);
  border: 2px dashed var(--hana-light-gray);
  color: var(--hana-primary);
  font-weight: 600;

  &:hover {
    border-color: var(--hana-primary);
    background: var(--hana-primary-light);
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: auto;
  background: var(--hana-white);
`;

// 고객 정보 표시 컴포넌트
const CustomerInfoDisplay = ({ customer, detailed = false, onSendToTablet }) => {
  if (!customer) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--hana-space-8)",
          color: "var(--hana-gray)",
          background: "var(--hana-white)",
          borderRadius: "var(--hana-radius-lg)",
          margin: "var(--hana-space-4)",
          border: "var(--hana-border-light)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "var(--hana-space-4)" }}>
          👤
        </div>
        <h3
          style={{
            color: "var(--hana-primary)",
            marginBottom: "var(--hana-space-2)",
            fontSize: "var(--hana-font-size-xl)",
          }}
        >
          고객 정보 없음
        </h3>
        <p style={{ color: "var(--hana-gray)" }}>
          신분증을 업로드하거나 테스트 고객을 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--hana-space-4)" }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--hana-primary) 0%, var(--hana-mint) 100%)",
          color: "var(--hana-white)",
          padding: "var(--hana-space-6)",
          borderRadius: "var(--hana-radius-lg)",
          marginBottom: "var(--hana-space-6)",
          boxShadow: "var(--hana-shadow-medium)",
        }}
      >
        <h2
          style={{
            margin: "0 0 var(--hana-space-4) 0",
            fontSize: "var(--hana-font-size-2xl)",
            fontWeight: "700",
          }}
        >
          {customer.Name} 고객님
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--hana-space-4)",
          }}
        >
          <div>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>연락처:</strong> {customer.Phone}
            </p>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>나이:</strong> {customer.Age}세
            </p>
          </div>
          <div>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>고객 ID:</strong> {customer.CustomerID}
            </p>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>주소:</strong> {customer.Address}
            </p>
          </div>
        </div>
      </div>

      {detailed && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4 style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}>
              💰 재정 정보
            </h4>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>연소득:</strong> {customer.Income?.toLocaleString()}원
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>총 자산:</strong> {customer.Assets?.toLocaleString()}원
            </p>
          </div>

          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4 style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}>
              🎯 투자 성향
            </h4>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>투자 목적:</strong> {customer.InvestmentGoal}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>위험 성향:</strong> {customer.RiskTolerance}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>투자 기간:</strong> {customer.InvestmentPeriod}개월
            </p>
          </div>
        </div>
      )}
      
      {/* 태블릿에 보여주기 버튼 */}
      {detailed && onSendToTablet && (
        <div style={{ 
          marginTop: "var(--hana-space-4)", 
          textAlign: "center",
          padding: "var(--hana-space-4)",
          borderTop: "1px solid #eee"
        }}>
          <button
            onClick={() => onSendToTablet(customer)}
            style={{
              background: "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))",
              color: "white",
              border: "none",
              borderRadius: "var(--hana-radius-md)",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "var(--hana-shadow-light)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "var(--hana-shadow-medium)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--hana-shadow-light)";
            }}
          >
            📱 태블릿에 보여주기
          </button>
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
  const [activeTab, setActiveTab] = useState("customer");
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testCustomers, setTestCustomers] = useState([]);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // WebSocket 연결 함수
  const connectWebSocket = (sessionId, employee) => {
    const client = new Client({
      webSocketFactory: () => {
        // 로컬 개발 환경에서는 로컬 서버 사용
        const isDevelopment = process.env.NODE_ENV === 'development';
        const wsUrl = isDevelopment 
          ? "http://localhost:8080/api/ws"
          : "https://hana-backend-production.up.railway.app/api/ws";
        console.log("WebSocket 연결 시도:", wsUrl);
        return new SockJS(wsUrl);
      },
      connectHeaders: {},
      debug: function (str) {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
      console.log("STOMP 연결 성공:", frame);
      setStompClient(client);

      // 전역 STOMP 클라이언트 설정 (ActualBankForm에서 사용)
      window.stompClient = client;

      // 세션 ID 확인
      console.log("사용할 세션 ID:", sessionId);

      // 세션 참여
      client.publish({
        destination: "/app/join-session",
        body: JSON.stringify({
          sessionId: sessionId,
          userType: "employee",
          userId: employee.employeeId,
        }),
      });

      // 세션 메시지 구독 (태블릿과 통신용)
      client.subscribe("/topic/session/" + sessionId, function (message) {
        const data = JSON.parse(message.body);
        console.log("직원이 세션 메시지 수신:", data);

        // 메시지 타입별 처리
        switch (data.type) {
          case "tablet-connected":
            console.log("태블릿 연결됨:", data);
            break;
          case "customer-info-confirmed":
            console.log("태블릿에서 고객 정보 확인 완료:", data);
            break;
          case "customer-info-display":
            console.log("고객 정보 표시 메시지 수신:", data);
            // 태블릿에서 고객 정보 표시 요청을 받았을 때의 처리
            if (data.data && data.data.customer) {
              console.log("고객 정보:", data.data.customer);
            }
            break;
          case "FIELD_INPUT_COMPLETED":
            console.log("태블릿에서 필드 입력 완료:", data);
            // 폼 필드 업데이트 처리
            if (data.field && window.updateFormField) {
              window.updateFormField(data.field, data.value);
            }
            break;
          default:
            console.log("알 수 없는 메시지 타입:", data.type);
            break;
        }
      });

      console.log("직원 세션 참여:", sessionId);
    };

    client.onStompError = function (frame) {
      console.error("STOMP 오류:", frame.headers["message"]);
    };

    client.activate();
    return client;
  };

  // 태블릿에 고객 정보 전송
  const sendCustomerInfoToTablet = (customerData) => {
    console.log("=== 메시지 전송 시작 ===");
    console.log("stompClient 상태:", !!stompClient);
    console.log("stompClient.active:", stompClient?.active);
    console.log("sessionId:", sessionId);
    console.log("customerData:", customerData);
    console.log("현재 시간:", new Date().toLocaleTimeString());
    
    if (stompClient && sessionId && stompClient.active) {
      const messagePayload = {
        sessionId: sessionId,
        type: "customer-info-display",
        data: {
          customer: customerData,
          timestamp: Date.now()
        }
      };
      
      console.log("전송할 메시지 페이로드:", JSON.stringify(messagePayload, null, 2));
      console.log("전송 대상 토픽:", `/app/send-to-session`);
      console.log("실제 브로드캐스트될 토픽:", `/topic/session/${sessionId}`);
      
      try {
        stompClient.publish({
          destination: "/app/send-to-session",
          body: JSON.stringify(messagePayload)
        });
        
        console.log("✅ 메시지 전송 완료");
        console.log("전송된 세션 ID:", sessionId);
        alert("고객 정보가 태블릿에 전송되었습니다!");
      } catch (error) {
        console.error("❌ 메시지 전송 실패:", error);
        alert("메시지 전송에 실패했습니다: " + error.message);
      }
    } else {
      console.error("❌ 연결 상태 확인:");
      console.error("- stompClient 존재:", !!stompClient);
      console.error("- sessionId 존재:", !!sessionId, "값:", sessionId);
      console.error("- stompClient 활성화:", stompClient?.active);
      alert("태블릿이 연결되어 있지 않습니다. 태블릿 연결을 확인해주세요.");
    }
  };

  useEffect(() => {
    // 로그인된 직원 정보 확인
    const employeeData = localStorage.getItem("employee");
    const sessionData = localStorage.getItem("sessionId");
    if (!employeeData) {
      navigate("/employee/login");
      return;
    }

    const employee = JSON.parse(employeeData);
    setEmployee(employee);
    
    // 기존 방식으로 되돌림 - Railway 백엔드와 호환
    const finalSessionId = "tablet_main";
    setSessionId(finalSessionId);
    
    // sessionId가 없었다면 localStorage에 저장
    if (!sessionData) {
      localStorage.setItem("sessionId", finalSessionId);
      console.log("세션 ID 생성 및 저장:", finalSessionId);
    } else {
      console.log("기존 세션 ID 사용:", finalSessionId);
    }

    // WebSocket 연결
    const client = connectWebSocket(finalSessionId, employee);



    // 테스트 고객 목록 가져오기
    fetchTestCustomers();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [navigate]);

  // currentCustomer 상태 변화 감지
  useEffect(() => {
    console.log("currentCustomer 상태 변경됨:", currentCustomer);
  }, [currentCustomer]);

  const fetchTestCustomers = async () => {
    console.log("테스트 고객 데이터를 로드합니다...");

    // 직접 테스트 데이터 설정 (API 호출 없이)
    const testCustomerData = [
      {
        customer_id: "C001",
        name: "김철수",
        age: 35,
        phone: "010-1234-5678",
        address: "서울시 강남구 역삼동",
        income: 50000000,
        assets: 100000000,
        investment_goal: "주택 구매",
        risk_tolerance: "medium",
        investment_period: 60,
        id_number: "850315-1******",
      },
      {
        customer_id: "C002",
        name: "이영희",
        age: 28,
        phone: "010-2345-6789",
        address: "서울시 서초구 서초동",
        income: 40000000,
        assets: 50000000,
        investment_goal: "결혼 자금",
        risk_tolerance: "low",
        investment_period: 36,
        id_number: "960712-2******",
      },
      {
        customer_id: "C003",
        name: "박민수",
        age: 42,
        phone: "010-3456-7890",
        address: "경기도 성남시 분당구",
        income: 80000000,
        assets: 200000000,
        investment_goal: "자녀 교육비",
        risk_tolerance: "high",
        investment_period: 120,
        id_number: "820428-1******",
      },
      {
        customer_id: "C004",
        name: "최지연",
        age: 31,
        phone: "010-4567-8901",
        address: "부산시 해운대구",
        income: 45000000,
        assets: 80000000,
        investment_goal: "노후 준비",
        risk_tolerance: "medium",
        investment_period: 240,
        id_number: "930825-2******",
      },
      {
        customer_id: "C005",
        name: "정태호",
        age: 26,
        phone: "010-5678-9012",
        address: "대구시 수성구",
        income: 35000000,
        assets: 30000000,
        investment_goal: "창업 자금",
        risk_tolerance: "high",
        investment_period: 24,
        id_number: "980203-1******",
      },
    ];

    setTestCustomers(testCustomerData);
    console.log("테스트 고객 데이터 로드 완료:", testCustomerData.length, "명");
  };

  const selectTestCustomer = async (customerId) => {
    console.log("selectTestCustomer 호출됨 - customerId:", customerId);
    setLoading(true);
    try {
      // 임시로 클라이언트에서 직접 고객 데이터 생성
      const selectedCustomer = testCustomers.find(
        (customer) => customer.customer_id === customerId
      );
      console.log("찾은 고객:", selectedCustomer);

      if (selectedCustomer) {
        // OCR 결과와 같은 형태로 변환
        const customerData = {
          CustomerID: selectedCustomer.customer_id,
          Name: selectedCustomer.name,
          Phone: selectedCustomer.phone,
          Age: selectedCustomer.age,
          Address: selectedCustomer.address,
          IdNumber: selectedCustomer.id_number || "******-*******",
          Income: selectedCustomer.income,
          Assets: selectedCustomer.assets,
          InvestmentGoal: selectedCustomer.investment_goal,
          RiskTolerance: selectedCustomer.risk_tolerance,
          InvestmentPeriod: selectedCustomer.investment_period,
        };

        console.log("변환된 고객 데이터:", customerData);

        setCurrentCustomer(customerData);
        setShowCustomerSelect(false);

        console.log("선택된 고객:", customerData.Name);
        console.log("currentCustomer 상태 업데이트됨");
        console.log("STOMP 상태:", stompClient ? "연결됨" : "연결안됨");
        console.log("세션 ID:", sessionId);

        // Socket을 통해 고객 태블릿에 정보 전송
        if (stompClient && sessionId && stompClient.active) {
          console.log("고객 정보를 태블릿에 전송합니다...");

          // 고객 정보 업데이트 이벤트 전송
          stompClient.publish({
            destination: "/app/customer-info-update",
            body: JSON.stringify({
              sessionId: sessionId,
              ...customerData,
            }),
          });

          // OCR 결과 이벤트도 전송 (호환성을 위해)
          stompClient.publish({
            destination: "/app/send-message",
            body: JSON.stringify({
              sessionId: sessionId,
              customerData: customerData,
            }),
          });
        } else {
          console.error("Socket 또는 세션 ID가 없습니다!");
        }

        await createConsultationSession(customerData.CustomerID);
      } else {
        alert("고객 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("테스트 고객 선택 오류:", error);
      alert("고객 선택에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");
    if (stompClient && stompClient.active) stompClient.deactivate();
    navigate("/employee/login");
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Base64를 Blob으로 변환
      const byteCharacters = atob(imageSrc.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

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
      formData.append("idCard", imageFile);

      const response = await axios.post(
        "https://hana-backend-production.up.railway.app/api/ocr/id-card",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.customer) {
        const ocrCustomerData = response.data.customer;

        // OCR 데이터가 이미 올바른 형태인지 확인하고, 필요시 변환
        const transformedOcrData = {
          CustomerID: ocrCustomerData.CustomerID || ocrCustomerData.customerId,
          Name: ocrCustomerData.Name || ocrCustomerData.name,
          Phone: ocrCustomerData.Phone || ocrCustomerData.phone,
          Age: ocrCustomerData.Age || ocrCustomerData.age,
          Address: ocrCustomerData.Address || ocrCustomerData.address,
          IdNumber:
            ocrCustomerData.IdNumber ||
            ocrCustomerData.idNumber ||
            "******-*******",
          Income: ocrCustomerData.Income || ocrCustomerData.income,
          Assets: ocrCustomerData.Assets || ocrCustomerData.assets,
          InvestmentGoal:
            ocrCustomerData.InvestmentGoal || ocrCustomerData.investmentGoal,
          RiskTolerance:
            ocrCustomerData.RiskTolerance || ocrCustomerData.riskTolerance,
          InvestmentPeriod:
            ocrCustomerData.InvestmentPeriod ||
            ocrCustomerData.investmentPeriod,
        };

        setCurrentCustomer(transformedOcrData);
        console.log("OCR 고객 데이터 변환 완료:", transformedOcrData);

        // Socket을 통해 고객 태블릿에 정보 전송
        if (stompClient && sessionId && stompClient.active) {
          stompClient.publish({
            destination: "/app/send-message",
            body: JSON.stringify({
              sessionId: sessionId,
              customerData: transformedOcrData,
            }),
          });
        }

        await createConsultationSession(transformedOcrData.CustomerID);
      } else {
        alert("등록되지 않은 고객입니다. 신규 고객 등록이 필요합니다.");
      }
    } catch (error) {
      console.error("OCR 처리 오류:", error);
      alert("신분증 인식에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setCameraActive(false);
    }
  };

  const createConsultationSession = async (customerId) => {
    try {
      const response = await axios.post(
        "https://hana-backend-production.up.railway.app/api/consultation/sessions",
        {
          employeeId: employee.employeeId,
          customerId: customerId,
        }
      );

      if (response.data.success) {
        const sharedSessionId = "tablet_main";
        setSessionId(sharedSessionId);

        // STOMP에 세션 참여
        stompClient.publish({
          destination: "/app/join-session",
          body: JSON.stringify({
            sessionId: sharedSessionId,
            userType: "employee",
            userId: employee.employeeId,
          }),
        });

        // 고객 상세 정보 조회
        const customerResponse = await axios.get(
          `https://hana-backend-production.up.railway.app/api/customers/${customerId}`
        );
        const backendCustomerData = customerResponse.data.data;

        // 백엔드 데이터를 프론트엔드가 기대하는 형태로 변환
        const transformedCustomerData = {
          CustomerID: backendCustomerData.customerId,
          Name: backendCustomerData.name,
          Phone: backendCustomerData.phone,
          Age: backendCustomerData.age,
          Address: backendCustomerData.address,
          IdNumber: backendCustomerData.idNumber || "******-*******",
          Income: backendCustomerData.income,
          Assets: backendCustomerData.assets,
          InvestmentGoal: backendCustomerData.investmentGoal,
          RiskTolerance: backendCustomerData.riskTolerance,
          InvestmentPeriod: backendCustomerData.investmentPeriod,
        };

        setCurrentCustomer(transformedCustomerData);
        console.log(
          "백엔드에서 가져온 고객 데이터 변환 완료:",
          transformedCustomerData
        );
      }
    } catch (error) {
      console.error("세션 생성 오류:", error);
      alert("상담 세션 생성에 실패했습니다.");
    }
  };

  const syncScreenToCustomer = (screenData) => {
    if (stompClient && sessionId && stompClient.active) {
      // 상품 상세보기 동기화
      if (screenData.type === "product-detail-sync") {
        stompClient.publish({
          destination: "/app/product-detail-sync",
          body: JSON.stringify({
            sessionId: sessionId,
            productData: screenData.data,
          }),
        });
      } else {
        stompClient.publish({
          destination: "/app/screen-sync",
          body: JSON.stringify({
            sessionId,
            screenData,
          }),
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
        {/* 태블릿 연결 상태 및 QR 코드 */}
        {sessionId && employee && (
          <SessionQRCode 
            sessionId={sessionId} 
            employeeName={employee.name}
          />
        )}
        
        <Section>
          <SectionTitle>고객 인식</SectionTitle>

          {!cameraActive ? (
            <div>
              <Button className="primary" onClick={() => setCameraActive(true)}>
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
                style={{ marginTop: "0.5rem" }}
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
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                <Button className="primary" onClick={capturePhoto}>
                  📸 촬영
                </Button>
                <Button
                  className="secondary"
                  onClick={() => setCameraActive(false)}
                >
                  취소
                </Button>
              </div>
            </CameraContainer>
          )}

          {loading && <div>신분증 인식 중...</div>}
        </Section>

        {currentCustomer ? (
          <Section>
            <CustomerInfoDisplay customer={currentCustomer} />
          </Section>
        ) : (
          <Section>
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "var(--hana-dark-gray)",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "2px dashed #dee2e6",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>👤</div>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--hana-mint)" }}>
                고객 정보
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                신분증을 촬영하거나
                <br />
                테스트 고객을 선택해주세요
              </p>
            </div>
          </Section>
        )}
      </Sidebar>

      <MainContent>
        <TopBar>
          <HanaLogo>
            <img
              src="/hana-logo.svg"
              alt="Hana"
              style={{ width: "40px", height: "40px" }}
            />
            <div className="logo-text">하나금융그룹 스마트 상담</div>
          </HanaLogo>

          <EmployeeInfo>
            <Avatar>{employee.name.charAt(0)}</Avatar>
            <EmployeeDetails>
              <div className="name">
                {employee.name} {employee.position}
              </div>
              <div className="role">{employee.department}</div>
            </EmployeeDetails>
          </EmployeeInfo>

          <div
            style={{
              display: "flex",
              gap: "var(--hana-space-4)",
              alignItems: "center",
            }}
          >
            <SessionStatus active={!!sessionId}>
              {sessionId ? `세션 활성: ${sessionId.slice(-8)}` : "대기 중"}
            </SessionStatus>
            <Button className="secondary" onClick={handleLogout}>
              🚪 로그아웃
            </Button>
          </div>
        </TopBar>

        <TabContainer>
          <Tab
            active={activeTab === "customer"}
            onClick={() => setActiveTab("customer")}
          >
            고객 정보
          </Tab>
          <Tab
            active={activeTab === "products"}
            onClick={() => setActiveTab("products")}
          >
            상품 탐색
          </Tab>
          <Tab
            active={activeTab === "forms"}
            onClick={() => setActiveTab("forms")}
          >
            서식 선택
          </Tab>
          <Tab
            active={activeTab === "pdf-forms"}
            onClick={() => setActiveTab("pdf-forms")}
          >
            📝 PDF 서식 작성
          </Tab>
          <Tab
            active={activeTab === "simulation"}
            onClick={() => setActiveTab("simulation")}
          >
            혜택 시뮬레이션
          </Tab>
          <Tab active={activeTab === "ai"} onClick={() => setActiveTab("ai")}>
            🤖 AI 질문 생성
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === "customer" &&
            (currentCustomer ? (
              <CustomerInfoDisplay 
                customer={currentCustomer} 
                detailed 
                onSendToTablet={sendCustomerInfoToTablet}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  👤
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  고객 정보 없음
                </h3>
                <p
                  style={{
                    color: "var(--hana-gray)",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  왼쪽 사이드바에서 신분증을 업로드하거나 테스트 고객을
                  선택해주세요.
                </p>
              </div>
            ))}

          {activeTab === "products" && (
            <ProductExplorer
              onScreenSync={syncScreenToCustomer}
              onProductSelected={setSelectedProduct}
              customerId={currentCustomer?.CustomerID}
            />
          )}

          {activeTab === "forms" && (
            <FormSelector
              selectedProduct={selectedProduct}
              onFormSelected={setSelectedForm}
              sessionId={sessionId}
              stompClient={stompClient}
            />
          )}

          {activeTab === "pdf-forms" && (
            <PDFFormManager
              onFormSubmit={(formData) => {
                console.log("PDF 폼 제출:", formData);
                // 백엔드에 폼 데이터 저장
                if (currentCustomer) {
                  axios
                    .post(
                      "https://hana-backend-production.up.railway.app/api/forms/submit",
                      {
                        customerId: currentCustomer.CustomerID,
                        ...formData,
                      }
                    )
                    .catch((error) => console.error("폼 제출 오류:", error));
                }
              }}
              onScreenSync={syncScreenToCustomer}
            />
          )}

          {activeTab === "simulation" &&
            (currentCustomer ? (
              <SimulationPanel
                customer={currentCustomer}
                onScreenSync={syncScreenToCustomer}
                sessionId={sessionId}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  📊
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  혜택 시뮬레이션
                </h3>
                <p style={{ color: "var(--hana-gray)" }}>
                  고객 정보를 먼저 입력해주세요.
                </p>
              </div>
            ))}

          {activeTab === "ai" &&
            (currentCustomer ? (
              <AiQuestionGenerator
                customerInfo={{
                  customerId: currentCustomer.CustomerID,
                  name: currentCustomer.Name,
                  age: currentCustomer.Age,
                  income: currentCustomer.Income,
                  assets: currentCustomer.Assets,
                  goals: [currentCustomer.InvestmentGoal],
                }}
                onQuestionsGenerated={(questions) => {
                  console.log("AI 질문 생성 완료:", questions);
                  // 선택된 질문들을 태블릿으로 전송하는 로직 추가 가능
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  🤖
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  AI 질문 생성
                </h3>
                <p style={{ color: "var(--hana-gray)" }}>
                  고객 정보를 먼저 입력해주세요.
                </p>
              </div>
            ))}
        </TabContent>
      </MainContent>

      {/* 테스트 고객 선택 모달 */}
      {showCustomerSelect && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 133, 122, 0.3)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "hanaFadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: "var(--hana-white)",
              borderRadius: "var(--hana-radius-xl)",
              padding: "var(--hana-space-8)",
              maxWidth: "700px",
              width: "90%",
              maxHeight: "85%",
              overflow: "auto",
              boxShadow: "var(--hana-shadow-heavy)",
              border: "var(--hana-border-light)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--hana-space-6)",
                borderBottom: "3px solid var(--hana-primary-light)",
                paddingBottom: "var(--hana-space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--hana-space-3)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))",
                    borderRadius: "var(--hana-radius-full)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--hana-font-size-xl)",
                    color: "var(--hana-white)",
                  }}
                >
                  👥
                </div>
                <h2
                  style={{
                    color: "var(--hana-primary)",
                    margin: 0,
                    fontSize: "var(--hana-font-size-2xl)",
                    fontWeight: "700",
                  }}
                >
                  테스트 고객 선택
                </h2>
              </div>
              <button
                onClick={() => setShowCustomerSelect(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "var(--hana-font-size-2xl)",
                  cursor: "pointer",
                  color: "var(--hana-gray)",
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--hana-radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all var(--hana-transition-base)",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "var(--hana-error-light)";
                  e.target.style.color = "var(--hana-error)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "none";
                  e.target.style.color = "var(--hana-gray)";
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: "var(--hana-space-4)" }}>
              {testCustomers.map((customer) => (
                <CustomerCard
                  key={customer.customer_id}
                  onClick={() => selectTestCustomer(customer.customer_id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <CustomerName>
                        {customer.name} ({customer.age}세)
                      </CustomerName>
                      <CustomerDetails>
                        <div className="customer-id">
                          ID: {customer.customer_id}
                        </div>
                        <div className="customer-phone">
                          📞 {customer.phone}
                        </div>
                        <div>📍 {customer.address}</div>
                        <div>
                          💰 연소득: {customer.income?.toLocaleString()}원
                        </div>
                        <div>🎯 목표: {customer.investment_goal}</div>
                      </CustomerDetails>
                    </div>
                    <StatusBadge className="waiting">선택 가능</StatusBadge>
                  </div>
                </CustomerCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default EmployeeDashboard;
