import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HTTP_WS_URL } from '../config';

interface SimpleWebSocketProps {
  sessionId: string;
  onMessage: (message: any) => void;
}

const SimpleWebSocket: React.FC<SimpleWebSocketProps> = ({ sessionId, onMessage }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const testDirectWebSocket = () => {
    console.log('=== 직접 WebSocket 테스트 ===');
    const wsUrl = HTTP_WS_URL.replace('https://', 'wss://').replace('/api/ws', '/api/websocket');
    console.log('직접 WebSocket URL:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ 직접 WebSocket 연결 성공!');
        setLastMessage('직접 WebSocket 연결 성공');
        ws.close();
      };
      
      ws.onerror = (error) => {
        console.log('❌ 직접 WebSocket 연결 실패:', error);
        setLastMessage('직접 WebSocket 연결 실패');
      };
      
      ws.onclose = (event) => {
        console.log('직접 WebSocket 종료:', event.code, event.reason);
      };
    } catch (error) {
      console.error('직접 WebSocket 테스트 오류:', error);
    }
  };

  const connect = () => {
    console.log('=== Railway WebSocket 연결 디버깅 ===');
    console.log('HTTP URL:', HTTP_WS_URL);
    console.log('세션 ID:', sessionId);
    
    // 먼저 직접 WebSocket 테스트
    testDirectWebSocket();

    console.log('=== SockJS 연결 시도 ===');
    
    // Railway WebSocket 연결 문제 해결을 위한 설정
    const client = new Client({
      webSocketFactory: () => {
        console.log('SockJS 팩토리 호출:', HTTP_WS_URL);
        
                 // Railway WebSocket 문제 해결: 기본 설정으로 복원
         console.log('⚠️ Railway 기본 설정으로 복원');
         const sockjs = new SockJS(HTTP_WS_URL, null, {
           debug: true,
           timeout: 15000
         });
        
                 sockjs.onopen = () => {
           console.log('✅ SockJS 연결 성공!');
           console.log('SockJS 상태:', sockjs.readyState);
           console.log('SockJS URL:', sockjs.url);
           console.log('SockJS 프로토콜:', sockjs.protocol);
           console.log('SockJS 확장:', sockjs.extensions);
           setLastMessage('SockJS 연결 성공');
           
           // SockJS 연결 후 STOMP 활성화 확인
           setTimeout(() => {
             console.log('🔍 STOMP 활성화 상태 확인...');
             console.log('STOMP 클라이언트 상태:', client.connected);
           }, 1000);
         };
        
        sockjs.onerror = (error) => {
          console.error('❌ SockJS 연결 오류:', error);
          console.error('오류 상세:', JSON.stringify(error, null, 2));
          setLastMessage('SockJS 연결 실패');
        };
        
        sockjs.onclose = (event) => {
          console.log('SockJS 연결 종료:', event.code, event.reason, event.wasClean);
          if (event.code !== 1000) {
            setLastMessage(`연결 종료: ${event.code} - ${event.reason}`);
          }
        };
        
        return sockjs;
      },
      connectHeaders: {},
             debug: function (str) {
         console.log('🔍 STOMP Debug:', str);
         // STOMP 연결 과정 추적
         if (str.includes('CONNECT')) {
           console.log('🚀 STOMP CONNECT 시도');
         }
         if (str.includes('CONNECTED')) {
           console.log('🎉 STOMP CONNECTED 성공!');
         }
         if (str.includes('ERROR')) {
           console.log('❌ STOMP ERROR 발생');
         }
         if (str.includes('Opening Web Socket')) {
           console.log('🔌 STOMP WebSocket 열기 시작');
         }
         if (str.includes('Web Socket is closed')) {
           console.log('🔌 STOMP WebSocket 닫힘');
         }
       },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
      console.log('✅ STOMP 연결 성공:', frame);
      console.log('STOMP 프레임:', JSON.stringify(frame, null, 2));
      setStompClient(client);
      setIsConnected(true);
      setLastMessage('STOMP 연결 성공');

      // 세션 참여 (웹과 동일)
      console.log('세션 참여 시도:', sessionId);
      client.publish({
        destination: '/app/join-session',
        body: JSON.stringify({
          sessionId: sessionId,
          userType: 'customer-tablet',
        }),
      });

      // 메시지 구독 (웹과 동일)
      const subscription = client.subscribe('/topic/session/' + sessionId, function (message) {
        console.log('📨 태블릿 메시지 수신 시작');
        console.log('메시지 헤더:', message.headers);
        console.log('메시지 바디:', message.body);
        
        try {
          const data = JSON.parse(message.body);
          console.log('📨 태블릿 메시지 수신:', data);
          onMessage(data);
          setLastMessage(`메시지 수신: ${data.type}`);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
          setLastMessage('메시지 파싱 오류');
        }
      });
      
      console.log('구독 완료:', subscription);
    };

         client.onStompError = function (frame) {
       console.error('❌ STOMP 오류 발생');
       console.error('STOMP 오류 프레임:', JSON.stringify(frame, null, 2));
       console.error('오류 메시지:', frame.headers['message']);
       console.error('오류 헤더:', frame.headers);
       console.error('STOMP 클라이언트 상태:', client.connected);
       setIsConnected(false);
       setLastMessage(`STOMP 오류: ${frame.headers['message'] || 'Unknown'}`);
     };

     // STOMP 연결 타임아웃 추가
     setTimeout(() => {
       if (!client.connected) {
         console.error('⏰ STOMP 연결 타임아웃 (15초)');
         console.error('STOMP 클라이언트 상태:', client.connected);
         setLastMessage('STOMP 연결 타임아웃');
       }
     }, 15000);

    client.onWebSocketError = function (error) {
      console.error('❌ WebSocket 오류:', error);
      setIsConnected(false);
      setLastMessage(`WebSocket 오류: ${error.message || 'Unknown'}`);
    };

    client.onWebSocketClose = function (event) {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
      setIsConnected(false);
      setLastMessage(`WebSocket 종료: ${event.code}`);
    };

    client.activate();
  };

  useEffect(() => {
    if (sessionId) {
      connect();
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket 연결 상태</Text>
      <View style={[styles.status, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.statusText}>
          {isConnected ? '🟢 연결됨' : '🔴 연결 대기 중'}
        </Text>
      </View>
      
      <Text style={styles.sessionId}>세션: {sessionId}</Text>
      
      {lastMessage && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{lastMessage}</Text>
        </View>
      )}

      {!isConnected && (
        <TouchableOpacity style={styles.button} onPress={connect}>
          <Text style={styles.buttonText}>다시 연결</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 10,
  },
  status: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sessionId: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  messageBox: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  button: {
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SimpleWebSocket;
