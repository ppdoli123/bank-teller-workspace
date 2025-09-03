import React, { useState } from "react";
import styled from "styled-components";

// 스타일드 컴포넌트 정의
const FormContainer = styled.div`
  background-color: #f0f2f5;
  font-family: "Malgun Gothic", "맑은 고딕", sans-serif;
  display: flex;
  justify-content: center;
  padding: 20px;
  font-size: 10px;
  min-height: 100vh;
`;

const FormWrapper = styled.div`
  width: 800px;
  min-height: 1131px;
  background-color: white;
  padding: 40px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #ccc;
`;

const PositionedElement = styled.div`
  position: absolute;
  margin: 0;
  padding: 0;
  line-height: 1.4;
`;

const MainTitle = styled.h1`
  font-size: 18px;
  font-weight: bold;
  position: absolute;
  top: 50px;
  left: 180px;
`;

const SubTitle = styled.p`
  font-size: 11px;
  position: absolute;
  top: 75px;
  left: 200px;
`;

const BankName = styled.p`
  font-size: 14px;
  position: absolute;
  top: 105px;
  left: 40px;
`;

const SectionTitle = styled.span`
  font-weight: bold;
  background-color: #e9e9e9;
  padding: 4px 8px;
  display: inline-block;
  border: 1px solid #ccc;
  border-bottom: 1px solid black;
`;

const FormInput = styled.input`
  position: absolute;
  border: none;
  border-bottom: 1px solid #999;
  padding: 2px;
  font-size: 10px;
  font-family: inherit;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid #2196f3;
  }
`;

const FormCheckbox = styled.input`
  position: absolute;
  width: 12px;
  height: 12px;
  cursor: pointer;
`;

const FormRadio = styled.input`
  position: absolute;
  width: 12px;
  height: 12px;
  cursor: pointer;
`;

const FormLabel = styled.label`
  position: absolute;
  font-size: 10px;
  cursor: pointer;
`;

const FormTable = styled.table`
  position: absolute;
  border-collapse: collapse;
  width: 100%;
`;

const TableCell = styled.td`
  border: 1px solid black;
  padding: 5px;
  vertical-align: top;
`;

const TitleCell = styled.td`
  background-color: #f2f2f2;
  text-align: center;
  font-weight: bold;
  width: 100px;
  border: 1px solid black;
  padding: 5px;
  vertical-align: top;
`;

const Disclaimer = styled.div`
  position: absolute;
  width: 720px;
  font-size: 9px;
  line-height: 1.5;
  color: #555;
`;

const SignatureSection = styled.div`
  position: absolute;
  text-align: center;
`;

const DateInput = styled.input`
  width: 40px;
  text-align: center;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 10px;

  &:focus {
    outline: none;
    border-bottom: 2px solid #2196f3;
  }
`;

const MonthInput = styled(DateInput)`
  width: 30px;
`;

const DayInput = styled(DateInput)`
  width: 30px;
`;

const SignatureInput = styled.input`
  width: 120px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 10px;

  &:focus {
    outline: none;
    border-bottom: 2px solid #2196f3;
  }
`;

const BankLogo = styled.img`
  position: absolute;
  width: 100px;
`;

