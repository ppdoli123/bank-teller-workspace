# 하나은행 지능형 금융 컨설팅 시스템 시작 스크립트

Write-Host "====================================" -ForegroundColor Green
Write-Host "하나은행 지능형 금융 컨설팅 시스템" -ForegroundColor Green  
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] 기존 프로세스 종료 중..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "[2/3] 서버 시작 중..." -ForegroundColor Yellow
$serverPath = Join-Path $PSScriptRoot "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; Write-Host '=== 하나은행 서버 ===' -ForegroundColor Green; node server.js"
Start-Sleep -Seconds 5

Write-Host "[3/3] 클라이언트 시작 중..." -ForegroundColor Yellow  
$clientPath = Join-Path $PSScriptRoot "client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; Write-Host '=== 하나은행 클라이언트 ===' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "시스템 시작 완료!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "직원용: http://localhost:3000" -ForegroundColor Cyan
Write-Host "태블릿: http://localhost:3000/tablet" -ForegroundColor Cyan  
Write-Host "서버: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "로그인 정보:" -ForegroundColor Yellow
Write-Host "ID: 1234" -ForegroundColor White
Write-Host "PW: 1234" -ForegroundColor White
Write-Host ""

Write-Host "브라우저가 자동으로 열립니다..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3000/tablet"

Write-Host "시스템이 성공적으로 시작되었습니다!" -ForegroundColor Green
Write-Host "이 창을 닫지 마세요." -ForegroundColor Red
