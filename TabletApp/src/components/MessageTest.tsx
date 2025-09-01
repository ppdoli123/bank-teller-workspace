import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Client } from '@stomp/stompjs';
import { HTTP_WS_URL, WS_URL } from '../config';

interface MessageTestProps {
  sessionId: string;
}

const MessageTest: React.FC<MessageTestProps> = ({ sessionId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [lastReceivedMessage, setLastReceivedMessage] = useState('');

  const addMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const connectWebSocket = () => {
    console.log('=== 메시지 테스트 WebSocket 연결 ===');
    console.log('WebSocket URL:', WS_URL);
    console.log('세션 ID:', sessionId);

    const client = new Client({
      webSocketFactory: () => {
        console.log('WebSocket 팩토리 호출:', WS_URL);
        return new WebSocket(WS_URL);
      },
      connectHeaders: {},
      debug: function (str) {
        console.log('🔍 STOMP Debug:', str);
        if (str.includes('CONNECT')) {
          console.log('🚀 STOMP CONNECT 시도');
          addMessage('STOMP CONNECT 시도');
        }
        if (str.includes('CONNECTED')) {
          console.log('🎉 STOMP CONNECTED 성공!');
          addMessage('STOMP CONNECTED 성공!');
        }
        if (str.includes('ERROR')) {
          console.log('❌ STOMP ERROR 발생');
          addMessage('STOMP ERROR 발생');
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
      console.log('✅ WebSocket STOMP 연결 성공:', frame);
      setStompClient(client);
      setIsConnected(true);
      addMessage('WebSocket STOMP 연결 성공');

      // 세션 참여
      console.log('세션 참여 시도:', sessionId);
      client.publish({
        destination: '/app/join-session',
        body: JSON.stringify({
          sessionId: sessionId,
          userType: 'customer-tablet',
        }),
      });
      addMessage('세션 참여 요청 전송');

      // 메시지 구독
      const subscription = client.subscribe('/topic/session/' + sessionId, function (message) {
        console.log('📨 태블릿 메시지 수신:', message.body);
        try {
          const data = JSON.parse(message.body);
          const messageText = `메시지 수신: ${data.type || 'unknown'}`;
          setLastReceivedMessage(messageText);
          addMessage(messageText);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
          addMessage('메시지 파싱 오류');
        }
      });
      addMessage('메시지 구독 완료');
    };

    client.onStompError = function (frame) {
      console.error('❌ STOMP 오류:', frame);
      setIsConnected(false);
      addMessage(`STOMP 오류: ${frame.headers['message'] || 'Unknown'}`);
    };

    client.onWebSocketError = function (error) {
      console.error('❌ WebSocket 오류:', error);
      setIsConnected(false);
      addMessage(`WebSocket 오류: ${error.message || 'Unknown'}`);
    };

    client.onWebSocketClose = function (event) {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
      setIsConnected(false);
      addMessage(`WebSocket 종료: ${event.code}`);
    };

    client.activate();
  };

  const sendTestMessage = () => {
    if (stompClient && isConnected) {
      const testMessage = {
        type: 'test-message',
        sessionId: sessionId,
        content: '태블릿에서 보낸 테스트 메시지',
        timestamp: new Date().toISOString()
      };

      stompClient.publish({
        destination: '/app/test-message',
        body: JSON.stringify(testMessage),
      });

      addMessage('테스트 메시지 전송');
      console.log('테스트 메시지 전송:', testMessage);
    } else {
      addMessage('연결되지 않음 - 메시지 전송 실패');
    }
  };

  const sendProductSelection = () => {
    if (stompClient && isConnected) {
      const productMessage = {
        type: 'product-selection',
        sessionId: sessionId,
        productId: 'loan_001',
        productName: '주택담보대출',
        timestamp: new Date().toISOString()
      };

      stompClient.publish({
        destination: '/app/product-detail-sync',
        body: JSON.stringify(productMessage),
      });

      addMessage('상품 선택 메시지 전송');
      console.log('상품 선택 메시지 전송:', productMessage);
    } else {
      addMessage('연결되지 않음 - 상품 선택 전송 실패');
    }
  };

  useEffect(() => {
    if (sessionId) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>메시지 전송 테스트</Text>
      
      <View style={[styles.status, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.statusText}>
          {isConnected ? '🟢 연결됨' : '🔴 연결 대기 중'}
        </Text>
      </View>
      
      <Text style={styles.sessionId}>세션: {sessionId}</Text>
      
      {lastReceivedMessage && (
        <View style={styles.lastMessageBox}>
          <Text style={styles.lastMessageText}>마지막 수신: {lastReceivedMessage}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={sendTestMessage}>
          <Text style={styles.buttonText}>테스트 메시지 전송</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={sendProductSelection}>
          <Text style={styles.buttonText}>상품 선택 전송</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={connectWebSocket}>
          <Text style={styles.buttonText}>재연결</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.logTitle}>연결 로그:</Text>
      <ScrollView style={styles.logContainer}>
        {messages.map((message, index) => (
          <Text key={index} style={styles.logText}>{message}</Text>
        ))}
      </ScrollView>
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
    fontSize: 18,
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
  lastMessageBox: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  lastMessageText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
  },
  logText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default MessageTest;



