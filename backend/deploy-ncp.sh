#!/bin/bash

# 네이버 클라우드 플랫폼 배포 스크립트
# 사용법: ./deploy-ncp.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="bank-teller-backend"
REGION="kr-standard-1"

# 네이버 클라우드 Container Registry 설정
# 실제 프로젝트 ID로 변경하세요
PROJECT_ID="your-ncp-project-id"
REGISTRY_URL="registry.ncloud.com/$PROJECT_ID"

echo "🚀 네이버 클라우드 플랫폼 배포 시작..."
echo "환경: $ENVIRONMENT"
echo "프로젝트: $PROJECT_NAME"
echo "리전: $REGION"
echo "레지스트리: $REGISTRY_URL"

# 1. Maven 빌드
echo "📦 Maven 빌드 중..."
cd backend
./mvnw clean package -DskipTests

# 2. Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드 중..."
docker build -t $PROJECT_NAME:$ENVIRONMENT .

# 3. 네이버 클라우드 Container Registry에 푸시
echo "📤 Container Registry에 푸시 중..."
docker tag $PROJECT_NAME:$ENVIRONMENT $REGISTRY_URL/$PROJECT_NAME:$ENVIRONMENT
docker push $REGISTRY_URL/$PROJECT_NAME:$ENVIRONMENT

# 4. Kubernetes 배포
if [ "$ENVIRONMENT" = "production" ]; then
    echo "☸️ Kubernetes 배포 중..."
    
    # Secrets 생성 (이미 존재하지 않는 경우)
    echo "🔐 Secrets 확인 중..."
    kubectl get secret db-secret >/dev/null 2>&1 || {
        echo "⚠️  db-secret이 존재하지 않습니다. k8s/secrets.yaml을 수정하고 적용하세요."
    }
    
    kubectl get secret openai-secret >/dev/null 2>&1 || {
        echo "⚠️  openai-secret이 존재하지 않습니다. k8s/secrets.yaml을 수정하고 적용하세요."
    }
    
    # Deployment 및 Service 적용
    kubectl apply -f k8s/deployment.yaml
    
    echo "⏳ 배포 상태 확인 중..."
    kubectl rollout status deployment/bank-teller-backend
    
    echo "🌐 서비스 정보:"
    kubectl get service bank-teller-backend-service
    
    echo "✅ 배포 완료!"
else
    echo "✅ 이미지 푸시 완료!"
fi

echo "🎉 배포가 성공적으로 완료되었습니다!"
echo "📊 모니터링: https://console.ncloud.com/naver-service/application"
echo "🔍 로그 확인: kubectl logs -f deployment/bank-teller-backend"
