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
import { Customer, ProductForm, WebSocketMessage } from '../types';

const { width, height } = Dimensions.get('window');

const CustomerTablet: React.FC = () => {
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

  useEffect(() => {
    setupWebSocket();
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const setupWebSocket = () => {
    const socket = new SockJS('http://10.0.2.2:8080/websocket'); // Android 에뮬레이터용 localhost
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('WebSocket 연결됨');
        setIsConnected(true);
        
        // 태블릿 채널 구독
        client.subscribe('/topic/tablet', (message) => {
          const data: WebSocketMessage = JSON.parse(message.body);
          handleWebSocketMessage(data);
        });
      },
      onDisconnect: () => {
        console.log('WebSocket 연결 해제됨');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP 오류:', frame);
      },
    });

    client.activate();
    setStompClient(client);
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'CUSTOMER_INFO_REQUEST':
        setCustomer(prev => ({ ...prev, currentStep: 'info_input' }));
        break;
      case 'FORM_DISPLAY':
        setCurrentForm(message.data);
        setCustomer(prev => ({ ...prev, currentStep: 'form_filling' }));
        break;
      case 'SIGNATURE_REQUEST':
        setShowSignature(true);
        setCustomer(prev => ({ ...prev, currentStep: 'signature' }));
        break;
      case 'CONSULTATION_COMPLETE':
        setCustomer(prev => ({ ...prev, currentStep: 'complete' }));
        break;
      default:
        break;
    }
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
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>하나은행에 오신 것을 환영합니다</Text>
        <Text style={styles.welcomeSubtitle}>스마트 상담 서비스</Text>
        <Text style={styles.description}>
          행원과의 상담을 위해 고객님의 정보를 입력해주세요
        </Text>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setCustomer(prev => ({ ...prev, currentStep: 'info_input' }))}
        >
          <Text style={styles.startButtonText}>상담 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
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
            onChangeText={(text) => setCustomer(prev => ({ ...prev, name: text }))}
            placeholder="성함을 입력해주세요"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>연락처</Text>
          <TextInput
            style={styles.textInput}
            value={customer.phoneNumber}
            onChangeText={(text) => setCustomer(prev => ({ ...prev, phoneNumber: text }))}
            placeholder="연락처를 입력해주세요"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>주민등록번호</Text>
          <TextInput
            style={styles.textInput}
            value={customer.rrn}
            onChangeText={(text) => setCustomer(prev => ({ ...prev, rrn: text }))}
            placeholder="주민등록번호를 입력해주세요"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={sendCustomerInfo}>
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
          <Text style={styles.infoText}>금리: {currentForm?.interestRate}%</Text>
          <Text style={styles.infoText}>상품 유형: {currentForm?.formType}</Text>
          
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
      <Text style={styles.completeSubtitle}>하나은행을 이용해 주셔서 감사합니다</Text>
      
      <TouchableOpacity
        style={styles.newConsultationButton}
        onPress={() => {
          setCustomer({ name: '', phoneNumber: '', rrn: '', currentStep: 'waiting' });
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
        <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.connectionText}>
            {isConnected ? '연결됨' : '연결 안됨'}
          </Text>
        </View>
      </View>

      {customer.currentStep === 'waiting' && renderWelcomeScreen()}
      {customer.currentStep === 'info_input' && renderInfoInput()}
      {customer.currentStep === 'form_filling' && renderFormDisplay()}
      {showSignature && renderSignature()}
      {(customer.currentStep === 'waiting_employee' || customer.currentStep === 'processing') && renderWaiting()}
      {customer.currentStep === 'complete' && renderComplete()}
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
});

export default CustomerTablet;
