@echo off
echo ========================================
echo 하나은행 스마트 금융 상담 시스템 (Spring Boot)
echo ========================================
echo.

echo [1단계] Spring Boot 서버 시작 중...
cd backend
start "Spring Boot Server" cmd /k "mvnw.cmd spring-boot:run"

timeout /t 10 /nobreak >nul

echo [2단계] React 클라이언트 시작 중...
cd ..\client
start "React Client" cmd /k "npm start"

echo.
echo 시스템이 시작되었습니다!
echo - Spring Boot 서버: http://localhost:8080
echo - React 클라이언트: http://localhost:3000
echo - 직원용 로그인: http://localhost:3000/employee/login
echo - 고객용 태블릿: http://localhost:3000/tablet
echo.
echo 종료하려면 각 터미널 창을 닫아주세요.
pause
