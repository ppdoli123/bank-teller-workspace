@echo off
echo ================================
echo    하나은행 스마트 상담 시스템
echo     Spring Boot Backend 시작
echo ================================
echo.

REM Java 버전 확인
echo Java 버전 확인 중...
java -version
if %ERRORLEVEL% neq 0 (
    echo.
    echo [오류] Java가 설치되어 있지 않거나 PATH에 설정되지 않았습니다.
    echo Java 11 이상을 설치하고 환경변수를 설정해주세요.
    echo.
    pause
    exit /b 1
)

echo.
echo 백엔드 디렉토리로 이동 중...
if not exist "backend" (
    echo [오류] backend 폴더를 찾을 수 없습니다.
    echo 프로젝트 루트 디렉토리에서 실행해주세요.
    pause
    exit /b 1
)

cd backend

echo.
echo 포트 8080 사용 여부 확인 중...
netstat -ano | findstr :8080 > nul
if %ERRORLEVEL% equ 0 (
    echo [경고] 포트 8080이 이미 사용 중입니다.
    echo 다른 Spring Boot 서버가 실행 중일 수 있습니다.
    echo 계속하려면 아무 키나 누르세요...
    pause > nul
)

echo.
echo Maven Wrapper 권한 확인 중...
if not exist "mvnw.cmd" (
    echo [오류] mvnw.cmd 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

echo.
echo ===================================
echo  Spring Boot 서버를 시작합니다...
echo  포트: 8080
echo  중단하려면: Ctrl+C
echo ===================================
echo.

mvnw.cmd spring-boot:run

echo.
echo 서버가 종료되었습니다.
pause


