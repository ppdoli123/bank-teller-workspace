#!/bin/bash

echo "🐳 Bank Teller Docker 환경 시작..."

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행되지 않았습니다. Docker를 시작해주세요."
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose down

# 이미지 빌드 및 컨테이너 시작
echo "🔨 이미지 빌드 및 컨테이너 시작 중..."
docker-compose up --build -d

# 컨테이너 상태 확인
echo "📊 컨테이너 상태 확인..."
docker-compose ps

echo "✅ Docker 환경이 시작되었습니다!"
echo "🌐 프론트엔드: http://localhost:3000"
echo "🔧 백엔드: http://localhost:8080"
echo "🗄️ 데이터베이스: localhost:5432"

echo ""
echo "📋 유용한 명령어:"
echo "  로그 확인: docker-compose logs -f"
echo "  컨테이너 중지: docker-compose down"
echo "  컨테이너 재시작: docker-compose restart"
