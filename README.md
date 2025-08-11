# 🏦 하나은행 스마트 금융 상담 시스템

실제 은행 창구와 동일한 경험을 제공하는 지능형 금융 상담 시스템입니다. 직원용 PC와 고객용 태블릿이 실시간으로 연동되어 seamless한 상담 서비스를 구현합니다.

![하나은행 로고](https://img.shields.io/badge/하나은행-00C73C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

## 📋 목차
- [✨ 주요 기능](#-주요-기능)
- [🛠️ 기술 스택](#️-기술-스택)
- [🚀 빠른 시작](#-빠른-시작)
- [📖 사용 방법](#-사용-방법)
- [🏗️ 시스템 구조](#️-시스템-구조)
- [📊 데이터베이스](#-데이터베이스)
- [🔧 개발 환경](#-개발-환경)
- [🤝 기여하기](#-기여하기)

## ✨ 주요 기능

### 🏛️ 실제 은행 창구 환경 구현
- **직원용 PC**: 고객 관리, 상품 탐색, 상담 진행
- **고객용 태블릿**: 실시간 정보 확인, 상품 상세보기
- **실시간 동기화**: Socket.IO를 통한 즉시 화면 연동

### 👥 고객 관리 시스템
- **OCR 신분증 인식**: 실제 신분증 스캔 (시뮬레이션)
- **테스트 고객 데이터**: 5명의 샘플 고객 제공
- **보유 상품 현황**: 예금, 적금, 대출 등 전체 포트폴리오 표시
- **자산/부채 요약**: 총 자산, 총 부채, 순자산 자동 계산

### 💰 금융 상품 관리
- **214개 실제 하나은행 상품**: JSON 데이터 기반
- **스마트 검색**: 상품명, 타입, 특징으로 필터링
- **상품 비교**: 최대 3개 상품 동시 비교
- **우대금리 표시**: 기존 고객 혜택 강조

### 🔄 실시간 상담 기능
- **화면 동기화**: 직원 PC에서 상품 선택 시 고객 태블릿에 즉시 표시
- **세션 관리**: 직원-고객 1:1 매칭 시스템
- **상담 히스토리**: 진행 상황 추적

## 🛠️ 기술 스택

### Backend
- **Node.js + Express.js**: RESTful API 서버
- **SQLite3**: 경량 데이터베이스
- **Socket.IO**: 실시간 양방향 통신
- **JWT**: 직원 인증 시스템
- **bcrypt**: 비밀번호 암호화

### Frontend
- **React 18**: 사용자 인터페이스
- **Styled Components**: CSS-in-JS 스타일링
- **Axios**: HTTP 클라이언트
- **Socket.IO Client**: 실시간 통신

### Database Schema
```sql
-- 직원 정보
employees (id, employee_id, name, password, position)

-- 고객 정보  
customers (customer_id, name, phone, age, address, income, assets)

-- 고객 보유 상품
customer_products (id, customer_id, product_name, balance, interest_rate)

-- 금융 상품
financial_products (id, product_name, product_type, interest_rate)

-- 상담 세션
consultation_sessions (id, session_id, employee_id, customer_id)
```

## 🚀 빠른 시작

### 자동 설치 및 실행 (권장)

#### Windows
```bash
# 저장소 클론
git clone https://github.com/your-username/hana-smart-consulting.git
cd hana-smart-consulting

# 자동 설치 및 실행
./setup.bat
```

#### macOS/Linux
```bash
# 저장소 클론
git clone https://github.com/your-username/hana-smart-consulting.git
cd hana-smart-consulting

# 자동 설치 및 실행
chmod +x setup.sh
./setup.sh
```

### 수동 설치

#### 1. 필수 요구사항
- **Node.js** 16.0 이상
- **npm** 8.0 이상

#### 2. 의존성 설치
```bash
# 서버 의존성 설치
cd server
npm install

# 클라이언트 의존성 설치  
cd ../client
npm install
```

#### 3. 데이터베이스 초기화
```bash
cd ../server/scripts
node initDatabase.js
node addCustomerProducts.js
node updateProductData.js
```

#### 4. 서버 실행
```bash
# 서버 시작 (포트 5000)
cd ../
node server.js
```

#### 5. 클라이언트 실행 (새 터미널)
```bash
# 클라이언트 시작 (포트 3000)
cd client
npm start
```

## 📖 사용 방법

### 1. 시스템 접속
- **직원용**: http://localhost:3000
- **고객 태블릿**: http://localhost:3000/tablet

### 2. 직원 로그인
```
ID: 1234
비밀번호: 1234
```

### 3. 고객 상담 시작
1. **고객 선택**: "🧪 테스트 고객 선택" 버튼 클릭
2. **고객 정보 확인**: 태블릿에서 고객 정보 자동 표시
3. **보유 상품 검토**: 기존 예금, 적금, 대출 현황 확인
4. **신규 상품 추천**: 상품 탐색에서 적합한 상품 선택
5. **상품 설명**: "📱 고객에게 보여주기" 버튼으로 태블릿 동기화

### 4. 테스트 고객 정보

| 고객명 | 나이 | 투자목적 | 순자산 | 특징 |
|--------|------|----------|--------|------|
| 김철수 | 35세 | 주택구매 | +2,860만원 | 안정적 자산 보유 |
| 이영희 | 28세 | 결혼자금 | +430만원 | 소액 대출 보유 |
| 박민수 | 42세 | 교육비 | -8,000만원 | 주택담보대출 보유 |
| 최지연 | 31세 | 노후준비 | +2,690만원 | 연금상품 가입 |
| 정태호 | 26세 | 창업자금 | -640만원 | 청년층 고객 |

## 🏗️ 시스템 구조

```
📁 프로젝트 구조
├── 📁 server/              # 백엔드 서버
│   ├── 📁 config/           # 데이터베이스 설정
│   ├── 📁 routes/           # API 라우터
│   ├── 📁 scripts/          # 데이터베이스 스크립트
│   ├── 📁 data/             # JSON 데이터 파일
│   └── server.js            # 메인 서버 파일
├── 📁 client/               # 프론트엔드
│   ├── 📁 public/           # 정적 파일
│   └── 📁 src/
│       ├── 📁 components/   # React 컴포넌트
│       │   ├── 📁 employee/ # 직원용 컴포넌트
│       │   └── 📁 customer/ # 고객용 컴포넌트
│       └── App.js           # 메인 앱 컴포넌트
├── setup.bat                # Windows 자동 설치
├── setup.sh                 # macOS/Linux 자동 설치
└── README.md
```

### 🔄 시스템 플로우
```mermaid
graph TD
    A[직원 로그인] --> B[고객 선택/OCR]
    B --> C[Socket.IO 세션 생성]
    C --> D[고객 태블릿 연결]
    D --> E[보유 상품 표시]
    E --> F[상품 탐색 및 추천]
    F --> G[실시간 화면 동기화]
    G --> H[상담 완료]
```

## 📊 데이터베이스

### 주요 테이블

#### 고객 보유 상품 (customer_products)
- 실제 은행 고객의 포트폴리오 시뮬레이션
- 예금, 적금, 대출 등 다양한 상품 유형
- 잔액, 금리, 만기일 등 상세 정보

#### 금융 상품 (financial_products)  
- 214개 실제 하나은행 상품 데이터
- 예금, 적금, 대출, 카드 등 전 상품군
- 금리, 가입조건, 우대혜택 포함

## 🔧 개발 환경

### 환경 변수 설정
```bash
# server/config.env (자동 생성됨)
PORT=5000
JWT_SECRET=hana_bank_smart_consulting_jwt_secret_key_2024
DB_PATH=./database.db
NODE_ENV=development
LOG_LEVEL=info
```

**⚠️ 보안 주의사항:**
- `config.env` 파일은 Git에 포함되지 않습니다
- 실제 운영환경에서는 `JWT_SECRET`을 반드시 변경하세요
- 데이터베이스 파일(`database.db`)도 Git에 포함되지 않습니다

### 개발 모드 실행
```bash
# 서버 개발 모드 (nodemon 사용)
cd server
npm run dev

# 클라이언트 개발 모드
cd client  
npm start
```

### API 엔드포인트

#### 인증
- `POST /api/auth/login` - 직원 로그인
- `GET /api/auth/verify` - 토큰 검증

#### 고객 관리
- `GET /api/customers/:id` - 고객 정보 조회
- `GET /api/customers/:id/products` - 고객 보유 상품 조회

#### 상품 관리
- `GET /api/products` - 전체 상품 조회
- `GET /api/products/search` - 상품 검색

#### OCR 시뮬레이션
- `POST /api/ocr/id-card` - 신분증 인식
- `GET /api/ocr/test-customers` - 테스트 고객 목록

## 🤝 기여하기

1. 저장소를 Fork합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- **코드 스타일**: Prettier + ESLint 설정 준수
- **커밋 메시지**: [Conventional Commits](https://www.conventionalcommits.org/) 형식
- **테스트**: 새 기능 추가 시 테스트 코드 작성

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **하나은행**: 실제 금융 상품 데이터 참조
- **React 커뮤니티**: 우수한 오픈소스 라이브러리 제공
- **Socket.IO 팀**: 실시간 통신 솔루션 제공

---

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 버그 리포트는 [Issues](https://github.com/your-username/hana-smart-consulting/issues) 페이지를 이용해 주세요.

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**