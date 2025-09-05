import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getWebSocketUrl } from "../../config/api";
import { getFieldInfo, autoFillDuplicateFields } from "../../data/fieldMapping";

import ConsentForm from "./ConsentForm";
import ApplicationForm from "./ApplicationForm";

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
  const [highlights, setHighlights] = useState([]); // 하이라이트 상태
  const [currentCustomer, setCurrentCustomer] = useState(null); // 현재 선택된 고객 정보
  const [sidebarOpen, setSidebarOpen] = useState(false); // 사이드바 열림/닫힘 상태
  const [showProductDescription, setShowProductDescription] = useState(false); // 상품설명서 뷰어 표시 여부

  // 입력 필드 동기화 상태
  const [focusedField, setFocusedField] = useState(null); // 현재 포커스된 필드
  const [fieldValues, setFieldValues] = useState({}); // 필드 값들
  const [isFieldInputMode, setIsFieldInputMode] = useState(false); // 필드 입력 모드 여부

  // 공통 필드 ID들 (자동 입력 대상)
  const commonFieldIds = [
    "customer_name",
    "resident_number",
    "phone_number",
    "address",
    "email",
    "occupation",
    "account_number",
  ];

  useEffect(() => {
    console.log("🚀 [태블릿] 컴포넌트 마운트 - WebSocket 연결 시작");
    connectWebSocket();
    return () => {
      console.log("🔌 [태블릿] 컴포넌트 언마운트 - WebSocket 연결 종료");
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  const connectWebSocket = () => {
    console.log("🔌 [태블릿] WebSocket 연결 시작...");
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/api/ws"),
      debug: function (str) {
        console.log("🔍 [태블릿] STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("✅ [태블릿] WebSocket 연결 성공:", frame);
      console.log("🔍 [태블릿] 연결된 프레임 정보:", frame);
      console.log("🔍 [태블릿] WebSocket URL:", getWebSocketUrl());
      setConnected(true);
      setStompClient(client);

      // 태블릿 세션 참여
      console.log(
        "🔌 [태블릿] WebSocket 구독 시작 - 경로: /topic/session/tablet_main"
      );
      const subscription = client.subscribe(
        "/topic/session/tablet_main",
        (message) => {
          try {
            console.log("📨 [태블릿] RAW 메시지 수신:", message);
            console.log("📨 [태블릿] 메시지 body:", message.body);
            const data = JSON.parse(message.body);
            console.log("📨 [태블릿] 파싱된 메시지:", data);
            console.log("🔍 [태블릿] 메시지 타입:", data.type);
            console.log("🔍 [태블릿] 메시지 데이터:", data.data);
            console.log("🔍 [태블릿] 메시지 키들:", Object.keys(data));
            handleWebSocketMessage(data);
          } catch (error) {
            console.error("❌ [태블릿] 메시지 파싱 오류:", error);
            console.error("❌ [태블릿] 원본 메시지:", message);
          }
        }
      );

      console.log("✅ [태블릿] 구독 완료:", subscription);
      console.log("✅ [태블릿] WebSocket 연결 상태:", client.connected);
      console.log("✅ [태블릿] 구독 경로: /topic/session/tablet_main");
      console.log("✅ [태블릿] 구독 ID:", subscription.id);
      console.log("✅ [태블릿] 구독 활성화:", subscription.active);

      // 태블릿 세션 참여
      console.log("📤 [태블릿] 세션 참여 메시지 전송 중...");
      const joinMessage = {
        sessionId: "tablet_main",
        userType: "tablet",
      };
      console.log("📤 [태블릿] 전송할 메시지:", joinMessage);
      client.publish({
        destination: "/app/join-session",
        body: JSON.stringify(joinMessage),
      });
      console.log("📤 [태블릿] 세션 참여 메시지 전송 완료");
    };

    client.onStompError = (frame) => {
      console.error("❌ [태블릿] STOMP 오류:", frame);
      console.error("❌ [태블릿] STOMP 오류 상세:", frame.headers);
      console.error("❌ [태블릿] STOMP 오류 메시지:", frame.body);
      setConnected(false);
    };

    client.onWebSocketClose = (event) => {
      console.log("🔌 [태블릿] WebSocket 연결 종료:", event);
      console.log("🔌 [태블릿] 연결 종료 코드:", event.code);
      console.log("🔌 [태블릿] 연결 종료 이유:", event.reason);
      setConnected(false);
    };

    console.log("🚀 [태블릿] WebSocket 클라이언트 활성화 중...");
    client.activate();
    console.log("🚀 [태블릿] WebSocket 클라이언트 활성화 완료");
  };

  const handleWebSocketMessage = (data) => {
    console.log("🔍 [태블릿] 메시지 타입:", data.type);
    console.log("🔍 [태블릿] 전체 메시지 데이터:", data);
    console.log("🔍 [태블릿] 메시지 키들:", Object.keys(data));

    switch (data.type) {
      case "customer-info-update":
        console.log("🔍 고객 정보 업데이트:", data.data);
        if (data.data) {
          console.log("✅ 고객 정보 설정 시작");
          setCurrentCustomer(data.data.customer);
          setCurrentProduct(null);
          setCurrentFormIndex(0);
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
          setCurrentFormIndex(0);
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
          // setCurrentForm(productWithForms.forms[0]);
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

      // case "field-input-completed": // 중복 제거 - 아래에서 처리

      case "form-navigation":
        console.log("🔍 서식 네비게이션:", data.data);
        if (data.data) {
          const { currentFormIndex: newFormIndex, currentForm } = data.data;
          if (newFormIndex !== undefined) {
            setCurrentFormIndex(newFormIndex);
            console.log("✅ 태블릿 서식 인덱스 업데이트:", newFormIndex);

            // 서식 타입에 따라 페이지 전환
            if (currentForm) {
              if (currentForm.formType === "consent") {
                // 개인정보 동의서는 이미 product-enrollment 페이지에 있음
                console.log("📄 개인정보 동의서 유지");
              } else if (currentForm.formType === "application") {
                // 은행거래신청서로 전환
                console.log("📄 은행거래신청서로 전환");
                // 필요시 페이지 전환 로직 추가
              }
            }
          }
        }
        break;

      case "test-connection":
        console.log("🔍 연결 테스트:", data.data);
        break;

      case "field-focus":
        console.log("🔍 [태블릿] 필드 포커스 메시지 수신:", data);
        console.log("🔍 [태블릿] 하이라이트와 동일한 방식으로 처리");

        // 하이라이트와 동일한 방식으로 처리 - data.data에서 필드 정보 추출
        if (data.data && data.data.fieldId) {
          const fieldData = {
            fieldId: data.data.fieldId,
            fieldName: data.data.fieldName || data.data.fieldId,
            fieldLabel: data.data.fieldLabel,
            fieldType: data.data.fieldType || "text",
            fieldPlaceholder:
              data.data.fieldPlaceholder ||
              `${data.data.fieldLabel}을(를) 입력해주세요`,
            formIndex: data.data.formIndex || 0,
            formName: data.data.formName || "개인정보 수집·이용 동의서",
          };

          console.log(
            "✅ [태블릿] 필드 데이터 추출 성공 (data.data):",
            fieldData
          );
          setFocusedField(fieldData);
          setIsFieldInputMode(true);
          console.log(
            "✅ [태블릿] 필드 입력 모드 활성화:",
            fieldData.fieldLabel
          );
        } else if (data.fieldId && data.fieldLabel) {
          // 백업: 직접 필드 정보가 있는 경우
          const fieldData = {
            fieldId: data.fieldId,
            fieldName: data.fieldName || data.fieldId,
            fieldLabel: data.fieldLabel,
            fieldType: data.fieldType || "text",
            fieldPlaceholder:
              data.fieldPlaceholder || `${data.fieldLabel}을(를) 입력해주세요`,
            formIndex: data.formIndex || 0,
            formName: data.formName || "개인정보 수집·이용 동의서",
          };

          console.log("✅ [태블릿] 필드 데이터 추출 성공 (직접):", fieldData);
          setFocusedField(fieldData);
          setIsFieldInputMode(true);
          console.log(
            "✅ [태블릿] 필드 입력 모드 활성화:",
            fieldData.fieldLabel
          );
        } else {
          console.log("❌ [태블릿] 필드 정보를 찾을 수 없음");
          console.log("❌ [태블릿] data.data:", data.data);
          console.log("❌ [태블릿] data:", data);
        }
        break;

      case "field-input-completed":
        console.log("🔍 필드 입력 완료 메시지 수신:", data);
        // 백엔드에서 직접 필드 정보를 전달하므로 data.data가 아닌 직접 접근
        const inputFieldId = data.fieldId || (data.data && data.data.fieldId);
        const inputFieldValue =
          data.fieldValue || (data.data && data.data.fieldValue);

        if (inputFieldId && inputFieldValue !== undefined) {
          // 중복 필드 자동 채우기
          const updatedValues = autoFillDuplicateFields(
            fieldValues,
            inputFieldId,
            inputFieldValue
          );

          setFieldValues(updatedValues);
          console.log("✅ 필드 값 업데이트:", inputFieldId, inputFieldValue);
          console.log("🔄 중복 필드 자동 채우기 완료:", updatedValues);
        }
        break;

      case "field-values-sync":
        console.log("🔍 필드 값 동기화 메시지 수신:", data);
        if (data.data) {
          const { fieldValues: syncedFieldValues, updatedField } = data.data;
          console.log("📥 PC에서 받은 필드 값들:", syncedFieldValues);
          console.log("📥 업데이트된 필드:", updatedField);

          // PC에서 받은 필드 값들로 태블릿 상태 동기화
          setFieldValues(syncedFieldValues);
          console.log("✅ 태블릿 필드 값 동기화 완료");
        }
        break;

      case "product-description":
        console.log("🔍 웹 태블릿 상품설명서 동기화 메시지 수신:", data);
        console.log("상품 정보:", data.data?.product);
        console.log("현재 페이지:", data.data?.currentPage);

        if (data.data?.product) {
          // 상품설명서 뷰어 표시 로직 추가
          setCurrentProduct(data.data.product);
          setCurrentPage(data.data.currentPage || 1);
          setShowProductDescription(true);
          // 페이지 변경 시 하이라이트 초기화 (주석 처리하여 하이라이트 유지)
          // setHighlights([]);
          console.log("✅ 웹 태블릿 상품설명서 뷰어 표시 설정 완료");
        }
        break;

      case "screen-highlight":
        console.log("🔍 웹 태블릿 화면 하이라이트 동기화 메시지 수신:", data);
        console.log("🔍 하이라이트 데이터 구조:", data.data);

        if (data.data?.highlight) {
          const highlight = data.data.highlight;
          console.log("✅ 하이라이트 객체 발견:", highlight);
          setHighlights((prev) => {
            const updated = [...prev, highlight];
            console.log("📝 태블릿 하이라이트 배열 업데이트:", updated);
            return updated;
          });
        } else {
          console.log("❌ 하이라이트 객체를 찾을 수 없음");
        }
        break;

      case "product-simulation":
        console.log("🔍 웹 태블릿 상품 시뮬레이션 동기화 메시지 수신:", data);
        console.log("🔍 시뮬레이션 데이터:", data.data);

        if (data.data?.product) {
          setCurrentProduct(data.data.product);
          setCurrentPage("product-simulation");
          setShowProductDescription(false);
          console.log("✅ 웹 태블릿 시뮬레이션 화면 표시 설정 완료");
        }
        break;

      case "product-description-close":
        console.log("🔍 웹 태블릿 상품설명서 닫기 메시지 수신:", data);
        console.log("🔍 현재 상태:", {
          showProductDescription,
          currentProduct: !!currentProduct,
          currentPage,
        });
        setShowProductDescription(false);
        setCurrentProduct(null);
        setCurrentPage("welcome");
        setHighlights([]);
        console.log("✅ 웹 태블릿 상품설명서 닫기 완료");
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
        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.7 }}>
          WebSocket URL: {getWebSocketUrl()}
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

  const renderProductDescriptionViewer = () => {
    if (!showProductDescription || !currentProduct) {
      return null;
    }

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "white",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>
            상품설명서 - {currentProduct.product_name}
          </h2>
          <button
            onClick={() => setShowProductDescription(false)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </div>

        {/* PDF 뷰어 */}
        <div style={{ flex: 1, padding: "20px", position: "relative" }}>
          <iframe
            src={`http://localhost:8080/api/documents/product-pdf/${currentPage}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&scrollbar=1&view=FitH&pagemode=none&disableworker=true`}
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "8px" }}
            title="상품설명서"
          />

          {/* 하이라이트 렌더링 */}
          {(() => {
            const currentPageHighlights = highlights.filter(
              (highlight) => highlight.page === currentPage
            );
            console.log("🎨 태블릿 하이라이트 렌더링:", {
              totalHighlights: highlights.length,
              currentPageHighlights: currentPageHighlights.length,
              currentPage,
              highlights: currentPageHighlights,
            });
            return currentPageHighlights.map((highlight) => {
              console.log("🎨 태블릿 개별 하이라이트 렌더링:", highlight);
              return (
                <div
                  key={highlight.id}
                  style={{
                    position: "absolute",
                    left: Math.min(highlight.startX, highlight.endX),
                    top: Math.min(highlight.startY, highlight.endY),
                    width: Math.abs(highlight.endX - highlight.startX),
                    height: Math.abs(highlight.endY - highlight.startY),
                    backgroundColor: highlight.color,
                    opacity: 0.3,
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />
              );
            });
          })()}
        </div>

        {/* 페이지 정보 표시 (읽기 전용) */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "bold", color: "#666" }}>
            {currentPage} / 80 페이지
          </span>
        </div>
      </div>
    );
  };

  const renderProductSimulationPage = () => {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          overflow: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "900px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h1
            style={{
              color: "#2d3748",
              marginBottom: "1rem",
              fontSize: "1.8rem",
            }}
          >
            상품 시뮬레이션
          </h1>
          <p
            style={{
              color: "#4a5568",
              marginBottom: "2rem",
              fontSize: "1rem",
            }}
          >
            {currentProduct?.product_name || "상품"}의 시뮬레이션을 확인하고
            있습니다.
          </p>

          {/* 시뮬레이션 시각화 카드들 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {/* 우대금리 조건 달성 */}
            <div
              style={{
                background: "linear-gradient(135deg, #4CAF50, #45a049)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎯</div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                우대금리 조건
              </h3>
              <p style={{ margin: "0", fontSize: "0.9rem", opacity: 0.9 }}>
                신규자금 우대금리 제공
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                ✅ 조건 달성
              </div>
            </div>

            {/* 가입 기간 */}
            <div
              style={{
                background: "linear-gradient(135deg, #2196F3, #1976D2)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                가입 기간
              </h3>
              <p style={{ margin: "0", fontSize: "0.9rem", opacity: 0.9 }}>
                {currentProduct?.deposit_period || "상품별 상이"}
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                추천: 12개월
              </div>
            </div>

            {/* 가입 금액 */}
            <div
              style={{
                background: "linear-gradient(135deg, #FF9800, #F57C00)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                가입 금액
              </h3>
              <p style={{ margin: "0", fontSize: "0.9rem", opacity: 0.9 }}>
                {currentProduct?.deposit_amount || "상품별 상이"}
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                최소: 1천만원
              </div>
            </div>

            {/* 기준금리 */}
            <div
              style={{
                background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                기준금리
              </h3>
              <p style={{ margin: "0", fontSize: "0.9rem", opacity: 0.9 }}>
                {currentProduct?.interest_rate || "시장금리 연동"}
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                우대: +0.5%
              </div>
            </div>
          </div>

          {/* 상품 정보 요약 */}
          <div
            style={{
              background: "#f7fafc",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                color: "#2d3748",
                marginBottom: "1rem",
                fontSize: "1.1rem",
              }}
            >
              상품 정보 요약
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <strong>상품명:</strong>
                <br />
                {currentProduct?.product_name || "정보 없음"}
              </div>
              <div>
                <strong>상품유형:</strong>
                <br />
                {currentProduct?.product_type || "정보 없음"}
              </div>
              <div>
                <strong>대상고객:</strong>
                <br />
                {currentProduct?.target_customers || "정보 없음"}
              </div>
              <div>
                <strong>특징:</strong>
                <br />
                {currentProduct?.product_features || "정보 없음"}
              </div>
            </div>
          </div>

          <p style={{ color: "#718096", fontSize: "0.9rem" }}>
            행원이 PC에서 시뮬레이션을 조작하면 여기에 실시간으로 반영됩니다.
          </p>
        </div>
      </div>
    );
  };

  const renderProductEnrollmentPage = () => {
    // currentFormIndex에 따라 다른 서식 표시
    console.log("📄 서식 렌더링 - currentFormIndex:", currentFormIndex);

    if (currentFormIndex === 0) {
      // 첫 번째 서식: 개인정보 수집·이용 동의서
      return (
        <ConsentForm
          fieldValues={fieldValues}
          onFieldClick={(fieldId, fieldLabel, fieldType) => {
            console.log("🖱️ ConsentForm 필드 클릭:", {
              fieldId,
              fieldLabel,
              fieldType,
            });
            // PC에 필드 포커스 메시지 전송
            if (stompClient && sessionId && stompClient.active) {
              stompClient.publish({
                destination: "/topic/session/" + sessionId,
                body: JSON.stringify({
                  type: "field-focus",
                  data: {
                    fieldId: fieldId,
                    fieldName: fieldId,
                    fieldLabel: fieldLabel,
                    fieldType: fieldType,
                    fieldPlaceholder: `${fieldLabel}을(를) 입력해주세요`,
                    formIndex: currentFormIndex,
                    formName: "개인정보 수집·이용 동의서",
                  },
                  timestamp: new Date().toISOString(),
                }),
              });
              console.log("📤 ConsentForm에서 field-focus 메시지 전송:", {
                fieldId,
                fieldLabel,
                fieldType,
              });
            }
          }}
        />
      );
    } else if (currentFormIndex === 1) {
      // 두 번째 서식: 은행거래신청서
      return (
        <ApplicationForm
          fieldValues={fieldValues}
          onFieldClick={(fieldId, fieldLabel, fieldType) => {
            console.log("🖱️ ApplicationForm 필드 클릭:", {
              fieldId,
              fieldLabel,
              fieldType,
            });
            // PC에 필드 포커스 메시지 전송
            if (stompClient && sessionId && stompClient.active) {
              stompClient.publish({
                destination: "/topic/session/" + sessionId,
                body: JSON.stringify({
                  type: "field-focus",
                  data: {
                    fieldId: fieldId,
                    fieldName: fieldId,
                    fieldLabel: fieldLabel,
                    fieldType: fieldType,
                    fieldPlaceholder: `${fieldLabel}을(를) 입력해주세요`,
                    formIndex: currentFormIndex,
                    formName: "은행거래신청서",
                  },
                  timestamp: new Date().toISOString(),
                }),
              });
              console.log("📤 ApplicationForm에서 field-focus 메시지 전송:", {
                fieldId,
                fieldLabel,
                fieldType,
              });
            }
          }}
        />
      );
    } else {
      // 기본값: 개인정보 수집·이용 동의서
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>서식을 불러오는 중...</h2>
          <p>현재 서식 인덱스: {currentFormIndex}</p>
        </div>
      );
    }
  };

  const renderCurrentPage = () => {
    // 상품설명서 뷰어가 표시되어야 하는 경우
    if (showProductDescription) {
      return renderProductDescriptionViewer();
    }

    switch (currentPage) {
      case "welcome":
        return renderWelcomePage();
      case "customer-info":
        return renderCustomerInfoPage();
      case "product-detail":
        return renderProductDetailPage();
      case "product-enrollment":
        return renderProductEnrollmentPage();
      case "product-simulation":
        return renderProductSimulationPage();
      case "consent-form":
        return <ConsentForm />;
      case "application-form":
        return <ApplicationForm />;
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

      {/* 필드 입력 오버레이 */}
      {(() => {
        console.log("🔍 필드 입력 오버레이 렌더링 체크:");
        console.log("- isFieldInputMode:", isFieldInputMode);
        console.log("- focusedField:", focusedField);
        console.log("- 렌더링 조건:", isFieldInputMode && focusedField);
        return null;
      })()}
      {isFieldInputMode && focusedField && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h2
              style={{
                color: "#2d3748",
                marginBottom: "1rem",
                textAlign: "center",
                fontSize: "1.5rem",
              }}
            >
              📝 {focusedField.fieldLabel} 입력
            </h2>

            <div
              style={{
                background: "#f7fafc",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                color: "#4a5568",
              }}
            >
              <div>
                <strong>서식:</strong> {focusedField.formName || "알 수 없음"}
              </div>
              <div>
                <strong>필드 ID:</strong> {focusedField.fieldId}
              </div>
              <div>
                <strong>타입:</strong> {focusedField.fieldType}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#4a5568",
                }}
              >
                {focusedField.fieldLabel}
                {focusedField.required && (
                  <span style={{ color: "red", marginLeft: "0.25rem" }}>*</span>
                )}
              </label>

              <input
                type="text"
                placeholder={focusedField.fieldPlaceholder || "입력해주세요"}
                value={fieldValues[focusedField.fieldId] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFieldValues((prev) => ({
                    ...prev,
                    [focusedField.fieldId]: value,
                  }));
                }}
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4CAF50";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                }}
                autoFocus
              />
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
                  setIsFieldInputMode(false);
                  setFocusedField(null);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#e2e8f0",
                  color: "#4a5568",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                취소
              </button>

              <button
                onClick={() => {
                  const value = fieldValues[focusedField.fieldId] || "";

                  // PC에 필드 입력 완료 메시지 전송 (백엔드 엔드포인트 사용)
                  if (stompClient && sessionId && stompClient.active) {
                    stompClient.publish({
                      destination: "/app/field-input-completed",
                      body: JSON.stringify({
                        sessionId: sessionId,
                        fieldId: focusedField.fieldId,
                        fieldValue: value,
                        fieldLabel: focusedField.fieldLabel,
                        formId: focusedField.formId,
                        timestamp: new Date().toISOString(),
                      }),
                    });
                    console.log("📤 필드 입력 완료 메시지 전송:", {
                      fieldId: focusedField.fieldId,
                      fieldValue: value,
                    });
                  }

                  setIsFieldInputMode(false);
                  setFocusedField(null);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                입력 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </TabletContainer>
  );
};

export default CustomerTablet;
