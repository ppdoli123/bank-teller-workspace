// 서식별 필드 매핑 시스템
// 각 서식의 필드 ID와 라벨, 타입을 정의

export const FORM_FIELD_MAPPING = {
  // 개인정보 수집·이용 동의서
  consent: {
    formName: "개인정보 수집·이용 동의서",
    fields: {
      // 고유식별정보 동의
      unique_info_consent_yes: {
        label: "고유식별정보 수집·이용 동의함",
        type: "checkbox",
        category: "consent",
        required: true,
      },
      unique_info_consent_no: {
        label: "고유식별정보 수집·이용 동의하지 않음",
        type: "checkbox",
        category: "consent",
        required: true,
      },
      // 개인정보 동의
      personal_info_consent_yes: {
        label: "개인(신용)정보 수집·이용 동의함",
        type: "checkbox",
        category: "consent",
        required: true,
      },
      personal_info_consent_no: {
        label: "개인(신용)정보 수집·이용 동의하지 않음",
        type: "checkbox",
        category: "consent",
        required: true,
      },
      // 날짜 정보
      year: {
        label: "년도",
        type: "text",
        category: "date",
        placeholder: "YYYY",
        required: true,
      },
      month: {
        label: "월",
        type: "text",
        category: "date",
        placeholder: "MM",
        required: true,
      },
      day: {
        label: "일",
        type: "text",
        category: "date",
        placeholder: "DD",
        required: true,
      },
      // 본인 정보
      customer_name: {
        label: "본인 성명",
        type: "text",
        category: "personal",
        placeholder: "성명을 입력해주세요",
        required: true,
      },
      signature: {
        label: "본인 서명",
        type: "text",
        category: "personal",
        placeholder: "서명을 입력해주세요",
        required: true,
      },
      // 대리인 정보
      agent_name: {
        label: "대리인 성명",
        type: "text",
        category: "agent",
        placeholder: "대리인 성명을 입력해주세요",
        required: false,
      },
      agent_signature: {
        label: "대리인 서명",
        type: "text",
        category: "agent",
        placeholder: "대리인 서명을 입력해주세요",
        required: false,
      },
      // 법정대리인 정보
      father_name: {
        label: "부 성명",
        type: "text",
        category: "legal_guardian",
        placeholder: "부 성명을 입력해주세요",
        required: false,
      },
      mother_name: {
        label: "모 성명",
        type: "text",
        category: "legal_guardian",
        placeholder: "모 성명을 입력해주세요",
        required: false,
      },
      legal_guardian_name: {
        label: "법정대리인 성명",
        type: "text",
        category: "legal_guardian",
        placeholder: "법정대리인 성명을 입력해주세요",
        required: false,
      },
      legal_guardian_signature: {
        label: "법정대리인 서명",
        type: "text",
        category: "legal_guardian",
        placeholder: "법정대리인 서명을 입력해주세요",
        required: false,
      },
    },
  },

  // 은행거래신청서
  application: {
    formName: "은행거래신청서",
    fields: {
      // 고객 기본 정보
      customer_name: {
        label: "성명(업체명)",
        type: "text",
        category: "personal",
        placeholder: "성명 또는 업체명을 입력해주세요",
        required: true,
      },
      birth_date: {
        label: "생년월일(사업자번호)",
        type: "text",
        category: "personal",
        placeholder: "생년월일 또는 사업자번호를 입력해주세요",
        required: true,
      },
      english_name: {
        label: "영문명",
        type: "text",
        category: "personal",
        placeholder: "영문명을 입력해주세요",
        required: false,
      },
      phone: {
        label: "휴대폰",
        type: "text",
        category: "contact",
        placeholder: "휴대폰 번호를 입력해주세요",
        required: true,
      },
      email: {
        label: "이메일",
        type: "text",
        category: "contact",
        placeholder: "이메일 주소를 입력해주세요",
        required: false,
      },
      address: {
        label: "주소",
        type: "text",
        category: "contact",
        placeholder: "주소를 입력해주세요",
        required: true,
      },
      job: {
        label: "직업",
        type: "text",
        category: "personal",
        placeholder: "직업을 입력해주세요",
        required: false,
      },
      // 상품 정보
      product_name: {
        label: "상품명",
        type: "text",
        category: "product",
        placeholder: "상품명을 입력해주세요",
        required: true,
      },
      amount: {
        label: "가입금액(월부금)",
        type: "text",
        category: "product",
        placeholder: "가입금액 또는 월부금을 입력해주세요",
        required: true,
      },
      period: {
        label: "계약기간",
        type: "text",
        category: "product",
        placeholder: "계약기간을 입력해주세요",
        required: true,
      },
    },
  },
};

// 필드 ID로 필드 정보를 찾는 헬퍼 함수
export const getFieldInfo = (formType, fieldId) => {
  const form = FORM_FIELD_MAPPING[formType];
  if (!form) return null;
  return form.fields[fieldId] || null;
};

// 서식의 모든 필드 정보를 가져오는 헬퍼 함수
export const getFormFields = (formType) => {
  const form = FORM_FIELD_MAPPING[formType];
  if (!form) return [];
  return Object.entries(form.fields).map(([fieldId, fieldInfo]) => ({
    fieldId,
    ...fieldInfo,
  }));
};

// 중복 필드를 찾는 헬퍼 함수
export const findDuplicateFields = (fieldValues) => {
  const duplicates = {};
  const fieldMap = {};

  // 모든 서식의 필드를 순회하며 중복 찾기
  Object.values(FORM_FIELD_MAPPING).forEach((form) => {
    Object.entries(form.fields).forEach(([fieldId, fieldInfo]) => {
      const key = `${fieldInfo.label}_${fieldInfo.type}`;
      if (fieldMap[key]) {
        if (!duplicates[key]) {
          duplicates[key] = [fieldMap[key]];
        }
        duplicates[key].push({ fieldId, ...fieldInfo });
      } else {
        fieldMap[key] = { fieldId, ...fieldInfo };
      }
    });
  });

  return duplicates;
};

// 필드 값으로 중복 필드 자동 채우기
export const autoFillDuplicateFields = (fieldValues, newFieldId, newValue) => {
  const updatedValues = { ...fieldValues };

  // 같은 필드 ID를 가진 모든 필드에 값 적용 (라벨이 달라도 필드 ID가 같으면 같은 데이터)
  Object.values(FORM_FIELD_MAPPING).forEach((form) => {
    Object.entries(form.fields).forEach(([fieldId, info]) => {
      if (fieldId === newFieldId) {
        updatedValues[fieldId] = newValue;
        console.log(
          `🔄 자동 채우기: ${fieldId} = "${newValue}" (${info.label})`
        );
      }
    });
  });

  return updatedValues;
};
