@echo off
echo 하나은행 스마트 상담 태블릿 앱 시작...
echo.

cd /d "C:\Users\ksh\Desktop\최종플젝_코포\TabletApp"

echo Metro 서버 시작 중...
start cmd /k "npx react-native start"

timeout /t 5

echo 안드로이드 앱 빌드 및 실행 중...
npx react-native run-android

pause
