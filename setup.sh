#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "================================================================"
echo "🏦 하나은행 스마트 금융 상담 시스템 - 자동 설치 스크립트"
echo "================================================================"
echo -e "${NC}"

# Node.js 설치 확인
echo -e "${BLUE}📋 시스템 요구사항 확인 중...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js가 설치되어 있습니다.${NC}"
    echo "   버전: $(node --version)"
else
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
    echo "   https://nodejs.org에서 Node.js를 다운로드하여 설치해주세요."
    exit 1
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm이 설치되어 있습니다.${NC}"
    echo "   버전: $(npm --version)"
else
    echo -e "${RED}❌ npm이 설치되지 않았습니다.${NC}"
    exit 1
fi
echo

# 기존 프로세스 종료
echo -e "${YELLOW}🔄 기존 Node.js 프로세스 종료 중...${NC}"
pkill -f "node.*server" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
echo -e "${GREEN}✅ 기존 프로세스 정리 완료${NC}"
echo

# 서버 의존성 설치
echo -e "${BLUE}📦 서버 의존성 설치 중...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    echo "   npm install 실행 중..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 서버 의존성 설치 완료${NC}"
    else
        echo -e "${RED}❌ 서버 의존성 설치 실패${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 서버 의존성이 이미 설치되어 있습니다.${NC}"
fi
echo

# 클라이언트 의존성 설치
echo -e "${BLUE}📦 클라이언트 의존성 설치 중...${NC}"
cd ../client
if [ ! -d "node_modules" ]; then
    echo "   npm install 실행 중..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 클라이언트 의존성 설치 완료${NC}"
    else
        echo -e "${RED}❌ 클라이언트 의존성 설치 실패${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 클라이언트 의존성이 이미 설치되어 있습니다.${NC}"
fi
echo

# 환경설정 파일 생성
echo -e "${BLUE}⚙️ 환경설정 파일 생성 중...${NC}"
cd ../server
if [ ! -f "config.env" ]; then
    cp config.env.example config.env
    echo -e "${GREEN}✅ config.env 파일 생성 완료${NC}"
else
    echo -e "${GREEN}✅ config.env 파일이 이미 존재합니다.${NC}"
fi

# 데이터베이스 초기화
echo -e "${PURPLE}🗄️ 데이터베이스 초기화 중...${NC}"
cd scripts

if [ ! -f "../database.db" ]; then
    echo "   데이터베이스 파일이 없습니다. 새로 생성합니다..."
    node initDatabase.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 기본 데이터베이스 생성 완료${NC}"
    else
        echo -e "${RED}❌ 데이터베이스 초기화 실패${NC}"
        exit 1
    fi
    
    echo "   고객 보유 상품 데이터 추가 중..."
    node addCustomerProducts.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 고객 보유 상품 데이터 추가 완료${NC}"
    else
        echo -e "${RED}❌ 고객 상품 데이터 추가 실패${NC}"
        exit 1
    fi
    
    echo "   금융 상품 데이터 업데이트 중..."
    node updateProductData.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 금융 상품 데이터 업데이트 완료${NC}"
    else
        echo -e "${RED}❌ 금융 상품 데이터 업데이트 실패${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 데이터베이스가 이미 존재합니다.${NC}"
fi
echo

# 서버 시작
echo -e "${CYAN}🚀 서버 시작 중... (포트 5000)${NC}"
cd ..

# macOS에서 새 터미널 창 열기
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && echo \"🏦 하나은행 서버 실행 중 (포트 5000)\" && node server.js"'
else
    # Linux에서 새 터미널 창 열기 (gnome-terminal 사용)
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="하나은행 서버" -- bash -c "cd $(pwd) && echo '🏦 하나은행 서버 실행 중 (포트 5000)' && node server.js; exec bash"
    else
        # 백그라운드에서 서버 실행
        nohup node server.js > server.log 2>&1 &
        echo "   서버가 백그라운드에서 실행됩니다. (로그: server.log)"
    fi
fi

echo "   서버 시작을 기다리는 중..."
sleep 5
echo

# 클라이언트 시작
echo -e "${CYAN}🌐 클라이언트 시작 중... (포트 3000)${NC}"
cd ../client

# macOS에서 새 터미널 창 열기
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && echo \"🌐 하나은행 클라이언트 실행 중 (포트 3000)\" && npm start"'
else
    # Linux에서 새 터미널 창 열기
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="하나은행 클라이언트" -- bash -c "cd $(pwd) && echo '🌐 하나은행 클라이언트 실행 중 (포트 3000)' && npm start; exec bash"
    else
        # 백그라운드에서 클라이언트 실행
        nohup npm start > client.log 2>&1 &
        echo "   클라이언트가 백그라운드에서 실행됩니다. (로그: client.log)"
    fi
fi

echo "   클라이언트 시작을 기다리는 중..."
sleep 8

# 브라우저 자동 열기
echo -e "${YELLOW}🌍 브라우저 자동 실행 중...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:3000"
    sleep 2
    open "http://localhost:3000/tablet"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000" &
        sleep 2
        xdg-open "http://localhost:3000/tablet" &
    fi
fi

echo
echo -e "${GREEN}"
echo "================================================================"
echo "🎉 하나은행 스마트 금융 상담 시스템 설치 및 실행 완료!"
echo "================================================================"
echo -e "${NC}"
echo -e "${BLUE}📋 접속 정보:${NC}"
echo "   • 직원용 PC: http://localhost:3000"
echo "   • 고객 태블릿: http://localhost:3000/tablet"
echo
echo -e "${YELLOW}👤 로그인 정보:${NC}"
echo "   • 직원 ID: 1234"
echo "   • 비밀번호: 1234"
echo
echo -e "${PURPLE}🧪 테스트 고객:${NC}"
echo "   • 김철수 (35세) - 주택구매 목적"
echo "   • 이영희 (28세) - 결혼자금 목적"
echo "   • 박민수 (42세) - 교육비 목적"
echo "   • 최지연 (31세) - 노후준비 목적"
echo "   • 정태호 (26세) - 창업자금 목적"
echo
echo -e "${RED}🔄 시스템 종료 시:${NC}"
echo "   pkill -f \"node.*server\" && pkill -f \"npm.*start\""
echo -e "${GREEN}================================================================${NC}"
echo
