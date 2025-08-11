@echo off
chcp 65001 >nul
echo.
echo ================================================================
echo 🏦 하나은행 스마트 금융 상담 시스템 - 빠른 시작
echo ================================================================
echo.

REM 기존 프로세스 종료
echo 🔄 기존 프로세스 정리 중...
taskkill /f /im node.exe >nul 2>&1
echo ✅ 정리 완료
echo.

REM 서버 시작
echo 🚀 서버 시작 중...
cd server
start "하나은행 서버" cmd /k "echo 🏦 하나은행 서버 (포트 5000) && node server.js"
timeout /t 3 /nobreak >nul

REM 클라이언트 시작
echo 🌐 클라이언트 시작 중...
cd ..\client
start "하나은행 클라이언트" cmd /k "echo 🌐 하나은행 클라이언트 (포트 3000) && npm start"
timeout /t 5 /nobreak >nul

REM 브라우저 열기
echo 🌍 브라우저 실행 중...
start "" "http://localhost:3000"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/tablet"

echo.
echo ✅ 시스템 시작 완료!
echo    직원용: http://localhost:3000
echo    태블릿: http://localhost:3000/tablet
echo.
pause