#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "================================================================"
echo "🏦 하나은행 스마트 금융 상담 시스템 - 빠른 시작"
echo "================================================================"
echo -e "${NC}"

# 기존 프로세스 종료
echo -e "${BLUE}🔄 기존 프로세스 정리 중...${NC}"
pkill -f "node.*server" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
echo -e "${GREEN}✅ 정리 완료${NC}"
echo

# 서버 시작
echo -e "${BLUE}🚀 서버 시작 중...${NC}"
cd server

if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && echo \"🏦 하나은행 서버 (포트 5000)\" && node server.js"'
else
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="하나은행 서버" -- bash -c "cd $(pwd) && echo '🏦 하나은행 서버 (포트 5000)' && node server.js; exec bash"
    else
        nohup node server.js > server.log 2>&1 &
    fi
fi

sleep 3

# 클라이언트 시작
echo -e "${BLUE}🌐 클라이언트 시작 중...${NC}"
cd ../client

if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && echo \"🌐 하나은행 클라이언트 (포트 3000)\" && npm start"'
else
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="하나은행 클라이언트" -- bash -c "cd $(pwd) && echo '🌐 하나은행 클라이언트 (포트 3000)' && npm start; exec bash"
    else
        nohup npm start > client.log 2>&1 &
    fi
fi

sleep 5

# 브라우저 열기
echo -e "${BLUE}🌍 브라우저 실행 중...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
    sleep 1
    open "http://localhost:3000/tablet"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000" &
        sleep 1
        xdg-open "http://localhost:3000/tablet" &
    fi
fi

echo
echo -e "${GREEN}✅ 시스템 시작 완료!${NC}"
echo "   직원용: http://localhost:3000"
echo "   태블릿: http://localhost:3000/tablet"
echo

