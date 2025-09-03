import React from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
  padding: 20px;
`;

const PDFContainer = styled.div`
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 0 0 20px 0;
  border-radius: 8px;
  overflow: hidden;
  width: 95vw;
  max-width: 1200px;
  display: flex;
  justify-content: center;
`;

const Header = styled.div`
  background: linear-gradient(
    135deg,
    var(--hana-mint) 0%,
    var(--hana-mint-dark) 100%
  );
  color: white;
  padding: 16px 24px;
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 1200px;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
`;

const FormDataOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const FilledField = styled.div`
  position: absolute;
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid #4caf50;
  color: #2e7d32;
  font-weight: bold;
  padding: 2px 4px;
  font-size: ${(props) => props.fontSize || "14px"};
  display: flex;
  align-items: center;
  border-radius: 4px;
`;

const SignatureImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const StatusBadge = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${(props) => (props.completed ? "#4caf50" : "#ff9800")};
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const PDFFormViewer = ({ formData, title = "하나은행 업무 서식" }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!formData) {
    return (
      <ViewerContainer>
        <div style={{ textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: "4rem", marginBottom: "24px" }}>📄</div>
          <h3 style={{ margin: "0 0 12px 0" }}>서식 대기 중</h3>
          <p style={{ margin: 0 }}>
            상담원이 서식을 전송하면 여기에 표시됩니다.
          </p>
        </div>
      </ViewerContainer>
    );
  }

  const { form, formData: fieldData, signatures } = formData;

  // 완성도 계산
  const requiredFields = form?.fields?.filter((field) => field.required) || [];
  const completedFields = requiredFields.filter((field) => {
    if (field.type === "signature") {
      return signatures && signatures[field.id];
    } else {
      return (
        fieldData && fieldData[field.id] && fieldData[field.id].trim() !== ""
      );
    }
  });

  const completionRate =
    requiredFields.length > 0
      ? Math.round((completedFields.length / requiredFields.length) * 100)
      : 100;

  return (
    <ViewerContainer>
      <Header>
        <Title>{form?.title || title}</Title>
        <Subtitle>고객 확인용 서식 미리보기</Subtitle>
      </Header>

      <StatusBadge completed={completionRate === 100}>
        작성률: {completionRate}%
      </StatusBadge>

      {/* PDF 크기 조절 컨트롤 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          background: "white",
          padding: "12px 24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <span style={{ fontWeight: "bold", color: "#333" }}>PDF 크기:</span>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          style={{
            background: "var(--hana-mint)",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🔍-
        </button>
        <span
          style={{ minWidth: "60px", textAlign: "center", fontWeight: "bold" }}
        >
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(3.0, scale + 0.1))}
          style={{
            background: "var(--hana-mint)",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🔍+
        </button>
      </div>

      {form?.pdfUrl ? (
        <PDFContainer style={{ position: "relative" }}>
          <Document
            file={form.pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            options={{
              cMapUrl: "cmaps/",
              cMapPacked: true,
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={Math.min(window.innerWidth * 0.9, 1200)}
            />

            {/* 입력된 데이터 오버레이 */}
            <FormDataOverlay>
              {form.fields
                ?.filter((field) => field.page === pageNumber)
                ?.map((field) => {
                  const value =
                    field.type === "signature"
                      ? signatures?.[field.id]
                      : fieldData?.[field.id];

                  if (!value) return null;

                  return (
                    <FilledField
                      key={field.id}
                      style={{
                        left: field.x * scale,
                        top: field.y * scale,
                        width: field.width * scale,
                        height: field.height * scale,
                      }}
                      fontSize={`${12 * scale}px`}
                    >
                      {field.type === "signature" ? (
                        <SignatureImage src={value} alt="서명" />
                      ) : (
                        value
                      )}
                    </FilledField>
                  );
                })}
            </FormDataOverlay>
          </Document>
        </PDFContainer>
      ) : (
        <div
          style={{
            background: "white",
            padding: "48px",
            borderRadius: "12px",
            textAlign: "center",
            margin: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "24px" }}>📝</div>
          <h3 style={{ margin: "0 0 16px 0", color: "var(--hana-mint)" }}>
            {form?.title || "서식 정보"}
          </h3>
          <p style={{ margin: "0 0 24px 0", color: "#666" }}>
            {form?.description || "서식이 준비 중입니다."}
          </p>

          {form?.fields && (
            <div
              style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}
            >
              <h4 style={{ margin: "0 0 16px 0", color: "#333" }}>
                필요한 정보:
              </h4>
              {form.fields
                .filter((field) => field.required)
                .map((field) => (
                  <div
                    key={field.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span>{field.label}</span>
                    <span
                      style={{
                        color: (
                          field.type === "signature"
                            ? signatures?.[field.id]
                            : fieldData?.[field.id]
                        )
                          ? "#4caf50"
                          : "#ff9800",
                        fontWeight: "bold",
                      }}
                    >
                      {(
                        field.type === "signature"
                          ? signatures?.[field.id]
                          : fieldData?.[field.id]
                      )
                        ? "✓"
                        : "⏳"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 페이지 네비게이션 */}
      {numPages > 1 && (
        <div
          style={{
            position: "sticky",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "12px 24px",
            borderRadius: "24px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            margin: "20px auto",
            zIndex: 100,
          }}
        >
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            style={{
              background: pageNumber <= 1 ? "#ccc" : "var(--hana-mint)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
            }}
          >
            이전
          </button>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            style={{
              background: pageNumber >= numPages ? "#ccc" : "var(--hana-mint)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: pageNumber >= numPages ? "not-allowed" : "pointer",
            }}
          >
            다음
          </button>
        </div>
      )}
    </ViewerContainer>
  );
};

export default PDFFormViewer;
