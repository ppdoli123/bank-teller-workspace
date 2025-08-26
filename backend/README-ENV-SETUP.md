# 🔧 환경변수 설정 가이드

Hana Smart Consulting Backend에서 OpenAI API를 사용하기 위한 환경변수 설정 방법입니다.

## 📋 설정 방법

### 방법 1: 환경변수 직접 설정 (권장)

```bash
# 터미널에서 환경변수 설정
export OPENAI_API_KEY="your_actual_openai_api_key_here"

# 백엔드 실행
cd backend
./mvnw spring-boot:run
```

### 방법 2: application-local.properties 파일 사용

1. `backend/application-local.properties` 파일을 복사하여 새 파일 생성:

```bash
cp backend/application-local.properties backend/application-dev.properties
```

2. `backend/application-dev.properties` 파일에서 실제 API 키로 변경:

```properties
openai.api.key=your_actual_openai_api_key_here
```

3. 프로필을 지정하여 실행:

```bash
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

### 방법 3: IntelliJ IDEA / Eclipse 사용 시

1. Run Configuration 설정
2. Environment Variables 탭
3. `OPENAI_API_KEY` = `your_actual_openai_api_key_here` 추가

## 🔍 API 키 확인 방법

OpenAI API 키는 다음에서 확인할 수 있습니다:

- [OpenAI Platform](https://platform.openai.com/api-keys)

## ✅ 설정 확인

서버 실행 후 다음 명령어로 API가 정상 작동하는지 확인:

```bash
# 헬스 체크
curl -X GET http://localhost:8080/health

# AI 질문 생성 테스트
curl -X POST http://localhost:8080/api/ai/questions \
  -H "Content-Type: application/json" \
  -d '{"customerId": "CUST-001", "customerSnapshotJson": "테스트 고객", "employeeNotes": "테스트 메모"}'
```

## 🚨 주의사항

- API 키는 절대 Git에 커밋하지 마세요!
- `.gitignore`에 환경변수 파일들이 추가되어 있습니다
- 실제 운영환경에서는 더 안전한 방법으로 API 키를 관리하세요

## 🔧 문제 해결

### API 키가 설정되지 않은 경우

- 로그에 "Error generating questions" 메시지가 나타남
- 기본 질문 목록이 반환됨

### 잘못된 API 키 설정 시

- OpenAI API 호출 시 401 Unauthorized 에러 발생

## 📞 도움이 필요한 경우

환경변수 설정에 문제가 있으면 `backend/env-setup.sh` 스크립트를 실행해보세요:

```bash
cd backend
./env-setup.sh
```

