import React, { useState, useEffect, useRef } from "react";
import ForeignCurrencyRemittanceForm from "./ForeignCurrencyRemittanceForm";

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
  const [scale, setScale] = useState(1.3); // 130%로 설정
  const [currentScale, setCurrentScale] = useState(1.3); // 130%로 설정
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 입력필드 오버레이를 위한 상태
  const [formFields, setFormFields] = useState([]);
  const [clickedField, setClickedField] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [localFieldValues, setLocalFieldValues] = useState({});

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
        console.log("🔍 setupFormFields 시작:", fileName);
        const fields = await getFormFieldsByFileName(fileName, pdfDocument);
        console.log("📋 getFormFieldsByFileName 결과:", fields);
        setFormFields(fields);
        console.log("📋 입력필드 정의 완료:", fileName, fields);
      };

      setupFormFields();
    }
  }, [pdfUrl, pdfDocument]);

  // scale이 변경될 때마다 현재 페이지 다시 렌더링
  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(currentPage);
    }
  }, [scale]);

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

  // PDF 파일명별 입력필드 좌표 정의 (JSON 구조 기반)
  const getFormFieldsByFileName = async (fileName, pdf = null) => {
    console.log("🔍 getFormFieldsByFileName 호출:", fileName);
    switch (fileName) {
      case "외화송금신청서.pdf":
      case "3-08-1294.pdf":
        return [
          // === 송금방법 (Remittance Method) ===
          {
            id: "ott_transfer",
            name: "ottTransfer",
            type: "checkbox",
            label: "국외전신송금(OTT)",
            x: 105,
            y: 140,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "odt_transfer",
            name: "odtTransfer",
            type: "checkbox",
            label: "국내전신송금(ODT)",
            x: 205,
            y: 140,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "demand_draft",
            name: "demandDraft",
            type: "checkbox",
            label: "송금수표 (D/D)",
            x: 305,
            y: 140,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "domestic_settlement",
            name: "domesticSettlement",
            type: "checkbox",
            label: "금융결제원이체(국내)",
            x: 395,
            y: 140,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "international_settlement",
            name: "internationalSettlement",
            type: "checkbox",
            label: "금융결제원이체(국가간송금)",
            x: 510,
            y: 140,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },

          // === 송금정보등록 ===
          {
            id: "new_notification",
            name: "newNotification",
            type: "checkbox",
            label: "신규",
            x: 105,
            y: 170,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "new_number",
            name: "newNumber",
            type: "text",
            label: "신규 번호",
            x: 150,
            y: 170,
            width: 100,
            height: 12,
            required: false,
            placeholder: "신규 번호",
          },
          {
            id: "change_notification",
            name: "changeNotification",
            type: "checkbox",
            label: "변경",
            x: 105,
            y: 185,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "change_number",
            name: "changeNumber",
            type: "text",
            label: "변경 번호",
            x: 150,
            y: 185,
            width: 100,
            height: 12,
            required: false,
            placeholder: "변경 번호",
          },
          {
            id: "cancel_notification",
            name: "cancelNotification",
            type: "checkbox",
            label: "해지",
            x: 105,
            y: 200,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "cancel_number",
            name: "cancelNumber",
            type: "text",
            label: "해지 번호",
            x: 150,
            y: 200,
            width: 100,
            height: 12,
            required: false,
            placeholder: "해지 번호",
          },

          // === 송금결과 통지 ===
          {
            id: "sms_notification",
            name: "smsNotification",
            type: "checkbox",
            label: "SMS",
            x: 335,
            y: 170,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "sms_number",
            name: "smsNumber",
            type: "text",
            label: "SMS 번호",
            x: 375,
            y: 170,
            width: 175,
            height: 12,
            required: false,
            placeholder: "SMS 번호",
          },
          {
            id: "email_notification",
            name: "emailNotification",
            type: "checkbox",
            label: "E-MAIL",
            x: 335,
            y: 185,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "email_address",
            name: "emailAddress",
            type: "text",
            label: "E-MAIL 주소",
            x: 385,
            y: 185,
            width: 165,
            height: 12,
            required: false,
            placeholder: "E-MAIL 주소",
          },

          // === 보내는 분 정보 ===
          {
            id: "applicant_name_english",
            name: "applicantNameEnglish",
            type: "text",
            label: "보내는 분 (영문)",
            x: 125,
            y: 235,
            width: 225,
            height: 15,
            required: true,
            placeholder: "영문 이름을 입력하세요",
          },
          {
            id: "applicant_name_korean",
            name: "applicantNameKorean",
            type: "text",
            label: "보내는 분 (국문)",
            x: 125,
            y: 255,
            width: 225,
            height: 15,
            required: true,
            placeholder: "국문 이름을 입력하세요",
          },
          {
            id: "applicant_id_number",
            name: "applicantIdNumber",
            type: "text",
            label: "주민(사업자)번호",
            x: 125,
            y: 275,
            width: 225,
            height: 15,
            required: true,
            placeholder: "주민등록번호 또는 여권번호",
          },
          {
            id: "applicant_account_number",
            name: "applicantAccountNumber",
            type: "text",
            label: "보내는분 계좌번호",
            x: 390,
            y: 275,
            width: 160,
            height: 15,
            required: true,
            placeholder: "계좌번호를 입력하세요",
          },
          {
            id: "applicant_address",
            name: "applicantAddress",
            type: "text",
            label: "주소 (Address)",
            x: 125,
            y: 295,
            width: 425,
            height: 15,
            required: false,
            placeholder: "주소를 입력하세요",
          },
          {
            id: "existing_remittance_number",
            name: "existingRemittanceNumber",
            type: "text",
            label: "과거송금번호",
            x: 125,
            y: 315,
            width: 225,
            height: 15,
            required: false,
            placeholder: "과거 송금번호가 있다면 입력하세요",
          },

          // === 송금액 및 수수료 ===
          {
            id: "currency",
            name: "currency",
            type: "text",
            label: "통화(CURRENCY)",
            x: 130,
            y: 355,
            width: 70,
            height: 15,
            required: true,
            placeholder: "USD",
          },
          {
            id: "amount",
            name: "amount",
            type: "text",
            label: "금액(AMOUNT)",
            x: 210,
            y: 355,
            width: 140,
            height: 15,
            required: true,
            placeholder: "송금 금액을 입력하세요",
          },
          {
            id: "fee_payment_method_separate",
            name: "feePaymentMethodSeparate",
            type: "checkbox",
            label: "수수료 별도납부",
            x: 395,
            y: 355,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "fee_payment_method_deduct",
            name: "feePaymentMethodDeduct",
            type: "checkbox",
            label: "수수료차감후 송금",
            x: 480,
            y: 355,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },

          // === 결제은행 수수료부담 ===
          {
            id: "reimbursing_bank_charge_our",
            name: "reimbursingBankChargeOur",
            type: "checkbox",
            label: "송금인 (OUR)",
            x: 180,
            y: 405,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "reimbursing_bank_charge_sha",
            name: "reimbursingBankChargeSha",
            type: "checkbox",
            label: "수취인 (SHA)",
            x: 280,
            y: 405,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "reimbursing_bank_charge_ben",
            name: "reimbursingBankChargeBen",
            type: "checkbox",
            label: "수취인 (BEN)",
            x: 380,
            y: 405,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },

          // === 결제은행 정보 ===
          {
            id: "settlement_bank_swift_bic",
            name: "settlementBankSwiftBic",
            type: "text",
            label: "결제은행 은행코드(SWIFT BIC)",
            x: 125,
            y: 435,
            width: 425,
            height: 15,
            required: true,
            placeholder: "SWIFT BIC 코드를 입력하세요",
          },
          {
            id: "settlement_bank_name",
            name: "settlementBankName",
            type: "text",
            label: "결제은행 은행명",
            x: 125,
            y: 455,
            width: 425,
            height: 15,
            required: true,
            placeholder: "결제은행명을 입력하세요",
          },

          // === 받으실분 거래은행 정보 ===
          {
            id: "beneficiary_bank_branch_name",
            name: "beneficiaryBankBranchName",
            type: "text",
            label: "받으실분 거래은행 지점명 및 주소",
            x: 140,
            y: 500,
            width: 210,
            height: 15,
            required: true,
            placeholder: "지점명과 주소를 입력하세요",
          },
          {
            id: "beneficiary_bank_city",
            name: "beneficiaryBankCity",
            type: "text",
            label: "받으실분 거래은행 도시명",
            x: 355,
            y: 500,
            width: 95,
            height: 15,
            required: true,
            placeholder: "도시명을 입력하세요",
          },
          {
            id: "beneficiary_bank_country",
            name: "beneficiaryBankCountry",
            type: "text",
            label: "받으실분 거래은행 국가명",
            x: 455,
            y: 500,
            width: 95,
            height: 15,
            required: true,
            placeholder: "국가명을 입력하세요",
          },
          {
            id: "beneficiary_bank_code",
            name: "beneficiaryBankCode",
            type: "text",
            label: "받으실분 거래은행 은행코드",
            x: 140,
            y: 535,
            width: 110,
            height: 15,
            required: true,
            placeholder: "은행코드를 입력하세요",
          },
          {
            id: "beneficiary_account_number",
            name: "beneficiaryAccountNumber",
            type: "text",
            label: "수취인 계좌번호",
            x: 255,
            y: 535,
            width: 295,
            height: 15,
            required: true,
            placeholder: "수취인 계좌번호를 입력하세요",
          },

          // === 수취인 정보 ===
          {
            id: "beneficiary_name",
            name: "beneficiaryName",
            type: "text",
            label: "받으실분 성명",
            x: 140,
            y: 565,
            width: 210,
            height: 15,
            required: true,
            placeholder: "수취인 성명을 입력하세요",
          },
          {
            id: "beneficiary_relation",
            name: "beneficiaryRelation",
            type: "text",
            label: "신청인과의 관계",
            x: 390,
            y: 565,
            width: 160,
            height: 15,
            required: false,
            placeholder: "관계를 입력하세요",
          },
          {
            id: "beneficiary_address",
            name: "beneficiaryAddress",
            type: "text",
            label: "받으실분 주소",
            x: 140,
            y: 585,
            width: 210,
            height: 15,
            required: true,
            placeholder: "수취인 주소를 입력하세요",
          },
          {
            id: "beneficiary_city",
            name: "beneficiaryCity",
            type: "text",
            label: "받으실분 도시명",
            x: 355,
            y: 585,
            width: 95,
            height: 15,
            required: true,
            placeholder: "도시명을 입력하세요",
          },
          {
            id: "beneficiary_country",
            name: "beneficiaryCountry",
            type: "text",
            label: "받으실분 국가명",
            x: 455,
            y: 585,
            width: 95,
            height: 15,
            required: true,
            placeholder: "국가명을 입력하세요",
          },

          // === HAPPY E-MAIL 서비스 ===
          {
            id: "happy_email_service",
            name: "happyEmailService",
            type: "checkbox",
            label: "HAPPY E-MAIL 서비스 신청",
            x: 120,
            y: 610,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "happy_email_address",
            name: "happyEmailAddress",
            type: "text",
            label: "HAPPY E-MAIL 서비스 이메일 주소",
            x: 280,
            y: 610,
            width: 270,
            height: 12,
            required: false,
            placeholder: "이메일 주소를 입력하세요",
          },

          // === 송금 목적 및 적요 ===
          {
            id: "remittance_purpose",
            name: "remittancePurpose",
            type: "text",
            label: "송금 목적(송금사유)",
            x: 140,
            y: 645,
            width: 410,
            height: 15,
            required: true,
            placeholder: "송금 목적을 입력하세요",
          },
          {
            id: "payment_details",
            name: "paymentDetails",
            type: "text",
            label: "적요(DETAILS OF PAYMENT)",
            x: 140,
            y: 680,
            width: 410,
            height: 15,
            required: false,
            placeholder: "송금 상세 내용을 입력하세요",
          },

          // === 지정거래 자동갱신 ===
          {
            id: "designated_item_01",
            name: "designatedItem01",
            type: "text",
            label: "지정항목 (01)",
            x: 140,
            y: 715,
            width: 110,
            height: 15,
            required: false,
            placeholder: "지정항목을 입력하세요",
          },
          {
            id: "auto_renewal_new",
            name: "autoRenewalNew",
            type: "checkbox",
            label: "신규 (지정거래 자동갱신)",
            x: 260,
            y: 715,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },
          {
            id: "auto_renewal_change",
            name: "autoRenewalChange",
            type: "checkbox",
            label: "변경 (지정거래 자동갱신)",
            x: 300,
            y: 715,
            width: 13,
            height: 12,
            required: false,
            value: false,
          },

          // === 하단 서명 및 신청 정보 ===
          {
            id: "withdrawal_account_number",
            name: "withdrawalAccountNumber",
            type: "text",
            label: "출금계좌번호",
            x: 40,
            y: 850,
            width: 140,
            height: 15,
            required: true,
            placeholder: "출금할 계좌번호를 입력하세요",
          },
          {
            id: "account_holder_name",
            name: "accountHolderName",
            type: "text",
            label: "예금주명",
            x: 190,
            y: 850,
            width: 140,
            height: 15,
            required: true,
            placeholder: "예금주명을 입력하세요",
          },
          {
            id: "account_holder_signature",
            name: "accountHolderSignature",
            type: "text",
            label: "예금주 서명",
            x: 340,
            y: 850,
            width: 110,
            height: 15,
            required: true,
            placeholder: "서명 또는 인을 입력하세요",
          },
          {
            id: "application_date",
            name: "applicationDate",
            type: "text",
            label: "신청일",
            x: 460,
            y: 850,
            width: 100,
            height: 15,
            required: true,
            placeholder: "신청일을 입력하세요",
          },
          {
            id: "applicant_name",
            name: "applicantName",
            type: "text",
            label: "신청인(Applicant) 이름",
            x: 190,
            y: 870,
            width: 140,
            height: 15,
            required: true,
            placeholder: "신청인 이름",
          },
          {
            id: "applicant_signature",
            name: "applicantSignature",
            type: "text",
            label: "신청인(Applicant) 서명",
            x: 340,
            y: 870,
            width: 110,
            height: 15,
            required: true,
            placeholder: "신청인 서명 또는 인",
          },
          {
            id: "agent_name",
            name: "agentName",
            type: "text",
            label: "대리인(Agent) 이름",
            x: 190,
            y: 890,
            width: 140,
            height: 15,
            required: false,
            placeholder: "대리인 이름 (있는 경우)",
          },
          {
            id: "agent_signature",
            name: "agentSignature",
            type: "text",
            label: "대리인(Agent) 서명",
            x: 340,
            y: 890,
            width: 110,
            height: 15,
            required: false,
            placeholder: "대리인 서명 또는 인",
          },
          {
            id: "agent_id_number",
            name: "agentIdNumber",
            type: "text",
            label: "대리인 실명번호",
            x: 190,
            y: 910,
            width: 140,
            height: 15,
            required: false,
            placeholder: "대리인 실명번호 (있는 경우)",
          },
        ];

      case "3-09-0131_250620.pdf":
        return [
          // === 기본 정보 입력필드 ===
          {
            id: "customer_name",
            name: "customerName",
            type: "text",
            label: "고객명",
            x: 200,
            y: 150,
            width: 200,
            height: 25,
            required: true,
            placeholder: "고객명을 입력하세요",
          },
          {
            id: "customer_id",
            name: "customerId",
            type: "text",
            label: "고객번호",
            x: 200,
            y: 180,
            width: 150,
            height: 25,
            required: true,
            placeholder: "고객번호를 입력하세요",
          },
          {
            id: "phone_number",
            name: "phoneNumber",
            type: "text",
            label: "연락처",
            x: 200,
            y: 210,
            width: 150,
            height: 25,
            required: false,
            placeholder: "연락처를 입력하세요",
          },
          {
            id: "email",
            name: "email",
            type: "text",
            label: "이메일",
            x: 200,
            y: 240,
            width: 200,
            height: 25,
            required: false,
            placeholder: "이메일을 입력하세요",
          },
          {
            id: "address",
            name: "address",
            type: "text",
            label: "주소",
            x: 200,
            y: 270,
            width: 300,
            height: 25,
            required: false,
            placeholder: "주소를 입력하세요",
          },
          {
            id: "product_type",
            name: "productType",
            type: "text",
            label: "상품종류",
            x: 200,
            y: 300,
            width: 200,
            height: 25,
            required: true,
            placeholder: "상품종류를 입력하세요",
          },
          {
            id: "amount",
            name: "amount",
            type: "text",
            label: "금액",
            x: 200,
            y: 330,
            width: 150,
            height: 25,
            required: true,
            placeholder: "금액을 입력하세요",
          },
          {
            id: "period",
            name: "period",
            type: "text",
            label: "기간",
            x: 200,
            y: 360,
            width: 100,
            height: 25,
            required: false,
            placeholder: "기간을 입력하세요",
          },
          {
            id: "interest_rate",
            name: "interestRate",
            type: "text",
            label: "이율",
            x: 200,
            y: 390,
            width: 100,
            height: 25,
            required: false,
            placeholder: "이율을 입력하세요",
          },
          {
            id: "application_date",
            name: "applicationDate",
            type: "text",
            label: "신청일",
            x: 200,
            y: 420,
            width: 150,
            height: 25,
            required: true,
            placeholder: "신청일을 입력하세요",
          },
          {
            id: "signature",
            name: "signature",
            type: "text",
            label: "서명",
            x: 200,
            y: 450,
            width: 200,
            height: 25,
            required: true,
            placeholder: "서명 또는 인을 입력하세요",
          },
          {
            id: "terms_agreement",
            name: "termsAgreement",
            type: "checkbox",
            label: "약관동의",
            x: 200,
            y: 480,
            width: 20,
            height: 20,
            required: true,
            value: false,
          },
          {
            id: "privacy_agreement",
            name: "privacyAgreement",
            type: "checkbox",
            label: "개인정보동의",
            x: 250,
            y: 480,
            width: 20,
            height: 20,
            required: true,
            value: false,
          },
          {
            id: "odt_transfer",
            name: "odtTransfer",
            type: "checkbox",
            label: "국외송금(ODT)",
            x: 200,
            y: 120,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "cdt_transfer",
            name: "cdtTransfer",
            type: "checkbox",
            label: "국내송금(CDT)",
            x: 250,
            y: 120,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "demand_draft",
            name: "demandDraft",
            type: "checkbox",
            label: "송금수표(D/D)",
            x: 150,
            y: 150,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "domestic_settlement",
            name: "domesticSettlement",
            type: "checkbox",
            label: "금융결제원이체(국내)",
            x: 150,
            y: 180,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "international_settlement",
            name: "internationalSettlement",
            type: "checkbox",
            label: "금융결제원이체(국가간송금)",
            x: 150,
            y: 210,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },

          // === 송금정보통보 (Remittance Notification) ===
          {
            id: "new_notification",
            name: "newNotification",
            type: "checkbox",
            label: "신규",
            x: 150,
            y: 250,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "change_notification",
            name: "changeNotification",
            type: "checkbox",
            label: "변경",
            x: 200,
            y: 250,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "hp_number",
            name: "hpNumber",
            type: "text",
            label: "H.P. NO.",
            x: 230,
            y: 250,
            width: 100,
            height: 20,
            required: false,
            placeholder: "휴대폰 번호",
          },
          {
            id: "sms_notification",
            name: "smsNotification",
            type: "checkbox",
            label: "SMS",
            x: 150,
            y: 280,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "email_notification",
            name: "emailNotification",
            type: "checkbox",
            label: "E-MAIL",
            x: 200,
            y: 280,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },

          // === 보내는 분 (Applicant Info) ===
          {
            id: "applicant_name_english",
            name: "applicantNameEnglish",
            type: "text",
            label: "성명/상호 (영문/English)",
            x: 200,
            y: 320,
            width: 250,
            height: 25,
            required: true,
            placeholder: "영문 이름을 입력하세요",
          },
          {
            id: "applicant_name_korean",
            name: "applicantNameKorean",
            type: "text",
            label: "성명/상호 (국문/Korean)",
            x: 200,
            y: 350,
            width: 250,
            height: 25,
            required: true,
            placeholder: "국문 이름을 입력하세요",
          },
          {
            id: "applicant_id_number",
            name: "applicantIdNumber",
            type: "text",
            label: "주민(사업자)번호 (I.D No. / Passport No.)",
            x: 200,
            y: 380,
            width: 250,
            height: 25,
            required: true,
            placeholder: "주민등록번호 또는 여권번호",
          },
          {
            id: "applicant_account_number",
            name: "applicantAccountNumber",
            type: "text",
            label: "보내는분 계좌번호(A/C NO)",
            x: 200,
            y: 410,
            width: 250,
            height: 25,
            required: true,
            placeholder: "송금할 계좌번호",
          },
          {
            id: "applicant_address",
            name: "applicantAddress",
            type: "text",
            label: "주소 (ADDRESS)",
            x: 200,
            y: 440,
            width: 300,
            height: 25,
            required: true,
            placeholder: "상세 주소를 입력하세요",
          },
          {
            id: "existing_ref_number",
            name: "existingRefNumber",
            type: "text",
            label: "거래외국환은행 지정(신규/변경) 신청 (EXISTING REF. NO)",
            x: 200,
            y: 470,
            width: 300,
            height: 25,
            required: false,
            placeholder: "기존 거래번호 (있는 경우)",
          },

          // === 송금액 (Amount Info) ===
          {
            id: "currency",
            name: "currency",
            type: "text",
            label: "통화(CURRENCY)",
            x: 200,
            y: 510,
            width: 120,
            height: 25,
            required: true,
            placeholder: "USD, EUR, JPY 등",
          },
          {
            id: "amount",
            name: "amount",
            type: "text",
            label: "금액(AMOUNT)",
            x: 350,
            y: 510,
            width: 150,
            height: 25,
            required: true,
            placeholder: "송금할 금액",
          },

          // === 수수료 납부방법 ===
          {
            id: "separate_fee_payment",
            name: "separateFeePayment",
            type: "checkbox",
            label: "수수료 별도납부",
            x: 150,
            y: 550,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "fee_deducted_transfer",
            name: "feeDeductedTransfer",
            type: "checkbox",
            label: "수수료차감후 송금",
            x: 250,
            y: 550,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },

          // === 결제대금/수수료부담 ===
          {
            id: "sender_pays_fees",
            name: "senderPaysFees",
            type: "checkbox",
            label: "송금인 (OUR)",
            x: 150,
            y: 590,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "shared_fees",
            name: "sharedFees",
            type: "checkbox",
            label: "수취인 (SHA)",
            x: 250,
            y: 590,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "beneficiary_pays_fees",
            name: "beneficiaryPaysFees",
            type: "checkbox",
            label: "수취인 (BEN)",
            x: 350,
            y: 590,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },

          // === 송금 보내는 신청내역 ===
          {
            id: "reimbursing_bank_name",
            name: "reimbursingBankName",
            type: "text",
            label: "은행명 (BANK NAME)",
            x: 200,
            y: 630,
            width: 250,
            height: 25,
            required: true,
            placeholder: "결제은행명을 입력하세요",
          },

          // === 받는분 정보 거래은행 ===
          {
            id: "beneficiary_bank_branch",
            name: "beneficiaryBankBranch",
            type: "text",
            label: "지점명 및 주소 (Branch Name/Address)",
            x: 200,
            y: 670,
            width: 300,
            height: 25,
            required: true,
            placeholder: "지점명과 주소를 입력하세요",
          },
          {
            id: "beneficiary_city",
            name: "beneficiaryCity",
            type: "text",
            label: "도시명(CITY)",
            x: 200,
            y: 700,
            width: 150,
            height: 25,
            required: true,
            placeholder: "도시명을 입력하세요",
          },
          {
            id: "beneficiary_country",
            name: "beneficiaryCountry",
            type: "text",
            label: "국가명(COUNTRY)",
            x: 200,
            y: 730,
            width: 150,
            height: 25,
            required: true,
            placeholder: "국가명을 입력하세요",
          },
          {
            id: "beneficiary_bank_code",
            name: "beneficiaryBankCode",
            type: "text",
            label: "은행코드 (BANK CODE - SWIFT BIC 등)",
            x: 200,
            y: 760,
            width: 200,
            height: 25,
            required: true,
            placeholder: "SWIFT BIC 코드",
          },
          {
            id: "intermediary_bank_code",
            name: "intermediaryBankCode",
            type: "text",
            label: "중계은행코드 (INTERMEDIARY BANK)",
            x: 200,
            y: 790,
            width: 200,
            height: 25,
            required: false,
            placeholder: "중계은행 코드 (있는 경우)",
          },
          {
            id: "beneficiary_account_number",
            name: "beneficiaryAccountNumber",
            type: "text",
            label: "수취인 계좌번호 (BNF'S A/C No.)",
            x: 200,
            y: 820,
            width: 200,
            height: 25,
            required: true,
            placeholder: "수취인 계좌번호",
          },

          // === 받으실분 (Beneficiary Info) ===
          {
            id: "beneficiary_name",
            name: "beneficiaryName",
            type: "text",
            label: "성명 (Name)",
            x: 200,
            y: 860,
            width: 200,
            height: 25,
            required: true,
            placeholder: "수취인 이름",
          },
          {
            id: "relation_to_applicant",
            name: "relationToApplicant",
            type: "text",
            label: "신청인과의 관계 (RELATION TO APPLICANT)",
            x: 200,
            y: 890,
            width: 200,
            height: 25,
            required: true,
            placeholder: "신청인과의 관계",
          },
          {
            id: "beneficiary_address",
            name: "beneficiaryAddress",
            type: "text",
            label: "주소 (Address)",
            x: 200,
            y: 920,
            width: 300,
            height: 25,
            required: true,
            placeholder: "수취인 주소",
          },
          {
            id: "beneficiary_city",
            name: "beneficiaryCity",
            type: "text",
            label: "도시명(CITY)",
            x: 200,
            y: 950,
            width: 150,
            height: 25,
            required: true,
            placeholder: "수취인 도시",
          },
          {
            id: "beneficiary_country",
            name: "beneficiaryCountry",
            type: "text",
            label: "국가명(COUNTRY)",
            x: 200,
            y: 980,
            width: 150,
            height: 25,
            required: true,
            placeholder: "수취인 국가",
          },

          // === HAPPY E-MAIL 서비스 ===
          {
            id: "happy_email_service",
            name: "happyEmailService",
            type: "checkbox",
            label: "HAPPY E-MAIL 서비스 신청 (무료)",
            x: 150,
            y: 1010,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "beneficiary_email",
            name: "beneficiaryEmail",
            type: "text",
            label: "E-mail Address",
            x: 200,
            y: 1010,
            width: 200,
            height: 25,
            required: false,
            placeholder: "수취인 이메일 주소",
          },

          // === 송금 목적 ===
          {
            id: "payment_purpose",
            name: "paymentPurpose",
            type: "text",
            label: "송금 목적(송금사유)",
            x: 200,
            y: 1050,
            width: 400,
            height: 50,
            required: true,
            placeholder: "송금 목적을 상세히 입력하세요",
          },

          // === 적요 ===
          {
            id: "payment_details",
            name: "paymentDetails",
            type: "text",
            label: "적요(DETAILS OF PAYMENT)",
            x: 200,
            y: 1120,
            width: 400,
            height: 50,
            required: true,
            placeholder: "송금 상세 내용을 입력하세요",
          },

          // === 지정거래 자동연장 ===
          {
            id: "designated_item",
            name: "designatedItem",
            type: "text",
            label: "지정항목 (01)",
            x: 200,
            y: 1190,
            width: 100,
            height: 25,
            required: false,
            placeholder: "지정항목",
          },
          {
            id: "auto_extension_new",
            name: "autoExtensionNew",
            type: "checkbox",
            label: "신규",
            x: 150,
            y: 1220,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },
          {
            id: "auto_extension_change",
            name: "autoExtensionChange",
            type: "checkbox",
            label: "변경",
            x: 200,
            y: 1220,
            width: 20,
            height: 20,
            required: false,
            value: false,
          },

          // === 서명 섹션 ===
          {
            id: "account_holder_name",
            name: "accountHolderName",
            type: "text",
            label: "예금주명 (A/C HOLDER NAME)",
            x: 200,
            y: 1260,
            width: 200,
            height: 25,
            required: true,
            placeholder: "예금주명",
          },
          {
            id: "signature",
            name: "signature",
            type: "text",
            label: "서명 (SIGNATURE)",
            x: 200,
            y: 1290,
            width: 200,
            height: 25,
            required: true,
            placeholder: "서명 또는 인",
          },
          {
            id: "application_date_year",
            name: "applicationDateYear",
            type: "text",
            label: "신청일 (년)",
            x: 200,
            y: 1320,
            width: 60,
            height: 25,
            required: true,
            placeholder: "2024",
            maxLength: 4,
          },
          {
            id: "application_date_month",
            name: "applicationDateMonth",
            type: "text",
            label: "신청일 (월)",
            x: 270,
            y: 1320,
            width: 40,
            height: 25,
            required: true,
            placeholder: "12",
            maxLength: 2,
          },
          {
            id: "application_date_day",
            name: "applicationDateDay",
            type: "text",
            label: "신청일 (일)",
            x: 320,
            y: 1320,
            width: 40,
            height: 25,
            required: true,
            placeholder: "25",
            maxLength: 2,
          },
          {
            id: "applicant_name",
            name: "applicantName",
            type: "text",
            label: "신청인(Applicant) 이름",
            x: 200,
            y: 1350,
            width: 200,
            height: 25,
            required: true,
            placeholder: "신청인 이름",
          },
          {
            id: "applicant_signature",
            name: "applicantSignature",
            type: "text",
            label: "신청인(Applicant) 서명",
            x: 200,
            y: 1380,
            width: 200,
            height: 25,
            required: true,
            placeholder: "신청인 서명 또는 인",
          },
          {
            id: "agent_name",
            name: "agentName",
            type: "text",
            label: "대리인(Agent) 이름",
            x: 200,
            y: 1410,
            width: 200,
            height: 25,
            required: false,
            placeholder: "대리인 이름 (있는 경우)",
          },
          {
            id: "agent_signature",
            name: "agentSignature",
            type: "text",
            label: "대리인(Agent) 서명",
            x: 200,
            y: 1440,
            width: 200,
            height: 25,
            required: false,
            placeholder: "대리인 서명 또는 인",
          },
          {
            id: "agent_id_number",
            name: "agentIdNumber",
            type: "text",
            label: "대리인 실명번호 (AGENT I.D. NO)",
            x: 200,
            y: 1470,
            width: 200,
            height: 25,
            required: false,
            placeholder: "대리인 실명번호 (있는 경우)",
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
      const containerWidth = container.clientWidth - 40; // 패딩 고려
      const containerHeight = container.clientHeight - 40;

      // 사용자가 설정한 scale을 우선 사용
      const userScale = scale;

      // PDF 비율 유지하면서 사용자 scale 적용
      const pageViewport = page.getViewport({ scale: 1.0 });
      const baseScale = Math.min(
        containerWidth / pageViewport.width,
        containerHeight / pageViewport.height
      );

      // 사용자 scale과 기본 scale을 곱해서 최종 scale 계산
      const finalScale = baseScale * userScale;

      const viewport = page.getViewport({ scale: finalScale });
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
      setCurrentScale(finalScale);

      console.log("✅ PDF 렌더링 완료:", {
        pageNum,
        userScale,
        finalScale,
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
    console.log("🔍 renderFormFields 호출됨:", {
      formFields,
      length: formFields?.length,
    });
    if (!formFields || formFields.length === 0) {
      console.log("❌ formFields가 비어있음");
      return null;
    }

    // PDF 캔버스의 실제 위치와 크기 계산
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = canvas.parentElement.getBoundingClientRect();

    // PDF가 실제로 렌더링된 위치 계산
    const pdfLeft = canvasRect.left - containerRect.left;
    const pdfTop = canvasRect.top - containerRect.top;
    const pdfWidth = canvasRect.width;
    const pdfHeight = canvasRect.height;

    console.log("🔍 PDF 렌더링 위치:", {
      pdfLeft,
      pdfTop,
      pdfWidth,
      pdfHeight,
    });

    return formFields.map((field) => {
      // PDF 좌표를 화면 좌표로 변환
      // PDF의 원본 크기 대비 현재 렌더링 크기의 비율 계산
      const scaleX = pdfWidth / (currentScale * 595.28); // A4 너비 기준
      const scaleY = pdfHeight / (currentScale * 841.89); // A4 높이 기준

      // 입력필드의 실제 화면 위치 계산
      const screenX = pdfLeft + field.x * scaleX;
      const screenY = pdfTop + field.y * scaleY;
      const screenWidth = field.width * scaleX;
      const screenHeight = field.height * scaleY;

      console.log(`🔍 필드 ${field.label}:`, {
        원본: {
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
        },
        화면: {
          x: screenX,
          y: screenY,
          width: screenWidth,
          height: screenHeight,
        },
        스케일: { scaleX, scaleY },
      });

      return (
        <div
          key={field.id}
          style={{
            position: "absolute",
            left: `${screenX}px`,
            top: `${screenY}px`,
            width: `${screenWidth}px`,
            height: `${screenHeight}px`,
            border:
              field.type === "checkbox"
                ? "2px solid #2196F3"
                : field.autoDetected
                ? "2px dashed #FF6B35"
                : "2px solid #4CAF50",
            borderRadius: field.type === "checkbox" ? "2px" : "4px",
            backgroundColor:
              field.type === "checkbox"
                ? "rgba(33, 150, 243, 0.1)"
                : field.autoDetected
                ? "rgba(255, 107, 53, 0.15)"
                : "rgba(76, 175, 80, 0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.max(10, 12), // 고정 폰트 크기
            color:
              field.type === "checkbox"
                ? "#2196F3"
                : field.autoDetected
                ? "#FF6B35"
                : "#4CAF50",
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
          {editingField && editingField.id === field.id ? (
            // 편집 모드
            field.type === "checkbox" ? (
              <input
                type="checkbox"
                defaultChecked={
                  (fieldValues && fieldValues[field.id]) ||
                  localFieldValues[field.id] ||
                  field.value
                }
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
                onChange={(e) =>
                  handleFieldValueChange(field.id, e.target.checked)
                }
              />
            ) : (
              <input
                type="text"
                defaultValue={
                  (fieldValues && fieldValues[field.id]) ||
                  localFieldValues[field.id] ||
                  ""
                }
                placeholder={field.placeholder}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "transparent",
                  fontSize: Math.max(9, 11),
                  textAlign: "center",
                  outline: "none",
                  color: "#2E7D32",
                  fontWeight: "bold",
                }}
                onBlur={(e) => handleFieldValueChange(field.id, e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleFieldValueChange(field.id, e.target.value);
                  }
                }}
                autoFocus
              />
            )
          ) : field.type === "checkbox" ? (
            // 체크박스 표시
            <div
              style={{
                fontSize: "14px",
                textAlign: "center",
                color: field.type === "checkbox" ? "#2196F3" : "#4CAF50",
              }}
            >
              {(fieldValues && fieldValues[field.id]) ||
              localFieldValues[field.id]
                ? "☑"
                : "☐"}
            </div>
          ) : (fieldValues && fieldValues[field.id]) ||
            localFieldValues[field.id] ? (
            // 텍스트 값 표시
            <div
              style={{
                color: "#2E7D32",
                fontSize: Math.max(9, 11), // 고정 폰트 크기
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {(fieldValues && fieldValues[field.id]) ||
                localFieldValues[field.id]}
            </div>
          ) : (
            // 기본 라벨 표시
            <div
              style={{
                fontSize: Math.max(9, 11),
                textAlign: "center",
                color: field.type === "checkbox" ? "#2196F3" : "#4CAF50",
              }}
            >
              {field.label}
            </div>
          )}
        </div>
      );
    });
  };

  // 필드 클릭 핸들러
  const handleFieldClick = (field) => {
    console.log("🔍 PDF 필드 클릭됨:", field);
    setClickedField(field);
    setEditingField(field);

    if (onFieldClick) {
      onFieldClick(field);
    }
  };

  // 입력필드 값 변경 핸들러
  const handleFieldValueChange = (fieldId, value) => {
    setLocalFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setEditingField(null);
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

  // 외화송금신청서인 경우 HTML 폼 표시
  if (pdfUrl && pdfUrl.includes("외화송금신청서.pdf")) {
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
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <h3 style={{ color: "#2196F3", margin: 0 }}>
            📝 외화송금신청서 (HTML 폼)
          </h3>
          <p
            style={{
              color: "#666",
              margin: "0.5rem 0 0 0",
              fontSize: "0.9rem",
            }}
          >
            PDF 대신 인터랙티브한 HTML 폼을 사용합니다
          </p>
        </div>

        <ForeignCurrencyRemittanceForm
          onFormSubmit={(formData) => {
            console.log("📝 외화송금신청서 제출됨:", formData);
            // 여기에 제출 로직 추가
          }}
          initialData={fieldValues || {}}
        />
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

        {/* PDF 크기 조절 컨트롤 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: "bold", color: "#495057" }}>
            PDF 크기:
          </span>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🔍-
          </button>
          <span
            style={{
              minWidth: "50px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(3.0, scale + 0.1))}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🔍+
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
          border: "1px solid #dee2e6",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          minHeight: "800px",
          height: "auto",
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              margin: "0 auto",
              maxWidth: "95vw", // 화면 너비의 95%
              width: "auto",
              height: "auto", // 높이 자동 조정
            }}
          />

          {/* 입력필드 오버레이 - PDF 위치에 맞춰 배치 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none", // PDF 클릭 방지
            }}
          >
            {renderFormFields()}
          </div>
        </div>
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
