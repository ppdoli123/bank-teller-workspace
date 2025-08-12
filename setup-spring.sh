#!/bin/bash

echo "========================================"
echo "하나은행 스마트 금융 상담 시스템 설치 (Spring Boot)"
echo "========================================"
echo

echo "Java 버전 확인 중..."
if ! java -version 2>&1 | grep -q "17\|18\|19\|20\|21"; then
    echo "ERROR: Java 17 이상이 필요합니다."
    echo "Java를 설치한 후 다시 시도해주세요."
    exit 1
fi

echo
echo "[1단계] Spring Boot 백엔드 의존성 설치 중..."
cd backend
chmod +x mvnw
./mvnw clean install -DskipTests
if [ $? -ne 0 ]; then
    echo "ERROR: Spring Boot 백엔드 설치에 실패했습니다."
    exit 1
fi

echo
echo "[2단계] React 클라이언트 의존성 설치 중..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: React 클라이언트 설치에 실패했습니다."
    exit 1
fi

cd ..

echo
echo "========================================"
echo "설치가 완료되었습니다!"
echo "========================================"
echo
echo "시스템을 시작하려면 다음 명령어를 실행하세요:"
echo "  ./start-spring.sh"
echo
echo "테스트 계정:"
echo "- ID: 1234, PW: 1234 (김직원)"
echo "- ID: 1111, PW: 1111 (박상담사)"
echo "- ID: admin, PW: admin123 (관리자)"
echo
