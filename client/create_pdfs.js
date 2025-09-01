const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const sampleFormsDir = path.join(__dirname, "public", "sample-forms");

// 디렉토리가 없으면 생성
if (!fs.existsSync(sampleFormsDir)) {
  fs.mkdirSync(sampleFormsDir, { recursive: true });
}

function createSamplePDF(filename, title, contentLines) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(path.join(sampleFormsDir, filename));
  doc.pipe(stream);

  // 제목
  doc.fontSize(24).font("Helvetica-Bold").text(title, 50, 100);

  // 내용
  doc.fontSize(12).font("Helvetica");
  let yPosition = 150;
  contentLines.forEach((line) => {
    if (line.trim() === "") {
      yPosition += 20;
    } else {
      doc.text(line, 50, yPosition);
      yPosition += 20;
    }
  });

  doc.end();
  return new Promise((resolve) => {
    stream.on("finish", () => {
      console.log(`Created: ${filename}`);
      resolve();
    });
  });
}

async function createAllPDFs() {
  // 대출신청서
  await createSamplePDF("loan-application.pdf", "대출신청서", [
    "신청인 성명: _________________",
    "주민등록번호: _________________",
    "연락처: _________________",
    "주소: _________________",
    "대출목적: _________________",
    "대출금액: _________________",
    "대출기간: _________________",
    "월소득: _________________",
    "직장구분: _________________",
    "직장명: _________________",
    "신청일자: _________________",
    "서명: _________________",
  ]);

  // 예금계좌개설신청서
  await createSamplePDF("savings-account.pdf", "예금계좌개설신청서", [
    "예금주 성명: _________________",
    "주민등록번호: _________________",
    "연락처: _________________",
    "주소: _________________",
    "계좌종류: _________________",
    "초기입금액: _________________",
    "이자율: _________________",
    "만기기간: _________________",
    "자동연장 동의: □",
    "신청일자: _________________",
    "서명: _________________",
  ]);

  // 개인정보동의서
  await createSamplePDF(
    "privacy-consent.pdf",
    "개인(신용)정보 수집·이용 동의서",
    [
      "고객명: _________________",
      "주민등록번호: _________________",
      "동의일자: _________________",
      "",
      "□ 개인정보 수집 및 이용에 동의합니다",
      "□ 마케팅 정보 수신에 동의합니다 (선택)",
      "",
      "서명: _________________",
    ]
  );

  // 대출계약서
  await createSamplePDF("loan-contract.pdf", "대출계약서", [
    "차주 성명: _________________",
    "대출금액: _________________",
    "연이자율: _________________",
    "대출기간: _________________",
    "월상환금액: _________________",
    "계약일자: _________________",
    "",
    "□ 계약 조건을 확인하고 동의합니다",
    "",
    "서명: _________________",
  ]);

  // 대출상환계획서
  await createSamplePDF("loan-repayment.pdf", "대출상환계획서", [
    "차주 성명: _________________",
    "잔여대출금: _________________",
    "상환방법: _________________",
    "월상환금액: _________________",
    "상환시작일: _________________",
    "",
    "□ 조기상환 시 수수료 면제 동의",
    "",
    "서명: _________________",
  ]);

  // 외화송금신청서
  await createSamplePDF("foreign-exchange.pdf", "외화송금신청서", [
    "송금인 성명: _________________",
    "주민등록번호: _________________",
    "수취인 성명: _________________",
    "수취은행: _________________",
    "수취계좌번호: _________________",
    "송금금액: _________________",
    "통화: _________________",
    "송금목적: _________________",
    "",
    "서명: _________________",
  ]);

  // 퇴직연금신청서
  await createSamplePDF(
    "retirement-pension.pdf",
    "퇴직연금 거래신청서(개인형IRP)",
    [
      "계좌주 성명: _________________",
      "주민등록번호: _________________",
      "계좌종류: _________________",
      "납입금액: _________________",
      "운용방식: _________________",
      "위험도: _________________",
      "",
      "서명: _________________",
    ]
  );

  console.log("모든 PDF 파일이 생성되었습니다.");
}

createAllPDFs().catch(console.error);

