import React, { useState } from "react";
import styled from "styled-components";

// 실제 하나은행 자동이체 신청서 PDF와 100% 동일한 레이아웃
const FormContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: white;
  margin: 0 auto;
  padding: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: "Malgun Gothic", "맑은 고딕", sans-serif;
  font-size: 9pt;
  line-height: 1.2;
  overflow: hidden;
`;

// 상단 회색 헤더
const FormHeader = styled.div`
  background: #666666;
  color: white;
  text-align: center;
  font-size: 16pt;
  font-weight: bold;
  padding: 8px 0;
  margin: 0;
`;

// 메인 컨테이너
const MainContent = styled.div`
  padding: 10px;
`;

// 상단 안내문구
const InfoText = styled.div`
  font-size: 9pt;
  margin-bottom: 15px;
  line-height: 1.3;
`;

// 일반 테이블 스타일
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;

  td,
  th {
    border: 1px solid #000;
    padding: 3px 5px;
    font-size: 8pt;
    vertical-align: middle;
    line-height: 1.2;
  }

  th {
    background: #f0f0f0;
    font-weight: bold;
    text-align: center;
  }

  tbody tr:hover {
    background: rgba(0, 102, 204, 0.05);
  }
`;

// 클릭 가능한 입력 영역 표시
const ClickableInputArea = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 2px;
  min-height: 18px;

  &:hover {
    background: #e8f4fd;
    outline: 1px dashed #0066cc;
  }

  &.active {
    background: #d4edda;
    outline: 2px solid #28a745;
  }
