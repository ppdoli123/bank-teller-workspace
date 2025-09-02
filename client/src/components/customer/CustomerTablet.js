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
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 700;
`;

const ConnectionStatus = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  background: ${(props) => (props.connected ? "#48bb78" : "#ed8936")};
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

      // stompClient 설정 후 세션 참여
      console.log("🔍 연결 성공 후 세션 참여 시작");
      setTimeout(() => {
        joinSession();
      }, 100);
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP 에러:", frame);
      setConnected(false);
    };

    client.activate();
  };

  const joinSession = () => {
    if (!stompClient) return;

    // PC와 동일한 세션 ID 사용
    const sessionId = "tablet_main";
    setSessionId(sessionId);

    console.log("🔍 joinSession 시작:");
    console.log("- stompClient:", !!stompClient);
    console.log("- sessionId:", sessionId);

    // 세션 참여 요청
    stompClient.publish({
      destination: "/app/join-session",
      body: JSON.stringify({
        sessionId: sessionId,
        userType: "customer-tablet",
        userId: "anonymous",
      }),
    });

    console.log("✅ 세션 참여 요청 전송 완료");

    // 세션 메시지 구독
    console.log("🔍 세션 메시지 구독 시작:");
    console.log("- 구독 토픽:", `/topic/session/${sessionId}`);
    console.log("- stompClient 상태:", !!stompClient);

    const subscription = stompClient.subscribe(
      `/topic/session/${sessionId}`,
      (message) => {
        console.log("📨 메시지 수신:", message);
        console.log("📨 메시지 헤더:", message.headers);
        console.log("📨 메시지 본문:", message.body);

        try {
          const data = JSON.parse(message.body);
          console.log("✅ 메시지 파싱 성공:", data);
          handleSessionMessage(data);
        } catch (error) {
          console.error("❌ 메시지 파싱 실패:", error);
          console.error("원본 메시지:", message.body);
        }
      }
    );

    console.log("✅ 세션 메시지 구독 완료:", subscription);
    console.log("📱 태블릿 세션 참여:", sessionId);
  };

  const handleSessionMessage = (data) => {
    console.log("🔍 메시지 타입:", data.type);
    console.log("🔍 전체 메시지 데이터:", data);
    console.log("🔍 메시지 본문:", data.data);

    switch (data.type) {
      case "session-joined":
        console.log("🔍 세션 참여 메시지 수신!");
        console.log("🔍 세션 정보:", data.data);
        break;

      case "tablet-connected":
        console.log("🔍 태블릿 연결 메시지 수신!");
        console.log("🔍 연결 정보:", data.data);
        break;

      case "participant-joined":
        console.log("🔍 참가자 참여 메시지 수신!");
        console.log("🔍 참가자 정보:", data.data);

        if (data.data && data.data.userType === "customer-tablet") {
          console.log("✅ 태블릿 세션 참여 완료");
          // 태블릿이 세션에 참여했음을 확인
        }
        break;

      case "customer-info-display":
        console.log("🔍 고객 정보 표시 메시지 수신!");
        console.log("🔍 전체 데이터:", data);
        console.log("🔍 data.data:", data.data);
        console.log("🔍 data.data.customer:", data.data?.customer);

        if (data.data && data.data.customer) {
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

      case "field-input-complete":
        console.log("🔍 태블릿에서 field-input-complete 메시지 수신:", data);
        if (data.data) {
          console.log("✅ 필드 입력 완료 메시지 처리:", data.data);
          const { fieldId, fieldName, value } = data.data;
          if (fieldId && value) {
            setFieldValues((prev) => ({
              ...prev,
              [fieldId]: value,
            }));
            setCommonFormData((prev) => ({
              ...prev,
              [fieldId]: value,
              [fieldName]: value,
            }));
            console.log("✅ 태블릿 화면에 필드 값 저장됨:", fieldId, value);
            console.log("🔍 현재 fieldValues:", {
              ...fieldValues,
              [fieldId]: value,
            });
          }
        }
        break;

      default:
        console.log("🔍 알 수 없는 메시지 타입:", data.type);
    }
  };

  const handleFieldInput = (fieldId, fieldName, value) => {
    if (!fieldId || !fieldName) {
      console.log("❌ 필수 파라미터 누락:");
      console.log("- fieldId:", fieldId);
      console.log("- fieldName:", fieldName);
      console.log("- value:", value);
      console.log("- highlightedField:", highlightedField);
      return;
    }

    console.log("🔍 필드 입력 시작");
    console.log("- fieldId:", fieldId);
    console.log("- fieldName:", fieldName);
    console.log("- value:", value);
    console.log("- highlightedField:", highlightedField);

    // 필드 값 저장
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // 공통 필드 데이터에도 저장
    setCommonFormData((prev) => ({
      ...prev,
      [fieldId]: value,
      [fieldName]: value,
    }));

    // PC에 필드 입력 완료 메시지 전송
    if (stompClient && sessionId) {
      const fieldInputMessage = {
        type: "field-input-complete",
        data: {
          fieldId: fieldId,
          fieldName: fieldName,
          value: value,
          formIndex: currentFormIndex,
          formName:
            currentForm?.formName ||
            currentProduct?.forms[currentFormIndex]?.formName,
        },
        timestamp: Date.now(),
      };

      stompClient.publish({
        destination: "/topic/session/" + sessionId,
        body: JSON.stringify(fieldInputMessage),
      });

      console.log(
        "📤 태블릿에서 field-input-complete 메시지 전송:",
        fieldInputMessage
      );
    }

    // 입력 모드 종료
    setIsFieldFocusMode(false);
    setFocusedField(null);
    setHighlightedField(null);

    console.log("✅ 필드 입력 완료 및 메시지 전송 완료");
  };

  // 공통 필드 자동 채우기 함수
  const autoFillCommonFields = () => {
    if (!currentForm?.formSchema) return;

    try {
      const schema =
        typeof currentForm.formSchema === "string"
          ? JSON.parse(currentForm.formSchema)
          : currentForm.formSchema;

      let hasUpdates = false;
      const newFieldValues = { ...fieldValues };

      schema.fields.forEach((field) => {
        if (
          commonFieldIds.includes(field.id) &&
          commonFormData[field.id] &&
          !fieldValues[field.id]
        ) {
          newFieldValues[field.id] = commonFormData[field.id];
          hasUpdates = true;
          console.log(
            `🔄 자동 채우기: ${field.id} = ${commonFormData[field.id]}`
          );
        }
      });

      if (hasUpdates) {
        setFieldValues(newFieldValues);
        console.log("✅ 공통 필드 자동 채우기 완료");
      }
    } catch (error) {
      console.error("공통 필드 자동 채우기 실패:", error);
    }
  };

  // 서식이 변경될 때마다 공통 필드 자동 채우기 실행
  useEffect(() => {
    if (currentForm && Object.keys(commonFormData).length > 0) {
      setTimeout(() => {
        autoFillCommonFields();
      }, 500);
    }
  }, [currentForm, currentFormIndex]);

  // WebSocket 연결 상태 모니터링
  useEffect(() => {
    console.log("🔍 WebSocket 상태 변화:");
    console.log("- connected:", connected);
    console.log("- stompClient:", !!stompClient);
    console.log("- sessionId:", sessionId);
  }, [connected, stompClient, sessionId]);

  // 테스트용 자동 페이지 설정 제거 - 올바른 흐름으로 복원

  const renderPage = () => {
    console.log("🔍 renderPage 호출됨:");
    console.log("- currentPage:", currentPage);
    console.log("- currentProduct:", currentProduct);
    console.log("- currentForm:", currentForm);
    console.log("- currentFormIndex:", currentFormIndex);

    switch (currentPage) {
      case "customer-info":
        console.log("📱 customer-info 페이지 렌더링");
        return (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {/* 고객 정보 */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem" }}>
                👤 고객 정보
              </h2>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                선택된 고객 정보
              </div>
            </div>

            {/* 고객 상세 정보 */}
            <div style={{ fontSize: "1rem", lineHeight: "1.5" }}>
              <p>
                <strong>고객명:</strong> {currentCustomer?.Name || "정보 없음"}
              </p>
              <p>
                <strong>고객ID:</strong>{" "}
                {currentCustomer?.CustomerID || "정보 없음"}
              </p>
              <p>
                <strong>연락처:</strong> {currentCustomer?.Phone || "정보 없음"}
              </p>
              <p>
                <strong>나이:</strong> {currentCustomer?.Age || "정보 없음"}세
              </p>
              <p>
                <strong>주소:</strong> {currentCustomer?.Address || "정보 없음"}
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "2rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                color: "#6c757d",
              }}
            >
              직원이 상품을 선택할 때까지 대기중입니다...
            </div>
          </div>
        );

      case "product-detail":
        console.log("📱 product-detail 페이지 렌더링");
        return (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {/* 상품 정보 */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem" }}>
                {currentProduct?.product_name || "상품 정보"}
              </h2>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                상품 상세 정보
              </div>
            </div>

            {/* 상품 상세 정보 */}
            {currentProduct && (
              <div style={{ fontSize: "1rem", lineHeight: "1.5" }}>
                <p>
                  <strong>상품명:</strong> {currentProduct.product_name}
                </p>
                <p>
                  <strong>상품ID:</strong> {currentProduct.id}
                </p>
                <p>
                  <strong>상품타입:</strong> {currentProduct.producttype}
                </p>
                <p>
                  <strong>기본금리:</strong> {currentProduct.baserate}%
                </p>
                <p>
                  <strong>최소금액:</strong>{" "}
                  {currentProduct.minamount?.toLocaleString()}원
                </p>
                <p>
                  <strong>최대금액:</strong>{" "}
                  {currentProduct.maxamount?.toLocaleString()}원
                </p>
                <p>
                  <strong>설명:</strong> {currentProduct.description}
                </p>
              </div>
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: "2rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                color: "#6c757d",
              }}
            >
              "상품 가입하기"를 클릭하면 서식 작성이 시작됩니다.
            </div>
          </div>
        );

      case "welcome":
        console.log("📱 welcome 페이지 렌더링");
        return (
          <div
            style={{
              textAlign: "center",
              color: "white",
              padding: "4rem 2rem",
            }}
          >
            <h1
              style={{
                fontSize: "3rem",
                marginBottom: "2rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              🏦 하나금융그룹
            </h1>
            <h2
              style={{
                fontSize: "2rem",
                marginBottom: "3rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              스마트 상담 시스템
            </h2>
            <div style={{ fontSize: "1.2rem", opacity: 0.9 }}>
              직원이 서식을 선택할 때까지 대기중입니다...
            </div>
          </div>
        );

      case "product-enrollment":
        console.log("📱 product-enrollment 페이지 렌더링 시도");
        console.log("- currentProduct 존재:", !!currentProduct);
        console.log("- currentForm 존재:", !!currentForm);

        if (!currentProduct || !currentForm) {
          console.log("❌ product-enrollment 페이지 렌더링 실패 - 데이터 부족");
          console.log("- currentProduct:", currentProduct);
          console.log("- currentForm:", currentForm);
          return (
            <div
              style={{
                textAlign: "center",
                color: "white",
                padding: "4rem 2rem",
              }}
            >
              <div style={{ fontSize: "1.2rem", opacity: 0.9 }}>
                직원이 서식을 선택할 때까지 대기중입니다...
              </div>
              <div
                style={{ fontSize: "1rem", opacity: 0.7, marginTop: "1rem" }}
              >
                디버그: currentProduct={!!currentProduct}, currentForm=
                {!!currentForm}
              </div>

              {/* 고객 정보 표시 */}
              {currentProduct && (
                <div style={{ marginTop: "2rem", textAlign: "left" }}>
                  <h3 style={{ color: "#FFD700", marginBottom: "1rem" }}>
                    📋 상품 정보
                  </h3>
                  <div style={{ fontSize: "1rem", lineHeight: "1.5" }}>
                    <p>
                      <strong>상품명:</strong> {currentProduct.productName}
                    </p>
                    <p>
                      <strong>상품ID:</strong> {currentProduct.productId}
                    </p>
                    <p>
                      <strong>서식 개수:</strong>{" "}
                      {currentProduct.forms?.length || 0}개
                    </p>
                  </div>
                </div>
              )}

              {/* 현재 서식 정보 */}
              {currentForm && (
                <div style={{ marginTop: "2rem", textAlign: "left" }}>
                  <h3 style={{ color: "#FFD700", marginBottom: "1rem" }}>
                    📄 현재 서식
                  </h3>
                  <div style={{ fontSize: "1rem", lineHeight: "1.5" }}>
                    <p>
                      <strong>서식명:</strong> {currentForm.formName}
                    </p>
                    <p>
                      <strong>서식ID:</strong> {currentForm.formId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {/* 상품 정보 */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.8rem" }}>
                {currentProduct.productName}
              </h2>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                상품 가입 서식 작성
              </div>
            </div>

            {/* 서식 네비게이션 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              <button
                onClick={() => {
                  if (currentFormIndex > 0) {
                    setCurrentFormIndex(currentFormIndex - 1);
                    setCurrentForm(currentProduct.forms[currentFormIndex - 1]);
                  }
                }}
                disabled={currentFormIndex <= 0}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  background: currentFormIndex <= 0 ? "#f8f9fa" : "white",
                  color: currentFormIndex <= 0 ? "#adb5bd" : "#495057",
                  cursor: currentFormIndex <= 0 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
              >
                ◀ 이전 서식
              </button>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  서식 {currentFormIndex + 1} / {currentProduct.forms.length}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#6c757d",
                    marginTop: "0.25rem",
                  }}
                >
                  {currentForm?.formName || "서식명 없음"}
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentFormIndex < currentProduct.forms.length - 1) {
                    setCurrentFormIndex(currentFormIndex + 1);
                    setCurrentForm(currentProduct.forms[currentFormIndex + 1]);
                  }
                }}
                disabled={currentFormIndex >= currentProduct.forms.length - 1}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  background:
                    currentFormIndex >= currentProduct.forms.length - 1
                      ? "#f8f9fa"
                      : "white",
                  color:
                    currentFormIndex >= currentProduct.forms.length - 1
                      ? "#adb5bd"
                      : "#495057",
                  cursor:
                    currentFormIndex >= currentProduct.forms.length - 1
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "1rem",
                }}
              >
                다음 서식 ▶
              </button>
            </div>

            {/* PDF 서식 뷰어 */}
            {currentForm?.formTemplatePath && (
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
                  📄 PDF 서식 뷰어
                </div>

                {/* PDF 뷰어 컴포넌트 */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    border: "1px solid #ddd",
                  }}
                >
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
                </div>

                {/* 스마트창구 필드 입력 모드 */}
                {isFieldFocusMode && focusedField && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                      {focusedField.formName}
                    </div>
                    {(() => {
                      const field = focusedField;
                      return (
                        <div
                          style={{
                            maxWidth: "500px",
                            margin: "0 auto",
                          }}
                        >
                          <div
                            style={{
                              background: "white",
                              borderRadius: "8px",
                              padding: "1.5rem",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}
                          >
                            <label
                              style={{
                                display: "block",
                                fontWeight: "bold",
                                marginBottom: "0.5rem",
                                color: "#2d3748",
                                fontSize: "1.1rem",
                              }}
                            >
                              {field.fieldLabel}
                            </label>
                            <input
                              type={
                                field.fieldType === "number" ? "number" : "text"
                              }
                              placeholder={field.fieldPlaceholder}
                              style={{
                                width: "100%",
                                padding: "1rem",
                                border: "2px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "1.1rem",
                                outline: "none",
                                transition: "border-color 0.2s ease",
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  const value = e.target.value.trim();
                                  if (value) {
                                    handleFieldInput(
                                      field.fieldId,
                                      field.fieldName,
                                      value
                                    );
                                  }
                                }
                              }}
                            />
                            <div
                              style={{
                                marginTop: "1rem",
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                onClick={() => {
                                  const input = document.querySelector("input");
                                  const value = input.value.trim();
                                  if (value) {
                                    handleFieldInput(
                                      field.fieldId,
                                      field.fieldName,
                                      value
                                    );
                                  }
                                }}
                                style={{
                                  padding: "0.75rem 2rem",
                                  background: "#48bb78",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "1.1rem",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 4px 12px rgba(72, 187, 120, 0.3)",
                                }}
                              >
                                입력 완료
                              </button>
                              <button
                                onClick={() => {
                                  setIsFieldFocusMode(false);
                                  setFocusedField(null);
                                  setHighlightedField(null);
                                }}
                                style={{
                                  padding: "0.75rem 2rem",
                                  background: "#e53e3e",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "1.1rem",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 4px 12px rgba(229, 62, 62, 0.3)",
                                }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 입력 완료된 필드들 표시 */}
                {Object.keys(fieldValues).length > 0 && (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #4caf50",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      marginBottom: "1rem",
                      boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        color: "#4caf50",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      ✅ 입력 완료된 필드들
                    </div>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {Object.entries(fieldValues).map(([fieldId, value]) => (
                        <div
                          key={fieldId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "#f1f8e9",
                            borderRadius: "6px",
                            border: "1px solid #c8e6c9",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "500",
                              color: "#2e7d32",
                            }}
                          >
                            {fieldId}
                          </span>
                          <span
                            style={{
                              color: "#4caf50",
                              fontWeight: "bold",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PDF 뷰어 (메인) - product-enrollment 페이지에서만 표시 */}
            {currentPage === "product-enrollment" &&
              currentForm?.formtemplatepath && (
                <div
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    maxHeight: "85vh",
                    overflow: "auto",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      color: "#008485",
                      textAlign: "center",
                    }}
                  >
                    📄 {currentForm.formName}
                  </div>
                  <PDFViewer
                    pdfUrl={currentForm.formtemplatepath}
                    formSchema={currentForm.formSchema}
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
                        formName: currentForm?.formName,
                      });
                      setIsFieldFocusMode(true);
                    }}
                    highlightedField={highlightedField}
                    isFieldFocusMode={isFieldFocusMode}
                  />
                </div>
              )}
          </div>
        );

      default:
        return (
          <div
            style={{
              textAlign: "center",
              color: "white",
              padding: "4rem 2rem",
            }}
          >
            <div style={{ fontSize: "1.2rem", opacity: 0.9 }}>
              알 수 없는 페이지입니다.
            </div>
          </div>
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
