@echo off
chcp 65001 >nul
echo.
echo ================================================================
echo 🏦 하나은행 스마트 금융 상담 시스템 - 자동 설치 스크립트
echo ================================================================
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 관리자 권한으로 실행 중입니다.
) else (
    echo ⚠️  관리자 권한이 필요할 수 있습니다.
)
echo.

REM Node.js 설치 확인
echo 📋 시스템 요구사항 확인 중...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js가 설치되어 있습니다.
    node --version
) else (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    https://nodejs.org에서 Node.js를 다운로드하여 설치해주세요.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ npm이 설치되어 있습니다.
    npm --version
) else (
    echo ❌ npm이 설치되지 않았습니다.
    pause
    exit /b 1
)
echo.

REM 기존 프로세스 종료
echo 🔄 기존 Node.js 프로세스 종료 중...
taskkill /f /im node.exe >nul 2>&1
echo ✅ 기존 프로세스 정리 완료
echo.

REM 서버 의존성 설치
echo 📦 서버 의존성 설치 중...
cd server
if not exist node_modules (
    echo    npm install 실행 중...
    npm install
    if %errorLevel% == 0 (
        echo ✅ 서버 의존성 설치 완료
    ) else (
        echo ❌ 서버 의존성 설치 실패
        pause
        exit /b 1
    )
) else (
    echo ✅ 서버 의존성이 이미 설치되어 있습니다.
)
echo.

REM 클라이언트 의존성 설치
echo 📦 클라이언트 의존성 설치 중...
cd ..\client
if not exist node_modules (
    echo    npm install 실행 중...
    npm install
    if %errorLevel% == 0 (
        echo ✅ 클라이언트 의존성 설치 완료
    ) else (
        echo ❌ 클라이언트 의존성 설치 실패
        pause
        exit /b 1
    )
) else (
    echo ✅ 클라이언트 의존성이 이미 설치되어 있습니다.
)
echo.

REM 환경설정 파일 생성
echo ⚙️ 환경설정 파일 생성 중...
cd ..\server
if not exist config.env (
    copy config.env.example config.env >nul
    echo ✅ config.env 파일 생성 완료
) else (
    echo ✅ config.env 파일이 이미 존재합니다.
)

REM 데이터베이스 초기화
echo 🗄️ 데이터베이스 초기화 중...
cd scripts

if not exist ..\database.db (
    echo    데이터베이스 파일이 없습니다. 새로 생성합니다...
    node initDatabase.js
    if %errorLevel% == 0 (
        echo ✅ 기본 데이터베이스 생성 완료
    ) else (
        echo ❌ 데이터베이스 초기화 실패
        pause
        exit /b 1
    )
    
    echo    고객 보유 상품 데이터 추가 중...
    node addCustomerProducts.js
    if %errorLevel% == 0 (
        echo ✅ 고객 보유 상품 데이터 추가 완료
    ) else (
        echo ❌ 고객 상품 데이터 추가 실패
        pause
        exit /b 1
    )
    
    echo    금융 상품 데이터 업데이트 중...
    node updateProductData.js
    if %errorLevel% == 0 (
        echo ✅ 금융 상품 데이터 업데이트 완료
    ) else (
        echo ❌ 금융 상품 데이터 업데이트 실패
        pause
        exit /b 1
    )
) else (
    echo ✅ 데이터베이스가 이미 존재합니다.
)
echo.

REM 서버 시작
echo 🚀 서버 시작 중... (포트 5000)
cd ..
start "하나은행 서버" cmd /k "echo 🏦 하나은행 서버 실행 중 (포트 5000) && node server.js"

REM 서버 시작 대기
echo    서버 시작을 기다리는 중...
timeout /t 5 /nobreak >nul
echo.

REM 클라이언트 시작
echo 🌐 클라이언트 시작 중... (포트 3000)
cd ..\client
start "하나은행 클라이언트" cmd /k "echo 🌐 하나은행 클라이언트 실행 중 (포트 3000) && npm start"

REM 브라우저 자동 열기
echo    클라이언트 시작을 기다리는 중...
timeout /t 8 /nobreak >nul

echo 🌍 브라우저 자동 실행 중...
start "" "http://localhost:3000"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/tablet"

echo.
echo ================================================================
echo 🎉 하나은행 스마트 금융 상담 시스템 설치 및 실행 완료!
echo ================================================================
echo.
echo 📋 접속 정보:
echo    • 직원용 PC: http://localhost:3000
echo    • 고객 태블릿: http://localhost:3000/tablet
echo.
echo 👤 로그인 정보:
echo    • 직원 ID: 1234
echo    • 비밀번호: 1234
echo.
echo 🧪 테스트 고객:
echo    • 김철수 (35세) - 주택구매 목적
echo    • 이영희 (28세) - 결혼자금 목적  
echo    • 박민수 (42세) - 교육비 목적
echo    • 최지연 (31세) - 노후준비 목적
echo    • 정태호 (26세) - 창업자금 목적
echo.
echo 🔄 시스템 종료 시: 열린 cmd 창들을 모두 닫아주세요.
echo ================================================================
echo.
pause
