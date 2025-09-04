# 🐳 Docker 환경 가이드

이 가이드는 Bank Teller 프로젝트를 Docker를 사용하여 윈도우와 맥 간의 환경 차이 없이 실행하는 방법을 설명합니다.

## 📋 사전 요구사항

1. **Docker Desktop** 설치

   - [Windows용 Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
   - [Mac용 Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)

2. **Git** 설치 (코드 다운로드용)

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd bank-teller-workspace
```

### 2. Docker 환경 시작

**Windows:**

```cmd
start-docker.bat
```

**Mac/Linux:**

```bash
./start-docker.sh
```

### 3. 애플리케이션 접속

- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:8080
- **데이터베이스**: localhost:5432

## 🛠️ 수동 명령어

### 전체 환경 시작

```bash
docker-compose up --build -d
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 컨테이너 상태 확인

```bash
docker-compose ps
```

### 환경 중지

```bash
docker-compose down
```

### 데이터까지 완전 삭제

```bash
docker-compose down -v
```

## 🔧 개발 모드

### 백엔드 개발

```bash
# 백엔드만 재시작
docker-compose restart backend

# 백엔드 로그 실시간 확인
docker-compose logs -f backend
```

### 프론트엔드 개발

```bash
# 프론트엔드만 재시작
docker-compose restart frontend

# 프론트엔드 로그 실시간 확인
docker-compose logs -f frontend
```

## 🗄️ 데이터베이스 관리

### 데이터베이스 접속

```bash
docker-compose exec postgres psql -U postgres -d smart_consulting
```

### 데이터베이스 백업

```bash
docker-compose exec postgres pg_dump -U postgres smart_consulting > backup.sql
```

### 데이터베이스 복원

```bash
docker-compose exec -T postgres psql -U postgres -d smart_consulting < backup.sql
```

## 🐛 문제 해결

### 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
netstat -tulpn | grep :5432

# 프로세스 종료 후 Docker 재시작
docker-compose down
docker-compose up -d
```

### 컨테이너 재빌드

```bash
# 모든 이미지 재빌드
docker-compose build --no-cache

# 특정 서비스만 재빌드
docker-compose build --no-cache backend
```

### Docker 캐시 정리

```bash
# 사용하지 않는 이미지 삭제
docker image prune -f

# 모든 Docker 리소스 정리
docker system prune -f
```

## 📁 프로젝트 구조

```
bank-teller-workspace/
├── docker-compose.yml          # Docker Compose 설정
├── start-docker.sh            # 시작 스크립트 (Mac/Linux)
├── start-docker.bat           # 시작 스크립트 (Windows)
├── stop-docker.sh             # 중지 스크립트 (Mac/Linux)
├── stop-docker.bat            # 중지 스크립트 (Windows)
├── backend/
│   ├── Dockerfile             # 백엔드 Docker 이미지
│   └── .dockerignore          # 백엔드 Docker 제외 파일
├── client/
│   ├── Dockerfile             # 프론트엔드 Docker 이미지
│   ├── nginx.conf             # Nginx 설정
│   └── .dockerignore          # 프론트엔드 Docker 제외 파일
└── .dockerignore              # 루트 Docker 제외 파일
```

## 🔄 Git 워크플로우

### 1. 코드 변경 후

```bash
git add .
git commit -m "변경사항 설명"
git push origin main
```

### 2. 다른 환경에서 받기

```bash
git pull origin main
docker-compose down
docker-compose up --build -d
```

## 💡 팁

1. **개발 중**: 코드 변경 시 컨테이너가 자동으로 재시작됩니다.
2. **성능**: Docker Desktop의 리소스 할당을 충분히 설정하세요.
3. **보안**: 프로덕션 환경에서는 환경 변수와 시크릿을 별도로 관리하세요.

## 🆘 지원

문제가 발생하면 다음을 확인하세요:

1. Docker Desktop이 실행 중인지
2. 포트가 충돌하지 않는지
3. 충분한 디스크 공간이 있는지
4. 방화벽 설정이 올바른지
