# 태블릿 앱 설치 및 실행 가이드

## 1. 개발 환경 요구사항

### 필수 소프트웨어
- **Node.js** v16 이상
- **Java Development Kit (JDK)** 11
- **Android Studio** (최신 버전)
- **Android SDK**

### 환경 변수 설정
```
ANDROID_HOME = C:\Users\[사용자명]\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-11.x.x
```

## 2. 프로젝트 설정

### 의존성 설치
```bash
cd TabletApp
npm install
```

### Android 에뮬레이터 설정
1. Android Studio 실행
2. AVD Manager 열기
3. 태블릿 에뮬레이터 생성 (Pixel C 또는 Nexus 9 추천)
4. API Level 28 이상 선택

## 3. 서버 연결 설정

### 로컬 개발용 (에뮬레이터)
- 서버 주소: `http://10.0.2.2:8080`
- WebSocket: `http://10.0.2.2:8080/websocket`

### 실제 디바이스용
1. `src/components/CustomerTablet.tsx` 파일 열기
2. 43번째 줄의 서버 주소를 실제 서버 IP로 변경:
```typescript
const socket = new SockJS('http://[서버IP]:8080/websocket');
```

## 4. 앱 실행

### 방법 1: 명령어 실행
```bash
# Metro 서버 시작
npm start

# 새 터미널에서 안드로이드 앱 실행
npm run android
```

### 방법 2: 배치 파일 실행
프로젝트 루트에서 `start-tablet-app.bat` 더블클릭

## 5. 빌드 및 배포

### 디버그 APK 생성
```bash
npm run build-android
```
생성된 파일: `android/app/build/outputs/apk/debug/app-debug.apk`

### 릴리즈 APK 생성
```bash
npm run build-release
```

## 6. 문제 해결

### 일반적인 오류들

#### Metro 서버 연결 오류
```bash
npx react-native start --reset-cache
```

#### 안드로이드 빌드 오류
```bash
npm run clean
npm run android
```

#### 네트워크 연결 오류
1. Android 에뮬레이터의 네트워크 설정 확인
2. 방화벽 설정 확인
3. 백엔드 서버 실행 상태 확인

### 디바이스별 설정

#### 실제 태블릿에서 테스트
1. 태블릿에서 USB 디버깅 활성화
2. 개발자 옵션에서 "USB 디버깅" 체크
3. USB로 연결 후 앱 실행

#### 네트워크 설정
- 태블릿과 개발 PC가 같은 네트워크에 있어야 함
- 서버 IP 주소를 태블릿에서 접근 가능한 주소로 설정

## 7. 배포된 앱 설치

### APK 파일로 설치
1. APK 파일을 태블릿으로 전송
2. 태블릿에서 "알 수 없는 소스" 허용
3. APK 파일 실행하여 설치

### USB로 직접 설치
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 8. 사용 방법

1. 앱 실행 후 "상담 시작하기" 버튼 터치
2. 고객 정보 입력 (성함, 연락처, 주민등록번호)
3. 행원의 서식 선택 대기
4. 서식 작성 및 전자 서명
5. 상담 완료

## 9. 주의사항

- 앱 실행 전 반드시 백엔드 서버가 실행 중이어야 함
- 네트워크 연결 상태 확인 필요
- 태블릿의 배터리 상태 및 저장 공간 확인

## 연락처
개발 관련 문의: [개발팀 연락처]
