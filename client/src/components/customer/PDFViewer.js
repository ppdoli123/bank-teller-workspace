import React, { useState, useEffect, useRef } from "react";

const PDFViewer = ({
  pdfUrl,
  formSchema,
  fieldValues,
  onFieldClick,
  highlightedField,
  isFieldFocusMode,
}) => {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [currentScale, setCurrentScale] = useState(1.0);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 입력필드 오버레이를 위한 상태
  const [formFields, setFormFields] = useState([]);
  const [clickedField, setClickedField] = useState(null);

  useEffect(() => {
    if (pdfUrl) {
      loadPDF(pdfUrl);
    }
  }, [pdfUrl]);

  // PDF 파일명에 따른 입력필드 정의
  useEffect(() => {
    if (pdfUrl && pdfDocument) {
      const fileName = pdfUrl.split("/").pop();
      const setupFormFields = async () => {
        const fields = await getFormFieldsByFileName(fileName, pdfDocument);
        setFormFields(fields);
        console.log("📋 입력필드 정의 완료:", fileName, fields);
      };

      setupFormFields();
    }
  }, [pdfUrl, pdfDocument]);

  // PDF에서 빈칸을 자동으로 감지하여 입력필드 생성
  const detectFormFieldsFromPDF = async (pdf) => {
    try {
      console.log("🔍 PDF에서 입력필드 자동 감지 시작...");

      // 첫 번째 페이지에서 텍스트 추출
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();

      // 빈칸 패턴 감지 (예: "_____", "□", "○" 등)
      const blankPatterns = [
        "_____",
        "□□□□□",
        "○○○○○",
        "▢▢▢▢▢",
        "____",
        "□□□",
        "○○○",
      ];
      const detectedFields = [];

      textContent.items.forEach((item, index) => {
        const text = item.str;
        if (blankPatterns.some((pattern) => text.includes(pattern))) {
          console.log(
            `🔍 빈칸 감지: "${text}" at (${item.transform[4]}, ${item.transform[5]})`
          );

          // 빈칸 근처의 라벨 텍스트 찾기
          let label = "입력필드";
          for (
            let i = Math.max(0, index - 3);
            i < Math.min(textContent.items.length, index + 3);
            i++
          ) {
            const nearbyItem = textContent.items[i];
            if (
              nearbyItem.str &&
              !blankPatterns.some((pattern) => nearbyItem.str.includes(pattern))
            ) {
              label = nearbyItem.str;
              break;
            }
          }

          detectedFields.push({
            id: `auto_field_${index}`,
            name: `autoField${index}`,
            type: "text",
            label: label,
            x: item.transform[4],
            y: item.transform[5],
            width: 150,
            height: 25,
            required: true,
            placeholder: `${label}을 입력하세요`,
            autoDetected: true,
          });
        }
      });

      console.log(`✅ 자동 감지된 입력필드: ${detectedFields.length}개`);
      return detectedFields;
    } catch (error) {
      console.error("❌ 입력필드 자동 감지 실패:", error);
      return [];
    }
  };

  // PDF 파일명별 입력필드 좌표 정의 (수동 정의 + 자동 감지)
  const getFormFieldsByFileName = async (fileName, pdf = null) => {
    switch (fileName) {
      case "3-08-1294.pdf":
        return [
          // 동의 체크박스
          {
            id: "unique_id_consent_agree",
            name: "uniqueIdConsentAgree",
            type: "checkbox",
            label: "고유식별정보 동의함",
            x: 450,
            y: 120,
            width: 20,
            height: 20,
            required: true,
            placeholder: "고유식별정보 수집·이용 동의",
            value: false,
          },
          {
            id: "personal_credit_info_consent_agree",
            name: "personalCreditInfoConsentAgree",
            type: "checkbox",
            label: "개인(신용)정보 동의함",
            x: 450,
            y: 200,
            width: 20,
            height: 20,
            required: true,
            placeholder: "개인(신용)정보 수집·이용 동의",
            value: false,
          },

          // 날짜 입력
          {
            id: "date_year",
            name: "dateYear",
            type: "text",
            label: "년",
            x: 150,
            y: 350,
            width: 60,
            height: 25,
            required: true,
            placeholder: "2024",
            maxLength: 4,
          },
          {
            id: "date_month",
            name: "dateMonth",
            type: "text",
            label: "월",
            x: 220,
            y: 350,
            width: 40,
            height: 25,
            required: true,
            placeholder: "12",
            maxLength: 2,
          },
          {
            id: "date_day",
            name: "dateDay",
            type: "text",
            label: "일",
            x: 270,
            y: 350,
            width: 40,
            height: 25,
            required: true,
            placeholder: "25",
            maxLength: 2,
          },

          // 본인 정보
          {
            id: "applicant_name",
            name: "applicantName",
            type: "text",
            label: "본인 성명",
            x: 150,
            y: 400,
            width: 150,
            height: 25,
            required: true,
            placeholder: "본인 성명을 입력하세요",
          },
          {
            id: "applicant_signature",
            name: "applicantSignature",
            type: "text",
            label: "본인 서명",
            x: 320,
            y: 400,
            width: 100,
            height: 25,
            required: true,
            placeholder: "(서명)",
          },

          // 대리인 정보
          {
            id: "agent_name",
            name: "agentName",
            type: "text",
            label: "대리인 성명",
            x: 150,
            y: 450,
            width: 150,
            height: 25,
            required: false,
            placeholder: "대리인 성명을 입력하세요",
          },
          {
            id: "agent_signature",
            name: "agentSignature",
            type: "text",
            label: "대리인 서명",
            x: 320,
            y: 450,
            width: 100,
            height: 25,
            required: false,
            placeholder: "(서명)",
          },

          // 법정대리인 정보 (미성년자인 경우)
          {
            id: "guardian_father_name",
            name: "guardianFatherName",
            type: "text",
            label: "법정대리인 부",
            x: 150,
            y: 500,
            width: 120,
            height: 25,
            required: false,
            placeholder: "부 성명",
          },
          {
            id: "guardian_mother_name",
            name: "guardianMotherName",
            type: "text",
            label: "법정대리인 모",
            x: 280,
            y: 500,
            width: 120,
            height: 25,
            required: false,
            placeholder: "모 성명",
          },
          {
            id: "legal_guardian_name",
            name: "legalGuardianName",
            type: "text",
            label: "법정대리인 성명",
            x: 150,
            y: 550,
            width: 150,
            height: 25,
            required: false,
            placeholder: "법정대리인 성명을 입력하세요",
          },
          {
            id: "legal_guardian_signature",
            name: "legalGuardianSignature",
            type: "text",
            label: "법정대리인 서명",
            x: 320,
            y: 550,
            width: 100,
            height: 25,
            required: false,
            placeholder: "(서명)",
          },
        ];
      case "3-09-0131_250620.pdf":
        return [
          // 기본 정보
          {
            id: "customer_name",
            name: "customerName",
            type: "text",
            label: "고객명",
            x: 200,
            y: 200,
            width: 180,
            height: 25,
            required: true,
            placeholder: "고객명을 입력하세요",
          },
          {
            id: "resident_number",
            name: "residentNumber",
            type: "text",
            label: "주민등록번호",
            x: 200,
            y: 240,
            width: 180,
            height: 25,
            required: true,
            placeholder: "주민등록번호를 입력하세요",
          },
          {
            id: "phone_number",
            name: "phoneNumber",
            type: "text",
            label: "연락처",
            x: 200,
            y: 280,
            width: 180,
            height: 25,
            required: true,
            placeholder: "연락처를 입력하세요",
          },
          {
            id: "address",
            name: "address",
            type: "text",
            label: "주소",
            x: 200,
            y: 320,
            width: 280,
            height: 25,
            required: true,
            placeholder: "주소를 입력하세요",
          },

          // 송금 정보
          {
            id: "transfer_amount",
            name: "transferAmount",
            type: "number",
            label: "송금금액",
            x: 200,
            y: 380,
            width: 180,
            height: 25,
            required: true,
            placeholder: "송금금액을 입력하세요",
          },
          {
            id: "currency_type",
            name: "currencyType",
            type: "text",
            label: "통화종류",
            x: 200,
            y: 420,
            width: 150,
            height: 25,
            required: true,
            placeholder: "USD, EUR, JPY 등",
          },
          {
            id: "destination_country",
            name: "destinationCountry",
            type: "text",
            label: "송금국가",
            x: 200,
            y: 460,
            width: 180,
            height: 25,
            required: true,
            placeholder: "송금국가를 입력하세요",
          },
          {
            id: "recipient_name",
            name: "recipientName",
            type: "text",
            label: "수취인명",
            x: 150,
            y: 530,
            width: 200,
            height: 30,
            required: true,
            placeholder: "수취인명을 입력하세요",
          },
          {
            id: "recipient_bank",
            name: "recipientBank",
            type: "text",
            label: "수취은행",
            x: 150,
            y: 580,
            width: 250,
            height: 30,
            required: true,
            placeholder: "수취은행명을 입력하세요",
          },
          {
            id: "recipient_account",
            name: "recipientAccount",
            type: "text",
            label: "수취계좌번호",
            x: 150,
            y: 630,
            width: 250,
            height: 30,
            required: true,
            placeholder: "수취계좌번호를 입력하세요",
          },

          // 추가 정보
          {
            id: "purpose",
            name: "purpose",
            type: "text",
            label: "송금목적",
            x: 150,
            y: 680,
            width: 300,
            height: 30,
            required: true,
            placeholder: "송금목적을 입력하세요",
          },
          {
            id: "relationship",
            name: "relationship",
            type: "text",
            label: "수취인과의 관계",
            x: 150,
            y: 730,
            width: 200,
            height: 30,
            required: true,
            placeholder: "친척, 친구, 비즈니스 등",
          },
          {
            id: "emergency_contact",
            name: "emergencyContact",
            type: "text",
            label: "비상연락처",
            x: 150,
            y: 780,
            width: 200,
            height: 30,
            required: false,
            placeholder: "비상연락처를 입력하세요",
          },
        ];
      case "5-09-0101.pdf":
        return [
          {
            id: "customer_name",
            name: "customerName",
            type: "text",
            label: "고객명",
            x: 150,
            y: 150,
            width: 200,
            height: 30,
            required: true,
            placeholder: "고객명을 입력하세요",
          },
          {
            id: "resident_number",
            name: "residentNumber",
            type: "text",
            label: "주민등록번호",
            x: 150,
            y: 200,
            width: 200,
            height: 30,
            required: true,
            placeholder: "주민등록번호를 입력하세요",
          },
          {
            id: "consent_date",
            name: "consentDate",
            type: "date",
            label: "동의일자",
            x: 150,
            y: 250,
            width: 200,
            height: 30,
            required: true,
            placeholder: "동의일자를 입력하세요",
          },
        ];
      default:
        // 기본 필드가 없는 경우 자동 감지 시도
        if (pdf) {
          console.log("🔍 기본 필드가 없어 자동 감지 시도...");
          const autoFields = await detectFormFieldsFromPDF(pdf);
          return autoFields;
        }
        return [];
    }
  };

  const loadPDF = async (url) => {
    try {
      console.log("🔍 PDF 로드 시작:", url);

      // URL을 Supabase Storage URL로 변환
      let pdfUrl = url;
      if (url) {
        if (url.includes("http") && !url.includes("supabase.co")) {
          // 외부 URL인 경우 파일명 추출하여 Supabase Storage URL 생성
          const fileName = url.split("/").pop(); // 마지막 부분을 파일명으로 사용
          if (fileName) {
            pdfUrl = `https://jhfjigeuxrxxbbsoflcd.supabase.co/storage/v1/object/public/eform_template/${fileName}`;
            console.log("🔄 외부 URL을 Supabase Storage URL로 변환:", pdfUrl);
          }
        } else if (url.startsWith("/")) {
          // 상대 경로인 경우 파일명 추출하여 Supabase Storage URL 생성
          const fileName = url.split("/").pop(); // 마지막 부분을 파일명으로 사용
          if (fileName) {
            pdfUrl = `https://jhfjigeuxrxxbbsoflcd.supabase.co/storage/v1/object/public/eform_template/${fileName}`;
            console.log("🔄 상대 경로를 Supabase Storage URL로 변환:", pdfUrl);
          }
        }
      }

      // PDF.js 라이브러리 확인
      const pdfjsLib = window["pdfjs-dist/build/pdf"] || window.pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF.js 라이브러리가 로드되지 않았습니다.");
      }

      // Worker 설정
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      console.log("📚 PDF.js 라이브러리 로드됨, PDF 문서 로딩 중...");
      console.log("📄 최종 PDF URL:", pdfUrl);

      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      console.log("✅ PDF 문서 로드 완료:", pdf.numPages, "페이지");
      setPdfDocument(pdf);

      if (pdf.numPages > 0) {
        renderPage(1, pdf);
      }
    } catch (error) {
      console.error("❌ PDF 로드 실패:", error);
      console.error("원본 URL:", url);
      console.error("에러 상세:", error.message);

      // 에러 발생 시 사용자에게 안내
      setPdfDocument(null);
    }
  };

  const renderPage = async (pageNum, pdf = pdfDocument) => {
    if (!pdf) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // 컨테이너 크기에 맞춰 PDF를 최대 크기로 표시
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth - 20; // 최소한의 패딩만
      const containerHeight = container.clientHeight - 20;

      // PDF 비율 유지하면서 최대 크기로 맞춤 (제한 없음)
      const pageViewport = page.getViewport({ scale: 1.0 });
      const scaleX = containerWidth / pageViewport.width;
      const scaleY = containerHeight / pageViewport.height;
      const optimalScale = Math.min(scaleX, scaleY); // 제한 없이 최대 크기

      const viewport = page.getViewport({ scale: optimalScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // PDF를 화면 중앙에 배치
      canvas.style.margin = "0 auto";
      canvas.style.display = "block";

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      setCurrentPage(pageNum);

      // 입력필드 위치를 절대좌표로 고정하기 위해 스케일 정보 저장
      setCurrentScale(optimalScale);

      console.log("✅ PDF 렌더링 완료:", {
        pageNum,
        scale: optimalScale,
        canvasSize: `${canvas.width}x${canvas.height}`,
        containerSize: `${containerWidth}x${containerHeight}`,
      });
    } catch (error) {
      console.error("페이지 렌더링 실패:", error);
    }
  };

  const handlePageChange = (direction) => {
    if (!pdfDocument) return;

    let newPage = currentPage;
    if (direction === "prev" && currentPage > 1) {
      newPage = currentPage - 1;
    } else if (direction === "next" && currentPage < pdfDocument.numPages) {
      newPage = currentPage + 1;
    }

    if (newPage !== currentPage) {
      renderPage(newPage);
    }
  };

  // 입력필드 오버레이 렌더링
  const renderFormFields = () => {
    if (!formFields || formFields.length === 0) return null;

    return formFields.map((field) => (
      <div
        key={field.id}
        style={{
          position: "absolute",
          left: `${field.x * currentScale}px`,
          top: field.y * currentScale,
          width: field.width * currentScale,
          height: field.height * currentScale,
          border: field.autoDetected
            ? "2px dashed #FF6B35"
            : "2px solid #4CAF50",
          borderRadius: "4px",
          backgroundColor: field.autoDetected
            ? "rgba(255, 107, 53, 0.15)"
            : "rgba(76, 175, 80, 0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(10, 12 * currentScale), // 절대좌표에 따른 폰트 크기 조정
          color: field.autoDetected ? "#FF6B35" : "#4CAF50",
          fontWeight: "bold",
          zIndex: 1000,
          transition: "all 0.2s ease",
        }}
        onClick={() => handleFieldClick(field)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "rgba(76, 175, 80, 0.2)";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
          e.target.style.transform = "scale(1)";
        }}
        title={`${field.label} (${field.placeholder})${
          field.autoDetected ? " - 자동감지" : ""
        }`}
      >
        {fieldValues && fieldValues[field.id] ? (
          <div
            style={{
              color: "#2E7D32",
              fontSize: Math.max(9, 11 * currentScale), // 절대좌표에 따른 폰트 크기 조정
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {fieldValues[field.id]}
          </div>
        ) : (
          field.label
        )}
      </div>
    ));
  };

  // 필드 클릭 핸들러
  const handleFieldClick = (field) => {
    console.log("🔍 PDF 필드 클릭됨:", field);
    setClickedField(field);

    if (onFieldClick) {
      onFieldClick(field);
    }
  };

  if (!pdfUrl) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#666",
          background: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        PDF 파일이 선택되지 않았습니다.
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#666",
          background: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>📄 PDF 로딩 중...</div>
        <div style={{ fontSize: "0.9rem", color: "#999" }}>
          원본 경로: {pdfUrl}
        </div>
        <div style={{ fontSize: "0.9rem", color: "#999", marginTop: "0.5rem" }}>
          Supabase Storage에서 파일을 찾는 중입니다.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        background: "#f8f9fa",
        borderRadius: "8px",
        padding: "1rem",
        overflow: "hidden",
      }}
    >
      {/* PDF 컨트롤 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          padding: "0.5rem",
          background: "white",
          borderRadius: "6px",
          border: "1px solid #e9ecef",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage <= 1}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              background: currentPage <= 1 ? "#f8f9fa" : "white",
              color: currentPage <= 1 ? "#adb5bd" : "#495057",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            }}
          >
            ◀ 이전
          </button>
          <span
            style={{
              padding: "0.5rem 1rem",
              background: "#e9ecef",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            {currentPage} / {pdfDocument?.numPages || "?"}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={!pdfDocument || currentPage >= pdfDocument.numPages}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              background:
                !pdfDocument || currentPage >= pdfDocument.numPages
                  ? "#f8f9fa"
                  : "white",
              color:
                !pdfDocument || currentPage >= pdfDocument.numPages
                  ? "#adb5bd"
                  : "#495057",
              cursor:
                !pdfDocument || currentPage >= pdfDocument.numPages
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            다음 ▶
          </button>
        </div>
      </div>

      {/* PDF 뷰어 */}
      <div
        style={{
          position: "relative",
          background: "white",
          borderRadius: "8px",
          overflow: "auto",
          maxHeight: "85vh", // 높이 증가
          border: "1px solid #dee2e6",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            margin: "0 auto",
            maxWidth: "100%", // 최대 너비 설정
            height: "auto", // 높이 자동 조정
          }}
        />

        {/* 입력필드 오버레이 */}
        {renderFormFields()}
      </div>

      {/* 필드 정보 */}
      {formSchema && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "white",
            borderRadius: "6px",
            border: "1px solid #e9ecef",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>
            📋 서식 필드 정보
          </h4>
          <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
            총 {formSchema.fields?.length || 0}개 필드
            {Object.keys(fieldValues).length > 0 && (
              <span style={{ color: "#28a745", marginLeft: "1rem" }}>
                • {Object.keys(fieldValues).length}개 입력 완료
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
