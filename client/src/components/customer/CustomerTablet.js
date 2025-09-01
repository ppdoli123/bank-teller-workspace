import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import FormViewer from "./FormViewer";

const TabletContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  display: flex;
  flex-direction: column;
  font-family: "Noto Sans KR", sans-serif;
  overflow: hidden;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const HeaderTitle = styled.h1`
  color: var(--hana-mint);
  font-size: 1.5rem;
  margin: 0;
  font-weight: bold;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${(props) => (props.connected ? "#4caf50" : "#ff9800")};
  font-weight: bold;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WelcomePage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
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
  background: ${(props) => (props.connected ? "#e8f5e8" : "#fff3e0")};
  border: 2px solid ${(props) => (props.connected ? "#4caf50" : "#ff9800")};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const StatusText = styled.p`
  color: ${(props) => (props.connected ? "#2e7d32" : "#f57c00")};
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
`;

const CustomerInfoPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
`;

const CustomerInfoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const CustomerInfoTitle = styled.h2`
  color: var(--hana-mint);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CustomerInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--hana-mint);
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
  width: 100%;

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

const ProductsList = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const ProductItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  background: ${(props) => (props.balance >= 0 ? "#f8fff8" : "#fff8f8")};
`;

const FormPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  margin: 1rem;
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: var(--hana-mint);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const FormContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const WaitingPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
`;

const WaitingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
`;

const WaitingIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

