@echo off
echo 🛑 Bank Teller Docker 환경 중지...

REM 컨테이너 중지 및 제거
docker-compose down

REM 볼륨도 함께 제거하려면 (데이터 삭제됨)
REM docker-compose down -v

echo ✅ Docker 환경이 중지되었습니다!
pause
