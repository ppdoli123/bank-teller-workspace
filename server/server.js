const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const { query } = require('./config/database');

// 라우터 import
const { router: authRoutes } = require('./routes/auth');
const productRoutes = require('./routes/products');
const consultationRoutes = require('./routes/consultation');
const customerRoutes = require('./routes/customers');
const ocrRoutes = require('./routes/ocr');

const app = express();
const server = http.createServer(app);

// Socket.IO 설정
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100개 요청
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ocr', ocrRoutes);

// 헬스체크 엔드포인트
app.get('/api/health', async (req, res) => {
  try {
    // 데이터베이스 연결 테스트
    const result = await query('SELECT datetime("now") as now');
    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// 세션 관리를 위한 메모리 저장소
const activeSessions = new Map();

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다:', socket.id);
  
  // 직원 세션 참여
  socket.on('join-session', (data) => {
    const { sessionId, userType, userId } = data;
    socket.join(sessionId);
    
    // 세션 정보 저장
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, {
        employees: new Map(),
        tablets: new Map(),
        customers: new Map()
      });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (userType === 'employee') {
      session.employees.set(socket.id, { userId, socketId: socket.id });
      console.log(`직원 ${userId}이 세션 ${sessionId}에 참여했습니다.`);
      
      // 태블릿에 직원 연결 알림
      socket.to(sessionId).emit('employee-connected', {
        employeeName: userId,
        employeeId: userId
      });
    }
    
    socket.sessionId = sessionId;
    socket.userType = userType;
    socket.userId = userId;
  });
  
  // 활성 직원 세션 확인
  socket.on('check-active-employees', () => {
    const activeEmployees = [];
    
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.employees.size > 0) {
        const employee = Array.from(session.employees.values())[0];
        activeEmployees.push({
          sessionId: sessionId,
          userId: employee.userId,
          employeeName: employee.userId
        });
      }
    }
    
    console.log('활성 직원 세션 확인:', activeEmployees);
    socket.emit('active-employees', activeEmployees);
  });

  // 고객 태블릿 세션 참여
  socket.on('join-tablet-session', (data) => {
    const { sessionId, userType } = data;
    socket.join(sessionId);
    
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, {
        employees: new Map(),
        tablets: new Map(),
        customers: new Map()
      });
    }
    
    const session = activeSessions.get(sessionId);
    session.tablets.set(socket.id, { socketId: socket.id });
    
    console.log(`고객 태블릿이 세션 ${sessionId}에 참여했습니다.`);
    
    // 직원이 이미 연결되어 있다면 알림
    if (session.employees.size > 0) {
      const employee = Array.from(session.employees.values())[0];
      socket.emit('employee-connected', {
        employeeName: employee.userId,
        employeeId: employee.userId
      });
    }
    
    socket.sessionId = sessionId;
    socket.userType = userType;
  });
  
  // OCR 결과를 태블릿에 전송
  socket.on('ocr-result', (data) => {
    const { sessionId, customerData } = data;
    console.log(`OCR 결과를 세션 ${sessionId}에 전송:`, customerData);
    socket.to(sessionId).emit('customer-info-updated', customerData);
  });
  
  // 메시지 전송
  socket.on('send-message', (data) => {
    socket.to(data.sessionId).emit('receive-message', data);
  });
  
  // 고객 정보 업데이트
  socket.on('customer-info-update', (data) => {
    socket.to(data.sessionId).emit('customer-info-updated', data);
  });
  
  // 상품 추천 업데이트
  socket.on('product-recommendation-update', (data) => {
    socket.to(data.sessionId).emit('product-recommendation-updated', data);
  });

  // 상품 상세보기 동기화
  socket.on('product-detail-sync', (data) => {
    const { sessionId, productData } = data;
    console.log(`상품 상세보기 동기화: ${productData.product_name}`);
    socket.to(sessionId).emit('product-detail-sync', productData);
  });
  
  // 상담 시작
  socket.on('start-consultation', (data) => {
    const { sessionId } = data;
    socket.to(sessionId).emit('consultation-started', data);
  });
  
  // 고객 정보 확인 완료
  socket.on('customer-info-confirmed', (data) => {
    const { sessionId, customerData } = data;
    socket.to(sessionId).emit('customer-confirmed', customerData);
  });
  
  // 연결 해제
  socket.on('disconnect', () => {
    console.log('클라이언트가 연결을 해제했습니다:', socket.id);
    
    // 세션에서 제거
    if (socket.sessionId && activeSessions.has(socket.sessionId)) {
      const session = activeSessions.get(socket.sessionId);
      
      if (socket.userType === 'employee') {
        session.employees.delete(socket.id);
        // 태블릿에 직원 연결 해제 알림
        socket.to(socket.sessionId).emit('employee-disconnected');
      } else if (socket.userType === 'customer-tablet') {
        session.tablets.delete(socket.id);
      }
      
      // 세션이 비어있으면 제거
      if (session.employees.size === 0 && session.tablets.size === 0 && session.customers.size === 0) {
        activeSessions.delete(socket.sessionId);
      }
    }
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다.'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`클라이언트 URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// 서버 종료 처리
process.on('SIGTERM', () => {
  console.log('서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});

module.exports = app; 