`;

const ActualBankForm = ({ onFormComplete }) => {
  const [formData, setFormData] = useState({});
  const [activeField, setActiveField] = useState(null);

  // 입력란 클릭 시 태블릿으로 신호 전송
  const handleFieldClick = (fieldId, fieldLabel, fieldType = "text") => {
    setActiveField(fieldId);

    // STOMP WebSocket으로 태블릿에 입력 요청 전송
    if (window.stompClient && window.stompClient.connected) {
      window.stompClient.publish({
        destination: "/app/send-message",
        body: JSON.stringify({
          sessionId: "tablet_main", // 기본 태블릿 세션
          type: "FIELD_INPUT_REQUEST",
          field: {
            id: fieldId,
            label: fieldLabel,
            type: fieldType,
            currentValue: formData[fieldId] || "",
            placeholder: getPlaceholderForField(fieldId),
          },
        }),
      });

      console.log("필드 입력 요청 전송:", fieldId, fieldLabel);
    } else {
      console.log("STOMP 클라이언트가 연결되지 않음");
    }
  };

  // 태블릿에서 입력 완료 시 받는 데이터
  React.useEffect(() => {
    const handleStompMessage = (message) => {
      if (!message || !message.body) return;

      try {
        const data = JSON.parse(message.body);
        console.log("ActualBankForm 메시지 수신:", data);

        // receive-message 타입으로 래핑된 메시지 처리
        let messageData = data;
        if (data.type === "receive-message" && data.data) {
          messageData = data.data;
          console.log("ActualBankForm 래핑된 메시지 데이터:", messageData);
        }

        if (messageData.type === "field-input-completed") {
          console.log(
            "필드 입력 완료 처리:",
            messageData.fieldId,
            messageData.fieldValue
          );
          setFormData((prev) => ({
            ...prev,
            [messageData.fieldId]: messageData.fieldValue,
          }));
          setActiveField(null);
        }
      } catch (error) {
        console.error("메시지 파싱 오류:", error);
      }
    };

    // STOMP 구독 설정
    if (window.stompClient && window.stompClient.connected) {
      const subscription = window.stompClient.subscribe(
        "/topic/session/tablet_main",
        handleStompMessage
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, []);

  const getPlaceholderForField = (fieldId) => {
    const placeholders = {
      account_holder_name: "고객 성명을 입력해주세요",
      phone_number: "연락처를 입력해주세요 (예: 010-1234-5678)",
      withdrawal_account: "출금계좌번호를 입력해주세요",
      deposit_holder: "예금주명을 입력해주세요",
      deposit_account: "입금계좌번호를 입력해주세요",
      deposit_amount: "이체금액을 입력해주세요",
    };
    return placeholders[fieldId] || "정보를 입력해주세요";
  };

  return (
    <FormContainer>
      <FormHeader>자동이체 신청서</FormHeader>

      <MainContent>
        <InfoText>
          본인은 하나은행의 해당 자동이체 약관에 동의하여 다음과 같이
          신청합니다.
        </InfoText>

        {/* 상단 날짜 입력란 */}
        <Table style={{ marginBottom: "15px" }}>
          <tbody>
            <tr>
              <td
                style={{
                  width: "60px",
                  textAlign: "center",
                  background: "#f0f0f0",
                }}
              >
                20
              </td>
              <td style={{ width: "20px", textAlign: "center" }}>년</td>
              <td
                style={{
                  width: "40px",
                  textAlign: "center",
                  background: "#f0f0f0",
                }}
              >
                월
              </td>
              <td style={{ width: "20px", textAlign: "center" }}>일</td>
              <td style={{ width: "150px", border: "none" }}></td>
              <td
                style={{ width: "80px", textAlign: "center", fontSize: "7pt" }}
              >
                신청자
              </td>
              <td
                style={{ width: "80px", textAlign: "center", fontSize: "7pt" }}
              >
                담당
              </td>
              <td
                style={{ width: "80px", textAlign: "center", fontSize: "7pt" }}
              >
                영업점
              </td>
            </tr>
            <tr>
              <td colSpan="5" style={{ border: "none" }}></td>
              <td style={{ height: "25px" }}></td>
              <td style={{ height: "25px" }}></td>
              <td style={{ height: "25px" }}></td>
            </tr>
          </tbody>
        </Table>

        {/* 예금주 성명 */}
        <Table>
          <tbody>
            <tr>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                예금주 성명
              </td>
              <td style={{ width: "200px" }}>
                <ClickableInputArea
                  className={
                    activeField === "account_holder_name" ? "active" : ""
                  }
                  onClick={() =>
                    handleFieldClick(
                      "account_holder_name",
                      "예금주 성명",
                      "text"
                    )
                  }
                >
                  {formData.account_holder_name || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                연락처
              </td>
              <td>
                <ClickableInputArea
                  className={activeField === "phone_number" ? "active" : ""}
                  onClick={() =>
                    handleFieldClick("phone_number", "연락처", "tel")
                  }
                >
                  {formData.phone_number || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
            </tr>
          </tbody>
        </Table>

        <Table>
          <tbody>
            <tr>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                출금계좌번호
              </td>
              <td style={{ padding: "2px 5px", fontSize: "7pt" }}>
                ※ 작성하실때는 입금할 거래은행의 지점번호까지 기재하여 주시기
                바랍니다.
              </td>
            </tr>
          </tbody>
        </Table>

        {/* 출금계좌 정보 */}
        <Table>
          <tbody>
            <tr>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                출금계좌
              </td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                은행
              </td>
              <td style={{ width: "40px", textAlign: "center" }}>하나</td>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                계좌번호
              </td>
              <td style={{ width: "150px" }}>
                <ClickableInputArea
                  className={
                    activeField === "withdrawal_account" ? "active" : ""
                  }
                  onClick={() =>
                    handleFieldClick(
                      "withdrawal_account",
                      "출금계좌번호",
                      "text"
                    )
                  }
                >
                  {formData.withdrawal_account || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                예금주
              </td>
              <td>
                <ClickableInputArea
                  className={
                    activeField === "withdrawal_holder" ? "active" : ""
                  }
                  onClick={() =>
                    handleFieldClick(
                      "withdrawal_holder",
                      "출금계좌 예금주",
                      "text"
                    )
                  }
                >
                  {formData.withdrawal_holder || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
            </tr>
          </tbody>
        </Table>

        {/* 입금계좌 정보 */}
        <Table>
          <tbody>
            <tr>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                입금계좌
              </td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                은행
              </td>
              <td style={{ width: "100px" }}>
                <ClickableInputArea
                  className={activeField === "deposit_bank" ? "active" : ""}
                  onClick={() =>
                    handleFieldClick("deposit_bank", "입금은행", "text")
                  }
                >
                  {formData.deposit_bank || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                계좌번호
              </td>
              <td style={{ width: "150px" }}>
                <ClickableInputArea
                  className={activeField === "deposit_account" ? "active" : ""}
                  onClick={() =>
                    handleFieldClick("deposit_account", "입금계좌번호", "text")
                  }
                >
                  {formData.deposit_account || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                예금주
              </td>
              <td>
                <ClickableInputArea
                  className={activeField === "deposit_holder" ? "active" : ""}
                  onClick={() =>
                    handleFieldClick(
                      "deposit_holder",
                      "입금계좌 예금주",
                      "text"
                    )
                  }
                >
                  {formData.deposit_holder || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
            </tr>
          </tbody>
        </Table>

        {/* 이체금액 */}
        <Table>
          <tbody>
            <tr>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                이체금액
              </td>
              <td style={{ width: "120px" }}>
                <ClickableInputArea
                  className={activeField === "deposit_amount" ? "active" : ""}
                  onClick={() =>
                    handleFieldClick("deposit_amount", "이체금액", "number")
                  }
                >
                  {formData.deposit_amount || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
              <td style={{ width: "20px", textAlign: "center" }}>원</td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                이체일자
              </td>
              <td
                style={{
                  width: "60px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                매월
              </td>
              <td style={{ width: "50px" }}>
                <ClickableInputArea
                  className={activeField === "transfer_date" ? "active" : ""}
                  onClick={() =>
                    handleFieldClick("transfer_date", "이체일자", "number")
                  }
                >
                  {formData.transfer_date || "클릭하여 입력"}
                </ClickableInputArea>
              </td>
              <td style={{ width: "20px", textAlign: "center" }}>일</td>
            </tr>
          </tbody>
        </Table>

        {/* 계좌정보 및 자동이체 */}
        <Table>
          <tbody>
            <tr>
              <td
                rowSpan="2"
                style={{
                  width: "15px",
                  background: "#f0f0f0",
                  textAlign: "center",
                  fontSize: "7pt",
                }}
              >
                계좌정보및
                <br />
                자동이체
              </td>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                □ 타행 자동이체
              </td>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                □ 당행 자동이체(일시정지)
              </td>
              <td
                style={{
                  width: "80px",
                  background: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                □ 하나 자동이체
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: "7pt", textAlign: "center" }}>
                신규(3개월 신규), 변경, 해지
              </td>
              <td style={{ fontSize: "7pt", textAlign: "center" }}>
                자동이체기간 만료후 중지 (3개월 미사용)
              </td>
              <td style={{ fontSize: "7pt", textAlign: "center" }}>
                수수료면제 좌수 (신규, 미사용)
              </td>
            </tr>
          </tbody>
        </Table>

        {/* 하단 하나은행 로고 */}
        <div
          style={{
            position: "relative",
            height: "40px",
            marginTop: "20px",
            borderTop: "1px solid #000",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 10px",
          }}
        >
          <div style={{ fontSize: "7pt" }}>
            (6자리간코드)1000-000-대출상황-영업점번호(2017.09)
            <br />
            업무자(주)하나은행(주) 1544
          </div>
          <div style={{ fontSize: "18pt", fontWeight: "bold" }}>
            📱 하나은행
          </div>
        </div>
      </MainContent>
    </FormContainer>
  );
};

export default ActualBankForm;
