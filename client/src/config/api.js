// API 설정 - 로컬 개발용으로 강제 설정
const API_CONFIG = {
  // 무조건 로컬 서버 사용
  BASE_URL: 'http://localhost:8080',
  
  // WebSocket URL - 무조건 로컬
  WS_URL: 'http://localhost:8080/api/ws',
    
  // API 엔드포인트들
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify'
    },
    AI: {
      QUESTIONS: '/api/ai/questions',
      RECOMMENDATIONS: '/api/ai/recommendations'
    },
    CUSTOMER: {
      LIST: '/api/customers',
      DETAIL: '/api/customers',
      CREATE: '/api/customers'
    },
    PRODUCT: {
      LIST: '/api/products',
      DETAIL: '/api/products',
      RECOMMENDATIONS: '/api/products/recommendations'
    },
    SIGNATURE: {
      SUBMIT: '/api/signature/submit'
    },
    SIMULATION: {
      BENEFITS: '/api/simulation/benefits'
    }
  }
};

// API URL 생성 헬퍼 함수
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// WebSocket URL
export const getWebSocketUrl = () => {
  return API_CONFIG.WS_URL;
};

export { API_CONFIG };
export default API_CONFIG;
