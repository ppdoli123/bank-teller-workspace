import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import PDFViewer from "./PDFViewer";

const TabletContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const SidebarToggle = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
    color: #2d3748;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.isOpen ? "0" : "-350px")};
  width: 350px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: left 0.3s ease;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: ${(props) =>
    props.isOpen ? "5px 0 25px rgba(0, 0, 0, 0.2)" : "none"};
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const SidebarTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
`;

const SidebarButton = styled.button`
  width: 100%;
  padding: 0.8rem 1rem;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const CustomerInfoBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const CustomerName = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
`;

const CustomerDetail = styled.p`
  margin: 0.3rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: ${(props) => (props.sidebarOpen ? "350px" : "0")};
  transition: margin-left 0.3s ease;
  height: 100vh;
  overflow: hidden;
`;

const PDFContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 0;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

const CustomerTablet = () => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentPage, setCurrentPage] = useState("welcome"); // 초기 페이지: welcome
  const [currentProduct, setCurrentProduct] = useState(null); // 초기 상품: 없음
  const [currentFormIndex, setCurrentFormIndex] = useState(0); // 초기 서식 인덱스: 0
  const [currentForm, setCurrentForm] = useState(null); // 초기 서식: 없음
  const [currentCustomer, setCurrentCustomer] = useState(null); // 현재 선택된 고객 정보
  const [highlightedField, setHighlightedField] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [isFieldFocusMode, setIsFieldFocusMode] = useState(false);
  const [commonFormData, setCommonFormData] = useState({}); // 공통 필드 데이터 저장
  const [fieldValues, setFieldValues] = useState({}); // 입력된 필드 값들을 저장
  const [sidebarOpen, setSidebarOpen] = useState(false); // 사이드바 열림/닫힘 상태

  // 공통 필드 ID들 (자동 입력 대상)
  const commonFieldIds = [
    "customer_name",
    "resident_number",
    "phone_number",
    "address",
  ];

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  const connectWebSocket = () => {
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
      console.log("✅ WebSocket 연결 성공:", frame);
      setConnected(true);
      setStompClient(client);

      // 태블릿 세션 참여
      client.subscribe("/topic/session/tablet_main", (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("📨 태블릿에서 메시지 수신:", data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("❌ 메시지 파싱 오류:", error);
        }
      });

      // 태블릿 세션 참여
      client.publish({
        destination: "/app/join-session",
        body: JSON.stringify({
          sessionId: "tablet_main",
          userType: "tablet",
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP 오류:", frame);
      setConnected(false);
    };

    client.activate();
  };

  const handleWebSocketMessage = (data) => {
    console.log("🔍 메시지 타입:", data.type);

    switch (data.type) {
      case "customer-info-update":
        console.log("🔍 고객 정보 업데이트:", data.data);
        if (data.data) {
          console.log("✅ 고객 정보 설정 시작");
          setCurrentCustomer(data.data.customer);
          setCurrentProduct(null);
          setCurrentForm(null);
          setCurrentFormIndex(0);
          setFieldValues({});
          setCommonFormData({});
          setCurrentPage("customer-info");
          console.log("✅ 고객 정보 페이지로 이동 완료");
        } else {
          console.log("❌ 고객 정보 데이터 누락");
        }
        break;

      case "product-detail-sync":
        console.log("🔍 상품 상세보기 동기화:", data.data);
        if (data.data) {
          setCurrentProduct(data.data._raw);
          setCurrentPage("product-detail");
          // 상품 상세보기에서는 서식 관련 상태 초기화
          setCurrentForm(null);
          setCurrentFormIndex(0);
          setFieldValues({});
          setCommonFormData({});
        }
        break;

      case "product-enrollment":
        console.log("🔍 상품 가입 시작:", data.data);
        console.log("🔍 전체 메시지:", data);
        if (data.data) {
          console.log("✅ data.data 존재:", data.data);
          console.log("✅ forms 개수:", data.data.forms?.length);
          console.log("✅ forms 내용:", data.data.forms);
          console.log("🔍 첫 번째 폼 상세:", data.data.forms?.[0]);
          console.log(
            "🔍 첫 번째 폼 키들:",
            data.data.forms?.[0] ? Object.keys(data.data.forms[0]) : []
          );
          console.log(
            "🔍 첫 번째 폼 formtemplatepath:",
            data.data.forms?.[0]?.formtemplatepath
          );
          console.log("🔍 백엔드에서 전송된 전체 forms 배열:", data.data.forms);
          console.log("🔍 백엔드에서 전송된 전체 data.data:", data.data);
          console.log(
            "🔍 백엔드에서 전송된 forms[0] 상세:",
            JSON.stringify(data.data.forms?.[0], null, 2)
          );
          console.log(
            "🔍 백엔드에서 전송된 forms[0] 키들:",
            data.data.forms?.[0] ? Object.keys(data.data.forms[0]) : []
          );

          const productWithForms = {
            ...data.data,
            forms: data.data.forms || [],
          };

          console.log("✅ productWithForms 설정:", productWithForms);
          console.log("✅ 첫 번째 폼:", productWithForms.forms[0]);

          setCurrentProduct(productWithForms);
          setCurrentFormIndex(0);
          setCurrentForm(productWithForms.forms[0]);
          setCurrentPage("product-enrollment");

          console.log("✅ 상태 설정 완료:");
          console.log("- currentProduct:", productWithForms);
          console.log("- currentFormIndex: 0");
          console.log("- currentForm:", productWithForms.forms[0]);
          console.log("- currentPage: product-enrollment");
          console.log("🔍 설정된 currentForm 상세:");
          console.log(
            "- formtemplatepath:",
            productWithForms.forms[0]?.formtemplatepath
          );
          console.log("- formName:", productWithForms.forms[0]?.formName);
          console.log("- formSchema:", productWithForms.forms[0]?.formSchema);
        } else {
          console.log("❌ data.data가 없음");
        }
        break;

      case "field-focus":
        console.log("🔍 필드 포커스:", data.data);
        if (data.data) {
          setHighlightedField({
            id: data.data.fieldId,
            label: data.data.fieldLabel,
            type: data.data.fieldType,
            placeholder: data.data.fieldPlaceholder,
          });
          setFocusedField({
            fieldId: data.data.fieldId,
            fieldName: data.data.fieldName,
            fieldLabel: data.data.fieldLabel,
            fieldType: data.data.fieldType,
            fieldPlaceholder: data.data.fieldPlaceholder,
            formIndex: data.data.formIndex,
            formName: data.data.formName,
          });
          setIsFieldFocusMode(true);
        }
        break;

      case "field-input-completed":
        console.log("🔍 필드 입력 완료:", data.data);
        if (data.data) {
          const { fieldId, value } = data.data;
          setFieldValues((prev) => ({
            ...prev,
            [fieldId]: value,
          }));

          // 공통 필드인 경우 자동으로 다른 서식에도 적용
          if (commonFieldIds.includes(fieldId)) {
            setCommonFormData((prev) => ({
              ...prev,
              [fieldId]: value,
            }));
          }
        }
        break;

      case "form-navigation":
        console.log("🔍 서식 네비게이션:", data.data);
        if (data.data) {
          const { direction } = data.data;
          if (
            direction === "next" &&
            currentFormIndex < (currentProduct?.forms?.length || 0) - 1
          ) {
            setCurrentFormIndex(currentFormIndex + 1);
            setCurrentForm(currentProduct.forms[currentFormIndex + 1]);
          } else if (direction === "prev" && currentFormIndex > 0) {
            setCurrentFormIndex(currentFormIndex - 1);
            setCurrentForm(currentProduct.forms[currentFormIndex - 1]);
          }
        }
        break;

      case "test-connection":
        console.log("🔍 연결 테스트:", data.data);
        break;

      default:
        console.log("🔍 알 수 없는 메시지 타입:", data.type);
        break;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderWelcomePage = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "white",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>
        🏦 하나은행 스마트 상담
      </h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        고객님의 금융 상담을 도와드리겠습니다
      </p>
      <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
        상담원이 연결되면 자동으로 상담이 시작됩니다
      </p>
      <div
        style={{
          marginTop: "3rem",
          padding: "1rem 2rem",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <p style={{ margin: 0, fontSize: "1.1rem" }}>
          연결 상태: {connected ? "✅ 연결됨" : "❌ 연결 중..."}
        </p>
      </div>
    </div>
  );

  const renderCustomerInfoPage = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "white",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>👤 고객 정보</h1>
      {currentCustomer && (
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "2rem",
            borderRadius: "15px",
            border: "1px solid rgba(255,255,255,0.3)",
            minWidth: "400px",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>
            {currentCustomer.name} 고객님
          </h2>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            생년월일: {currentCustomer.dateOfBirth}
          </p>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            연락처: {currentCustomer.contactNumber}
          </p>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            주소: {currentCustomer.address}
          </p>
        </div>
      )}
    </div>
  );

  const renderProductDetailPage = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "white",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>📊 상품 상세</h1>
      {currentProduct && (
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "2rem",
            borderRadius: "15px",
            border: "1px solid rgba(255,255,255,0.3)",
            minWidth: "500px",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>
            {currentProduct.productName}
          </h2>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            상품 타입: {currentProduct.productType}
          </p>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            기본 금리: {currentProduct.baseRate}%
          </p>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            최소 금액: {currentProduct.minAmount?.toLocaleString()}원
          </p>
          <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
            최대 금액: {currentProduct.maxAmount?.toLocaleString()}원
          </p>
          <p style={{ fontSize: "1.1rem", margin: "1rem 0 0 0", opacity: 0.8 }}>
            {currentProduct.description}
          </p>
        </div>
      )}
    </div>
  );

  const renderProductEnrollmentPage = () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 상품 정보 표시 */}
      {currentProduct && (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "1rem 2rem",
            textAlign: "center",
            borderBottom: "3px solid #4a5568",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
            {currentProduct.productName}
          </h2>
          <p style={{ margin: "0", fontSize: "1rem", opacity: 0.9 }}>
            {currentProduct.description}
          </p>
        </div>
      )}

      {/* PDF 뷰어 */}
      {currentForm?.formTemplatePath && (
        <PDFContainer>
          <PDFViewer
            pdfUrl={
              currentForm?.formTemplatePath ||
              currentProduct.forms[currentFormIndex]?.formTemplatePath
            }
            formSchema={
              currentForm?.formSchema ||
              currentProduct.forms[currentFormIndex]?.formSchema
            }
            fieldValues={fieldValues}
            onFieldClick={(field) => {
              console.log("🔍 PDF에서 필드 클릭됨:", field);
              setHighlightedField({
                id: field.id,
                label: field.label,
                type: field.type,
                placeholder: field.placeholder,
              });
              setFocusedField({
                fieldId: field.id,
                fieldName: field.name,
                fieldLabel: field.label,
                fieldType: field.type,
                fieldPlaceholder: field.placeholder,
                formName:
                  currentForm?.formName ||
                  currentProduct.forms[currentFormIndex]?.formName,
              });
              setIsFieldFocusMode(true);

              // PC에 field-focus 메시지 전송
              if (stompClient && sessionId) {
                const fieldFocusMessage = {
                  type: "field-focus",
                  data: {
                    fieldId: field.id,
                    fieldName: field.name,
                    fieldLabel: field.label,
                    fieldType: field.type,
                    fieldPlaceholder: field.placeholder,
                    formIndex: currentFormIndex,
                    formName:
                      currentForm?.formName ||
                      currentProduct.forms[currentFormIndex]?.formName,
                  },
                  timestamp: Date.now(),
                };
                stompClient.publish({
                  destination: "/topic/session/" + sessionId,
                  body: JSON.stringify(fieldFocusMessage),
                });
                console.log(
                  "📤 태블릿에서 field-focus 메시지 전송:",
                  fieldFocusMessage
                );
              }
            }}
            highlightedField={highlightedField}
            isFieldFocusMode={isFieldFocusMode}
          />
        </PDFContainer>
      )}

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
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: "bold",
              color: "white",
              marginBottom: "0.5rem",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            📋 {focusedField.fieldLabel} 입력
          </div>
          <div
            style={{
              color: "#e2e8f0",
              marginBottom: "1.5rem",
              fontSize: "1rem",
            }}
          >
            {focusedField.fieldPlaceholder}
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => {
                setIsFieldFocusMode(false);
                setFocusedField(null);
                setHighlightedField(null);
              }}
              style={{
                padding: "0.8rem 1.5rem",
                background: "#e53e3e",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "welcome":
        return renderWelcomePage();
      case "customer-info":
        return renderCustomerInfoPage();
      case "product-detail":
        return renderProductDetailPage();
      case "product-enrollment":
        return renderProductEnrollmentPage();
      default:
        return renderWelcomePage();
    }
  };

  return (
    <TabletContainer>
      {/* 사이드바 토글 버튼 */}
      <SidebarToggle onClick={toggleSidebar}>
        {sidebarOpen ? (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </SidebarToggle>

      {/* 사이드바 오버레이 */}
      <Overlay isOpen={sidebarOpen} onClick={toggleSidebar} />

      {/* 사이드바 */}
      <Sidebar isOpen={sidebarOpen}>
        {/* 대면상담 섹션 */}
        <SidebarSection>
          <SidebarTitle>대면상담</SidebarTitle>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                background: "#f0f0f0",
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                fontSize: "0.8rem",
                color: "#666",
              }}
            >
              QR코드
            </div>
            <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
              QR코드 스캔 후 고객정보를 입력해주세요.
            </p>
          </div>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            <p style={{ margin: "0.3rem 0" }}>1. QR코드 스캔</p>
            <p style={{ margin: "0.3rem 0" }}>2. 고객정보 입력</p>
            <p style={{ margin: "0.3rem 0" }}>3. 상품선택</p>
            <p style={{ margin: "0.3rem 0" }}>4. 서식작성</p>
            <p style={{ margin: "0.3rem 0" }}>5. 전자서명</p>
            <p style={{ margin: "0.3rem 0" }}>6. 상담종료</p>
          </div>
        </SidebarSection>

        {/* 고객정보 섹션 */}
        <SidebarSection>
          <SidebarTitle>고객정보</SidebarTitle>
          <SidebarButton>고객정보 확인</SidebarButton>
          <SidebarButton>고객정보 수정</SidebarButton>
        </SidebarSection>

        {/* 고객 상세 정보 */}
        {currentCustomer && (
          <CustomerInfoBox>
            <CustomerName>{currentCustomer.name} 고객님</CustomerName>
            <CustomerDetail>
              생년월일: {currentCustomer.dateOfBirth}
            </CustomerDetail>
            <CustomerDetail>
              연락처: {currentCustomer.contactNumber}
            </CustomerDetail>
            <CustomerDetail>주소: {currentCustomer.address}</CustomerDetail>
            {currentProduct && (
              <>
                <CustomerDetail>
                  상품명: {currentProduct.productName}
                </CustomerDetail>
                <CustomerDetail>계좌번호: 123-456-7890</CustomerDetail>
              </>
            )}
          </CustomerInfoBox>
        )}

        {/* 고객서식 섹션 */}
        <SidebarSection>
          <SidebarTitle>고객서식</SidebarTitle>
          <SidebarButton>서식함</SidebarButton>
          <SidebarButton>서식작성</SidebarButton>
          <SidebarButton>전자서명</SidebarButton>
        </SidebarSection>
      </Sidebar>

      {/* 메인 콘텐츠 */}
      <MainContent sidebarOpen={sidebarOpen}>{renderCurrentPage()}</MainContent>
    </TabletContainer>
  );
};

export default CustomerTablet;
