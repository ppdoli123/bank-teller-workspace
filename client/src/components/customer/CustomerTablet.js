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
  const [currentPage, setCurrentPage] = useState("welcome"); // welcome, customer-info, form, waiting
  const [connected, setConnected] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [formData, setFormData] = useState(null);
  const [currentFormUrl, setCurrentFormUrl] = useState(null);
  const [currentFormData, setCurrentFormData] = useState({});
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [currentFormTitle, setCurrentFormTitle] = useState("");
  const [sessionId] = useState("tablet_main");
  const [stompClient, setStompClient] = useState(null);
  const [isWaitingForEmployee, setIsWaitingForEmployee] = useState(true);

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

  // 뒤로가기 버튼
  const handleBack = () => {
    if (currentPage === "form") {
      setCurrentPage("customer-info");
    } else if (currentPage === "customer-info") {
      setCurrentPage("welcome");
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
