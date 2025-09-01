import React, { useState, useRef } from 'react';
import styled from 'styled-components';

// 정밀한 A4 크기 (실제 PDF와 동일)
const A4Container = styled.div`
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: 'Malgun Gothic', 'Dotum', Arial, sans-serif;
  font-size: 10px;
  line-height: 1.2;
  color: #000;
  overflow: hidden;
`;

// 정확한 위치 지정을 위한 절대 위치 컨테이너
const AbsoluteContainer = styled.div`
  position: absolute;
  top: ${props => props.top || 0}mm;
  left: ${props => props.left || 0}mm;
  width: ${props => props.width || 'auto'}mm;
  height: ${props => props.height || 'auto'}mm;
  ${props => props.styles || ''}
`;

// 정밀한 텍스트 스타일링
const PreciseText = styled.div`
  font-size: ${props => props.fontSize || 10}px;
  font-weight: ${props => props.fontWeight || 'normal'};
  color: ${props => props.color || '#000'};
  text-align: ${props => props.textAlign || 'left'};
  line-height: ${props => props.lineHeight || 1.2};
  ${props => props.styles || ''}
`;

// 정밀한 입력 필드
const PreciseInput = styled.input`
  width: ${props => props.width || 100}%;
  height: ${props => props.height || 20}px;
  border: ${props => props.border || '1px solid #000'};
  background: ${props => props.background || 'transparent'};
  font-size: ${props => props.fontSize || 10}px;
  font-family: inherit;
  padding: ${props => props.padding || '2px 4px'};
  outline: none;
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

// 정밀한 체크박스
const PreciseCheckbox = styled.input`
  width: ${props => props.size || 12}px;
  height: ${props => props.size || 12}px;
  margin: 0;
  vertical-align: middle;
`;

// 정밀한 테이블
const PreciseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.fontSize || 9}px;
  ${props => props.styles || ''}
`;

const PreciseTableCell = styled.td`
  border: ${props => props.border || '1px solid #000'};
  padding: ${props => props.padding || '3px 6px'};
  vertical-align: ${props => props.verticalAlign || 'middle'};
  text-align: ${props => props.textAlign || 'left'};
  background: ${props => props.background || 'transparent'};
  ${props => props.styles || ''}
`;

// 정밀한 서명 필드
const PreciseSignature = styled.div`
  width: ${props => props.width || 100}%;
  height: ${props => props.height || 40}px;
  border: ${props => props.border || '1px dashed #666'};
  background: ${props => props.background || '#fafafa'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${props => props.fontSize || 9}px;
  color: #666;
  
  &:hover {
    background: #f0f0f0;
  }
`;

// 정밀한 박스 (원금 손실가능 상품 등)
const PreciseBox = styled.div`
  position: absolute;
  top: ${props => props.top || 0}mm;
  left: ${props => props.left || 0}mm;
  width: ${props => props.width || 40}mm;
  height: ${props => props.height || 15}mm;
  background: ${props => props.background || '#f0f0f0'};
  border: ${props => props.border || '1px solid #000'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.fontSize || 9}px;
  font-weight: ${props => props.fontWeight || 'bold'};
  text-align: center;
  padding: 2px;
`;

// 정밀한 라디오 버튼 그룹
const RadioGroup = styled.div`
  display: flex;
  gap: ${props => props.gap || 10}px;
  align-items: center;
`;

