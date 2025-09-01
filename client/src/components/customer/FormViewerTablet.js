import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const FormViewerTablet = ({
  formUrl,
  formData,
  highlightedFields = [],
  isConnected = false,
  onFormDataChange,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [inputFields, setInputFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 기본 입력 필드 정의 (직원과 동일)
  const defaultFields = [
    {
      id: "customerName",
      label: "고객명",
      type: "text",
      x: 100,
      y: 150,
      width: 200,
      height: 30,
    },
    {
      id: "customerId",
      label: "주민번호",
      type: "text",
      x: 100,
      y: 200,
      width: 200,
      height: 30,
    },
    {
      id: "phone",
      label: "연락처",
      type: "text",
      x: 100,
      y: 250,
      width: 200,
      height: 30,
    },
    {
      id: "address",
      label: "주소",
      type: "text",
      x: 100,
      y: 300,
      width: 400,
      height: 30,
    },
    {
      id: "accountNumber",
      label: "계좌번호",
      type: "text",
      x: 100,
      y: 350,
      width: 200,
      height: 30,
    },
    {
      id: "productName",
      label: "상품명",
      type: "text",
      x: 100,
      y: 400,
      width: 300,
      height: 30,
    },
    {
      id: "amount",
      label: "금액",
      type: "number",
      x: 100,
      y: 450,
      width: 200,
      height: 30,
    },
    {
      id: "period",
      label: "기간",
      type: "number",
      x: 100,
      y: 500,
      width: 100,
      height: 30,
    },
    {
      id: "interestRate",
      label: "이자율",
      type: "number",
      x: 250,
      y: 500,
      width: 100,
      height: 30,
    },
    {
      id: "signature",
      label: "서명",
      type: "signature",
      x: 100,
      y: 600,
      width: 200,
      height: 100,
    },
  ];

  useEffect(() => {
    setInputFields(defaultFields);
    setIsLoading(false);
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleInputChange = (fieldId, value) => {
    if (onFormDataChange) {
      const updatedData = { ...formData, [fieldId]: value };
      onFormDataChange(updatedData);
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
      border: isHighlighted ? "3px solid #ff6b6b" : "1px solid #ddd",
      borderRadius: "4px",
      padding: "4px",
      fontSize: `${12 * scale}px`,
      backgroundColor: isHighlighted ? "#fff3cd" : "rgba(255, 255, 255, 0.9)",
      cursor: "pointer",
      zIndex: 10,
      transition: "all 0.3s ease",
      boxShadow: isHighlighted ? "0 0 10px rgba(255, 107, 107, 0.3)" : "none",
    };

    if (field.type === "signature") {
      return (
        <div key={field.id} style={fieldStyle}>
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
              {isHighlighted ? "🖊️ 서명 필요" : "서명 영역"}
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
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        style={fieldStyle}
        placeholder={field.label}
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
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>📝 서식 작성</h3>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            {isConnected ? "직원과 연결됨" : "연결 대기중"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            축소
          </button>
          <span style={{ padding: "8px 16px", fontWeight: "bold" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2.0, scale + 0.1))}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            확대
          </button>
        </div>
      </div>

      {/* 하이라이트 안내 */}
      {highlightedFields.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            borderLeft: "4px solid #ff6b6b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🎯</span>
            <div>
              <strong style={{ color: "#856404" }}>
                직원이 하이라이트한 필드
              </strong>
              <p
                style={{
                  margin: "5px 0 0 0",
                  color: "#856404",
                  fontSize: "14px",
                }}
              >
                빨간색 테두리로 표시된 필드를 확인해주세요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PDF 뷰어 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            로딩 중...
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <Document
              file={formUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading="PDF 로딩 중..."
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading="페이지 로딩 중..."
              />
            </Document>

            {/* 입력 필드 오버레이 */}
            {inputFields.map(renderInputField)}
          </div>
        )}
      </div>

      {/* 페이지 네비게이션 */}
      {numPages > 1 && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              opacity: pageNumber <= 1 ? 0.5 : 1,
            }}
          >
            이전
          </button>
          <span style={{ margin: "0 10px", fontWeight: "bold" }}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              opacity: pageNumber >= numPages ? 0.5 : 1,
            }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default FormViewerTablet;
