import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import FormDisplay from "./FormDisplay";
import InteractiveFormViewer from "./InteractiveFormViewer";
import TabletFieldInput from "./TabletFieldInput";

const TabletContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "Noto Sans KR", sans-serif;
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
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  const [isWaitingForEmployee, setIsWaitingForEmployee] = useState(true);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [productSummary, setProductSummary] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 필드 입력 상태 추가
  const [fieldInputData, setFieldInputData] = useState(null);
  const [showFieldInput, setShowFieldInput] = useState(false);

  useEffect(() => {
    // URL에서 세션 ID 추출 또는 기본 태블릿 세션 사용
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get("session") || "tablet_main";
    setSessionId(urlSessionId);

    // STOMP WebSocket 연결
    const client = new Client({
      webSocketFactory: () => {
        // 로컬 개발 환경에서는 로컬 서버 사용
        const isDevelopment = process.env.NODE_ENV === "development";
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

      // STOMP 연결 성공 시 직원 연결 상태로 설정
      setConnected(true);
      setEmployeeName("직원");
      setIsWaitingForEmployee(false);
      console.log("✅ STOMP 연결 성공 - 직원 연결 상태로 설정");

      // 태블릿 세션 참여
      client.publish({
        destination: "/app/join-session",
        body: JSON.stringify({
          sessionId: urlSessionId,
          userType: "customer-tablet",
        }),
      });

      // 실제 고객 정보 자동 로드 (연결 성공 시)
      setTimeout(() => {
        // DB에서 첫 번째 고객 정보 가져오기
        fetchCustomerInfo();
      }, 1000);

      // 메시지 구독 설정
      client.subscribe("/topic/session/" + urlSessionId, function (message) {
        const data = JSON.parse(message.body);
        console.log("세션 메시지 수신:", data);

        // receive-message 타입으로 래핑된 메시지 처리
        let messageData = data;
        if (data.type === "receive-message" && data.data) {
          messageData = data.data;
          console.log("래핑된 메시지 데이터:", messageData);
        }

        switch (messageData.type) {
          case "session-joined":
            if (messageData.userType === "employee") {
              setConnected(true);
              setEmployeeName(messageData.userId || "직원");
              setIsWaitingForEmployee(false);
              console.log("직원 연결됨:", messageData.userId);
            }
            break;
          case "employee-connected":
            setConnected(true);
            setEmployeeName(messageData.employeeName);
            setIsWaitingForEmployee(false);
            break;
          case "tablet-connected":
            // 태블릿 연결 성공 메시지
            console.log("태블릿 연결 성공:", messageData);
            break;
          case "participant-joined":
            // 참가자 참여 메시지 (직원이 참여한 경우)
            if (messageData.userType === "employee") {
              setConnected(true);
              setEmployeeName(messageData.userId || "직원");
              setIsWaitingForEmployee(false);
              console.log("직원 참여 감지:", messageData.userId);
            }
            break;
          case "customer-info-updated":
            setCurrentCustomer(messageData.customerData);
            if (messageData.customerData.CustomerID) {
              fetchCustomerProducts(messageData.customerData.CustomerID);
            }
            break;
          case "customer-info-display":
            console.log("고객 정보 표시 메시지 수신:", messageData);
            // 직원이 보낸 고객 정보를 태블릿에 표시
            if (messageData.data && messageData.data.customer) {
              const customerData = messageData.data.customer;
              setCurrentCustomer(customerData);
              fetchCustomerProducts(customerData.CustomerID);
              console.log("✅ 직원이 보낸 고객 정보 표시:", customerData.Name);
            }
            break;
          case "product-detail-sync":
            // 상품 상세 메시지를 받으면 직원이 연결된 것으로 간주
            if (!connected) {
              setConnected(true);
              setEmployeeName("직원");
              setIsWaitingForEmployee(false);
              console.log("직원 연결됨 (상품 동기화를 통해 감지)");
            }
            setSelectedProductDetail(
              messageData.data || messageData.productData
            );
            break;
          case "form-display":
            // 서식 표시 메시지 처리
            console.log("서식 표시 메시지 수신:", messageData);
            console.log("서식 데이터:", messageData.data);
            setFormData(messageData.data);
            setShowForm(true);
            // 직원이 연결되지 않았다면 연결상태로 설정
            if (!connected) {
              setConnected(true);
              setEmployeeName("직원");
              setIsWaitingForEmployee(false);
            }
            break;
          case "form-preview":
            // PDF 폼 미리보기
            console.log("PDF 폼 미리보기 수신:", messageData);
            setFormData(messageData.data);
            break;
          case "FIELD_INPUT_REQUEST":
            // 필드 입력 요청 처리
            console.log("필드 입력 요청 수신:", messageData);
            setFieldInputData(messageData.field);
            setShowFieldInput(true);
            break;
          case "FIELD_INPUT_COMPLETED":
            // 필드 입력 완료 메시지 (태블릿에서 보낸 것이 다시 돌아옴)
            console.log("필드 입력 완료 메시지 수신 (에코):", messageData);
            // 태블릿에서는 특별한 처리 불필요 (행원 화면용 메시지)
            break;
          case "form-completed":
            // 완성된 PDF 폼
            console.log("완성된 PDF 폼 수신:", messageData);
            setFormData(messageData.data);
            setShowForm(true);
            break;
          case "session-status":
            if (messageData.connected) {
              setConnected(true);
              setEmployeeName(messageData.employeeName);
              setIsWaitingForEmployee(false);
            }
            break;
          default:
            console.log("알 수 없는 메시지 타입:", messageData.type);
            break;
        }
      });
    };

    client.onStompError = function (frame) {
      console.error("STOMP 오류:", frame.headers["message"]);
    };

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  // 실제 고객 정보 가져오기
  const fetchCustomerInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/customers`);
      if (response.data.success && response.data.data.length > 0) {
        setAllCustomers(response.data.data);
        const customer = response.data.data[0]; // 첫 번째 고객
        setCurrentCustomer(customer);
        fetchCustomerProducts(customer.CustomerID);
        console.log("✅ 실제 고객 정보 로드:", customer.Name);
      } else {
        console.log("고객 정보가 없습니다.");
      }
    } catch (error) {
      console.error("고객 정보 조회 실패:", error);
    }
  };

  // 고객 선택 핸들러
  const handleCustomerSelect = (customer) => {
    setCurrentCustomer(customer);
    fetchCustomerProducts(customer.CustomerID);
    console.log("✅ 고객 선택됨:", customer.Name);

    // 직원에게 고객 선택 알림
    if (stompClient && stompClient.active) {
      stompClient.publish({
        destination: "/app/send-message",
        body: JSON.stringify({
          sessionId: sessionId,
          type: "customer-selected",
          customerData: customer,
        }),
      });
    }
  };

  const fetchCustomerProducts = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/customers/${customerId}/products`
      );
      if (response.data.success) {
        setCustomerProducts(response.data.data.products);
        setProductSummary(response.data.data.summary);
        console.log(
          "고객 보유 상품 로드:",
          response.data.data.products.length,
          "개"
        );
      }
    } catch (error) {
      console.error("고객 보유 상품 조회 실패:", error);
    }
  };

  const handleStartConsultation = () => {
    if (stompClient && stompClient.active) {
      stompClient.publish({
        destination: "/app/send-message",
        body: JSON.stringify({
          sessionId: sessionId,
          type: "start-consultation",
          ready: true,
        }),
      });
    }
  };

  const handleCustomerInfoConfirm = () => {
    if (stompClient && stompClient.active && currentCustomer) {
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

  // 필드 입력 완료 핸들러
  const handleFieldInputComplete = (inputValue) => {
    if (stompClient && stompClient.active && fieldInputData) {
      stompClient.publish({
        destination: "/app/send-message",
        body: JSON.stringify({
          sessionId: sessionId,
          type: "FIELD_INPUT_COMPLETED",
          field: {
            id: fieldInputData.id,
            value: inputValue,
          },
        }),
      });
    }

    setShowFieldInput(false);
    setFieldInputData(null);
  };

  // 필드 입력 취소 핸들러
  const handleFieldInputCancel = () => {
    setShowFieldInput(false);
    setFieldInputData(null);
  };

  return (
    <TabletContainer>
      {/* 필드 입력 모달 */}
      {showFieldInput && fieldInputData && (
        <TabletFieldInput
          fieldData={fieldInputData}
          onComplete={handleFieldInputComplete}
          onCancel={handleFieldInputCancel}
        />
      )}

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

        {/* 연결 성공 시 환영 메시지 */}
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

        {sessionId && (
          <SessionInfo>
            <h3>세션 정보</h3>
            <p>
              <strong>세션 ID:</strong> {sessionId}
            </p>
            <p>
              <strong>상태:</strong> {connected ? "연결됨" : "대기중"}
            </p>
          </SessionInfo>
        )}

        {allCustomers.length > 0 && (
          <SessionInfo>
            <h3>👥 고객 선택</h3>
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                상담할 고객을 선택해주세요:
              </p>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {allCustomers.map((customer) => (
                  <div
                    key={customer.CustomerID}
                    onClick={() => handleCustomerSelect(customer)}
                    style={{
                      border:
                        currentCustomer?.CustomerID === customer.CustomerID
                          ? "2px solid var(--hana-mint)"
                          : "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "1rem",
                      margin: "0.5rem 0",
                      background:
                        currentCustomer?.CustomerID === customer.CustomerID
                          ? "#e8f5e8"
                          : "#f8f9fa",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{ fontWeight: "bold", color: "var(--hana-mint)" }}
                    >
                      {customer.Name}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {customer.Phone} | {customer.Age}세
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SessionInfo>
        )}

        {currentCustomer && (
          <>
            <SessionInfo>
              <h3>👤 고객 정보 확인</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  margin: "1rem 0",
                }}
              >
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>성함</div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "var(--hana-mint)",
                    }}
                  >
                    {currentCustomer.Name}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    연락처
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "var(--hana-mint)",
                    }}
                  >
                    {currentCustomer.Phone}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "8px",
                  textAlign: "center",
                  margin: "1rem 0",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#666" }}>나이</div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "var(--hana-mint)",
                  }}
                >
                  {currentCustomer.Age}세
                </div>
              </div>
              <ActionButton onClick={handleCustomerInfoConfirm}>
                ✅ 정보 확인 완료
              </ActionButton>
            </SessionInfo>

            {productSummary && (
              <SessionInfo>
                <h3>💰 보유 상품 현황</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    margin: "1rem 0",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      background: "#e8f5e8",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      총 자산
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#2e7d32",
                      }}
                    >
                      {productSummary.totalAssets.toLocaleString()}원
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      background: "#ffebee",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      총 부채
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#c62828",
                      }}
                    >
                      {productSummary.totalDebts.toLocaleString()}원
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    background: "#f3e5f5",
                    borderRadius: "8px",
                    margin: "1rem 0",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    순자산
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "bold",
                      color:
                        productSummary.netAssets >= 0 ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {productSummary.netAssets.toLocaleString()}원
                  </div>
                </div>
              </SessionInfo>
            )}

            {customerProducts.length > 0 && (
              <SessionInfo>
                <h3>📋 보유 상품 목록 ({customerProducts.length}개)</h3>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {customerProducts.map((product, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "1rem",
                        margin: "0.5rem 0",
                        background:
                          product.balance >= 0 ? "#f8fff8" : "#fff8f8",
                      }}
                    >
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
                            {product.product_name}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#666" }}>
                            {product.product_type} | {product.interest_rate}%
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              color:
                                product.balance >= 0 ? "#2e7d32" : "#c62828",
                            }}
                          >
                            {product.balance >= 0 ? "+" : ""}
                            {product.balance.toLocaleString()}원
                          </div>
                          {product.monthly_payment !== 0 && (
                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                              월 {product.monthly_payment >= 0 ? "+" : ""}
                              {product.monthly_payment.toLocaleString()}원
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

        {connected && !currentCustomer && allCustomers.length === 0 && (
          <div
            style={{
              background: "#fff3e0",
              border: "2px solid #ff9800",
              borderRadius: "12px",
              padding: "1.5rem",
              margin: "1rem 0",
              textAlign: "center",
            }}
          >
            <p
              style={{ color: "#f57c00", margin: "1rem 0", fontWeight: "bold" }}
            >
              🎯 고객 정보를 불러오는 중입니다...
            </p>
            <ActionButton onClick={fetchCustomerInfo}>
              🔄 고객 정보 새로고침
            </ActionButton>
          </div>
        )}

        {connected && !currentCustomer && allCustomers.length > 0 && (
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
              style={{ color: "#1976d2", margin: "1rem 0", fontWeight: "bold" }}
            >
              👆 위에서 상담할 고객을 선택해주세요.
            </p>
          </div>
        )}

        {isWaitingForEmployee && !connected && (
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
              style={{ color: "#1976d2", margin: "1rem 0", fontWeight: "bold" }}
            >
              🔄 직원이 시스템에 접속하면 자동으로 연결됩니다.
            </p>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              연결 중... 잠시만 기다려 주세요.
            </div>
          </div>
        )}

        {/* 상품 상세보기 모달 */}
        {selectedProductDetail && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "2rem",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "80%",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  borderBottom: "2px solid #f1f3f4",
                  paddingBottom: "1rem",
                }}
              >
                <h2 style={{ color: "var(--hana-mint)", margin: 0 }}>
                  {selectedProductDetail.product_name}
                </h2>
                <button
                  onClick={() => setSelectedProductDetail(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}
                >
                  상품 타입
                </h4>
                <p style={{ margin: 0, color: "#333" }}>
                  {selectedProductDetail.productType ||
                    selectedProductDetail.product_type ||
                    "일반 상품"}
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}
                >
                  상품 특징
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "#333",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedProductDetail.productFeatures ||
                    selectedProductDetail.product_features ||
                    "정보 없음"}
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}
                >
                  가입 대상
                </h4>
                <p style={{ margin: 0, color: "#333", whiteSpace: "pre-line" }}>
                  {selectedProductDetail.targetCustomers ||
                    selectedProductDetail.target_customers ||
                    "정보 없음"}
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}
                >
                  가입 금액
                </h4>
                <p style={{ margin: 0, color: "#333", whiteSpace: "pre-line" }}>
                  {selectedProductDetail.depositAmount ||
                    selectedProductDetail.deposit_amount ||
                    "정보 없음"}
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}
                >
                  가입 기간
                </h4>
                <p style={{ margin: 0, color: "#333" }}>
                  {selectedProductDetail.depositPeriod ||
                    selectedProductDetail.deposit_period ||
                    "정보 없음"}
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}
                >
                  기본 금리
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "#333",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  {selectedProductDetail.interestRate ||
                    selectedProductDetail.interest_rate ||
                    "정보 없음"}
                </p>
              </div>

              {(selectedProductDetail.preferentialRate ||
                selectedProductDetail.preferential_rate) && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4
                    style={{
                      color: "var(--hana-mint)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    우대 금리
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: "#e65100",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {selectedProductDetail.preferentialRate ||
                      selectedProductDetail.preferential_rate}
                  </p>
                </div>
              )}

              {(selectedProductDetail.taxBenefits ||
                selectedProductDetail.tax_benefits) && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4
                    style={{
                      color: "var(--hana-mint)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    세제 혜택
                  </h4>
                  <p
                    style={{ margin: 0, color: "#333", whiteSpace: "pre-line" }}
                  >
                    {selectedProductDetail.taxBenefits ||
                      selectedProductDetail.tax_benefits}
                  </p>
                </div>
              )}

              <div
                style={{
                  background: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginTop: "1.5rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "var(--hana-mint)",
                    fontWeight: "bold",
                  }}
                >
                  💡 직원과 함께 상품에 대해 상담받아보세요!
                </p>
              </div>
            </div>
          </div>
        )}
      </WelcomeCard>

      {/* 서식 표시 */}
      {showForm && formData && (
        <>
          {/* 대화형 폼 뷰어 */}
          {formData.form &&
          (formData.form.pdfUrl || formData.form.type === "pdf") ? (
            <InteractiveFormViewer formData={formData} />
          ) : (
            /* 기존 일반 서식인 경우 */
            <FormDisplay formData={formData} />
          )}
        </>
      )}
    </TabletContainer>
  );
};

export default CustomerTablet;