const WaitingText = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const CustomerTablet = () => {
  // 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState("welcome"); // welcome, customer-info, form, waiting, customer-list, product-detail, product-enrollment
  const [connected, setConnected] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [formData, setFormData] = useState(null);
  const [currentFormUrl, setCurrentFormUrl] = useState(null);
  const [currentFormData, setCurrentFormData] = useState({});
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [currentFormTitle, setCurrentFormTitle] = useState("");
  const [currentForm, setCurrentForm] = useState(null);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const [isFieldFocusMode, setIsFieldFocusMode] = useState(false);
  const [commonFormData, setCommonFormData] = useState({}); // 공통 필드 데이터 저장
  
  // 공통 필드 ID들 (자동 입력 대상)
  const commonFieldIds = [
    'customer_name', 'customerName', 'applicant_name', 'applicantName', 'employee_name', 'employeeName',
    'resident_number', 'residentNumber', 
    'phone_number', 'phoneNumber', 'phone',
    'address',
    'email'
  ];
  
  const [sessionId] = useState("tablet_main");
  const [stompClient, setStompClient] = useState(null);
  const [isWaitingForEmployee, setIsWaitingForEmployee] = useState(true);

  // 필드 입력 처리 함수
  const handleFieldInput = (fieldId, fieldName, value) => {
    console.log("📝 필드 입력:", fieldId, fieldName, value);
    
    // 공통 필드 데이터에 저장
    setCommonFormData(prev => ({
      ...prev,
      [fieldId]: value,
      [fieldName]: value
    }));
    
    // PC에 입력 완료 알림
    if (stompClient && sessionId) {
      stompClient.publish({
        destination: "/topic/session/" + sessionId,
        body: JSON.stringify({
          type: "field-input-complete",
          data: {
            fieldId: fieldId,
            fieldName: fieldName,
            value: value,
            formIndex: currentFormIndex,
            formName: currentForm?.formName
          },
          timestamp: Date.now()
        }),
      });
    }
    
    // 필드 포커스 모드 해제
    setIsFieldFocusMode(false);
    setFocusedField(null);
  };

  // WebSocket 연결 설정
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/api/ws"),
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("Connected: " + frame);
      setConnected(true);
      setIsWaitingForEmployee(false);

      // 세션 참여
      client.subscribe("/topic/session/" + sessionId, (message) => {
        const data = JSON.parse(message.body);
        handleMessage(data);
      });

      client.publish({
        destination: "/app/join-session",
        body: JSON.stringify({
          sessionId: sessionId,
          userType: "customer-tablet",
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [sessionId]);

  // 메시지 처리
  const handleMessage = (data) => {
    console.log("태블릿이 메시지 수신:", data);

    switch (data.type) {
      case "customer-selected":
        setCurrentCustomer(data.customer);
        setCurrentPage("customer-info");
        loadCustomerProducts(data.customer.customerId);
        break;

      case "customer-info-display":
        if (data.action === "show_customer_info" && data.data) {
          console.log("고객 정보 표시:", data.data);
          setCurrentCustomer(data.data);
          setCurrentPage("customer-info");
          // 고객 ID가 있으면 상품 정보도 로드
          if (data.data.customerId) {
            loadCustomerProducts(data.data.customerId);
          }
        }
        break;

      case "product-detail-sync":
        if (data.data) {
          console.log("상품 상세 정보 표시:", data.data);
          setCurrentProduct(data.data);
          // 임시로 상품 가입 페이지로 이동
          setCurrentPage("product-enrollment");
        }
        break;

      case "customer-list":
        if (data.data) {
          console.log("고객 목록 표시:", data.data);
          setCustomers(data.data);
          setCurrentPage("customer-list");
        }
        break;

      case "participant-joined":
        console.log("참가자 참여:", data.data);
        break;

                case "product-enrollment":
            console.log("🔍 product-enrollment 메시지 수신:", data);
            console.log("🔍 data.action:", data.action);
            console.log("🔍 data.data:", data.data);
            if (data.action === "start_enrollment" && data.data) {
              console.log("✅ 상품 가입 서식 표시:", data.data);
              console.log("✅ 서식 개수:", data.data.forms?.length);
              console.log("✅ 현재 페이지를 product-enrollment로 설정");
              
              // 임시로 하드코딩된 서식 데이터 추가
              const productWithForms = {
                ...data.data,
                forms: data.data.forms || [
                  {
                    formId: "FORM-IRP-001",
                    formName: "퇴직연금 거래신청서(개인형IRP)",
                    formType: "deposit",
                    formSchema: '{"fields": [{"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, {"id": "phone_number", "name": "phoneNumber", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "address", "name": "address", "type": "text", "label": "주소", "required": true, "placeholder": "주소를 입력하세요"}, {"id": "account_number", "name": "accountNumber", "type": "text", "label": "계좌번호", "required": true, "placeholder": "계좌번호를 입력하세요"}]}'
                  },
                  {
                    formId: "FORM-HOUSING-001",
                    formName: "주택도시기금 대출신청서(가계용)",
                    formType: "loan",
                    formSchema: '{"fields": [{"id": "applicant_name", "name": "applicantName", "type": "text", "label": "신청인 성명", "required": true, "placeholder": "신청인 성명을 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "phone", "name": "phone", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "address", "name": "address", "type": "text", "label": "주소", "required": true, "placeholder": "주소를 입력하세요"}, {"id": "loan_amount", "name": "loanAmount", "type": "number", "label": "대출신청금액", "required": true, "placeholder": "대출신청금액을 입력하세요"}, {"id": "loan_purpose", "name": "loanPurpose", "type": "text", "label": "대출목적", "required": true, "placeholder": "대출목적을 입력하세요"}]}'
                  },
                  {
                    formId: "FORM-PRIVACY-001",
                    formName: "개인신용정보 수집이용동의서(비여신금융거래)",
                    formType: "deposit",
                    formSchema: '{"fields": [{"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "phone", "name": "phone", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "consent_date", "name": "consentDate", "type": "date", "label": "동의일자", "required": true, "placeholder": "동의일자를 선택하세요"}, {"id": "signature", "name": "signature", "type": "signature", "label": "서명", "required": true, "placeholder": "서명해주세요"}]}'
                  }
                ]
              };
              
              setCurrentProduct(productWithForms);
              setCurrentFormIndex(0);
              setCurrentForm(productWithForms.forms[0]);
              setCurrentPage("product-enrollment");
            }
            break;

      case "form-navigation":
        if (data.data) {
          console.log("서식 네비게이션:", data.data);
          setCurrentFormIndex(data.data.currentFormIndex);
          setCurrentForm(data.data.currentForm);
          // 필드 포커스 모드 해제
          setIsFieldFocusMode(false);
          setFocusedField(null);
        }
        break;
        
      case "field-focus":
        if (data.data) {
          console.log("필드 포커스:", data.data);
          setFocusedField(data.data);
          setIsFieldFocusMode(true);
        }
        break;

      case "screen-highlight":
        if (data.data) {
          console.log("화면 하이라이트:", data.data);
          // 하이라이트 효과 적용
          applyHighlight(data.data);
        }
        break;

      case "screen-updated":
        if (data.data.type === "form-viewer") {
          setFormData(data.data.data);
          setCurrentFormUrl(data.data.data.formUrl);
          setCurrentFormData(data.data.data.formData || {});
          setHighlightedFields(data.data.data.highlightedFields || []);
          setCurrentFormId(data.data.data.formId);
          setCurrentFormTitle(data.data.data.formTitle);
          setCurrentPage("form");
        }
        break;

      case "form-data-update":
        setCurrentFormData(data.data.formData || {});
        break;

      case "field-highlight":
        setHighlightedFields(data.fields || []);
        break;

      default:
        console.log("알 수 없는 메시지 타입:", data.type);
        break;
    }
  };

  // 고객 상품 정보 로드
  const loadCustomerProducts = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/customers/${customerId}/products`
      );
      if (response.data.success) {
        setCustomerProducts(response.data.data.products);
      }
    } catch (error) {
      console.error("고객 보유 상품 조회 실패:", error);
    }
  };

  // 고객 정보 확인
  const handleCustomerInfoConfirm = () => {
    if (stompClient && currentCustomer) {
      stompClient.publish({
        destination: "/app/send-message",
        body: JSON.stringify({
          sessionId: sessionId,
          type: "customer-info-confirmed",
          customerData: currentCustomer,
        }),
      });
    }
  };

  // 폼 데이터 변경 처리
  const handleFormDataChange = (updatedFormData) => {
    setCurrentFormData(updatedFormData);

    // 직원에게 실시간으로 데이터 변경 전송
    if (stompClient && connected) {
      stompClient.publish({
        destination: "/app/send-to-session",
        body: JSON.stringify({
          sessionId: sessionId,
          type: "form-data-update",
          data: {
            formData: updatedFormData,
            formId: currentFormId,
            formTitle: currentFormTitle,
          },
        }),
      });
    }
  };

  // 하이라이트 효과 적용
  const applyHighlight = (highlightData) => {
    const { elementId, highlightType, color } = highlightData;
    const element = document.getElementById(elementId);

    if (element) {
      // 기존 하이라이트 제거
      element.style.backgroundColor = "";
      element.style.borderBottom = "";
      element.style.textDecoration = "";

      if (highlightType === "highlight") {
        element.style.backgroundColor = color || "#ffff00";
      } else if (highlightType === "underline") {
        element.style.borderBottom = `3px solid ${color || "#ff0000"}`;
      }
      // "clear" 타입은 이미 위에서 제거됨
    }
  };

  // 뒤로가기 버튼
  const handleBack = () => {
    if (currentPage === "form") {
      setCurrentPage("customer-info");
    } else if (currentPage === "customer-info") {
      setCurrentPage("welcome");
    } else if (currentPage === "product-detail") {
      setCurrentPage("customer-info");
    } else if (currentPage === "customer-list") {
      setCurrentPage("welcome");
    } else if (currentPage === "product-enrollment") {
      setCurrentPage("product-detail");
    }
  };

  // 페이지 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case "welcome":
        return (
          <WelcomePage>
            <WelcomeCard>
              <Title>🏦 하나은행</Title>
              <Subtitle>스마트 금융 상담 시스템</Subtitle>

              <StatusCard connected={connected}>
                <StatusText connected={connected}>
                  {connected
                    ? `✅ ${employeeName} 직원과 연결되었습니다`
                    : "⏳ 직원 연결을 기다리는 중..."}
                </StatusText>
              </StatusCard>

              {connected && (
                <div
                  style={{
                    background: "#e8f5e8",
                    border: "2px solid #4caf50",
                    borderRadius: "12px",
                    padding: "1rem",
                    margin: "1rem 0",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#2e7d32",
                      fontWeight: "bold",
                      margin: 0,
                      fontSize: "1.1rem",
                    }}
                  >
                    🎉 연결 성공! 이제 직원과 상담을 시작할 수 있습니다.
                  </p>
                </div>
              )}

              {!connected && (
                <div
                  style={{
                    background: "#e3f2fd",
                    border: "2px solid #2196f3",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    margin: "1rem 0",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#1976d2",
                      margin: "1rem 0",
                      fontWeight: "bold",
                    }}
                  >
                    🔄 직원이 시스템에 접속하면 자동으로 연결됩니다.
                  </p>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    연결 중... 잠시만 기다려 주세요.
                  </div>
                </div>
              )}
            </WelcomeCard>
          </WelcomePage>
        );

      case "customer-info":
        return (
          <CustomerInfoPage>
            <CustomerInfoCard>
              <CustomerInfoTitle>👤 고객 정보 확인</CustomerInfoTitle>

              <CustomerInfoGrid>
                <InfoItem>
                  <InfoLabel>성함</InfoLabel>
                  <InfoValue>{currentCustomer?.name}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>연락처</InfoLabel>
                  <InfoValue>{currentCustomer?.phone}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>나이</InfoLabel>
                  <InfoValue>{currentCustomer?.age}세</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>주소</InfoLabel>
                  <InfoValue>{currentCustomer?.address}</InfoValue>
                </InfoItem>
              </CustomerInfoGrid>

              <ActionButton onClick={handleCustomerInfoConfirm}>
                ✅ 정보 확인 완료
              </ActionButton>
            </CustomerInfoCard>

            {customerProducts.length > 0 && (
              <ProductsList>
                <h3 style={{ color: "var(--hana-mint)", marginBottom: "1rem" }}>
                  📋 보유 상품 목록 ({customerProducts.length}개)
                </h3>
                {customerProducts.map((product, index) => (
                  <ProductItem key={index} balance={product.balance || 0}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "var(--hana-mint)",
                          }}
                        >
                          {product.productName ||
                            product.product_name ||
                            "상품명 없음"}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          {product.productType ||
                            product.product_type ||
                            "상품타입 없음"}{" "}
                          | {product.interestRate || product.interest_rate || 0}
                          %
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color:
                              (product.balance || 0) >= 0
                                ? "#2e7d32"
                                : "#c62828",
                          }}
                        >
                          {(product.balance || 0) >= 0 ? "+" : ""}
                          {(product.balance || 0).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </ProductItem>
                ))}
              </ProductsList>
            )}
          </CustomerInfoPage>
        );

      case "customer-list":
        return (
          <CustomerInfoPage>
            <CustomerInfoCard>
              <CustomerInfoTitle>👥 고객 목록</CustomerInfoTitle>
              <div style={{ marginBottom: "1rem", color: "#666" }}>
                총 {customers.length}명의 고객이 있습니다.
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {customers.map((customer, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      padding: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{ fontWeight: "bold", color: "var(--hana-mint)" }}
                    >
                      {customer.name}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      연락처: {customer.phone || customer.contactNumber}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      나이: {customer.age}세
                    </div>
                  </div>
                ))}
              </div>
            </CustomerInfoCard>
          </CustomerInfoPage>
        );

      case "product-detail":
        return (
          <CustomerInfoPage>
            <CustomerInfoCard>
              <CustomerInfoTitle>📋 상품 상세 정보</CustomerInfoTitle>

              {currentProduct && (
                <>
                  <CustomerInfoGrid>
                    <InfoItem>
                      <InfoLabel>상품명</InfoLabel>
                      <InfoValue>{currentProduct.productName}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>상품 유형</InfoLabel>
                      <InfoValue>{currentProduct.productType}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>기본 금리</InfoLabel>
                      <InfoValue>{currentProduct.baseRate}%</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>최소 금액</InfoLabel>
                      <InfoValue>
                        {currentProduct.minAmount?.toLocaleString()}원
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>최대 금액</InfoLabel>
                      <InfoValue>
                        {currentProduct.maxAmount?.toLocaleString()}원
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>판매 상태</InfoLabel>
                      <InfoValue>{currentProduct.salesStatus}</InfoValue>
                    </InfoItem>
                  </CustomerInfoGrid>

                  {currentProduct.description && (
                    <div style={{ marginTop: "1rem" }}>
                      <InfoLabel>상품 설명</InfoLabel>
                      <div
                        style={{
                          background: "#f8f9fa",
                          padding: "1rem",
                          borderRadius: "8px",
                          marginTop: "0.5rem",
                        }}
                      >
                        {currentProduct.description}
                      </div>
                    </div>
                  )}

                  {currentProduct.forms && currentProduct.forms.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <InfoLabel>
                        관련 서식 ({currentProduct.forms.length}개)
                      </InfoLabel>
                      <div style={{ marginTop: "0.5rem" }}>
                        {currentProduct.forms.map((form, index) => (
                          <div
                            key={index}
                            style={{
                              background: "#e8f5e8",
                              border: "1px solid #4caf50",
                              borderRadius: "6px",
                              padding: "0.5rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div
                              style={{ fontWeight: "bold", color: "#2e7d32" }}
                            >
                              {form.formName}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#666" }}>
                              {form.formType}{" "}
                              {form.isCommon ? "(공통)" : "(상품별)"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CustomerInfoCard>
          </CustomerInfoPage>
        );

      case "product-enrollment":
        console.log("product-enrollment 페이지 렌더링, currentProduct:", currentProduct);
        return (
          <CustomerInfoPage>
            <CustomerInfoCard>
              <CustomerInfoTitle>📝 상품 가입 서식</CustomerInfoTitle>

              {currentProduct && (
                <>
                  <div style={{ marginBottom: "1rem", color: "#666" }}>
                    <strong>{currentProduct.productName}</strong> 가입을 위한
                    서식을 작성해주세요.
                  </div>

                  {currentProduct.forms && currentProduct.forms.length > 0 && (
                    <>
                      <div
                        style={{
                          background: "#e8f5e8",
                          border: "1px solid #4caf50",
                          borderRadius: "8px",
                          padding: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#2e7d32",
                            marginBottom: "0.5rem",
                          }}
                        >
                          서식 {currentFormIndex + 1} /{" "}
                          {currentProduct.forms.length}
                        </div>
                        <div style={{ color: "#2e7d32" }}>
                          {currentForm?.formName ||
                            currentProduct.forms[currentFormIndex]?.formName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#666",
                            marginTop: "0.5rem",
                          }}
                        >
                          {currentForm?.formType ||
                            currentProduct.forms[currentFormIndex]?.formType}
                          {currentForm?.isCommon
                            ? " (공통 서식)"
                            : " (상품별 서식)"}
                        </div>
                      </div>

                      {currentForm?.description && (
                        <div
                          style={{
                            background: "#f8f9fa",
                            padding: "1rem",
                            borderRadius: "8px",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "0.5rem",
                            }}
                          >
                            서식 설명
                          </div>
                          <div>{currentForm.description}</div>
                        </div>
                      )}

                      {/* 서식 필드 렌더링 */}
                      {currentForm?.formSchema && (
                        <div
                          style={{
                            background: "white",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "1.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "1rem",
                              color: "#008485",
                            }}
                          >
                            📝 서식 작성
                          </div>
                          
                          {/* 스마트창구 필드 입력 모드 */}
                          {isFieldFocusMode && focusedField && (
                            <div
                              style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                border: "3px solid #4a5568",
                                borderRadius: "12px",
                                padding: "2rem",
                                marginBottom: "1.5rem",
                                textAlign: "center",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                              }}
                            >
                              <div style={{ 
                                fontSize: "1.4rem", 
                                fontWeight: "bold", 
                                color: "white", 
                                marginBottom: "0.5rem",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
                              }}>
                                📋 {focusedField.fieldLabel} 입력
                              </div>
                              <div style={{ 
                                color: "#e2e8f0", 
                                marginBottom: "1.5rem",
                                fontSize: "1rem"
                              }}>
                                {focusedField.formName}
                              </div>
                              {(() => {
                                const field = focusedField;
                                return (
                                  <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                                    <div style={{ 
                                      background: "white", 
                                      borderRadius: "8px", 
                                      padding: "1.5rem",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                    }}>
                                      <label style={{ 
                                        display: "block", 
                                        fontWeight: "bold", 
                                        marginBottom: "1rem", 
                                        color: "#2d3748",
                                        fontSize: "1.1rem"
                                      }}>
                                        {field.fieldLabel}
                                        <span style={{ color: "#e53e3e", marginLeft: "0.25rem" }}> *</span>
                                      </label>
                                      {field.fieldType === "text" && (
                                        <input
                                          type="text"
                                          placeholder={field.fieldPlaceholder}
                                          defaultValue={commonFormData[field.id] || commonFormData[field.name] || ""}
                                          style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            fontSize: "1.2rem",
                                            border: "2px solid #e2e8f0",
                                            borderRadius: "8px",
                                            textAlign: "left",
                                            background: "#f7fafc",
                                            transition: "all 0.3s ease"
                                          }}
                                          onFocus={(e) => {
                                            e.target.style.borderColor = "#667eea";
                                            e.target.style.background = "white";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                          }}
                                          onBlur={(e) => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.background = "#f7fafc";
                                            e.target.style.boxShadow = "none";
                                          }}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleFieldInput(field.id, field.name, e.target.value);
                                            }
                                          }}
                                          autoFocus
                                        />
                                      )}
                                      {field.fieldType === "number" && (
                                        <input
                                          type="number"
                                          placeholder={field.fieldPlaceholder}
                                          defaultValue={commonFormData[field.id] || commonFormData[field.name] || ""}
                                          style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            fontSize: "1.2rem",
                                            border: "2px solid #e2e8f0",
                                            borderRadius: "8px",
                                            textAlign: "left",
                                            background: "#f7fafc",
                                            transition: "all 0.3s ease"
                                          }}
                                          onFocus={(e) => {
                                            e.target.style.borderColor = "#667eea";
                                            e.target.style.background = "white";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                          }}
                                          onBlur={(e) => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.background = "#f7fafc";
                                            e.target.style.boxShadow = "none";
                                          }}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleFieldInput(field.id, field.name, e.target.value);
                                            }
                                          }}
                                          autoFocus
                                        />
                                      )}
                                      {field.fieldType === "email" && (
                                        <input
                                          type="email"
                                          placeholder={field.fieldPlaceholder}
                                          defaultValue={commonFormData[field.id] || commonFormData[field.name] || ""}
                                          style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            fontSize: "1.2rem",
                                            border: "2px solid #e2e8f0",
                                            borderRadius: "8px",
                                            textAlign: "left",
                                            background: "#f7fafc",
                                            transition: "all 0.3s ease"
                                          }}
                                          onFocus={(e) => {
                                            e.target.style.borderColor = "#667eea";
                                            e.target.style.background = "white";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                          }}
                                          onBlur={(e) => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.background = "#f7fafc";
                                            e.target.style.boxShadow = "none";
                                          }}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleFieldInput(field.id, field.name, e.target.value);
                                            }
                                          }}
                                          autoFocus
                                        />
                                      )}
                                      {field.fieldType === "date" && (
                                        <input
                                          type="date"
                                          defaultValue={commonFormData[field.id] || commonFormData[field.name] || ""}
                                          style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            fontSize: "1.2rem",
                                            border: "2px solid #e2e8f0",
                                            borderRadius: "8px",
                                            textAlign: "left",
                                            background: "#f7fafc",
                                            transition: "all 0.3s ease"
                                          }}
                                          onFocus={(e) => {
                                            e.target.style.borderColor = "#667eea";
                                            e.target.style.background = "white";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                          }}
                                          onBlur={(e) => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.background = "#f7fafc";
                                            e.target.style.boxShadow = "none";
                                          }}
                                          onChange={(e) => {
                                            handleFieldInput(field.id, field.name, e.target.value);
                                          }}
                                          autoFocus
                                        />
                                      )}
                                      {field.fieldType === "textarea" && (
                                        <textarea
                                          placeholder={field.fieldPlaceholder}
                                          defaultValue={commonFormData[field.id] || commonFormData[field.name] || ""}
                                          rows={4}
                                          style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            fontSize: "1.2rem",
                                            border: "2px solid #e2e8f0",
                                            borderRadius: "8px",
                                            resize: "vertical",
                                            background: "#f7fafc",
                                            transition: "all 0.3s ease"
                                          }}
                                          onFocus={(e) => {
                                            e.target.style.borderColor = "#667eea";
                                            e.target.style.background = "white";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                          }}
                                          onBlur={(e) => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.background = "#f7fafc";
                                            e.target.style.boxShadow = "none";
                                          }}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) {
                                              handleFieldInput(field.id, field.name, e.target.value);
                                            }
                                          }}
                                          autoFocus
                                        />
                                      )}
                                      {field.fieldType === "signature" && (
                                        <div
                                          style={{
                                            width: "100%",
                                            height: "250px",
                                            border: "3px dashed #667eea",
                                            borderRadius: "12px",
                                            background: "linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)",
                                            backgroundSize: "20px 20px",
                                            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.2rem",
                                            color: "#4a5568",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease"
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.borderColor = "#4c51bf";
                                            e.target.style.background = "linear-gradient(45deg, #edf2f7 25%, transparent 25%), linear-gradient(-45deg, #edf2f7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #edf2f7 75%), linear-gradient(-45deg, transparent 75%, #edf2f7 75%)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.borderColor = "#667eea";
                                            e.target.style.background = "linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)";
                                          }}
                                        >
                                          ✍️ 서명을 입력해주세요
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          {(() => {
                            try {
                              const schema = JSON.parse(currentForm.formSchema);
                              return schema.fields?.map((field, index) => (
                                <div key={index} style={{ marginBottom: "1rem" }}>
                                  <label
                                    style={{
                                      display: "block",
                                      fontWeight: "bold",
                                      marginBottom: "0.5rem",
                                      color: "#333",
                                    }}
                                  >
                                    {field.label}
                                    {field.required && (
                                      <span style={{ color: "red" }}> *</span>
                                    )}
                                  </label>
                                  {field.type === "text" && (
                                    <input
                                      type="text"
                                      placeholder={field.placeholder}
                                      style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "1rem",
                                      }}
                                    />
                                  )}
                                  {field.type === "number" && (
                                    <input
                                      type="number"
                                      placeholder={field.placeholder}
                                      style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "1rem",
                                      }}
                                    />
                                  )}
                                  {field.type === "email" && (
                                    <input
                                      type="email"
                                      placeholder={field.placeholder}
                                      style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "1rem",
                                      }}
                                    />
                                  )}
                                  {field.type === "date" && (
                                    <input
                                      type="date"
                                      style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "1rem",
                                      }}
                                    />
                                  )}
                                  {field.type === "textarea" && (
                                    <textarea
                                      placeholder={field.placeholder}
                                      rows={3}
                                      style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "1rem",
                                        resize: "vertical",
                                      }}
                                    />
                                  )}
                                  {field.type === "signature" && (
                                    <div
                                      style={{
                                        border: "2px dashed #ddd",
                                        borderRadius: "4px",
                                        padding: "1rem",
                                        textAlign: "center",
                                        background: "#f9f9f9",
                                        minHeight: "100px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#666",
                                      }}
                                    >
                                      ✍️ 서명 영역 (터치하여 서명)
                                    </div>
                                  )}
                                </div>
                              ));
                            } catch (e) {
                              return (
                                <div style={{ color: "red" }}>
                                  서식 데이터를 불러올 수 없습니다.
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}

                      {/* 서식 진행 상태 표시 (읽기 전용) */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "1rem",
                          padding: "1rem",
                          background: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ color: "#666", fontSize: "1.1rem", fontWeight: "bold" }}>
                          서식 {currentFormIndex + 1} / {currentProduct.forms.length}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CustomerInfoCard>
          </CustomerInfoPage>
        );

      case "form":
        return (
          <FormPage>
            <FormHeader>
              <FormTitle>{currentFormTitle || "서식 작성"}</FormTitle>
              <BackButton onClick={handleBack}>← 뒤로</BackButton>
            </FormHeader>
            <FormContent>
              <FormViewer
                formUrl={currentFormUrl}
                formData={currentFormData}
                highlightedFields={highlightedFields}
                onFormDataChange={handleFormDataChange}
                isReadOnly={false}
              />
            </FormContent>
          </FormPage>
        );

      default:
        return (
          <WaitingPage>
            <WaitingCard>
              <WaitingIcon>⏳</WaitingIcon>
              <WaitingText>
                직원이 서식을 선택할 때까지 대기중입니다...
              </WaitingText>
            </WaitingCard>
          </WaitingPage>
        );
    }
  };

  return (
    <TabletContainer>
      <Header>
        <HeaderTitle>🏦 하나은행 스마트 상담</HeaderTitle>
        <ConnectionStatus connected={connected}>
          {connected ? "🟢 연결됨" : "🟡 연결 대기중"}
        </ConnectionStatus>
      </Header>

      <ContentArea>{renderPage()}</ContentArea>
    </TabletContainer>
  );
};

export default CustomerTablet;
