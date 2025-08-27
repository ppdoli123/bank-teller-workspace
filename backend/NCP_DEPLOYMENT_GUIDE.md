# 네이버 클라우드 플랫폼 배포 가이드

## 사전 준비사항

### 1. 네이버 클라우드 플랫폼 설정
- [네이버 클라우드 플랫폼](https://www.ncloud.com/) 계정 생성
- 프로젝트 생성 및 프로젝트 ID 확인
- Container Registry 활성화
- Kubernetes Cluster 생성 (NKS)

### 2. 로컬 환경 설정
```bash
# Docker 설치 확인
docker --version

# kubectl 설치 확인
kubectl version --client

# 네이버 클라우드 CLI 설치 (선택사항)
# https://www.ncloud.com/guide/docs/ko/naver-cloud-cli
```

## 배포 단계

### 1. 설정 파일 수정

#### A. 프로젝트 ID 설정
`deploy-ncp.sh` 파일에서 실제 프로젝트 ID로 변경:
```bash
PROJECT_ID="your-actual-ncp-project-id"
```

#### B. Secrets 설정
`k8s/secrets.yaml` 파일에서 실제 값으로 변경:

```bash
# Base64 인코딩 예시
echo -n "your-database-url" | base64
echo -n "your-username" | base64
echo -n "your-password" | base64
echo -n "your-openai-api-key" | base64
echo -n "your-supabase-url" | base64
echo -n "your-supabase-key" | base64
```

### 2. 네이버 클라우드 인증

#### A. Container Registry 로그인
```bash
# 네이버 클라우드 콘솔에서 Container Registry 인증 정보 확인
docker login registry.ncloud.com
```

#### B. Kubernetes 클러스터 연결
```bash
# 네이버 클라우드 콘솔에서 kubeconfig 다운로드 후
kubectl config use-context your-cluster-context
```

### 3. 배포 실행

```bash
# 프로덕션 배포
cd backend
./deploy-ncp.sh production

# 또는 개발 환경
./deploy-ncp.sh development
```

### 4. 배포 확인

```bash
# Pod 상태 확인
kubectl get pods -l app=bank-teller-backend

# 서비스 상태 확인
kubectl get service bank-teller-backend-service

# 로그 확인
kubectl logs -f deployment/bank-teller-backend

# 배포 상태 확인
kubectl rollout status deployment/bank-teller-backend
```

## 환경 변수 설정

### 필수 환경 변수
- `DATABASE_URL`: PostgreSQL 데이터베이스 URL
- `DATABASE_USERNAME`: 데이터베이스 사용자명
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `OPENAI_API_KEY`: OpenAI API 키
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_KEY`: Supabase API 키

### 선택적 환경 변수
- `SPRING_PROFILES_ACTIVE`: Spring 프로필 (기본값: production)
- `SERVER_PORT`: 서버 포트 (기본값: 8080)

## 모니터링 및 로그

### 네이버 클라우드 콘솔
- [Application Load Balancer](https://console.ncloud.com/naver-service/application)
- [Container Registry](https://console.ncloud.com/naver-service/container)
- [Kubernetes Service](https://console.ncloud.com/naver-service/kubernetes)

### kubectl 명령어
```bash
# Pod 로그 확인
kubectl logs -f deployment/bank-teller-backend

# Pod 상세 정보
kubectl describe pod -l app=bank-teller-backend

# 서비스 엔드포인트 확인
kubectl get endpoints bank-teller-backend-service

# 리소스 사용량 확인
kubectl top pods -l app=bank-teller-backend
```

## 트러블슈팅

### 일반적인 문제들

#### 1. 이미지 풀 에러
```bash
# 이미지 태그 확인
docker images | grep bank-teller-backend

# 레지스트리 로그인 재확인
docker login registry.ncloud.com
```

#### 2. Pod 시작 실패
```bash
# Pod 이벤트 확인
kubectl describe pod -l app=bank-teller-backend

# 로그 확인
kubectl logs -l app=bank-teller-backend --previous
```

#### 3. 서비스 연결 문제
```bash
# 서비스 상태 확인
kubectl get service bank-teller-backend-service

# 엔드포인트 확인
kubectl get endpoints bank-teller-backend-service
```

## 비용 최적화

### 리소스 요청/제한 조정
`k8s/deployment.yaml`에서 리소스 설정 조정:
```yaml
resources:
  requests:
    memory: "256Mi"  # 최소 요청
    cpu: "100m"
  limits:
    memory: "512Mi"  # 최대 제한
    cpu: "250m"
```

### Replica 수 조정
트래픽에 따라 replica 수 조정:
```yaml
spec:
  replicas: 1  # 개발환경
  # replicas: 2  # 프로덕션
```

## 보안 고려사항

1. **Secrets 관리**: 민감한 정보는 Kubernetes Secrets 사용
2. **네트워크 정책**: 필요한 포트만 노출
3. **이미지 스캔**: Container Registry의 보안 스캔 활성화
4. **RBAC**: 적절한 권한 설정

## 백업 및 복구

### 데이터베이스 백업
```bash
# PostgreSQL 백업
pg_dump $DATABASE_URL > backup.sql

# 복구
psql $DATABASE_URL < backup.sql
```

### 설정 백업
```bash
# Kubernetes 리소스 백업
kubectl get all -l app=bank-teller-backend -o yaml > backup.yaml

# 복구
kubectl apply -f backup.yaml
```
