@echo off
echo ================================
echo    하나은행 스마트 상담 시스템
echo      React Frontend 시작
echo ================================
echo.

REM Node.js 버전 확인
echo Node.js 버전 확인 중...
node --version
if %ERRORLEVEL% neq 0 (
    echo.
    echo [오류] Node.js가 설치되어 있지 않거나 PATH에 설정되지 않았습니다.
    echo Node.js 16 이상을 설치해주세요.
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo npm 버전 확인 중...
npm --version
if %ERRORLEVEL% neq 0 (
    echo [오류] npm을 찾을 수 없습니다.
    pause
    exit /b 1
)

echo.
echo 프론트엔드 디렉토리로 이동 중...
if not exist "client" (
    echo [오류] client 폴더를 찾을 수 없습니다.
    echo 프로젝트 루트 디렉토리에서 실행해주세요.
    pause
    exit /b 1
)

cd client

echo.
echo package.json 확인 중...
if not exist "package.json" (
    echo [오류] package.json 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

echo.
echo 포트 3000 사용 여부 확인 중...
netstat -ano | findstr :3000 > nul
if %ERRORLEVEL% equ 0 (
    echo [경고] 포트 3000이 이미 사용 중입니다.
    echo 다른 React 서버가 실행 중일 수 있습니다.
    echo 계속하려면 아무 키나 누르세요...
    pause > nul
)

echo.
echo node_modules 폴더 확인 중...
if not exist "node_modules" (
    echo [알림] node_modules가 없습니다. npm install을 실행합니다...
    echo.
    npm install
    if %ERRORLEVEL% neq 0 (
        echo [오류] npm install에 실패했습니다.
        pause
        exit /b 1
    )
) else (
    echo [확인] node_modules 폴더가 존재합니다.
)

echo.
echo 백엔드 서버 연결 확인 중...
ping -n 1 localhost > nul
if %ERRORLEVEL% equ 0 (
    echo [확인] localhost 연결 가능
) else (
    echo [경고] localhost 연결에 문제가 있을 수 있습니다.
)

echo.
echo ===================================
echo  React 개발 서버를 시작합니다...
echo  포트: 3000
echo  백엔드 API: http://localhost:8080
echo  중단하려면: Ctrl+C
echo ===================================
echo.
echo [중요] 브라우저가 자동으로 열리지 않으면
echo        http://localhost:3000 을 직접 입력하세요.
echo.

npm start

echo.
echo 서버가 종료되었습니다.
pause
