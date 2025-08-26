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
import { API_BASE_URL, WS_URL, CONFIG, ALTERNATIVE_IPS } from '../config';

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
  const [sessionId, setSessionId] = useState(CONFIG.SESSION_ID);
  const [employeeName, setEmployeeName] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isWaitingForEmployee, setIsWaitingForEmployee] = useState(true);
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

  // 디버그 정보 추가
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // 최근 10개만 유지
  };

  // 단일 IP 테스트
  const testSingleIP = async (ip: string, timeout = 5000) => {
    const testUrl = `http://${ip}:8080/api/health`;
    addDebugInfo(`🔍 IP 테스트: ${ip}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      addDebugInfo(`✅ ${ip} 연결 성공`);
      setNetworkStatus(`연결됨 (${ip})`);
      return { success: true, ip, data };
    } catch (error) {
      addDebugInfo(`❌ ${ip} 연결 실패: ${error.message}`);
      return { success: false, ip, error: error.message };
    }
  };

  // 디바이스 네트워크 정보 확인
  const getDeviceNetworkInfo = () => {
    console.log('=== 디바이스 네트워크 정보 ===');
    console.log('User Agent:', navigator.userAgent);

    // 가능한 네트워크 힌트들
    if (typeof navigator !== 'undefined' && navigator.connection) {
      console.log('연결 타입:', navigator.connection.effectiveType);
    }

    // WebRTC를 통한 로컬 IP 확인 시도 (제한적)
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      pc.onicecandidate = event => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            console.log('태블릿 로컬 IP (추정):', ipMatch[1]);
          }
        }
      };
    } catch (error) {
      console.log('로컬 IP 확인 실패:', error.message);
    }
  };

  // 네트워크 연결 테스트 (다중 IP 지원)
  const testNetworkConnection = async () => {
    addDebugInfo('=== 클라우드 백엔드 연결 테스트 시작 ===');
    setNetworkStatus('클라우드 서버 연결 중...');

    // 클라우드 백엔드 URL 테스트
    const cloudUrl = `${API_BASE_URL}/api/health`;
    addDebugInfo(`클라우드 URL: ${cloudUrl}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      const response = await fetch(cloudUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      addDebugInfo('✅ 클라우드 백엔드 연결 성공!');
      addDebugInfo(`서버 상태: ${data.message || 'OK'}`);
      setNetworkStatus('클라우드 연결됨');
      return true;
    } catch (error) {
      addDebugInfo(`❌ 클라우드 연결 실패: ${error.message}`);
      setNetworkStatus('클라우드 연결 실패');
      addDebugInfo('확인: 인터넷 연결? 서버 상태?');
      return false;
    }
  };

  useEffect(() => {
    const initializeConnection = async () => {
      console.log('=== 태블릿 앱 초기화 ===');
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

  const setupWebSocket = () => {
    console.log('=== WebSocket 연결 시도 ===');
    console.log('URL:', WS_URL);
    console.log('개발 머신 IP:', '192.168.123.7');

    try {
      // SockJS 옵션 설정
      const sockJSOptions = {
        timeout: 30000,
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      };

      const socket = new SockJS(WS_URL, null, sockJSOptions);

      // SockJS 이벤트 로깅
      socket.onopen = () => {
        console.log('SockJS 연결 성공');
        addDebugInfo('🔗 SockJS 연결 성공');
      };
      socket.onclose = e => {
        console.log('SockJS 연결 종료:', e);
        addDebugInfo(
          `❌ SockJS 연결 종료: ${e.code} ${e.reason || 'No reason'}`,
        );
      };
      socket.onerror = e => {
        console.error('SockJS 오류:', e);
        addDebugInfo(`⚠️ SockJS 오류: ${e.type || 'Unknown error'}`);
      };

      const client = new Client({
        webSocketFactory: () => socket,
        debug: str => {
          console.log('STOMP:', str);
          addDebugInfo(`STOMP: ${str.substring(0, 50)}...`);
        },
        reconnectDelay: CONFIG.RECONNECT_DELAY,
        heartbeatIncoming: CONFIG.HEARTBEAT_INCOMING,
        heartbeatOutgoing: CONFIG.HEARTBEAT_OUTGOING,
        onConnect: frame => {
          console.log('STOMP 연결 성공:', frame);
          console.log('연결된 서버:', WS_URL);
          addDebugInfo('🎉 STOMP 연결 성공!');
          addDebugInfo(`서버: ${WS_URL}`);
          setStompClient(client);
          setIsConnected(true);

          // 태블릿 세션 참여
          client.publish({
            destination: '/app/join-session',
            body: JSON.stringify({
              sessionId: sessionId,
              userType: 'customer-tablet',
            }),
          });

          // 세션 메시지 구독
          client.subscribe('/topic/session/' + sessionId, message => {
            const data = JSON.parse(message.body);
            console.log('세션 메시지 수신:', data);
            handleWebSocketMessage(data);
          });

          // 기존 태블릿 채널도 유지 (호환성을 위해)
          client.subscribe('/topic/tablet', message => {
            const data: WebSocketMessage = JSON.parse(message.body);
            handleWebSocketMessage(data);
          });
        },
        onDisconnect: () => {
          console.log('WebSocket 연결 해제됨');
          addDebugInfo('🔌 WebSocket 연결 해제됨');
          setIsConnected(false);
          setIsWaitingForEmployee(true);
        },
        onStompError: frame => {
          console.error('STOMP 오류:', frame.headers['message']);
          console.error('STOMP 오류 상세:', frame);
          addDebugInfo(
            `❌ STOMP 오류: ${frame.headers['message'] || 'Unknown'}`,
          );
          setIsConnected(false);
          setIsWaitingForEmployee(true);
        },
      });

      console.log('STOMP 클라이언트 활성화 중...');
      addDebugInfo('🚀 STOMP 클라이언트 활성화 시도...');

      client.activate();
    } catch (error) {
      console.error('WebSocket 설정 오류:', error);
      addDebugInfo(`💥 WebSocket 설정 오류: ${error.message}`);
      setIsConnected(false);
      setIsWaitingForEmployee(true);

      // 5초 후 재시도
      setTimeout(() => {
        addDebugInfo('🔄 WebSocket 재시도...');
        setupWebSocket();
      }, 5000);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    // receive-message 타입으로 래핑된 메시지 처리
    let messageData = message;
    if (message.type === 'receive-message' && message.data) {
      messageData = message.data;
      console.log('래핑된 메시지 데이터:', messageData);
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
        setCurrentCustomer(messageData.customerData || null);
        if (messageData.customerData?.CustomerID) {
          fetchCustomerProducts(messageData.customerData.CustomerID);
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
            <TouchableOpacity
              style={styles.reconnectButton}
              onPress={async () => {
                addDebugInfo('🔄 수동 재연결 시도...');
                const networkOk = await testNetworkConnection();
                if (networkOk) {
                  setupWebSocket();
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

      {/* 디버그 정보 표시 */}
      {debugInfo.length > 0 && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>네트워크 디버그</Text>
          {debugInfo.map((info, index) => (
            <Text key={index} style={styles.debugText}>
              {info}
            </Text>
          ))}
        </View>
      )}

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
  sessionInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  sessionTitle: {
    color: '#00b894',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
});

export default CustomerTablet;