const ForeignCurrencyRemittanceForm = ({ onFormSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // 송금방법
    method_ott: false,
    method_odt: false,
    method_dd: false,

    // 보내는 분
    name_eng: initialData.name_eng || "",
    name_kor: initialData.name_kor || "",
    id_no: initialData.id_no || "",
    address: initialData.address || "",
    account_no: initialData.account_no || "",

    // 송금액
    currency: initialData.currency || "",
    amount: initialData.amount || "",
    fee_separate: false,
    fee_deduct: false,
    charge_method: initialData.charge_method || "OUR",

    // 받으실 분
    swift_code: initialData.swift_code || "",
    bank_name_addr: initialData.bank_name_addr || "",
    beneficiary_acct: initialData.beneficiary_acct || "",
    beneficiary_name: initialData.beneficiary_name || "",
    beneficiary_addr: initialData.beneficiary_addr || "",

    // 송금 목적
    purpose: initialData.purpose || "",

    // 서명
    year: initialData.year || "",
    month: initialData.month || "",
    day: initialData.day || "",
    applicant_signature: initialData.applicant_signature || "",
    agent_signature: initialData.agent_signature || "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFormSubmit) {
      onFormSubmit(formData);
    }
    console.log("📝 외화송금신청서 제출:", formData);
  };

  return (
    <FormContainer>
      <FormWrapper>
        <form onSubmit={handleSubmit}>
          <MainTitle>외화송금신청서 (APPLICATION FOR REMITTANCE)</MainTitle>
          <SubTitle>
            (지급신청서 및 거래 외국환은행 지정, 송금정보 등록, 변경신청서 겸용)
          </SubTitle>
          <BankName>주식회사 하나은행 앞</BankName>

          {/* 송금방법 */}
          <PositionedElement style={{ top: "140px", left: "40px" }}>
            <SectionTitle>송금방법</SectionTitle>
          </PositionedElement>

          <div style={{ position: "relative" }}>
            <FormCheckbox
              type="checkbox"
              id="method_ott"
              checked={formData.method_ott}
              onChange={(e) =>
                handleInputChange("method_ott", e.target.checked)
              }
              style={{ top: "170px", left: "60px" }}
            />
            <FormLabel
              htmlFor="method_ott"
              style={{ top: "169px", left: "80px" }}
            >
              국외전신송금(OTT)
            </FormLabel>

            <FormCheckbox
              type="checkbox"
              id="method_odt"
              checked={formData.method_odt}
              onChange={(e) =>
                handleInputChange("method_odt", e.target.checked)
              }
              style={{ top: "170px", left: "210px" }}
            />
            <FormLabel
              htmlFor="method_odt"
              style={{ top: "169px", left: "230px" }}
            >
              국내전신송금(ODT)
            </FormLabel>

            <FormCheckbox
              type="checkbox"
              id="method_dd"
              checked={formData.method_dd}
              onChange={(e) => handleInputChange("method_dd", e.target.checked)}
              style={{ top: "170px", left: "360px" }}
            />
            <FormLabel
              htmlFor="method_dd"
              style={{ top: "169px", left: "380px" }}
            >
              송금수표 (D/D)
            </FormLabel>
          </div>

          {/* 보내는 분 */}
          <PositionedElement style={{ top: "220px", left: "40px" }}>
            <SectionTitle>보내는 분 (Applicant)</SectionTitle>
          </PositionedElement>

          <FormTable style={{ top: "250px", left: "40px", width: "720px" }}>
            <tbody>
              <tr>
                <TitleCell rowSpan="2">성명/상호</TitleCell>
                <TableCell>
                  <FormLabel style={{ width: "80px", display: "inline-block" }}>
                    영문(English)
                  </FormLabel>
                  <FormInput
                    type="text"
                    value={formData.name_eng}
                    onChange={(e) =>
                      handleInputChange("name_eng", e.target.value)
                    }
                    style={{
                      width: "500px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TableCell>
                  <FormLabel style={{ width: "80px", display: "inline-block" }}>
                    국문(Korean)
                  </FormLabel>
                  <FormInput
                    type="text"
                    value={formData.name_kor}
                    onChange={(e) =>
                      handleInputChange("name_kor", e.target.value)
                    }
                    style={{
                      width: "500px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TitleCell>주민(사업자)번호</TitleCell>
                <TableCell>
                  <FormInput
                    type="text"
                    value={formData.id_no}
                    onChange={(e) => handleInputChange("id_no", e.target.value)}
                    style={{
                      width: "250px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TitleCell>주소(Address)</TitleCell>
                <TableCell>
                  <FormInput
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    style={{
                      width: "600px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TitleCell>계좌번호(A/C No)</TitleCell>
                <TableCell>
                  <FormInput
                    type="text"
                    value={formData.account_no}
                    onChange={(e) =>
                      handleInputChange("account_no", e.target.value)
                    }
                    style={{
                      width: "250px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
            </tbody>
          </FormTable>

          {/* 송금액 */}
          <PositionedElement style={{ top: "400px", left: "40px" }}>
            <SectionTitle>송금액 (Amount)</SectionTitle>
          </PositionedElement>

          <FormTable style={{ top: "430px", left: "40px", width: "720px" }}>
            <tbody>
              <tr>
                <TitleCell>통화 및 금액</TitleCell>
                <TableCell>
                  <FormLabel>통화(CURRENCY)</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    style={{
                      width: "100px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                      marginRight: "20px",
                    }}
                  />
                  <FormLabel>금액(AMOUNT)</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    style={{
                      width: "200px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TitleCell>수수료 납부</TitleCell>
                <TableCell>
                  <FormCheckbox
                    type="checkbox"
                    id="fee_separate"
                    checked={formData.fee_separate}
                    onChange={(e) =>
                      handleInputChange("fee_separate", e.target.checked)
                    }
                    style={{ position: "static", marginRight: "5px" }}
                  />
                  <FormLabel
                    htmlFor="fee_separate"
                    style={{ position: "static" }}
                  >
                    수수료 별도납부
                  </FormLabel>

                  <FormCheckbox
                    type="checkbox"
                    id="fee_deduct"
                    checked={formData.fee_deduct}
                    onChange={(e) =>
                      handleInputChange("fee_deduct", e.target.checked)
                    }
                    style={{
                      position: "static",
                      marginLeft: "20px",
                      marginRight: "5px",
                    }}
                  />
                  <FormLabel
                    htmlFor="fee_deduct"
                    style={{ position: "static" }}
                  >
                    수수료차감후 송금
                  </FormLabel>
                </TableCell>
              </tr>
              <tr>
                <TitleCell>해외수수료 부담</TitleCell>
                <TableCell>
                  <FormRadio
                    type="radio"
                    name="charge_method"
                    id="charge_our"
                    value="OUR"
                    checked={formData.charge_method === "OUR"}
                    onChange={(e) =>
                      handleInputChange("charge_method", e.target.value)
                    }
                    style={{ position: "static", marginRight: "5px" }}
                  />
                  <FormLabel
                    htmlFor="charge_our"
                    style={{ position: "static" }}
                  >
                    송금인(OUR)
                  </FormLabel>

                  <FormRadio
                    type="radio"
                    name="charge_method"
                    id="charge_sha"
                    value="SHA"
                    checked={formData.charge_method === "SHA"}
                    onChange={(e) =>
                      handleInputChange("charge_method", e.target.value)
                    }
                    style={{
                      position: "static",
                      marginLeft: "20px",
                      marginRight: "5px",
                    }}
                  />
                  <FormLabel
                    htmlFor="charge_sha"
                    style={{ position: "static" }}
                  >
                    수취인(SHA)
                  </FormLabel>

                  <FormRadio
                    type="radio"
                    name="charge_method"
                    id="charge_ben"
                    value="BEN"
                    checked={formData.charge_method === "BEN"}
                    onChange={(e) =>
                      handleInputChange("charge_method", e.target.value)
                    }
                    style={{
                      position: "static",
                      marginLeft: "20px",
                      marginRight: "5px",
                    }}
                  />
                  <FormLabel
                    htmlFor="charge_ben"
                    style={{ position: "static" }}
                  >
                    수취인(BEN)
                  </FormLabel>
                </TableCell>
              </tr>
            </tbody>
          </FormTable>

          {/* 받으실 분 */}
          <PositionedElement style={{ top: "560px", left: "40px" }}>
            <SectionTitle>받으실 분 (Beneficiary)</SectionTitle>
          </PositionedElement>

          <FormTable style={{ top: "590px", left: "40px", width: "720px" }}>
            <tbody>
              <tr>
                <TitleCell rowSpan="2">
                  거래은행
                  <br />
                  (Beneficiary's Bank)
                </TitleCell>
                <TableCell>
                  <FormLabel
                    style={{ width: "120px", display: "inline-block" }}
                  >
                    은행코드(SWIFT BIC)
                  </FormLabel>
                  <FormInput
                    type="text"
                    value={formData.swift_code}
                    onChange={(e) =>
                      handleInputChange("swift_code", e.target.value)
                    }
                    style={{
                      width: "460px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TableCell>
                  <FormLabel
                    style={{ width: "120px", display: "inline-block" }}
                  >
                    은행명 및 지점, 주소
                  </FormLabel>
                  <FormInput
                    type="text"
                    value={formData.bank_name_addr}
                    onChange={(e) =>
                      handleInputChange("bank_name_addr", e.target.value)
                    }
                    style={{
                      width: "460px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TitleCell>계좌번호</TitleCell>
                <TableCell>
                  <FormInput
                    type="text"
                    value={formData.beneficiary_acct}
                    onChange={(e) =>
                      handleInputChange("beneficiary_acct", e.target.value)
                    }
                    style={{
                      width: "600px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TitleCell rowSpan="2">수취인 정보</TitleCell>
                <TableCell>
                  <FormLabel style={{ width: "80px", display: "inline-block" }}>
                    성명(Name)
                  </FormLabel>
                  <FormInput
                    type="text"
                    value={formData.beneficiary_name}
                    onChange={(e) =>
                      handleInputChange("beneficiary_name", e.target.value)
                    }
                    style={{
                      width: "500px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
              <tr>
                <TableCell>
                  <FormLabel style={{ width: "80px", display: "inline-block" }}>
                    주소(Address)
                  </FormLabel>
                  <FormInput
                    type="text"
                    value={formData.beneficiary_addr}
                    onChange={(e) =>
                      handleInputChange("beneficiary_addr", e.target.value)
                    }
                    style={{
                      width: "500px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
            </tbody>
          </FormTable>

          {/* 송금 목적 */}
          <PositionedElement style={{ top: "770px", left: "40px" }}>
            <SectionTitle>송금 목적 (Purpose of Payment)</SectionTitle>
          </PositionedElement>

          <FormTable style={{ top: "800px", left: "40px", width: "720px" }}>
            <tbody>
              <tr>
                <TitleCell>송금사유</TitleCell>
                <TableCell>
                  <FormInput
                    type="text"
                    value={formData.purpose}
                    onChange={(e) =>
                      handleInputChange("purpose", e.target.value)
                    }
                    style={{
                      width: "600px",
                      position: "static",
                      border: "none",
                      borderBottom: "1px solid #ccc",
                    }}
                  />
                </TableCell>
              </tr>
            </tbody>
          </FormTable>

          {/* 면책조항 */}
          <Disclaimer style={{ top: "860px", left: "40px" }}>
            <p>
              • 본인은 귀행의 영업점에 비치된 외환거래기본약관을 열람하고 그
              내용을 따를것을 확약하며 위와같이 송금을 신청합니다.
            </p>
            <p>
              • 신청한 송금이 세계 각국의 '자금세탁방지 및 테러자금조달차단'
              제도에 의하여 Monitoring 대상이 되는 경우 취급이 거절될 수
              있습니다.
            </p>
          </Disclaimer>

          {/* 서명 섹션 */}
          <SignatureSection
            style={{ top: "950px", left: "40px", width: "720px" }}
          >
            <p style={{ textAlign: "center" }}>위와 같이 송금을 신청합니다.</p>
          </SignatureSection>

          <div
            style={{
              position: "absolute",
              top: "1000px",
              left: "450px",
              textAlign: "right",
            }}
          >
            <p>
              <DateInput
                type="text"
                placeholder="년"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
              />{" "}
              년
              <MonthInput
                type="text"
                placeholder="월"
                value={formData.month}
                onChange={(e) => handleInputChange("month", e.target.value)}
              />{" "}
              월
              <DayInput
                type="text"
                placeholder="일"
                value={formData.day}
                onChange={(e) => handleInputChange("day", e.target.value)}
              />{" "}
              일
            </p>
            <p style={{ marginTop: "20px" }}>
              신청인(Applicant) :{" "}
              <SignatureInput
                type="text"
                value={formData.applicant_signature}
                onChange={(e) =>
                  handleInputChange("applicant_signature", e.target.value)
                }
              />{" "}
              (서명)
            </p>
            <p style={{ marginTop: "10px" }}>
              대리인(Agent) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
              <SignatureInput
                type="text"
                value={formData.agent_signature}
                onChange={(e) =>
                  handleInputChange("agent_signature", e.target.value)
                }
              />{" "}
              (서명)
            </p>
          </div>

          {/* 하나은행 로고 */}
          <BankLogo
            src="https://image.kebhana.com/cont/common/img/new-logo-h.png"
            alt="Hana Bank Logo"
            style={{ top: "1080px", left: "650px" }}
          />

          {/* 제출 버튼 */}
          <div
            style={{
              position: "absolute",
              top: "1100px",
              left: "40px",
              width: "720px",
              textAlign: "center",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px 30px",
                fontSize: "14px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📝 외화송금신청서 제출
            </button>
          </div>
        </form>
      </FormWrapper>
    </FormContainer>
  );
};

export default ForeignCurrencyRemittanceForm;
