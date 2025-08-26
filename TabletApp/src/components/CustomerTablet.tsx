import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import SignatureScreen from 'react-native-signature-canvas';
import axios from 'axios';
import {
  Customer,
  ProductForm,
  WebSocketMessage,
  CustomerProduct,
  ProductSummary,
  ProductDetail,
  FormData,
} from '../types';
import TabletFieldInput from './TabletFieldInput';
import ProductDetailModal from './ProductDetailModal';
import SessionConnector from './SessionConnector';
import SimpleWebSocket from './SimpleWebSocket';
import { API_BASE_URL, WS_URL, HTTP_WS_URL, CONFIG, ALTERNATIVE_IPS } from '../config';

const { width, height } = Dimensions.get('window');

const CustomerTablet: React.FC = () => {
  // 기존 상태들
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phoneNumber: '',
    rrn: '',
    currentStep: 'waiting',
  });
  const [currentForm, setCurrentForm] = useState<ProductForm | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const signatureRef = useRef<any>(null);

  // 웹 버전에서 추가된 상태들
  const [sessionId, setSessionId] = useState<string>('tablet_main');
  const [employeeName, setEmployeeName] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isWaitingForEmployee, setIsWaitingForEmployee] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSessionConnector, setShowSessionConnector] = useState(false); // 기본 세션으로 바로 연결
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>(
    [],
  );
  const [productSummary, setProductSummary] = useState<ProductSummary | null>(
    null,
  );
  const [selectedProductDetail, setSelectedProductDetail] =
    useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [fieldInputData, setFieldInputData] = useState<any>(null);
  const [showFieldInput, setShowFieldInput] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<string>('연결 확인 중...');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [lastMessage, setLastMessage] = useState<string>('');

  // 디버그 정보 추가
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // 최근 10개만 유지
  };

  // Railway 백엔드 테스트 (로컬 IP 테스트 제거)
  const testRailwayConnection = async () => {
    const testUrl = `${API_BASE_URL}/api/health`;
    addDebugInfo(`🔍 Railway 백엔드 테스트: ${testUrl}`);

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      addDebugInfo(`✅ Railway 연결 성공`);
      setNetworkStatus(`연결됨 (Railway)`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // 디바이스 네트워크 정보 확인
  const getDeviceNetworkInfo = () => {
    console.log('=== 디바이스 네트워크 정보 ===');
    // console.log('User Agent:', navigator.userAgent); // React Native에서는 navigator 제한적 사용

    // 가능한 네트워크 힌트들 (React Native에서는 제한적)
    // if (typeof navigator !== 'undefined' && navigator.connection) {
    //   console.log('연결 타입:', navigator.connection.effectiveType);
    // }

    // WebRTC를 통한 로컬 IP 확인 시도 (React Native에서는 제한적이므로 주석 처리)
    // try {
    //   const pc = new RTCPeerConnection({ iceServers: [] });
    //   pc.createDataChannel('');
    //   pc.createOffer().then(offer => pc.setLocalDescription(offer));
    //   pc.onicecandidate = event => {
    //     if (event.candidate) {
    //       const candidate = event.candidate.candidate;
    //       const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
    //       if (ipMatch) {
    //         console.log('태블릿 로컬 IP (추정):', ipMatch[1]);
    //       }
    //     }
    //   };
    // } catch (error) {
    //   console.log('로컬 IP 확인 실패:', error instanceof Error ? error.message : 'Unknown error');
    // }
    
    // React Native 환경에서는 간단하게 네트워크 상태만 설정
    setNetworkStatus('네트워크 연결됨');
  };

  // Railway 백엔드 연결 테스트
    const testNetworkConnection = async () => {
    setNetworkStatus('Railway 서버 연결 중...');
    
    const result = await testRailwayConnection();
    
    if (result.success) {
      // WebSocket 연결 가능성 테스트
      try {
        console.log('WebSocket 연결 테스트 시작...');
        const wsUrl = WS_URL.replace('https://', 'wss://');
        console.log('WebSocket URL:', wsUrl);
        
        // WebSocket 직접 연결 테스트 (SockJS 없이)
        const ws = new WebSocket(wsUrl);
        
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.log('WebSocket 연결 타임아웃');
            ws.close();
            resolve(result.success); // HTTP는 성공했으므로 true 반환
          }, 5000);
          
          ws.onopen = () => {
            console.log('✅ 직접 WebSocket 연결 성공');
            clearTimeout(timeout);
            ws.close();
            resolve(true);
          };
          
          ws.onerror = (error) => {
            console.log('❌ 직접 WebSocket 연결 실패:', error);
            clearTimeout(timeout);
            resolve(result.success); // HTTP는 성공했으므로 true 반환
          };
        });
      } catch (error) {
        console.log('WebSocket 테스트 오류:', error);
        return result.success;
      }
    }
    
    return result.success;
  };

  useEffect(() => {
    const initializeConnection = async () => {
      console.log('=== 태블릿 앱 초기화 ===');
      console.log('기본 세션 ID:', sessionId);
      
      const networkOk = await testNetworkConnection();

      if (networkOk) {
        console.log('네트워크 연결 확인됨, WebSocket 연결 시작...');
        setupWebSocket();
      } else {
        console.error('네트워크 연결 실패, WebSocket 연결 중단');
        setIsConnected(false);
        setIsWaitingForEmployee(true);
      }
    };

    initializeConnection();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const handleSessionConnect = (newSessionId: string) => {
    console.log('세션 연결 시도:', newSessionId);
    setIsConnecting(true);
    setSessionId(newSessionId);
    
    // 기존 연결이 있으면 해제
    if (stompClient) {
      console.log('기존 STOMP 클라이언트 비활성화');
      stompClient.deactivate();
    }
    
    // WebSocket 연결 시도
    setTimeout(() => {
      setupWebSocket();
      // 연결 화면 숨기기
      setShowSessionConnector(false);
      setIsConnecting(false);
    }, 1000); // 기존 연결 해제를 위한 대기
  };

  const setupWebSocket = () => {
    console.log('=== WebSocket 연결 시도 ===');
    console.log('HTTP URL:', HTTP_WS_URL);
    console.log('WSS URL:', WS_URL);
    console.log('현재 시간:', new Date().toLocaleString());
    console.log('세션 ID:', sessionId);

    try {
      console.log('🔌 HTTPS -> WSS 연결 시도');
      
      // 첫 번째 시도: SockJS with HTTPS URL (자동 WSS 변환)
      const client = new Client({
        webSocketFactory: () => {
          console.log('🏭 SockJS WebSocket Factory 호출');
          console.log('SockJS URL:', HTTP_WS_URL);
          
          const sockjs = new SockJS(HTTP_WS_URL, null, {
            timeout: 10000,
            transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
            debug: true
          });
          
          sockjs.onopen = () => {
            console.log('🎉 SockJS 연결 성공');
            setLastMessage('SockJS 연결 성공');
          };
          
          sockjs.onerror = (error) => {
            console.error('💥 SockJS 오류:', error);
            setLastMessage('SockJS 연결 실패 - 네이티브 WebSocket 시도 중...');
            
            // SockJS 실패 시 네이티브 WebSocket 시도
            setTimeout(() => {
              setupNativeWebSocket();
            }, 2000);
          };
          
          sockjs.onclose = (event) => {
            console.log('SockJS 연결 종료:', event.code, event.reason);
            if (event.code !== 1000) {
              setLastMessage(`SockJS 종료: ${event.reason || 'Unknown'}`);
            }
          };
          
          return sockjs;
        },
        debug: str => {
          console.log('STOMP Debug:', str);
        },
        connectHeaders: {
          'Accept-Version': '1.0,1.1,1.2',
          'heart-beat': '4000,4000'
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = function (frame) {
        console.log('🎉 STOMP 연결 성공!', frame);
        setStompClient(client);
        setIsConnected(true);
        setLastMessage('STOMP 연결 성공');

        // 웹과 동일한 세션 참여
        client.publish({
          destination: '/app/join-session',
          body: JSON.stringify({
            sessionId: sessionId,
            userType: 'customer-tablet', // 웹과 동일
          }),
        });

        // 웹과 동일한 메시지 구독
        client.subscribe('/topic/session/' + sessionId, function (message) {
          const data = JSON.parse(message.body);
          console.log('태블릿 메시지 수신:', data);
          handleWebSocketMessage(data);
        });
      };
      client.onStompError = function (frame) {
        console.error('STOMP 오류:', frame.headers['message']);
        setIsConnected(false);
        setIsWaitingForEmployee(true);
        setLastMessage(`STOMP 오류: ${frame.headers['message'] || 'Unknown'}`);
      };

      client.activate();
    } catch (error) {
      console.error('WebSocket 설정 오류:', error);
      setIsConnected(false);
      setIsWaitingForEmployee(true);
      setLastMessage(`WebSocket 오류: ${error instanceof Error ? error.message : 'Unknown'}`);

      // 5초 후 재시도
      setTimeout(() => {
        console.log('🔄 WebSocket 재시도...');
        setupWebSocket();
      }, 5000);
    }
  };

  // 네이티브 WebSocket 연결 시도 (SockJS 실패 시)
  const setupNativeWebSocket = () => {
    console.log('=== 네이티브 WebSocket 연결 시도 ===');
    console.log('WSS URL:', WS_URL);
    
    try {
      const client = new Client({
        brokerURL: WS_URL, // 이미 wss://로 변환된 URL 사용
        debug: str => {
          console.log('네이티브 STOMP Debug:', str);
        },
        connectHeaders: {
          'Accept-Version': '1.0,1.1,1.2',
          'heart-beat': '4000,4000'
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: frame => {
          console.log('🎉 네이티브 WebSocket 연결 성공!', frame);
          setStompClient(client);
          setIsConnected(true);
          setLastMessage('네이티브 WebSocket 연결 성공');

          // 세션 참여
          const joinMessage = {
            sessionId: sessionId,
            userType: 'tablet',
            userId: 'tablet_' + Date.now(),
          };
          
          console.log('네이티브 WebSocket 세션 참여:', joinMessage);
          client.publish({
            destination: '/app/join-session',
            body: JSON.stringify(joinMessage),
          });

          // 메시지 구독
          const subscriptionTopic = '/topic/session/' + sessionId;
          console.log('네이티브 WebSocket 구독 토픽:', subscriptionTopic);
          
          client.subscribe(subscriptionTopic, message => {
            try {
              const data: WebSocketMessage = JSON.parse(message.body);
              console.log('=== 네이티브 WebSocket 메시지 수신 ===', data);
              handleWebSocketMessage(data);
            } catch (error) {
              console.error('네이티브 WebSocket 메시지 파싱 오류:', error);
            }
          });
        },
        onDisconnect: () => {
          console.log('네이티브 WebSocket 연결 해제됨');
          setIsConnected(false);
          setIsWaitingForEmployee(true);
          setLastMessage('네이티브 WebSocket 연결 해제됨');
        },
        onStompError: frame => {
          console.error('네이티브 WebSocket STOMP 오류:', frame.headers['message']);
          setIsConnected(false);
          setIsWaitingForEmployee(true);
          setLastMessage(`네이티브 WebSocket 오류: ${frame.headers['message'] || 'Unknown'}`);
        },
      });

      console.log('네이티브 WebSocket 클라이언트 활성화 중...');
      client.activate();
      
    } catch (error) {
      console.error('네이티브 WebSocket 설정 오류:', error);
      setLastMessage(`네이티브 WebSocket 설정 오류: ${error instanceof Error ? error.message : 'Unknown'}`);
      setIsConnected(false);
      setIsWaitingForEmployee(true);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('=== 태블릿 메시지 수신 ===', message);
    console.log('현재 세션 ID:', sessionId);
    console.log('메시지 타입:', message.type);
    console.log('메시지 전체 데이터:', JSON.stringify(message, null, 2));
    
    // receive-message 타입으로 래핑된 메시지 처리
    let messageData = message;
    if (message.type === 'receive-message' && message.data) {
      messageData = message.data;
      console.log('래핑된 메시지 데이터:', messageData);
    }
    
    // 일반 메시지 수신 알림 (고객 정보 메시지는 별도 처리)
    const messageType = messageData.type || message.type;
    if (messageType !== 'customer-info-display' && messageType !== 'customer-info-updated') {
      const timestamp = new Date().toLocaleTimeString();
      setLastMessage(`${timestamp} - ${messageType} 메시지 수신`);
      
      // 3초 후 메시지 알림 제거
      setTimeout(() => {
        setLastMessage('');
      }, 3000);
    }

    switch (messageData.type) {
      // 기존 메시지 타입들
      case 'CUSTOMER_INFO_REQUEST':
        setCustomer(prev => ({ ...prev, currentStep: 'info_input' }));
        break;
      case 'FORM_DISPLAY':
        setCurrentForm(messageData.data);
        setCustomer(prev => ({ ...prev, currentStep: 'form_filling' }));
        break;
      case 'SIGNATURE_REQUEST':
        setShowSignature(true);
        setCustomer(prev => ({ ...prev, currentStep: 'signature' }));
        break;
      case 'CONSULTATION_COMPLETE':
        setCustomer(prev => ({ ...prev, currentStep: 'complete' }));
        break;

      // 웹 버전에서 추가된 메시지 타입들
      case 'session-joined':
        if (messageData.userType === 'employee') {
          setIsConnected(true);
          setEmployeeName(messageData.userId || '직원');
          setIsWaitingForEmployee(false);
          console.log('직원 연결됨:', messageData.userId);
        }
        break;
      case 'employee-connected':
        setIsConnected(true);
        setEmployeeName(messageData.employeeName || '직원');
        setIsWaitingForEmployee(false);
        break;
      case 'customer-info-updated':
      case 'customer-info-display':
        // 행원이 고객 정보를 보여주기 요청했을 때
        console.log('🎯 고객 정보 표시 메시지 처리 시작');
        console.log('messageData:', messageData);
        console.log('messageData.data:', messageData.data);
        
        const customerData = messageData.data?.customer || messageData.customerData;
        console.log('추출된 고객 정보:', customerData);
        
        if (customerData) {
          setCurrentCustomer(customerData);
          setIsWaitingForEmployee(false);
          console.log('✅ 고객 정보 상태 업데이트 완료:', customerData);
          
          // 고객 정보 수신 특별 알림
          setLastMessage(`고객 정보 수신: ${customerData.Name || '고객'}`);
          setTimeout(() => {
            setLastMessage('');
          }, 5000); // 고객 정보는 5초간 표시
          
          if (customerData.CustomerID) {
            console.log('고객 상품 정보 조회 시작:', customerData.CustomerID);
            fetchCustomerProducts(customerData.CustomerID);
          }
        } else {
          console.log('❌ 고객 정보가 없습니다');
          setLastMessage('고객 정보 수신 실패');
          setTimeout(() => {
            setLastMessage('');
          }, 3000);
        }
        break;
      case 'product-detail-sync':
        // 상품 상세 메시지를 받으면 직원이 연결된 것으로 간주
        if (!isConnected) {
          setIsConnected(true);
          setEmployeeName('직원');
          setIsWaitingForEmployee(false);
          console.log('직원 연결됨 (상품 동기화를 통해 감지)');
        }
        setSelectedProductDetail(messageData.data || messageData.productData);
        setShowProductDetail(true);
        break;
      case 'form-display':
        // 서식 표시 메시지 처리
        console.log('서식 표시 메시지 수신:', messageData);
        setFormData(messageData.data);
        setShowForm(true);
        // 직원이 연결되지 않았다면 연결상태로 설정
        if (!isConnected) {
          setIsConnected(true);
          setEmployeeName('직원');
          setIsWaitingForEmployee(false);
        }
        break;
      case 'form-preview':
        // PDF 폼 미리보기
        console.log('PDF 폼 미리보기 수신:', messageData);
        setFormData(messageData.data);
        break;
      case 'FIELD_INPUT_REQUEST':
        // 필드 입력 요청 처리
        console.log('필드 입력 요청 수신:', messageData);
        setFieldInputData(messageData.field);
        setShowFieldInput(true);
        break;
      case 'FIELD_INPUT_COMPLETED':
        // 필드 입력 완료 메시지 (태블릿에서 보낸 것이 다시 돌아옴)
        console.log('필드 입력 완료 메시지 수신 (에코):', messageData);
        break;
      case 'form-completed':
        // 완성된 PDF 폼
        console.log('완성된 PDF 폼 수신:', messageData);
        setFormData(messageData.data);
        setShowForm(true);
        break;
      case 'session-status':
        if (messageData.connected) {
          setIsConnected(true);
          setEmployeeName(messageData.employeeName || '직원');
          setIsWaitingForEmployee(false);
        }
        break;
      default:
        console.log('알 수 없는 메시지 타입:', messageData.type);
        break;
    }
  };

  // 고객 보유 상품 조회 함수
  const fetchCustomerProducts = async (customerId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/customers/${customerId}/products`,
      );
      if (response.data.success) {
        setCustomerProducts(response.data.data.products);
        setProductSummary(response.data.data.summary);
        console.log(
          '고객 보유 상품 로드:',
          response.data.data.products.length,
          '개',
        );
      }
    } catch (error) {
      console.error('고객 보유 상품 조회 실패:', error);
    }
  };

  // 상담 시작 핸들러
  const handleStartConsultation = () => {
    if (stompClient && stompClient.active) {
      stompClient.publish({
        destination: '/app/send-message',
        body: JSON.stringify({
          sessionId: sessionId,
          type: 'start-consultation',
          ready: true,
        }),
      });
    }
  };

  // 고객 정보 확인 핸들러
  const handleCustomerInfoConfirm = () => {
    if (stompClient && stompClient.active && currentCustomer) {
      stompClient.publish({
        destination: '/app/send-message',
        body: JSON.stringify({
          sessionId: sessionId,
          type: 'customer-info-confirmed',
          customerData: currentCustomer,
        }),
      });
    }
  };

  // 필드 입력 완료 핸들러
  const handleFieldInputComplete = (inputValue: string) => {
    if (stompClient && stompClient.active && fieldInputData) {
      stompClient.publish({
        destination: '/app/send-message',
        body: JSON.stringify({
          sessionId: sessionId,
          type: 'FIELD_INPUT_COMPLETED',
          field: {
            id: fieldInputData.id,
            value: inputValue,
          },
        }),
      });
    }

    setShowFieldInput(false);
    setFieldInputData(null);
  };

  // 필드 입력 취소 핸들러
  const handleFieldInputCancel = () => {
    setShowFieldInput(false);
    setFieldInputData(null);
  };

  const sendCustomerInfo = () => {
    if (!customer.name || !customer.phoneNumber || !customer.rrn) {
      Alert.alert('오류', '모든 정보를 입력해주세요.');
      return;
    }

    if (stompClient) {
      stompClient.publish({
        destination: '/app/customer-info',
        body: JSON.stringify(customer),
      });
      setCustomer(prev => ({ ...prev, currentStep: 'waiting_employee' }));
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  };

  const onSaveEvent = (signature: string) => {
    const signatureData = {
      signature: signature,
      customerId: customer.id || 0,
      formId: currentForm?.id || 0,
    };

    if (stompClient) {
      stompClient.publish({
        destination: '/app/signature',
        body: JSON.stringify(signatureData),
      });
    }

    setShowSignature(false);
    setCustomer(prev => ({ ...prev, currentStep: 'waiting_employee' }));
    Alert.alert('완료', '서명이 저장되었습니다.');
  };

  const resetSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
  };

  const renderWelcomeScreen = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.welcomeContainer}
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>🏦 하나은행</Text>
        <Text style={styles.welcomeSubtitle}>스마트 금융 상담 시스템</Text>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: isConnected ? '#e8f5e8' : '#fff3e0' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isConnected ? '#2e7d32' : '#f57c00' },
            ]}
          >
            {isConnected
              ? `✅ ${employeeName} 직원과 연결되었습니다`
              : '⏳ 직원 연결을 기다리는 중...'}
          </Text>
        </View>

        {sessionId && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>세션 정보</Text>
            <Text style={styles.sessionText}>
              <Text style={styles.bold}>세션 ID:</Text> {sessionId}
            </Text>
            <Text style={styles.sessionText}>
              <Text style={styles.bold}>상태:</Text>{' '}
              {isConnected ? '연결됨' : '대기중'}
            </Text>
          </View>
        )}

        {currentCustomer && (
          <>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>고객 정보 확인</Text>
              <Text style={styles.sessionText}>
                <Text style={styles.bold}>성함:</Text> {currentCustomer.Name}
              </Text>
              <Text style={styles.sessionText}>
                <Text style={styles.bold}>연락처:</Text> {currentCustomer.Phone}
              </Text>
              <Text style={styles.sessionText}>
                <Text style={styles.bold}>나이:</Text> {currentCustomer.Age}세
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCustomerInfoConfirm}
              >
                <Text style={styles.actionButtonText}>정보 확인 완료</Text>
              </TouchableOpacity>
            </View>

            {productSummary && (
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>💰 보유 상품 현황</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>총 자산</Text>
                    <Text style={[styles.summaryValue, styles.positive]}>
                      {productSummary.totalAssets.toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>총 부채</Text>
                    <Text style={[styles.summaryValue, styles.negative]}>
                      {productSummary.totalDebts.toLocaleString()}원
                    </Text>
                  </View>
                </View>
                <View style={styles.netAssetsContainer}>
                  <Text style={styles.summaryLabel}>순자산</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      styles.netAssets,
                      productSummary.netAssets >= 0
                        ? styles.positive
                        : styles.negative,
                    ]}
                  >
                    {productSummary.netAssets.toLocaleString()}원
                  </Text>
                </View>
              </View>
            )}

            {customerProducts.length > 0 && (
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>
                  📋 보유 상품 목록 ({customerProducts.length}개)
                </Text>
                <ScrollView
                  style={styles.productsList}
                  showsVerticalScrollIndicator={false}
                >
                  {customerProducts.map((product, index) => (
                    <View
                      key={index}
                      style={[
                        styles.productItem,
                        {
                          backgroundColor:
                            product.balance >= 0 ? '#f8fff8' : '#fff8f8',
                        },
                      ]}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>
                          {product.product_name}
                        </Text>
                        <Text style={styles.productType}>
                          {product.product_type} | {product.interest_rate}%
                        </Text>
                      </View>
                      <View style={styles.productBalance}>
                        <Text
                          style={[
                            styles.balanceAmount,
                            product.balance >= 0
                              ? styles.positive
                              : styles.negative,
                          ]}
                        >
                          {product.balance >= 0 ? '+' : ''}
                          {product.balance.toLocaleString()}원
                        </Text>
                        {product.monthly_payment !== 0 && (
                          <Text style={styles.monthlyPayment}>
                            월 {product.monthly_payment >= 0 ? '+' : ''}
                            {product.monthly_payment.toLocaleString()}원
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {isConnected && !currentCustomer && (
          <View style={styles.waitingSection}>
            <Text style={styles.waitingText}>
              직원이 신분증을 확인하는 동안 잠시 기다려 주세요.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartConsultation}
            >
              <Text style={styles.actionButtonText}>상담 준비 완료</Text>
            </TouchableOpacity>
          </View>
        )}

        {isWaitingForEmployee && (
          <View style={styles.waitingSection}>
            <Text style={styles.waitingText}>
              직원이 시스템에 접속하면 자동으로 연결됩니다.
            </Text>
          </View>
        )}

        {!isConnected && (
          <View style={styles.connectionSection}>
            <Text style={styles.connectionProblem}>
              ⚠️ WebSocket 연결 실패
            </Text>
            <Text style={styles.connectionHelp}>
              • SockJS URL: {HTTP_WS_URL}{'\n'}
              • 네이티브 WSS URL: {WS_URL}{'\n'}
              • HTTPS → WSS 변환 확인 중...{'\n'}
              • 잠시 후 자동으로 재시도됩니다
            </Text>
            <TouchableOpacity
              style={styles.reconnectButton}
              onPress={async () => {
                setLastMessage('수동 재연결 시도 중...');
                const networkOk = await testNetworkConnection();
                if (networkOk) {
                  setupWebSocket();
                } else {
                  setLastMessage('네트워크 연결 실패');
                }
              }}
            >
              <Text style={styles.reconnectButtonText}>🔄 연결 재시도</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() =>
                setCustomer(prev => ({ ...prev, currentStep: 'info_input' }))
              }
            >
              <Text style={styles.startButtonText}>상담 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderInfoInput = () => (
    <View style={styles.formContainer}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>고객 정보 입력</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>성함</Text>
          <TextInput
            style={styles.textInput}
            value={customer.name}
            onChangeText={text =>
              setCustomer(prev => ({ ...prev, name: text }))
            }
            placeholder="성함을 입력해주세요"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>연락처</Text>
          <TextInput
            style={styles.textInput}
            value={customer.phoneNumber}
            onChangeText={text =>
              setCustomer(prev => ({ ...prev, phoneNumber: text }))
            }
            placeholder="연락처를 입력해주세요"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>주민등록번호</Text>
          <TextInput
            style={styles.textInput}
            value={customer.rrn}
            onChangeText={text => setCustomer(prev => ({ ...prev, rrn: text }))}
            placeholder="주민등록번호를 입력해주세요"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={sendCustomerInfo}
        >
          <Text style={styles.submitButtonText}>정보 전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFormDisplay = () => (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{currentForm?.productName}</Text>
        <Text style={styles.formSubtitle}>{currentForm?.formName}</Text>

        <View style={styles.formContent}>
          <Text style={styles.sectionTitle}>상품 정보</Text>
          <Text style={styles.infoText}>
            금리: {currentForm?.interestRate}%
          </Text>
          <Text style={styles.infoText}>
            상품 유형: {currentForm?.formType}
          </Text>

          {currentForm?.formFields.map((field, index) => (
            <View key={field.id} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {field.fieldName} {field.required && '*'}
              </Text>
              {field.fieldType === 'text' && (
                <TextInput
                  style={styles.textInput}
                  placeholder={`${field.fieldName}을(를) 입력해주세요`}
                />
              )}
              {field.fieldType === 'select' && (
                <View style={styles.optionsContainer}>
                  {field.options.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={optionIndex}
                      style={styles.optionButton}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderSignature = () => (
    <View style={styles.signatureContainer}>
      <Text style={styles.signatureTitle}>전자 서명</Text>
      <Text style={styles.signatureSubtitle}>아래 영역에 서명해주세요</Text>

      <View style={styles.signatureBox}>
        <SignatureScreen
          ref={signatureRef}
          onOK={onSaveEvent}
          onEmpty={() => Alert.alert('알림', '서명을 작성해주세요')}
          descriptionText="서명"
          clearText="지우기"
          confirmText="확인"
          webStyle={`
            .m-signature-pad--footer {display: none; margin: 0px;}
            body,html {
              width: 100%; height: 100%;
            }
          `}
        />
      </View>

      <View style={styles.signatureButtons}>
        <TouchableOpacity style={styles.resetButton} onPress={resetSignature}>
          <Text style={styles.buttonText}>다시 쓰기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveSignature}>
          <Text style={styles.buttonText}>서명 완료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWaiting = () => (
    <View style={styles.waitingContainer}>
      <Text style={styles.waitingTitle}>잠시만 기다려주세요</Text>
      <Text style={styles.waitingSubtitle}>
        {customer.currentStep === 'waiting_employee'
          ? '행원이 확인 중입니다...'
          : '상담 준비 중입니다...'}
      </Text>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <Text style={styles.completeTitle}>상담이 완료되었습니다</Text>
      <Text style={styles.completeSubtitle}>
        하나은행을 이용해 주셔서 감사합니다
      </Text>

      <TouchableOpacity
        style={styles.newConsultationButton}
        onPress={() => {
          setCustomer({
            name: '',
            phoneNumber: '',
            rrn: '',
            currentStep: 'waiting',
          });
          setCurrentForm(null);
          setShowSignature(false);
        }}
      >
        <Text style={styles.newConsultationText}>새 상담 시작</Text>
      </TouchableOpacity>
    </View>
  );

  // 세션 연결 화면 표시
  if (showSessionConnector) {
    return (
      <SessionConnector 
        onConnect={handleSessionConnect}
        isConnecting={isConnecting}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>하나은행 스마트 상담</Text>
        <View
          style={[
            styles.connectionStatus,
            { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
          ]}
        >
          <Text style={styles.connectionText}>
            {isConnected ? '연결됨' : networkStatus}
          </Text>
        </View>
      </View>

      {/* 간단한 WebSocket 연결 컴포넌트 */}
      <SimpleWebSocket 
        sessionId={sessionId}
        onMessage={handleWebSocketMessage}
      />

      <TouchableOpacity
        style={styles.sessionChangeButton}
        onPress={() => setShowSessionConnector(true)}
      >
        <Text style={styles.sessionChangeButtonText}>세션 변경</Text>
      </TouchableOpacity>

      {customer.currentStep === 'waiting' && renderWelcomeScreen()}
      {customer.currentStep === 'info_input' && renderInfoInput()}
      {customer.currentStep === 'form_filling' && renderFormDisplay()}
      {showSignature && renderSignature()}
      {(customer.currentStep === 'waiting_employee' ||
        customer.currentStep === 'processing') &&
        renderWaiting()}
      {customer.currentStep === 'complete' && renderComplete()}

      {/* 필드 입력 모달 */}
      {showFieldInput && fieldInputData && (
        <TabletFieldInput
          fieldData={fieldInputData}
          onComplete={handleFieldInputComplete}
          onCancel={handleFieldInputCancel}
        />
      )}

      {/* 상품 상세보기 모달 */}
      <ProductDetailModal
        productDetail={selectedProductDetail}
        visible={showProductDetail}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProductDetail(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00b894',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  connectionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 8,
    maxWidth: 600,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 24,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#00b894',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    elevation: 4,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 10,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#00b894',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formContent: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  signatureContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 10,
  },
  signatureSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  signatureBox: {
    width: width * 0.8,
    height: height * 0.5,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 4,
  },
  signature: {
    flex: 1,
  },
  signatureButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 20,
  },
  saveButton: {
    backgroundColor: '#00b894',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 15,
  },
  waitingSubtitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  newConsultationButton: {
    backgroundColor: '#00b894',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 4,
  },
  newConsultationText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // 새로 추가된 스타일들
  statusCard: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  sessionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#00b894',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#2e7d32',
  },
  negative: {
    color: '#c62828',
  },
  netAssetsContainer: {
    backgroundColor: '#f3e5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  netAssets: {
    fontSize: 18,
  },
  productsList: {
    maxHeight: 250,
  },
  productItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: '#666',
  },
  productBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  monthlyPayment: {
    fontSize: 12,
    color: '#666',
  },
  waitingSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  connectionSection: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  connectionProblem: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  connectionHelp: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  reconnectButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 4,
  },
  reconnectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#f5f5f5',
    margin: 10,
    padding: 10,
    borderRadius: 5,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  sessionInfo: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 4,
  },
  connectionStatusText: {
    fontSize: 14,
    color: '#333',
  },
  sessionButton: {
    backgroundColor: '#00b894',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sessionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageAlert: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 1,
  },
  messageAlertText: {
    fontSize: 15,
    color: '#1b5e20',
    fontWeight: '600',
    textAlign: 'center',
  },
  sessionChangeButton: {
    backgroundColor: '#00b894',
    margin: 10,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  sessionChangeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomerTablet;
