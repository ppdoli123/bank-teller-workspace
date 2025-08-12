#!/bin/bash

echo "========================================"
echo "하나은행 스마트 금융 상담 시스템 (Spring Boot)"
echo "========================================"
echo

echo "[1단계] Spring Boot 서버 시작 중..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "Spring Boot 서버가 시작되었습니다 (PID: $BACKEND_PID)"
echo "10초 후 React 클라이언트를 시작합니다..."
sleep 10

echo "[2단계] React 클라이언트 시작 중..."
cd ../client
npm start &
FRONTEND_PID=$!

echo "React 클라이언트가 시작되었습니다 (PID: $FRONTEND_PID)"
echo
echo "시스템이 시작되었습니다!"
echo "- Spring Boot 서버: http://localhost:8080"
echo "- React 클라이언트: http://localhost:3000"
echo "- 직원용 로그인: http://localhost:3000/employee/login"
echo "- 고객용 태블릿: http://localhost:3000/tablet"
echo
echo "종료하려면 Ctrl+C를 누르세요."

# 종료 시 모든 프로세스 종료
trap "echo '시스템을 종료합니다...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 무한 대기
wait
