import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HTTP_WS_URL } from '../config';

interface SimpleWebSocketProps {
  sessionId: string;
  onMessage: (message: any) => void;
}

const SimpleWebSocket: React.FC<SimpleWebSocketProps> = ({
  sessionId,
  onMessage,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('대기 중');
  const [keepAliveInterval, setKeepAliveInterval] =
    useState<NodeJS.Timeout | null>(null);

  const testNetworkConnection = () => {
    console.log('=== 네트워크 연결 테스트 ===');
    console.log('HTTP_WS_URL:', HTTP_WS_URL);

    // 1. HTTP 연결 테스트
    fetch(HTTP_WS_URL.replace('/api/ws', '/api/health'))
      .then(response => {
        console.log('✅ HTTP 연결 성공:', response.status);
        setLastMessage('HTTP 연결 성공');
      })
      .catch(error => {
        console.error('❌ HTTP 연결 실패:', error);
        setLastMessage('HTTP 연결 실패');
      });

    // 2. WebSocket 연결 테스트
    const wsUrl = HTTP_WS_URL.replace('http://', 'ws://').replace(
      '/api/ws',
      '/api/websocket',
    );
    console.log('WebSocket 테스트 URL:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket 연결 성공!');
        setLastMessage('WebSocket 연결 성공');
        ws.close();
      };

      ws.onerror = error => {
        console.log('❌ WebSocket 연결 실패:', error);
        setLastMessage('WebSocket 연결 실패');
      };

      ws.onclose = event => {
        console.log('WebSocket 종료:', event.code, event.reason);
      };
    } catch (error) {
      console.error('WebSocket 테스트 오류:', error);
    }
  };

  const connect = () => {
    console.log('=== WebSocket 연결 시도 ===');
    console.log('HTTP URL:', HTTP_WS_URL);
    console.log('세션 ID:', sessionId);

    // STOMP 연결만 시도 (단순 WebSocket은 제거)
    console.log('=== STOMP 연결 시도 ===');
    trySockJSConnection();
  };

  const trySimpleWebSocket = () => {
    console.log('=== 1단계: 단순 WebSocket 연결 ===');
    const wsUrl = 'ws://10.0.2.2:8080/api/simple-ws';
    console.log('단순 WebSocket URL:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ 단순 WebSocket 연결 성공!');
        setIsConnected(true);
        setLastMessage('단순 WebSocket 연결 성공');
        setConnectionStatus('단순 WebSocket 연결됨');

        // 연결 테스트 메시지 전송
        const testMessage = {
          type: 'join-session',
          sessionId: sessionId,
          userType: 'customer-tablet',
          message: '태블릿에서 연결 테스트',
        };

        ws.send(JSON.stringify(testMessage));
        console.log('테스트 메시지 전송:', testMessage);

        // Keep-alive 메커니즘 시작 (30초마다 ping 전송)
        const interval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              const pingMessage = {
                type: 'ping',
                sessionId: sessionId,
                timestamp: Date.now(),
              };
              ws.send(JSON.stringify(pingMessage));
              console.log('🏓 Keep-alive ping 전송');
            } catch (error) {
              console.error('Keep-alive ping 전송 실패:', error);
            }
          }
        }, 30000);

        setKeepAliveInterval(interval);
      };

      ws.onmessage = event => {
        console.log('📨 단순 WebSocket 메시지 수신:', event.data);
        try {
          const data = JSON.parse(event.data);

          // Pong 메시지는 별도 처리 (로그만 출력)
          if (data.type === 'pong') {
            console.log('🏓 Keep-alive pong 수신');
            return;
          }

          onMessage(data);
          setLastMessage(`메시지 수신: ${data.type}`);
        } catch (error) {
          console.log('메시지 파싱 오류, 원본 메시지:', event.data);
          setLastMessage('메시지 수신됨');
        }
      };

      ws.onerror = error => {
        console.log('❌ 단순 WebSocket 연결 실패:', error);
        setLastMessage('단순 WebSocket 연결 실패');
        setConnectionStatus('단순 WebSocket 실패');
      };

      ws.onclose = event => {
        console.log(
          '🔌 단순 WebSocket 연결 종료:',
          event.code,
          event.reason,
          event.wasClean,
        );
        console.log('연결 종료 상세 정보:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          type: event.type,
        });

        // Keep-alive 인터벌 정리
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          setKeepAliveInterval(null);
        }

        if (isConnected) {
          setIsConnected(false);
          setLastMessage(
            `연결 종료: ${event.code} - ${event.reason || 'Unknown'}`,
          );
          setConnectionStatus('연결 종료됨');
        }
      };

      // WebSocket 인스턴스 저장
      setStompClient({ connected: true, webSocket: ws } as any);
    } catch (error) {
      console.error('단순 WebSocket 생성 오류:', error);
      setLastMessage('WebSocket 생성 실패');
    }
  };

  const trySockJSConnection = () => {
    console.log('=== 2단계: SockJS + STOMP 연결 ===');

    // STOMP 클라이언트 설정 (웹과 동일한 방식)
    const client = new Client({
      webSocketFactory: () => {
        // 웹과 동일한 SockJS 방식 사용
        console.log('🔧 SockJS 팩토리 호출 (웹과 동일):', HTTP_WS_URL);

        // SockJS 사용 (웹과 동일)
        const sockjs = new SockJS(HTTP_WS_URL, null, {
          debug: false, // 디버그 비활성화 (웹과 동일)
          timeout: 30000,
        });

        sockjs.onopen = () => {
          console.log('✅ SockJS 연결 성공!');
          console.log('SockJS 상태:', sockjs.readyState);
          console.log('SockJS URL:', sockjs.url);
        };

        sockjs.onerror = error => {
          console.error('❌ SockJS 연결 오류:', error);
        };

        sockjs.onclose = event => {
          console.log('🔌 SockJS 연결 종료:', event.code, event.reason);
        };

        return sockjs;
      },
      connectHeaders: {},
      debug: function (str) {
        // 웹과 동일한 로깅 방식
        console.log('🔍 STOMP Debug:', str);

        // 중요 단계만 추적
        if (str.includes('CONNECT')) {
          console.log('🚀 STOMP CONNECT 시도');
        }
        if (str.includes('CONNECTED')) {
          console.log('🎉 STOMP CONNECTED 성공!');
        }
        if (str.includes('ERROR')) {
          console.log('❌ STOMP ERROR 발생:', str);
        }
        if (str.includes('Web Socket Opened')) {
          console.log('🔌 STOMP WebSocket 열림');
        }
        if (str.includes('Received data')) {
          console.log('📥 STOMP 데이터 수신');
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000, // 하트비트 간격 증가
      heartbeatOutgoing: 10000, // 하트비트 간격 증가
    });

    client.onConnect = function (frame) {
      console.log('🎉 STOMP 연결 성공!');
      console.log('STOMP 프레임:', JSON.stringify(frame, null, 2));
      console.log('STOMP 클라이언트 connected 상태:', client.connected);
      console.log('STOMP 클라이언트 ID:', client.id);
      console.log('STOMP 클라이언트 URL:', client.webSocket?.url);

      setStompClient(client);
      setIsConnected(true);
      setLastMessage('STOMP 연결 성공');
      setConnectionStatus('STOMP 연결됨');

      // 연결 후 잠시 대기 (안정성 향상)
      setTimeout(() => {
        console.log('=== 세션 참여 및 구독 시작 ===');
        console.log('현재 STOMP 상태:', client.connected);

        if (!client.connected) {
          console.error('❌ STOMP 클라이언트가 연결되지 않음');
          setLastMessage('STOMP 연결 실패');
          return;
        }

        try {
          // 메시지 구독 먼저 (웹과 동일)
          console.log('📡 구독 시작:', '/topic/session/' + sessionId);
          const subscription = client.subscribe(
            '/topic/session/' + sessionId,
            function (message) {
              console.log('📨 태블릿 메시지 수신 시작');
              console.log('메시지 헤더:', message.headers);
              console.log('메시지 바디:', message.body);
              console.log('메시지 전체:', JSON.stringify(message, null, 2));

              try {
                const data = JSON.parse(message.body);
                console.log('📨 태블릿 메시지 수신:', data);
                console.log('메시지 타입:', data.type);
                console.log('onMessage 콜백 호출 시작...');
                onMessage(data);
                console.log('onMessage 콜백 호출 완료');
                setLastMessage(`메시지 수신: ${data.type}`);
              } catch (error) {
                console.error('메시지 파싱 오류:', error);
                console.error('원본 메시지:', message.body);
                setLastMessage('메시지 파싱 오류');
              }
            },
          );

          console.log('✅ 구독 완료:', subscription.id);

          // 세션 참여 (웹과 동일)
          console.log('🚀 세션 참여 시도:', sessionId);
          const joinMessage = {
            sessionId: sessionId,
            userType: 'tablet',
            userId: 'tablet_' + Date.now(),
          };

          client.publish({
            destination: '/app/join-session',
            body: JSON.stringify(joinMessage),
          });

          console.log('✅ 세션 참여 메시지 전송 완료:', joinMessage);
          setLastMessage('세션 참여 완료');
          setConnectionStatus('세션 참여 완료');
        } catch (error) {
          console.error('❌ 구독/참여 과정 오류:', error);
          setLastMessage('구독/참여 오류');
          setConnectionStatus('구독/참여 오류');
        }
      }, 500); // 500ms 대기
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

    client.onWebSocketError = function (error) {
      console.error('❌ WebSocket 오류:', error);
      setIsConnected(false);
      setLastMessage(`WebSocket 오류: ${error.message || 'Unknown'}`);
    };

    client.onWebSocketClose = function (event) {
      console.log('🔌 WebSocket 연결 종료:', event.code, event.reason);
      setIsConnected(false);
      setLastMessage(`WebSocket 종료: ${event.code}`);
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

  const sendTestMessage = () => {
    if (!stompClient) {
      console.log('❌ 클라이언트가 연결되지 않음');
      setLastMessage('연결되지 않음 - 메시지 전송 불가');
      return;
    }

    try {
      console.log('🧪 테스트 메시지 전송 시작');

      // 단순 WebSocket인 경우
      if (
        stompClient.webSocket &&
        stompClient.webSocket.readyState === WebSocket.OPEN
      ) {
        const testMessage = {
          type: 'test-message',
          sessionId: sessionId,
          clientType: 'tablet',
          message: '태블릿에서 보내는 테스트 메시지',
          timestamp: Date.now(),
        };

        stompClient.webSocket.send(JSON.stringify(testMessage));
        console.log('✅ 단순 WebSocket 테스트 메시지 전송 완료');
        setLastMessage('테스트 메시지 전송됨');

        // STOMP 클라이언트인 경우
      } else if (stompClient.connected && stompClient.publish) {
        stompClient.publish({
          destination: '/app/test-connection',
          body: JSON.stringify({
            sessionId: sessionId,
            clientType: 'tablet',
            message: '태블릿에서 보내는 테스트 메시지',
            timestamp: Date.now(),
          }),
        });
        console.log('✅ STOMP 테스트 메시지 전송 완료');
        setLastMessage('테스트 메시지 전송됨');
      } else {
        console.log('❌ 연결 상태가 올바르지 않음');
        setLastMessage('연결 상태 불량');
      }
    } catch (error) {
      console.error('❌ 테스트 메시지 전송 오류:', error);
      setLastMessage('메시지 전송 오류');
    }
  };

  useEffect(() => {
    if (sessionId) {
      connect();
    }

    return () => {
      // Keep-alive 인터벌 정리
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }

      // 단순 WebSocket 연결 정리
      if (stompClient && stompClient.webSocket) {
        if (stompClient.webSocket.readyState === WebSocket.OPEN) {
          stompClient.webSocket.close();
        }
      }
      // STOMP 클라이언트 정리
      else if (stompClient && stompClient.deactivate) {
        stompClient.deactivate();
      }
    };
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket 연결 상태</Text>
      <View
        style={[
          styles.status,
          { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
        ]}
      >
        <Text style={styles.statusText}>
          {isConnected ? '🟢 STOMP 연결됨' : '🔴 연결 대기 중'}
        </Text>
      </View>

      <View style={styles.statusDetails}>
        <Text style={styles.statusDetailText}>상태: {connectionStatus}</Text>
        <Text style={styles.statusDetailText}>
          STOMP: {stompClient?.connected ? '✅ 연결됨' : '❌ 연결 안됨'}
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

      {/* 디버깅용 연결 테스트 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.debugButton]}
        onPress={() => {
          console.log('=== 현재 연결 상태 디버깅 ===');
          console.log('isConnected:', isConnected);
          console.log('connectionStatus:', connectionStatus);
          console.log('stompClient:', stompClient);
          console.log('stompClient?.connected:', stompClient?.connected);
          if (stompClient) {
            console.log('STOMP 클라이언트 상세:', {
              connected: stompClient.connected,
              state: stompClient.state,
              active: stompClient.active,
            });
          }
        }}
      >
        <Text style={styles.buttonText}>연결 상태 디버깅</Text>
      </TouchableOpacity>

      {/* 네트워크 연결 테스트 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.testButton]}
        onPress={testNetworkConnection}
      >
        <Text style={styles.buttonText}>🌐 네트워크 연결 테스트</Text>
      </TouchableOpacity>

      {/* 테스트 메시지 전송 버튼 */}
      {isConnected && (
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={sendTestMessage}
        >
          <Text style={styles.buttonText}>🧪 테스트 메시지 전송</Text>
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
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#6c757d',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  statusDetails: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  statusDetailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default SimpleWebSocket;
