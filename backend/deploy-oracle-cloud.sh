#!/bin/bash

# Oracle Cloud 배포 스크립트
echo "🚀 Oracle Cloud 배포 시작..."

# 환경 변수 설정
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH

# JAR 파일 확인
if [ ! -f "target/smart-consulting-1.0.0.jar" ]; then
    echo "❌ JAR 파일을 찾을 수 없습니다. 먼저 빌드해주세요."
    exit 1
fi

echo "✅ JAR 파일 확인 완료: target/smart-consulting-1.0.0.jar"

# 프로덕션 프로파일로 실행
echo "🌐 백엔드 서버 시작 (프로덕션 모드)..."
java -jar -Dspring.profiles.active=production target/smart-consulting-1.0.0.jar

echo "🎉 Oracle Cloud 배포 완료!"
echo "📱 백엔드 URL: http://your-oracle-cloud-ip:8080"
echo "🔗 H2 콘솔: http://your-oracle-cloud-ip:8080/h2-console"
