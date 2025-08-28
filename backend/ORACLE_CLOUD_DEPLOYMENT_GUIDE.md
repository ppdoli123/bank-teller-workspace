# Oracle Cloud 배포 가이드

## 🚀 Oracle Cloud 배포 단계

### 1. Oracle Cloud 인스턴스 준비

1. **Oracle Cloud Console**에 로그인
2. **Compute > Instances**에서 새 인스턴스 생성
3. **Oracle Linux 8** 또는 **Ubuntu 20.04** 선택
4. **VM.Standard.A1.Flex** (ARM) 또는 **VM.Standard.E2.1.Micro** (x86) 선택
5. **Public IP** 할당
6. **Security List**에서 포트 8080, 22 열기

### 2. 서버 접속 및 환경 설정

```bash
# SSH로 서버 접속
ssh ubuntu@your-oracle-cloud-ip

# Java 17 설치
sudo apt update
sudo apt install openjdk-17-jdk -y

# Java 버전 확인
java -version

# 프로젝트 디렉토리 생성
mkdir -p /home/ubuntu/hana-bank-teller
cd /home/ubuntu/hana-bank-teller
```

### 3. Oracle DinkDB 설정

Oracle Cloud의 DinkDB를 사용하므로 별도의 데이터베이스 설치가 필요하지 않습니다.

**환경 변수 설정:**

```bash
# 환경 변수 파일 생성
nano /home/ubuntu/hana-bank-teller/.env

# 내용 추가
DATABASE_URL=jdbc:oracle:thin:@dinkdb_medium?TNS_ADMIN=/Users/user/Downloads/Wallet_DinkDB
DATABASE_USERNAME=내꺼
DATABASE_PASSWORD=내꺼
OPENAI_API_KEY=your-openai-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### 4. 프로젝트 파일 업로드

로컬에서 다음 명령어로 파일 업로드:

```bash
# JAR 파일과 설정 파일들 업로드
scp target/smart-consulting-1.0.0.jar ubuntu@your-oracle-cloud-ip:/home/ubuntu/hana-bank-teller/
scp application-production.properties ubuntu@your-oracle-cloud-ip:/home/ubuntu/hana-bank-teller/
scp deploy-oracle-cloud.sh ubuntu@your-oracle-cloud-ip:/home/ubuntu/hana-bank-teller/
```

### 5. 백엔드 서버 실행

```bash
# 서버에서 실행
cd /home/ubuntu/hana-bank-teller
chmod +x deploy-oracle-cloud.sh
./deploy-oracle-cloud.sh
```

### 6. 프론트엔드 설정 변경

클라이언트와 태블릿 앱의 API URL을 Oracle Cloud IP로 변경:

```javascript
// client/src/components/customer/CustomerTablet.js
const API_BASE_URL = "http://your-oracle-cloud-ip:8080/api";

// client/src/components/employee/EmployeeDashboard.js
const API_BASE_URL = "http://your-oracle-cloud-ip:8080/api";

// TabletApp/src/config/index.ts
export const API_BASE_URL = "http://your-oracle-cloud-ip:8080/api";
export const WS_URL = "ws://your-oracle-cloud-ip:8080/api/ws";
export const HTTP_WS_URL = "http://your-oracle-cloud-ip:8080/api/ws";
```

### 7. 백그라운드 실행 (systemd)

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/hana-bank-teller.service
```

서비스 파일 내용:

```ini
[Unit]
Description=Hana Bank Teller Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/hana-bank-teller
EnvironmentFile=/home/ubuntu/hana-bank-teller/.env
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production smart-consulting-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable hana-bank-teller
sudo systemctl start hana-bank-teller

# 상태 확인
sudo systemctl status hana-bank-teller
```

### 8. 방화벽 설정

```bash
# UFW 방화벽 설정
sudo ufw allow 22
sudo ufw allow 8080
sudo ufw enable
```

### 9. 로그 확인

```bash
# 실시간 로그 확인
sudo journalctl -u hana-bank-teller -f

# 최근 로그 확인
sudo journalctl -u hana-bank-teller -n 50
```

## 🔧 Oracle DinkDB 연결 확인

Oracle DinkDB 연결을 확인하려면:

```bash
# 연결 테스트
curl http://your-oracle-cloud-ip:8080/api/health

# 데이터베이스 연결 확인
curl http://your-oracle-cloud-ip:8080/api/customers/C001/products
```

## 📱 테스트

배포 완료 후 다음 URL들로 테스트:

- **백엔드 API**: `http://your-oracle-cloud-ip:8080/api/health`
- **고객 상품 조회**: `http://your-oracle-cloud-ip:8080/api/customers/C001/products`
- **WebSocket 연결**: `ws://your-oracle-cloud-ip:8080/api/ws`

## 🚨 문제 해결

### 포트 8080이 열리지 않는 경우

```bash
# Oracle Cloud Security List에서 포트 8080 추가
# 또는 iptables로 직접 설정
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

### Java 메모리 부족 오류

```bash
# JVM 힙 메모리 증가
java -Xmx1g -Xms512m -jar smart-consulting-1.0.0.jar
```

### Oracle DinkDB 연결 오류

```bash
# 환경 변수 확인
cat /home/ubuntu/hana-bank-teller/.env

# 네트워크 연결 확인
ping dinkdb_medium
```

### 로그 확인

```bash
# 애플리케이션 로그
tail -f /home/ubuntu/hana-bank-teller/application.log

# 시스템 로그
sudo journalctl -u hana-bank-teller -f
```

## 🎉 배포 완료!

Oracle Cloud에 성공적으로 배포되면:

- ✅ 안정적인 서버 환경
- ✅ 24/7 가동
- ✅ Oracle DinkDB 연결
- ✅ 로컬 환경 문제 해결
- ✅ 외부에서 접근 가능

이제 웹 클라이언트와 태블릿 앱에서 Oracle Cloud IP로 연결하여 테스트해보세요!
