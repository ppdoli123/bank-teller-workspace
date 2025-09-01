# 하나은행 서식 관리 시스템 가이드

## 개요

이 시스템은 하나은행의 424개 서식을 효율적으로 관리하고, PDF와 동일한 레이아웃으로 렌더링하며, 태블릿과 연동하여 대화형 서식 작성을 지원합니다.

## 주요 기능

### 1. 통합 서식 관리
- **424개 서식 자동 생성**: `complete_hana_forms.json`을 기반으로 모든 서식 설정을 자동 생성
- **카테고리별 분류**: 대출, 예금, 외환, 퇴직연금, 전자금융, 파생상품, 기타
- **검색 및 필터링**: 서식명, 설명 기반 검색 및 카테고리별 필터링

### 2. PDF 스타일 렌더링
- **실제 서식과 동일한 레이아웃**: A4 용지 크기 (210mm x 297mm)
- **정확한 폰트 및 스타일**: 맑은 고딕, 9pt 기본 폰트
- **테이블 기반 레이아웃**: 실제 서식과 동일한 테이블 구조

### 3. 태블릿 연동
- **WebSocket 통신**: STOMP 프로토콜을 통한 실시간 통신
- **필드별 입력 요청**: 클릭 시 태블릿으로 입력 요청 전송
- **실시간 데이터 동기화**: 태블릿에서 입력한 데이터 즉시 반영

### 4. 데이터 공유 시스템
- **공유 필드 매핑**: 동일한 정보가 여러 서식에서 사용될 때 자동 공유
- **실시간 업데이트**: 한 곳에서 입력한 정보가 관련 모든 서식에 자동 반영
- **공유 데이터 패널**: 우측 상단에 공유 데이터 관리 패널

## 시스템 구조

### 컴포넌트 구조
```
UnifiedFormManager (메인 관리자)
├── FormRenderer (서식 렌더러)
├── Sidebar (서식 목록)
└── SharedDataPanel (공유 데이터)

PDFFormManager (기존 관리자)
├── InteractiveFormDocument (기존 서식)
└── ActualBankForm (자동이체 신청서)
```

### 데이터 구조
```
hanaFormConfigs.js (기본 서식 설정)
├── auto_transfer (자동이체 신청서)
├── bank_transaction (은행거래신청서)
└── balance_certificate (예금잔액증명 의뢰서)

formDataGenerator.js (자동 생성 유틸리티)
├── generateAllFormConfigs() (424개 서식 생성)
├── generateSpecialFields() (서식별 특수 필드)
└── searchGeneratedForms() (검색 및 필터링)
```

## 사용 방법

### 1. 서식 선택
1. 왼쪽 사이드바에서 서식 카테고리 선택
2. 검색창에 서식명 입력하여 검색
3. 원하는 서식을 클릭하여 선택

### 2. 서식 작성
1. 서식에서 입력할 필드를 클릭
2. 태블릿에서 해당 정보 입력
3. 입력 완료 시 자동으로 서식에 반영

### 3. 공유 데이터 관리
1. 우측 상단 "공유데이터 보기" 버튼 클릭
2. 공유 데이터 패널에서 기본 정보 입력
3. 입력한 정보가 관련 모든 서식에 자동 반영

### 4. 서식 완료
1. 모든 필수 필드 입력 완료
2. "서식 완료" 버튼 클릭
3. 완료된 서식 데이터 저장

## 기술적 특징

### 1. 컴포넌트화
- **FormRenderer**: 범용 서식 렌더러 (모든 서식 지원)
- **UnifiedFormManager**: 통합 서식 관리자 (424개 서식 관리)
- **formDataGenerator**: 자동 서식 생성 유틸리티

### 2. 데이터 공유
```javascript
// 공유 필드 매핑
const sharedFieldMappings = {
  "customer_name": ["account_holder_name", "applicant_name", "customer_name"],
  "phone_number": ["phone_number", "applicant_phone", "contact_number"],
  "resident_number": ["resident_number", "applicant_id", "id_number"],
  "address": ["address", "customer_address", "residential_address"]
};
```

### 3. 자동 서식 생성
```javascript
// 카테고리별 템플릿 기반 자동 생성
const categoryTemplates = {
  "대출": { headerColor: "#666666", sharedFields: [...] },
  "예금": { headerColor: "#0066cc", sharedFields: [...] },
  // ...
};
```

## 확장 방법

### 1. 새로운 서식 추가
1. `complete_hana_forms.json`에 서식 정보 추가
2. `formDataGenerator.js`에서 카테고리별 템플릿 수정
3. 특수 필드가 필요한 경우 `generateSpecialFields()` 함수 수정

### 2. 새로운 필드 타입 추가
1. `FormRenderer.js`에서 새로운 필드 타입 렌더링 로직 추가
2. 태블릿 앱에서 해당 필드 타입 입력 UI 구현
3. WebSocket 메시지 타입 추가

### 3. 새로운 카테고리 추가
1. `categoryTemplates`에 새로운 카테고리 템플릿 추가
2. `formCategories`에 카테고리별 서식 ID 추가
3. UI에서 카테고리 필터 옵션 추가

## 성능 최적화

### 1. 지연 로딩
- 서식 설정은 필요할 때만 로드
- 대용량 서식 데이터는 청크 단위로 분할

### 2. 메모리 관리
- 사용하지 않는 서식 데이터는 자동 해제
- WebSocket 연결은 필요할 때만 활성화

### 3. 렌더링 최적화
- React.memo를 사용한 컴포넌트 최적화
- 불필요한 리렌더링 방지

## 문제 해결

### 1. 서식이 표시되지 않는 경우
- `complete_hana_forms.json` 파일이 올바른 위치에 있는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 2. 태블릿 연동이 안 되는 경우
- WebSocket 연결 상태 확인
- STOMP 클라이언트 초기화 확인
- 네트워크 연결 상태 확인

### 3. 데이터 공유가 안 되는 경우
- 공유 필드 매핑 설정 확인
- 필드 ID가 올바르게 설정되었는지 확인

## 향후 개선 계획

1. **AI 기반 자동 필드 매핑**: 서식 내용 분석을 통한 자동 필드 추출
2. **실시간 협업**: 여러 사용자가 동시에 서식 작성
3. **모바일 최적화**: 태블릿 앱 성능 개선
4. **오프라인 지원**: 네트워크 없이도 기본 기능 사용 가능
5. **다국어 지원**: 영어, 중국어 등 다국어 서식 지원