// 정밀한 라벨
const PreciseLabel = styled.label`
  font-size: ${props => props.fontSize || 9}px;
  font-weight: ${props => props.fontWeight || 'normal'};
  color: ${props => props.color || '#000'};
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

// 정밀한 PDF 렌더러 컴포넌트
const PrecisePDFRenderer = ({ formConfig, onFieldChange, formData = {} }) => {
  const [signatures, setSignatures] = useState({});

  // 필드 변경 핸들러
  const handleFieldChange = (fieldName, value) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value);
    }
  };

  // 서명 필드 핸들러
  const handleSignatureClick = (fieldName) => {
    if (window.stompClient && window.stompClient.connected) {
      window.stompClient.send("/app/requestSignature", {}, JSON.stringify({
        fieldName: fieldName,
        formId: formConfig.id
      }));
    }
    
    setSignatures(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // 퇴직연금 거래신청서 (개인형IRP) - 실제 PDF 기반 정밀 레이아웃
  const renderPensionForm = () => {
    return (
      <A4Container>
        {/* 상단 헤더 영역 */}
        <PreciseBox top={10} left={10} width={35} height={12} background="#e0e0e0">
          원금 손실가능 상품
        </PreciseBox>
        
        <PreciseText 
          top={12} left={50} 
          fontSize={8} 
          styles="position: absolute;"
        >
          ※ 편입하는 상품에 따라 원금손실가능
        </PreciseText>

        {/* 메인 제목 */}
        <PreciseText 
          top={25} left={0} width={210} 
          fontSize={16} fontWeight="bold" textAlign="center"
          styles="position: absolute;"
        >
          퇴직연금 거래신청서 (개인형IRP)
        </PreciseText>

        {/* 우측 상단 서명 영역 */}
        <PreciseText top={15} left={150} fontSize={9} styles="position: absolute;">
          본인확인
        </PreciseText>
        <PreciseSignature 
          top={20} left={150} width={15} height={8}
          styles="position: absolute;"
        />

        <PreciseText top={30} left={150} fontSize={9} styles="position: absolute;">
          판매직원
        </PreciseText>
        <PreciseSignature 
          top={35} left={150} width={15} height={8}
          styles="position: absolute;"
        />

        <PreciseText top={45} left={150} fontSize={9} styles="position: absolute;">
          담당
        </PreciseText>
        <PreciseSignature 
          top={50} left={150} width={15} height={8}
          styles="position: absolute;"
        />

        <PreciseText top={60} left={150} fontSize={9} styles="position: absolute;">
          책임자
        </PreciseText>
        <PreciseSignature 
          top={65} left={150} width={15} height={8}
          styles="position: absolute;"
        />

        {/* 전산인자란 */}
        <PreciseBox top={75} left={150} width={35} height={8} background="#f0f0f0">
          전산인자란
        </PreciseBox>

        {/* 1. 기본정보 섹션 */}
        <PreciseText 
          top={95} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          1. 기본정보
        </PreciseText>

        {/* 기본정보 테이블 */}
        <PreciseTable 
          top={105} left={10} width={190}
          styles="position: absolute;"
        >
          <tbody>
            <tr>
              <PreciseTableCell width="30%" padding="6px 8px">성명</PreciseTableCell>
              <PreciseTableCell width="70%" padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.customerName || ''}
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  placeholder="성명을 입력하세요"
                />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">생년월일</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PreciseInput width="30" placeholder="20" />
                  <span>년</span>
                  <PreciseInput width="20" placeholder="월" />
                  <span>월</span>
                  <PreciseInput width="20" placeholder="일" />
                  <span>일</span>
                </div>
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">휴대전화</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">이메일주소</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              </PreciseTableCell>
            </tr>
          </tbody>
        </PreciseTable>

        {/* 해피콜 방식 */}
        <PreciseText 
          top={165} left={10} 
          fontSize={10} fontWeight="bold"
          styles="position: absolute;"
        >
          해피콜 방식
        </PreciseText>

        <RadioGroup 
          top={175} left={10}
          styles="position: absolute;"
        >
          <PreciseLabel>
            <PreciseCheckbox 
              type="checkbox"
              checked={formData.happyCallPhone || false}
              onChange={(e) => handleFieldChange('happyCallPhone', e.target.checked)}
            />
            전화(휴대폰)
          </PreciseLabel>
          <PreciseLabel>
            <PreciseCheckbox 
              type="checkbox"
              checked={formData.happyCallOnline || false}
              onChange={(e) => handleFieldChange('happyCallOnline', e.target.checked)}
            />
            온라인(모바일 웹)
          </PreciseLabel>
        </RadioGroup>

        <PreciseText 
          top={185} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          ※ 일정횟수 이상 응답하지 않으시는 경우, 손님이 선택하지 않은 방식으로도 실시됩니다.
        </PreciseText>

        {/* 2. 신청구분 섹션 */}
        <PreciseText 
          top={205} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          2. 신청구분
        </PreciseText>

        {/* 신청 용도 */}
        <PreciseText 
          top={220} left={10} 
          fontSize={10}
          styles="position: absolute;"
        >
          신청 용도
        </PreciseText>

        <RadioGroup 
          top={230} left={10}
          styles="position: absolute;"
        >
          <PreciseLabel>
            <PreciseCheckbox 
              type="radio"
              name="applicationPurpose"
              checked={formData.applicationPurpose === 'retirement' || false}
              onChange={() => handleFieldChange('applicationPurpose', 'retirement')}
            />
            퇴직금용
          </PreciseLabel>
          <PreciseLabel>
            <PreciseCheckbox 
              type="radio"
              name="applicationPurpose"
              checked={formData.applicationPurpose === 'retirement_savings' || false}
              onChange={() => handleFieldChange('applicationPurpose', 'retirement_savings')}
            />
            퇴직금용+적립용
          </PreciseLabel>
        </RadioGroup>

        {/* 가입자격 */}
        <PreciseText 
          top={250} left={10} 
          fontSize={10}
          styles="position: absolute;"
        >
          가입자격
        </PreciseText>

        <PreciseText 
          top={260} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          [필수] 선택하신 가입자격 확인서류를 제출하셔야 합니다(당행 퇴직연금 가입자 제외).
        </PreciseText>

        {/* 가입자격 체크박스들 */}
        <div style={{ position: 'absolute', top: '275mm', left: '10mm', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm' }}>
          {[
            '당행 퇴직연금 가입자',
            '타금융기관 퇴직연금 가입자',
            '직역연금가입자(공무원,사학,군인,별정우체국)',
            '근로기간 1년미만 근로자',
            '1주 15시간 미만 근로자',
            '퇴직금제도 적용 근로자',
            '자영업자'
          ].map((item, index) => (
            <PreciseLabel key={index} fontSize={8}>
              <PreciseCheckbox 
                type="checkbox"
                checked={formData[`eligibility_${index}`] || false}
                onChange={(e) => handleFieldChange(`eligibility_${index}`, e.target.checked)}
              />
              {item}
            </PreciseLabel>
          ))}
        </div>

        {/* 납입한도 */}
        <PreciseText 
          top={320} left={10} 
          fontSize={10}
          styles="position: absolute;"
        >
          납입한도
        </PreciseText>

        <PreciseText 
          top={330} left={10} 
          fontSize={9} fontWeight="bold"
          styles="position: absolute;"
        >
          *전금융기관 연금계좌 합산 연간 1,800만원까지 납입 가능
        </PreciseText>

        <PreciseText 
          top={340} left={10} 
          fontSize={9} fontWeight="bold"
          styles="position: absolute;"
        >
          [확인사항]
        </PreciseText>

        <PreciseText 
          top={350} left={10} 
          fontSize={8}
          styles="position: absolute;"
        >
          ①세금우대 연금계좌 연간 납입한도는 1,800만원으로, 한도를 높게 설정할 경우에는 다른 세금우대 연금계좌 개설이 불가능할 수 있습니다.
        </PreciseText>

        <PreciseText 
          top={360} left={10} 
          fontSize={8}
          styles="position: absolute;"
        >
          ②연금계좌 계약금액/한도 등을 확인하기 위해 타금융기관 정보를 조회합니다.
        </PreciseText>

        <PreciseText 
          top={370} left={10} 
          fontSize={9}
          styles="position: absolute;"
        >
          연간납입한도
        </PreciseText>

        <div style={{ position: 'absolute', top: '370mm', left: '35mm', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <PreciseInput width="60" placeholder="금액 입력" />
          <span>원</span>
        </div>

        {/* 하단 푸터 */}
        <PreciseText 
          top={280} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          5-14-0020(3-1) (2025.07 개정)
        </PreciseText>

        <PreciseText 
          top={285} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          (보존년한 : 해지일로부터 10년)
        </PreciseText>

        <PreciseText 
          top={280} left={160} 
          fontSize={12} fontWeight="bold" color="#007bff"
          styles="position: absolute;"
        >
          하나은행
        </PreciseText>
      </A4Container>
    );
  };

  // 외환파생상품거래 헤지 수요 현황 및 거래 실행에 따른 확인서
  const renderDerivativeForm = () => {
    return (
      <A4Container>
        {/* 헤더 */}
        <PreciseText 
          top={15} left={10} 
          fontSize={12}
          styles="position: absolute;"
        >
          주식회사 하나은행
        </PreciseText>

        <PreciseInput 
          top={15} left={50} width={40} height={15}
          placeholder="지점/부"
          styles="position: absolute;"
        />

        <PreciseText 
          top={15} left={95} 
          fontSize={12}
          styles="position: absolute;"
        >
          지점/부 앞
        </PreciseText>

        <PreciseText 
          top={25} left={10} 
          fontSize={12}
          styles="position: absolute;"
        >
          ◆
        </PreciseText>

        <PreciseInput 
          top={25} left={20} width={15} height={15}
          placeholder=""
          styles="position: absolute;"
        />

        <PreciseText 
          top={25} left={40} 
          fontSize={12}
          styles="position: absolute;"
        >
          년 외환파생상품거래 헤지 수요 현황
        </PreciseText>

        <PreciseText 
          top={25} left={160} 
          fontSize={10}
          styles="position: absolute;"
        >
          (단위 : 천미불)
        </PreciseText>

        {/* 메인 제목 */}
        <PreciseText 
          top={40} left={0} width={210} 
          fontSize={14} fontWeight="bold" textAlign="center"
          styles="position: absolute;"
        >
          외환파생상품거래 헤지 수요 현황 및 거래 실행에 따른 확인서
        </PreciseText>

        {/* 헤지 수요 현황 테이블 */}
        <PreciseTable 
          top={55} left={10} width={190}
          styles="position: absolute;"
        >
          <thead>
            <tr>
              <PreciseTableCell width="40%" background="#f0f0f0" fontWeight="bold">구분</PreciseTableCell>
              <PreciseTableCell width="30%" background="#f0f0f0" fontWeight="bold">금액</PreciseTableCell>
              <PreciseTableCell width="30%" background="#f0f0f0" fontWeight="bold">금액</PreciseTableCell>
              <PreciseTableCell width="20%" background="#f0f0f0" fontWeight="bold">비고</PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell fontSize={8} fontStyle="italic">(해당 □란에 체크)</PreciseTableCell>
              <PreciseTableCell fontSize={8} fontStyle="italic">수출(투자포함)</PreciseTableCell>
              <PreciseTableCell fontSize={8} fontStyle="italic">수입(조달포함)</PreciseTableCell>
              <PreciseTableCell fontSize={8} fontStyle="italic"></PreciseTableCell>
            </tr>
          </thead>
          <tbody>
            <tr>
              <PreciseTableCell>
                <PreciseLabel>
                  <PreciseCheckbox 
                    type="checkbox"
                    checked={formData.pastPerformance || false}
                    onChange={(e) => handleFieldChange('pastPerformance', e.target.checked)}
                  />
                  과거 수출입 실적기준
                </PreciseLabel>
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="금액 입력" />
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="금액 입력" />
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="비고" />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell>
                <PreciseLabel>
                  <PreciseCheckbox 
                    type="checkbox"
                    checked={formData.individualContract || false}
                    onChange={(e) => handleFieldChange('individualContract', e.target.checked)}
                  />
                  개별 계약건별 기준
                </PreciseLabel>
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="금액 입력" />
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="금액 입력" />
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="비고" />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell>
                <PreciseLabel>
                  <PreciseCheckbox 
                    type="checkbox"
                    checked={formData.other || false}
                    onChange={(e) => handleFieldChange('other', e.target.checked)}
                  />
                  기타 (향후 예상 경상/재무거래 등)
                </PreciseLabel>
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="금액 입력" />
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="금액 입력" />
              </PreciseTableCell>
              <PreciseTableCell>
                <PreciseInput width="100%" placeholder="비고" />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell background="#e8f4f8" fontWeight="bold">
                헤지대상 금액 합계<br />
                (헤지비율 분모에 해당)
              </PreciseTableCell>
              <PreciseTableCell background="#e8f4f8">
                <PreciseInput width="100%" placeholder="합계" readOnly />
              </PreciseTableCell>
              <PreciseTableCell background="#e8f4f8">
                <PreciseInput width="100%" placeholder="합계" readOnly />
              </PreciseTableCell>
              <PreciseTableCell background="#e8f4f8">
                <PreciseInput width="100%" placeholder="비고" />
              </PreciseTableCell>
            </tr>
          </tbody>
        </PreciseTable>

        {/* 하단 푸터 */}
        <PreciseText 
          top={280} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          5-09-0101(2-1) (2025.08 개정)
        </PreciseText>

        <PreciseText 
          top={285} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          (보존년한 : 완제일로부터 10년)
        </PreciseText>

        <PreciseText 
          top={280} left={160} 
          fontSize={12} fontWeight="bold" color="#007bff"
          styles="position: absolute;"
        >
          하나은행
        </PreciseText>
      </A4Container>
    );
  };

  // 개인신용정보 수집이용동의서
  const renderConsentForm = () => {
    return (
      <A4Container>
        {/* 메인 제목 */}
        <PreciseText 
          top={20} left={0} width={210} 
          fontSize={14} fontWeight="bold" textAlign="center"
          styles="position: absolute;"
        >
          [필수] 개인(신용)정보 수집 · 이용 동의서
        </PreciseText>

        <PreciseText 
          top={30} left={0} width={210} 
          fontSize={12} textAlign="center"
          styles="position: absolute;"
        >
          (비여신 금융거래)
        </PreciseText>

        <PreciseText 
          top={45} left={0} width={210} 
          fontSize={12} fontWeight="bold" textAlign="center"
          styles="position: absolute;"
        >
          주식회사 하나은행
        </PreciseText>

        {/* 동의 내용 */}
        <PreciseText 
          top={70} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          개인(신용)정보 수집·이용 동의
        </PreciseText>

        <PreciseText 
          top={85} left={10} 
          fontSize={10}
          styles="position: absolute;"
        >
          귀하는 개인(신용)정보 수집·이용에 관한 동의를 거부할 수 있습니다.
        </PreciseText>

        <PreciseText 
          top={95} left={10} 
          fontSize={10}
          styles="position: absolute;"
        >
          다만, 동의를 거부하시는 경우에는 비여신 금융거래 서비스 이용이 제한됩니다.
        </PreciseText>

        {/* 고객 정보 입력 */}
        <PreciseTable 
          top={120} left={10} width={190}
          styles="position: absolute;"
        >
          <tbody>
            <tr>
              <PreciseTableCell width="30%" padding="6px 8px">고객명</PreciseTableCell>
              <PreciseTableCell width="70%" padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.customerName || ''}
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  placeholder="고객명을 입력하세요"
                />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">주민등록번호</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.residentNumber || ''}
                  onChange={(e) => handleFieldChange('residentNumber', e.target.value)}
                  placeholder="000000-0000000"
                />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">연락처</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </PreciseTableCell>
            </tr>
          </tbody>
        </PreciseTable>

        {/* 수집·이용 목적 */}
        <PreciseText 
          top={180} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          수집·이용 목적
        </PreciseText>

        <div style={{ position: 'absolute', top: '195mm', left: '10mm' }}>
          {[
            '비여신 금융거래 서비스 제공',
            '고객 상담 및 민원처리',
            '법령상 의무이행',
            '금융사고 조사 및 분쟁해결'
          ].map((item, index) => (
            <PreciseLabel key={index} fontSize={10} style={{ display: 'block', marginBottom: '5px' }}>
              <PreciseCheckbox 
                type="checkbox"
                checked={formData[`purpose_${index}`] || false}
                onChange={(e) => handleFieldChange(`purpose_${index}`, e.target.checked)}
              />
              {item}
            </PreciseLabel>
          ))}
        </div>

        {/* 서명 및 날짜 */}
        <PreciseText 
          top={250} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          서명 및 날짜
        </PreciseText>

        <div style={{ position: 'absolute', top: '265mm', left: '10mm', display: 'flex', alignItems: 'center', gap: '20mm' }}>
          <div>
            <PreciseText fontSize={10}>서명</PreciseText>
            <PreciseSignature 
              width={40} height={15}
              onClick={() => handleSignatureClick('signature')}
            >
              {signatures.signature ? '✓ 서명 완료' : '클릭하여 서명'}
            </PreciseSignature>
          </div>
          <div>
            <PreciseText fontSize={10}>날짜</PreciseText>
            <PreciseInput width={40} height={15} placeholder="YYYY-MM-DD" />
          </div>
        </div>
      </A4Container>
    );
  };

  // 서식별 렌더링 분기
  const renderForm = () => {
    const filename = formConfig.filename;
    const title = formConfig.title;

    // 퇴직연금 거래신청서 (개인형IRP)
    if (filename === '5-14-0020.pdf' || title?.includes('퇴직연금 거래신청서')) {
      return renderPensionForm();
    }

    // 외환파생상품거래 헤지 수요 현황 및 거래 실행에 따른 확인서
    if (filename === '5-09-0101.pdf' || title?.includes('외환파생상품거래 헤지')) {
      return renderDerivativeForm();
    }

    // 개인신용정보 수집이용동의서
    if (filename === '3-08-1294.pdf' || title?.includes('개인(신용)정보 수집')) {
      return renderConsentForm();
    }

    // 기본 템플릿 (정밀한 기본 레이아웃)
    return (
      <A4Container>
        <PreciseText 
          top={20} left={0} width={210} 
          fontSize={16} fontWeight="bold" textAlign="center"
          styles="position: absolute;"
        >
          {formConfig.title || "서식 제목"}
        </PreciseText>

        <PreciseText 
          top={50} left={10} 
          fontSize={12}
          styles="position: absolute;"
        >
          주식회사 하나은행
        </PreciseText>

        <PreciseText 
          top={80} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          기본 정보
        </PreciseText>

        <PreciseTable 
          top={95} left={10} width={190}
          styles="position: absolute;"
        >
          <tbody>
            <tr>
              <PreciseTableCell width="30%" padding="6px 8px">고객명</PreciseTableCell>
              <PreciseTableCell width="70%" padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.customerName || ''}
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  placeholder="고객명을 입력하세요"
                />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">주민등록번호</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.residentNumber || ''}
                  onChange={(e) => handleFieldChange('residentNumber', e.target.value)}
                  placeholder="000000-0000000"
                />
              </PreciseTableCell>
            </tr>
            <tr>
              <PreciseTableCell padding="6px 8px">연락처</PreciseTableCell>
              <PreciseTableCell padding="6px 8px">
                <PreciseInput
                  width="100%"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </PreciseTableCell>
            </tr>
          </tbody>
        </PreciseTable>

        <PreciseText 
          top={180} left={10} 
          fontSize={12} fontWeight="bold"
          styles="position: absolute;"
        >
          서명 및 날짜
        </PreciseText>

        <div style={{ position: 'absolute', top: '195mm', left: '10mm', display: 'flex', alignItems: 'center', gap: '20mm' }}>
          <div>
            <PreciseText fontSize={10}>서명</PreciseText>
            <PreciseSignature 
              width={40} height={15}
              onClick={() => handleSignatureClick('signature')}
            >
              {signatures.signature ? '✓ 서명 완료' : '클릭하여 서명'}
            </PreciseSignature>
          </div>
          <div>
            <PreciseText fontSize={10}>날짜</PreciseText>
            <PreciseInput width={40} height={15} placeholder="YYYY-MM-DD" />
          </div>
        </div>

        <PreciseText 
          top={280} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          파일명: {formConfig.filename}
        </PreciseText>

        <PreciseText 
          top={285} left={10} 
          fontSize={8} color="#666"
          styles="position: absolute;"
        >
          카테고리: {formConfig.category}
        </PreciseText>

        <PreciseText 
          top={280} left={160} 
          fontSize={12} fontWeight="bold" color="#007bff"
          styles="position: absolute;"
        >
          하나은행
        </PreciseText>
      </A4Container>
    );
  };

  return renderForm();
};

export default PrecisePDFRenderer;



