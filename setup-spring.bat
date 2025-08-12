@echo off
echo ========================================
echo 하나은행 스마트 금융 상담 시스템 설치 (Spring Boot)
echo ========================================
echo.

echo Java 버전 확인 중...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java가 설치되어 있지 않습니다.
    echo Java 17 이상을 설치해주세요.
    pause
    exit /b 1
)

echo.
echo [1단계] Spring Boot 백엔드 의존성 설치 중...
cd backend
call mvnw.cmd clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Spring Boot 백엔드 설치에 실패했습니다.
    pause
    exit /b 1
)

echo.
echo [2단계] React 클라이언트 의존성 설치 중...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: React 클라이언트 설치에 실패했습니다.
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo 설치가 완료되었습니다!
echo ========================================
echo.
echo 시스템을 시작하려면 다음 명령어를 실행하세요:
echo   Windows: start-spring.bat
echo   Mac/Linux: ./start-spring.sh
echo.
echo 테스트 계정:
echo - ID: 1234, PW: 1234 (김직원)
echo - ID: 1111, PW: 1111 (박상담사)
echo - ID: admin, PW: admin123 (관리자)
echo.
pause
