import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// PDF.js 워커 설정 - 로컬 워커 사용
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FormViewer = ({
  formUrl,
  formData = {},
  formFields = [],
  formSchema, // formSchema prop 추가
  isReadOnly = false,
  isCustomerInput = false,
  onFormDataChange,
  onFieldHighlight,
  highlightedFields = [],
  sessionId, // WebSocket 세션 ID 추가
  stompClient, // WebSocket 클라이언트 추가
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [inputFields, setInputFields] = useState([]);
  const [signatureData, setSignatureData] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const containerRef = useRef(null);

  // 실제 하나은행 서식 스타일
  const formStyle = {
    width: "800px",
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: "40px",
    fontFamily: "Batang, serif",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#333",
    border: "1px solid #ccc",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#000",
    borderBottom: "2px solid #000",
    paddingBottom: "10px",
  };

  const sectionStyle = {
    marginBottom: "25px",
    border: "1px solid #000",
    padding: "15px",
  };

  const sectionTitleStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#000",
    borderBottom: "1px solid #000",
    paddingBottom: "5px",
  };

  const fieldRowStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    minHeight: "30px",
  };

  const fieldLabelStyle = {
    width: "120px",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#000",
  };

  const inputFieldStyle = {
    flex: 1,
    border: "none",
    borderBottom: "1px solid #000",
    backgroundColor: "transparent",
    fontSize: "13px",
    padding: "5px 0",
    outline: "none",
    fontFamily: "Batang, serif",
    minHeight: "20px",
    cursor: "text",
  };

  const inputFieldHoverStyle = {
    ...inputFieldStyle,
    backgroundColor: "#f0f8ff",
    borderBottom: "2px solid #007bff",
  };

  const signatureBoxStyle = {
    width: "200px",
    height: "60px",
    border: "1px solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
  };

  const signatureBoxHoverStyle = {
    ...signatureBoxStyle,
    backgroundColor: "#e3f2fd",
    border: "2px solid #007bff",
  };

  const checkboxStyle = {
    width: "16px",
    height: "16px",
    marginRight: "8px",
    cursor: "pointer",
  };

  const selectStyle = {
    ...inputFieldStyle,
    cursor: "pointer",
  };

  // 실제 하나은행 대출신청서 렌더링
  const renderHanaLoanApplication = () => {
    return (
      <div style={formStyle}>
        <div style={titleStyle}>대출신청서</div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>신청인 정보</div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>신청인 성명</div>
            <input
              type="text"
              value={formData.applicantName || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, applicantName: e.target.value })
              }
              style={inputFieldStyle}
              placeholder="홍길동"
              disabled={isReadOnly}
            />
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>주민등록번호</div>
            <input
              type="text"
              value={formData.applicantIdNumber || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  applicantIdNumber: e.target.value,
                })
              }
              style={inputFieldStyle}
              placeholder="000000-0000000"
              disabled={isReadOnly}
            />
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>연락처</div>
            <input
              type="text"
              value={formData.applicantPhone || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  applicantPhone: e.target.value,
                })
              }
              style={inputFieldStyle}
              placeholder="010-0000-0000"
              disabled={isReadOnly}
            />
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>주소</div>
            <input
              type="text"
              value={formData.applicantAddress || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  applicantAddress: e.target.value,
                })
              }
              style={inputFieldStyle}
              placeholder="서울시 강남구..."
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>대출 정보</div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>대출목적</div>
            <select
              value={formData.loanPurpose || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, loanPurpose: e.target.value })
              }
              style={selectStyle}
              disabled={isReadOnly}
            >
              <option value="">선택하세요</option>
              <option value="주택구입">주택구입</option>
              <option value="사업자금">사업자금</option>
              <option value="생활자금">생활자금</option>
              <option value="교육자금">교육자금</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>대출금액</div>
            <input
              type="text"
              value={formData.loanAmount || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, loanAmount: e.target.value })
              }
              style={inputFieldStyle}
              placeholder="10,000,000"
              disabled={isReadOnly}
            />
            <span style={{ marginLeft: "10px", fontSize: "13px" }}>원</span>
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>대출기간</div>
            <input
              type="text"
              value={formData.loanPeriod || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, loanPeriod: e.target.value })
              }
              style={inputFieldStyle}
              placeholder="12"
              disabled={isReadOnly}
            />
            <span style={{ marginLeft: "10px", fontSize: "13px" }}>개월</span>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>소득 정보</div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>월소득</div>
            <input
              type="text"
              value={formData.monthlyIncome || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, monthlyIncome: e.target.value })
              }
              style={inputFieldStyle}
              placeholder="3,000,000"
              disabled={isReadOnly}
            />
            <span style={{ marginLeft: "10px", fontSize: "13px" }}>원</span>
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>직장구분</div>
            <select
              value={formData.employmentType || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  employmentType: e.target.value,
                })
              }
              style={selectStyle}
              disabled={isReadOnly}
            >
              <option value="">선택하세요</option>
              <option value="회사원">회사원</option>
              <option value="공무원">공무원</option>
              <option value="자영업자">자영업자</option>
              <option value="프리랜서">프리랜서</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>직장명</div>
            <input
              type="text"
              value={formData.companyName || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, companyName: e.target.value })
              }
              style={inputFieldStyle}
              placeholder="(주)회사명"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>신청 정보</div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>신청일자</div>
            <input
              type="date"
              value={formData.applicationDate || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  applicationDate: e.target.value,
                })
              }
              style={inputFieldStyle}
              disabled={isReadOnly}
            />
          </div>

          <div style={fieldRowStyle}>
            <div style={fieldLabelStyle}>서명</div>
            <div
              style={signatureBoxStyle}
              onClick={() =>
                !isReadOnly && alert("서명 기능을 구현할 수 있습니다.")
              }
            >
              {formData.signature ? "서명 완료" : "서명란"}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          ※ 위 내용이 사실임을 확인하고 대출을 신청합니다.
        </div>
      </div>
    );
  };

  useEffect(() => {
    // formSchema가 문자열인 경우 파싱
    let parsedFields = [];

    if (formFields && formFields.length > 0) {
      parsedFields = formFields;
    } else if (formSchema) {
      try {
        const schema =
          typeof formSchema === "string" ? JSON.parse(formSchema) : formSchema;
        parsedFields = schema.fields || [];
      } catch (error) {
        console.error("formSchema 파싱 실패:", error);
        parsedFields = [];
      }
    }

    if (parsedFields.length > 0) {
      setInputFields(parsedFields);
      setIsLoading(false);
    }
  }, [formFields?.length, formSchema?.toString()]); // formSchema 문자열화하여 의존성 최적화

  const handleDocumentLoadSuccess = ({ numPages }) => {
    // PDF 로딩 성공 시 컨테이너 너비 설정
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    setNumPages(numPages);
    setPdfError(null);
    setIsLoading(false);
  };

  const handleDocumentLoadError = (error) => {
    console.error("PDF 로딩 에러:", error);
    setPdfError("PDF 파일을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
    setIsLoading(false);
  };

  const handleInputChange = (fieldId, value) => {
    const updatedData = { ...formData, [fieldId]: value };
    onFormDataChange(updatedData);

    // 자동완성: 동일한 필드명이 다른 서식에도 있는 경우 자동으로 채움
    autoFillSimilarFields(fieldId, value);
  };

  const autoFillSimilarFields = (fieldId, value) => {
    // 필드명 패턴 매칭으로 자동완성
    const patterns = {
      applicantName: ["신청인 성명", "성명", "이름", "applicantName"],
      applicantIdNumber: ["주민등록번호", "주민번호", "idNumber", "ssn"],
      applicantPhone: ["연락처", "전화번호", "휴대폰", "phoneNumber"],
      applicantAddress: ["주소", "거주지", "address"],
      loanPurpose: ["대출목적", "목적", "purpose"],
      loanAmount: ["대출금액", "금액", "amount"],
      loanPeriod: ["대출기간", "기간", "period"],
      monthlyIncome: ["월소득", "월급", "income"],
      employmentType: ["직장구분", "직장", "employmentType"],
      companyName: ["직장명", "회사명", "companyName"],
      applicationDate: ["신청일자", "신청날짜", "date"],
      signature: ["서명", "sign", "signature"],
    };

    Object.entries(patterns).forEach(([key, patternList]) => {
      if (patternList.some((pattern) => fieldId.includes(pattern))) {
        // 동일한 패턴의 다른 필드들도 자동으로 채움
        const similarFields = inputFields.filter((field) =>
          patternList.some((pattern) => field.id.includes(pattern))
        );

        similarFields.forEach((field) => {
          if (field.id !== fieldId) {
            handleInputChange(field.id, value);
          }
        });
      }
    });
  };

  const handleFieldClick = (fieldId) => {
    if (!isReadOnly && onFieldHighlight) {
      onFieldHighlight(fieldId);
    }

    // WebSocket을 통해 태블릿에 필드 클릭 메시지 전송
    if (stompClient && stompClient.connected && sessionId) {
      const field = formFields.find((f) => f.id === fieldId);
      if (field) {
        const message = {
          type: "field-clicked",
          sessionId: sessionId,
          fieldId: fieldId,
          fieldData: {
            id: field.id,
            label: field.label,
            type: field.type,
            x: field.x,
            y: field.y,
            width: field.width,
            height: field.height,
            placeholder: field.placeholder,
          },
          timestamp: new Date().toISOString(),
        };

        stompClient.publish({
          destination: "/topic/session/" + sessionId,
          body: JSON.stringify(message),
        });

        console.log("태블릿에 필드 클릭 메시지 전송:", message);
      }
    }
  };

  const renderInputField = (field) => {
    const isHighlighted = highlightedFields.includes(field.id);
    const value = formData[field.id] || "";

    const fieldStyle = {
      position: "absolute",
      left: field.x * scale,
      top: field.y * scale,
      width: field.width * scale,
      height: field.height * scale,
      border: isHighlighted ? "2px solid #ff6b6b" : "1px solid #ddd",
      borderRadius: "4px",
      padding: "4px",
      fontSize: `${12 * scale}px`,
      backgroundColor: isHighlighted ? "#fff3cd" : "#fff",
      cursor: "pointer",
      zIndex: 10,
    };

    if (field.type === "signature") {
      return (
        <div
          key={field.id}
          style={fieldStyle}
          onClick={() => handleFieldClick(field.id)}
        >
          {value ? (
            <img
              src={value}
              alt="서명"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#999",
                fontSize: `${10 * scale}px`,
              }}
            >
              서명 영역
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        key={field.id}
        type={field.type}
        value={value}
        onChange={(e) => {
          if (onFormDataChange) {
            onFormDataChange({ ...formData, [field.id]: e.target.value });
          }
        }}
        style={fieldStyle}
        onClick={() => handleFieldClick(field.id)}
        placeholder={field.label}
        disabled={isReadOnly} // 직원만 편집 가능
      />
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      {/* 컨트롤 패널 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            style={{ marginRight: "10px", padding: "8px 16px" }}
          >
            축소
          </button>
          <span style={{ marginRight: "10px" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2.0, scale + 0.1))}
            style={{ marginRight: "20px", padding: "8px 16px" }}
          >
            확대
          </button>
        </div>

        <div>
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            style={{ marginRight: "10px", padding: "8px 16px" }}
          >
            이전
          </button>
          <span style={{ marginRight: "10px" }}>
            {pageNumber} / {numPages || "?"}
          </span>
          <button
            onClick={() =>
              setPageNumber(Math.min(numPages || 1, pageNumber + 1))
            }
            disabled={pageNumber >= (numPages || 1)}
            style={{ marginRight: "20px", padding: "8px 16px" }}
          >
            다음
          </button>
        </div>
      </div>

      {/* PDF 뷰어 */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        {/* 하나은행 대출신청서 렌더링 */}
        {formUrl && formUrl !== "null" ? (
          <Document
            file={formUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            loading="PDF 로딩 중..."
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth}
              loading="페이지 로딩 중..."
            />
          </Document>
        ) : (
          renderHanaLoanApplication()
        )}
      </div>

      {/* 필드 정보 패널 (직원용) */}
      {/* 하나은행 대출신청서는 필드 정보 패널이 필요 없으므로 제거 */}
    </div>
  );
};

export default FormViewer;
