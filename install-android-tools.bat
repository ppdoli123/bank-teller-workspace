@echo off
echo ======================================
echo   Android 개발 도구 설치 (최소 구성)
echo ======================================
echo.

REM 작업 디렉토리 생성
if not exist "C:\android-sdk" (
    mkdir "C:\android-sdk"
)

cd "C:\android-sdk"

echo [1/4] Android Command Line Tools 다운로드 중...
echo.
echo 다음 URL에서 수동으로 다운로드해주세요:
echo https://developer.android.com/studio/releases/command-line-tools
echo.
echo "Windows용 command-line tools 최신 버전"을 다운로드하여
echo C:\android-sdk\ 폴더에 압축을 해제해주세요.
echo.
echo 압축 해제 후 폴더 구조:
echo C:\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat
echo.
pause

echo [2/4] 환경 변수 설정...
echo.
echo 다음 환경 변수를 시스템에 추가해주세요:
echo.
echo ANDROID_HOME = C:\android-sdk
echo ANDROID_SDK_ROOT = C:\android-sdk
echo.
echo Path에 추가:
echo C:\android-sdk\cmdline-tools\latest\bin
echo C:\android-sdk\platform-tools
echo.
pause

echo [3/4] Platform Tools 설치 안내...
echo.
echo 환경 변수 설정 후 새 터미널에서 실행:
echo sdkmanager "platform-tools" "platforms;android-28" "build-tools;28.0.3"
echo.
pause

echo [4/4] USB 디버깅 활성화 안내...
echo.
echo 태블릿에서 다음 설정을 활성화해주세요:
echo 1. 설정 → 휴대폰 정보 → 빌드 번호 7번 탭 (개발자 옵션 활성화)
echo 2. 설정 → 개발자 옵션 → USB 디버깅 활성화
echo 3. USB로 PC 연결 시 "디버깅 허용" 확인
echo.
echo 설정 완료 후 "adb devices" 명령어로 디바이스 확인
echo.
pause
