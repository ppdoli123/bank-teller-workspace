// 개발 환경 설정
const isDevelopment = __DEV__;

// 개발 머신 IP 주소들 (우선순위 순) - 태블릿에서 노트북으로 연결
const DEVELOPMENT_IPS = [
  '192.168.123.7', // 노트북 IP (백엔드 서버 실행 중)
  '192.168.123.1', // 라우터 IP (백업)
  '192.168.123.10', // 같은 대역 다른 IP들
  '192.168.123.100',
  '192.168.1.7', // 일반적인 홈 네트워크 대역 (.1.x)
  '192.168.0.7', // 라우터 기본 대역 (.0.x)
  '192.168.2.7', // 일반적인 네트워크 대역 (.2.x)
  '10.0.0.7', // 기업/학교 네트워크 (10.0.0.x)
  '10.0.1.7', // 기업/학교 네트워크 (10.0.1.x)
  '172.16.0.7', // 사설 네트워크 B 클래스
  '192.168.43.7', // 모바일 핫스팟 기본값
  '192.168.4.7', // 일부 라우터 기본값
];

// 기본 IP (첫 번째 IP 사용)
const DEFAULT_IP = DEVELOPMENT_IPS[0];

// API 기본 URL
export const API_BASE_URL = isDevelopment
  ? `http://${DEFAULT_IP}:8080`
  : 'http://localhost:8080';

// WebSocket URL (context-path가 /api이므로 /ws만 추가)
export const WS_URL = `${API_BASE_URL}/ws`;

// 대체 IP 주소들
export const ALTERNATIVE_IPS = DEVELOPMENT_IPS.slice(1);

// 기타 설정
export const CONFIG = {
  SESSION_ID: 'tablet_main',
  RECONNECT_DELAY: 5000,
  HEARTBEAT_INCOMING: 4000,
  HEARTBEAT_OUTGOING: 4000,
};

export default {
  API_BASE_URL,
  WS_URL,
  CONFIG,
};
