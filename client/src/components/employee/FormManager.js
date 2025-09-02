import React, { useState, useEffect } from "react";
import FormViewer from "../customer/FormViewer";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const FormManager = ({
  customerData,
  selectedProduct,
  isEmployee = true,
  onFormComplete,
  onScreenSync,
  onFormDataUpdate,
  sessionId = "tablet_main", // WebSocket 세션 ID 추가
}) => {
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [formProgress, setFormProgress] = useState({});
  const [stompClient, setStompClient] = useState(null); // WebSocket 클라이언트 추가

  // 하나은행 실제 서식 목록 (complete_hana_forms.json 기반)
  const hanaForms = [
    {
      id: "loan_application",
      title: "대출신청서",
      category: "대출",
      url: null, // 실제 하나은행 서식으로 렌더링
      korean_filename: "대출신청서.pdf",
      description:
        "대출 신청을 위한 기본 서식입니다. 모든 필수 항목을 정확히 기재해주세요.",
      required: true,
      fields: [
        {
          id: "applicantName",
          label: "신청인 성명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "applicantIdNumber",
          label: "주민등록번호",
          type: "text",
          x: 150,
          y: 240,
          width: 180,
          height: 25,
          required: true,
          mask: "000000-0000000",
          placeholder: "000000-0000000",
        },
        {
          id: "applicantPhone",
          label: "연락처",
          type: "text",
          x: 150,
          y: 280,
          width: 150,
          height: 25,
          required: true,
          mask: "000-0000-0000",
          placeholder: "010-0000-0000",
        },
        {
          id: "applicantAddress",
          label: "주소",
          type: "text",
          x: 150,
          y: 320,
          width: 400,
          height: 25,
          required: true,
          placeholder: "서울시 강남구 테헤란로 123",
        },
        {
          id: "loanPurpose",
          label: "대출목적",
          type: "select",
          x: 150,
          y: 360,
          width: 200,
          height: 25,
          required: true,
          options: [
            "주택구입",
            "주택개량",
            "사업자금",
            "생활자금",
            "교육자금",
            "기타",
          ],
        },
        {
          id: "loanAmount",
          label: "대출금액",
          type: "number",
          x: 150,
          y: 400,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "10,000,000",
        },
        {
          id: "loanPeriod",
          label: "대출기간",
          type: "number",
          x: 150,
          y: 440,
          width: 100,
          height: 25,
          required: true,
          suffix: "개월",
          placeholder: "36",
        },
        {
          id: "monthlyIncome",
          label: "월소득",
          type: "number",
          x: 320,
          y: 440,
          width: 120,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "3,000,000",
        },
        {
          id: "employmentType",
          label: "직장구분",
          type: "select",
          x: 150,
          y: 480,
          width: 150,
          height: 25,
          required: true,
          options: ["회사원", "공무원", "자영업자", "프리랜서", "기타"],
        },
        {
          id: "companyName",
          label: "직장명",
          type: "text",
          x: 320,
          y: 480,
          width: 200,
          height: 25,
          required: true,
          placeholder: "하나은행",
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 520,
          width: 200,
          height: 80,
          required: true,
        },
        {
          id: "applicationDate",
          label: "신청일자",
          type: "date",
          x: 400,
          y: 520,
          width: 120,
          height: 25,
          required: true,
        },
      ],
    },
    {
      id: "account_opening",
      title: "예금계좌개설신청서",
      category: "예금",
      url: "/sample-forms/savings-account.pdf",
      korean_filename: "예금계좌개설신청서.pdf",
      description:
        "예금 계좌 개설을 위한 신청서입니다. 본인 확인 후 정확히 기재해주세요.",
      required: true,
      fields: [
        {
          id: "accountHolderName",
          label: "예금주 성명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "accountHolderId",
          label: "주민등록번호",
          type: "text",
          x: 150,
          y: 240,
          width: 180,
          height: 25,
          required: true,
          mask: "000000-0000000",
          placeholder: "000000-0000000",
        },
        {
          id: "accountHolderPhone",
          label: "연락처",
          type: "text",
          x: 150,
          y: 280,
          width: 150,
          height: 25,
          required: true,
          mask: "000-0000-0000",
          placeholder: "010-0000-0000",
        },
        {
          id: "accountHolderAddress",
          label: "주소",
          type: "text",
          x: 150,
          y: 320,
          width: 400,
          height: 25,
          required: true,
          placeholder: "서울시 강남구 테헤란로 123",
        },
        {
          id: "accountType",
          label: "계좌종류",
          type: "select",
          x: 150,
          y: 360,
          width: 200,
          height: 25,
          required: true,
          options: ["일반예금", "정기예금", "정기적금", "자유적금", "기타"],
        },
        {
          id: "initialDeposit",
          label: "초기입금액",
          type: "number",
          x: 150,
          y: 400,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "1,000,000",
        },
        {
          id: "interestRate",
          label: "이자율",
          type: "number",
          x: 320,
          y: 400,
          width: 100,
          height: 25,
          required: false,
          suffix: "%",
          placeholder: "3.5",
        },
        {
          id: "maturityPeriod",
          label: "만기기간",
          type: "number",
          x: 150,
          y: 440,
          width: 100,
          height: 25,
          required: false,
          suffix: "개월",
          placeholder: "12",
        },
        {
          id: "autoRenewal",
          label: "자동연장",
          type: "checkbox",
          x: 150,
          y: 480,
          width: 20,
          height: 20,
          required: false,
          text: "자동연장 동의",
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 520,
          width: 200,
          height: 80,
          required: true,
        },
        {
          id: "applicationDate",
          label: "신청일자",
          type: "date",
          x: 400,
          y: 520,
          width: 120,
          height: 25,
          required: true,
        },
      ],
    },
    {
      id: "privacy_consent",
      title: "[필수] 개인(신용)정보 수집·이용 동의서 (비여신 금융거래)",
      category: "기타",
      url: "/sample-forms/privacy-consent.pdf",
      korean_filename: "필수_개인신용정보수집이용동의서_비여신금융거래.pdf",
      description:
        "개인정보 수집 및 이용에 대한 동의서입니다. 반드시 읽고 동의해주세요.",
      required: true,
      fields: [
        {
          id: "customerName",
          label: "고객명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "customerId",
          label: "주민등록번호",
          type: "text",
          x: 150,
          y: 240,
          width: 180,
          height: 25,
          required: true,
          mask: "000000-0000000",
          placeholder: "000000-0000000",
        },
        {
          id: "consentDate",
          label: "동의일자",
          type: "date",
          x: 150,
          y: 280,
          width: 120,
          height: 25,
          required: true,
        },
        {
          id: "privacyConsent",
          label: "개인정보 수집·이용 동의",
          type: "checkbox",
          x: 150,
          y: 320,
          width: 20,
          height: 20,
          required: true,
          text: "개인정보 수집 및 이용에 동의합니다",
        },
        {
          id: "marketingConsent",
          label: "마케팅 정보 수신 동의",
          type: "checkbox",
          x: 150,
          y: 360,
          width: 20,
          height: 20,
          required: false,
          text: "마케팅 정보 수신에 동의합니다 (선택)",
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 400,
          width: 200,
          height: 80,
          required: true,
        },
      ],
    },
    {
      id: "loan_contract",
      title: "대출계약서",
      category: "대출",
      url: "/sample-forms/loan-contract.pdf",
      korean_filename: "대출계약서.pdf",
      description: "대출 계약 조건을 확인하고 서명해주세요.",
      required: true,
      fields: [
        {
          id: "borrowerName",
          label: "차주 성명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "loanAmount",
          label: "대출금액",
          type: "number",
          x: 150,
          y: 240,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "10,000,000",
        },
        {
          id: "interestRate",
          label: "연이자율",
          type: "number",
          x: 320,
          y: 240,
          width: 100,
          height: 25,
          required: true,
          suffix: "%",
          placeholder: "5.5",
        },
        {
          id: "loanPeriod",
          label: "대출기간",
          type: "number",
          x: 150,
          y: 280,
          width: 100,
          height: 25,
          required: true,
          suffix: "개월",
          placeholder: "36",
        },
        {
          id: "monthlyPayment",
          label: "월상환금액",
          type: "number",
          x: 320,
          y: 280,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "300,000",
        },
        {
          id: "contractDate",
          label: "계약일자",
          type: "date",
          x: 150,
          y: 320,
          width: 120,
          height: 25,
          required: true,
        },
        {
          id: "contractAgreement",
          label: "계약조건 동의",
          type: "checkbox",
          x: 150,
          y: 360,
          width: 20,
          height: 20,
          required: true,
          text: "계약 조건을 확인하고 동의합니다",
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 400,
          width: 200,
          height: 80,
          required: true,
        },
      ],
    },
    {
      id: "loan_repayment",
      title: "대출상환계획서",
      category: "대출",
      url: "/sample-forms/loan-repayment.pdf",
      korean_filename: "대출상환계획서.pdf",
      description: "대출 상환 계획을 수립하고 확인해주세요.",
      required: true,
      fields: [
        {
          id: "borrowerName",
          label: "차주 성명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "remainingBalance",
          label: "잔여대출금",
          type: "number",
          x: 150,
          y: 240,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "8,500,000",
        },
        {
          id: "repaymentMethod",
          label: "상환방법",
          type: "select",
          x: 150,
          y: 280,
          width: 200,
          height: 25,
          required: true,
          options: [
            "원리금균등상환",
            "원금균등상환",
            "만기일시상환",
            "이자만상환",
          ],
        },
        {
          id: "monthlyPayment",
          label: "월상환금액",
          type: "number",
          x: 150,
          y: 320,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "300,000",
        },
        {
          id: "repaymentDate",
          label: "상환시작일",
          type: "date",
          x: 320,
          y: 320,
          width: 120,
          height: 25,
          required: true,
        },
        {
          id: "earlyRepayment",
          label: "조기상환",
          type: "checkbox",
          x: 150,
          y: 360,
          width: 20,
          height: 20,
          required: false,
          text: "조기상환 시 수수료 면제 동의",
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 400,
          width: 200,
          height: 80,
          required: true,
        },
      ],
    },
    {
      id: "foreign_exchange",
      title: "외화송금신청서",
      category: "외환",
      url: "/sample-forms/foreign-exchange.pdf",
      korean_filename: "외화송금신청서.pdf",
      description:
        "해외 송금을 위한 신청서입니다. 수취인 정보를 정확히 기재해주세요.",
      required: false,
      fields: [
        {
          id: "senderName",
          label: "송금인 성명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "senderId",
          label: "주민등록번호",
          type: "text",
          x: 150,
          y: 240,
          width: 180,
          height: 25,
          required: true,
          mask: "000000-0000000",
          placeholder: "000000-0000000",
        },
        {
          id: "recipientName",
          label: "수취인 성명",
          type: "text",
          x: 150,
          y: 280,
          width: 150,
          height: 25,
          required: true,
          placeholder: "John Smith",
        },
        {
          id: "recipientBank",
          label: "수취은행",
          type: "text",
          x: 320,
          y: 280,
          width: 200,
          height: 25,
          required: true,
          placeholder: "Bank of America",
        },
        {
          id: "recipientAccount",
          label: "수취계좌번호",
          type: "text",
          x: 150,
          y: 320,
          width: 250,
          height: 25,
          required: true,
          placeholder: "1234567890",
        },
        {
          id: "transferAmount",
          label: "송금금액",
          type: "number",
          x: 150,
          y: 360,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "1,000",
        },
        {
          id: "currency",
          label: "통화",
          type: "select",
          x: 320,
          y: 360,
          width: 100,
          height: 25,
          required: true,
          options: ["USD", "EUR", "JPY", "CNY", "GBP"],
        },
        {
          id: "purpose",
          label: "송금목적",
          type: "select",
          x: 150,
          y: 400,
          width: 200,
          height: 25,
          required: true,
          options: ["학비", "생활비", "사업자금", "기타"],
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 440,
          width: 200,
          height: 80,
          required: true,
        },
      ],
    },
    {
      id: "retirement_pension",
      title: "퇴직연금 거래신청서(개인형IRP)",
      category: "퇴직연금",
      url: "/sample-forms/retirement-pension.pdf",
      korean_filename: "퇴직연금_거래신청서_개인형IRP.pdf",
      description: "개인형 퇴직연금 계좌 개설 및 거래 신청서입니다.",
      required: false,
      fields: [
        {
          id: "accountHolderName",
          label: "계좌주 성명",
          type: "text",
          x: 150,
          y: 200,
          width: 120,
          height: 25,
          required: true,
          placeholder: "홍길동",
        },
        {
          id: "accountHolderId",
          label: "주민등록번호",
          type: "text",
          x: 150,
          y: 240,
          width: 180,
          height: 25,
          required: true,
          mask: "000000-0000000",
          placeholder: "000000-0000000",
        },
        {
          id: "accountType",
          label: "계좌종류",
          type: "select",
          x: 150,
          y: 280,
          width: 200,
          height: 25,
          required: true,
          options: ["개인형IRP", "기업형IRP", "DC형", "DB형"],
        },
        {
          id: "contributionAmount",
          label: "납입금액",
          type: "number",
          x: 150,
          y: 320,
          width: 150,
          height: 25,
          required: true,
          format: "currency",
          placeholder: "500,000",
        },
        {
          id: "investmentType",
          label: "운용방식",
          type: "select",
          x: 150,
          y: 360,
          width: 200,
          height: 25,
          required: true,
          options: ["자동운용", "수동운용", "혼합운용"],
        },
        {
          id: "riskLevel",
          label: "위험도",
          type: "select",
          x: 320,
          y: 360,
          width: 100,
          height: 25,
          required: true,
          options: ["보수형", "안정형", "중립형", "공격형"],
        },
        {
          id: "signature",
          label: "서명",
          type: "signature",
          x: 150,
          y: 400,
          width: 200,
          height: 80,
          required: true,
        },
      ],
    },
  ];

  // 현재 서식 데이터
  const currentForm = hanaForms[currentFormIndex];

  // 서식 데이터 초기화
  useEffect(() => {
    if (currentForm) {
      const initialData = {};
      currentForm.fields.forEach((field) => {
        initialData[field.id] = "";
      });
      setFormData(initialData);
    }
  }, [currentFormIndex]);

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
      console.log("FormManager WebSocket 연결됨: " + frame);
      setStompClient(client);
    };

    client.onStompError = (frame) => {
      console.error("FormManager WebSocket 오류: " + frame.headers["message"]);
      console.error("추가 정보: " + frame.body);
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // 서식 데이터 변경 핸들러
  const handleFormDataChange = (updatedData) => {
    setFormData(updatedData);

    // 실시간으로 태블릿에 데이터 전송
    if (onScreenSync) {
      onScreenSync({
        type: "form-data-update",
        data: {
          formData: updatedData,
          formId: currentForm?.id,
          formTitle: currentForm?.title,
        },
      });
    }
  };

  // 서식을 태블릿으로 전송
  const sendFormToTablet = () => {
    if (onScreenSync) {
      onScreenSync({
        type: "form-viewer",
        data: {
          formUrl: currentForm.url,
          formData: formData,
          highlightedFields: highlightedFields,
          formId: currentForm.id,
          formTitle: currentForm.title,
          formFields: currentForm.fields,
          isCustomerInput: true,
        },
      });
    }
  };

  // 필드 하이라이트 핸들러
  const handleFieldHighlight = (fieldId) => {
    setHighlightedFields([fieldId]);
  };

  // 서식 완료 핸들러
  const handleFormComplete = () => {
    if (onFormComplete) {
      onFormComplete({
        formId: currentForm.id,
        formTitle: currentForm.title,
        formData: formData,
      });
    }
  };

  // 다음 서식으로 이동
  const nextForm = () => {
    if (currentFormIndex < hanaForms.length - 1) {
      setCurrentFormIndex(currentFormIndex + 1);
    }
  };

  // 이전 서식으로 이동
  const prevForm = () => {
    if (currentFormIndex > 0) {
      setCurrentFormIndex(currentFormIndex - 1);
    }
  };

  // 서식 선택 핸들러
  const selectForm = (index) => {
    setCurrentFormIndex(index);
  };

  // 서식 진행률 계산
  const calculateProgress = () => {
    if (!currentForm) return 0;
    const requiredFields = currentForm.fields.filter((field) => field.required);
    const completedFields = requiredFields.filter(
      (field) =>
        formData[field.id] && formData[field.id].toString().trim() !== ""
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* 서식 선택기 */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ color: "#007bff", marginBottom: "15px" }}>📋 서식 선택</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {hanaForms.map((form, index) => (
            <button
              key={form.id}
              onClick={() => selectForm(index)}
              style={{
                padding: "10px 15px",
                border:
                  currentFormIndex === index
                    ? "2px solid #007bff"
                    : "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor:
                  currentFormIndex === index ? "#e3f2fd" : "#fff",
                color: currentFormIndex === index ? "#007bff" : "#333",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: currentFormIndex === index ? "bold" : "normal",
              }}
            >
              {form.title}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 서식 정보 */}
      {currentForm && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "#007bff", marginBottom: "10px" }}>
              📄 {currentForm.title}
            </h2>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              {currentForm.description}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#007bff", fontWeight: "bold" }}>
                진행률: {calculateProgress()}%
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={sendFormToTablet}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  📱 태블릿으로 전송
                </button>
                <button
                  onClick={handleFormComplete}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ✅ 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 서식 뷰어 */}
      {currentForm && (
        <FormViewer
          formUrl={currentForm.url}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          isEmployee={isEmployee}
          highlightedFields={highlightedFields}
          onFieldHighlight={handleFieldHighlight}
          formFields={currentForm.fields}
          isReadOnly={true}
          isCustomerInput={false}
          sessionId={sessionId} // WebSocket 세션 ID 전달
          stompClient={stompClient} // WebSocket 클라이언트 전달
        />
      )}

      {/* 네비게이션 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={prevForm}
          disabled={currentFormIndex === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: currentFormIndex === 0 ? "#ccc" : "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: currentFormIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← 이전 서식
        </button>
        <span style={{ color: "#666", alignSelf: "center" }}>
          {currentFormIndex + 1} / {hanaForms.length}
        </span>
        <button
          onClick={nextForm}
          disabled={currentFormIndex === hanaForms.length - 1}
          style={{
            padding: "10px 20px",
            backgroundColor:
              currentFormIndex === hanaForms.length - 1 ? "#ccc" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor:
              currentFormIndex === hanaForms.length - 1
                ? "not-allowed"
                : "pointer",
          }}
        >
          다음 서식 →
        </button>
      </div>
    </div>
  );
};

export default FormManager;
