@echo off
echo =======================================
echo     하나은행 스마트 상담 시스템
echo       초기 설정 및 의존성 설치
echo =======================================
echo.

echo [1/4] 시스템 요구사항 확인 중...
echo.

REM Java 확인
echo Java 버전 확인:
java -version
if %ERRORLEVEL% neq 0 (
    echo.
    echo [❌ 오류] Java가 설치되어 있지 않습니다.
    echo.
    echo Java 11 이상을 다운로드하여 설치해주세요:
    echo https://www.oracle.com/java/technologies/downloads/
    echo 또는
    echo https://openjdk.org/install/
    echo.
    pause
    exit /b 1
)

echo.
echo Node.js 버전 확인:
node --version
if %ERRORLEVEL% neq 0 (
    echo.
    echo [❌ 오류] Node.js가 설치되어 있지 않습니다.
    echo.
    echo Node.js 16 이상을 다운로드하여 설치해주세요:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo [✅ 확인] 시스템 요구사항을 만족합니다.
echo.

echo [2/4] 백엔드 의존성 설치 중...
echo.

if not exist "backend" (
    echo [❌ 오류] backend 폴더를 찾을 수 없습니다.
    pause
    exit /b 1
)

cd backend
echo Maven 의존성을 다운로드합니다... (시간이 걸릴 수 있습니다)
mvnw.cmd clean install -DskipTests
if %ERRORLEVEL% neq 0 (
    echo [❌ 오류] 백엔드 의존성 설치에 실패했습니다.
    pause
    exit /b 1
)

cd ..
echo [✅ 완료] 백엔드 의존성 설치 완료

echo.
echo [3/4] 프론트엔드 의존성 설치 중...
echo.

if not exist "client" (
    echo [❌ 오류] client 폴더를 찾을 수 없습니다.
    pause
    exit /b 1
)

cd client
echo npm 패키지를 설치합니다... (시간이 걸릴 수 있습니다)
npm install
if %ERRORLEVEL% neq 0 (
    echo [❌ 오류] 프론트엔드 의존성 설치에 실패했습니다.
    pause
    exit /b 1
)

cd ..
echo [✅ 완료] 프론트엔드 의존성 설치 완료

echo.
echo [4/4] 태블릿 앱 의존성 설치 중... (선택사항)
echo.

if exist "TabletApp" (
    cd TabletApp
    echo React Native 패키지를 설치합니다...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo [⚠️ 경고] 태블릿 앱 의존성 설치에 실패했습니다. (선택사항이므로 계속 진행)
    ) else (
        echo [✅ 완료] 태블릿 앱 의존성 설치 완료
    )
    cd ..
) else (
    echo [ℹ️ 정보] TabletApp 폴더가 없습니다. 건너뜁니다.
)

echo.
echo =======================================
echo           🎉 설치 완료! 🎉
echo =======================================
echo.
echo 다음 단계:
echo.
echo 1. 백엔드 서버 시작:
echo    start-backend.bat
echo.
echo 2. 프론트엔드 서버 시작 (새 터미널):
echo    start-frontend.bat
echo.
echo 3. 브라우저에서 접속:
echo    http://localhost:3000
echo.
echo =======================================
echo.
pause
