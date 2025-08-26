import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface SessionConnectorProps {
  onConnect: (sessionId: string) => void;
  isConnecting: boolean;
}

const SessionConnector: React.FC<SessionConnectorProps> = ({
  onConnect,
  isConnecting,
}) => {
  const [sessionId, setSessionId] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleConnect = () => {
    if (!sessionId.trim()) {
      Alert.alert('오류', '세션 ID를 입력해주세요.');
      return;
    }

    onConnect(sessionId.trim());
  };

  const handleUseDefault = () => {
    // 개발용 기본 세션 ID (웹 클라이언트와 동일한 형식)
    const defaultSessionId = 'session_' + Date.now();
    Alert.alert(
      '테스트 세션 생성', 
      `세션 ID: ${defaultSessionId}\n\n웹 클라이언트에서 이 세션 ID를 사용하여 연결하세요.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '연결', onPress: () => onConnect(defaultSessionId) }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🏦 하나은행 스마트 상담</Text>
          <Text style={styles.subtitle}>태블릿 연결</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>행원 ID 또는 세션 ID</Text>
          <TextInput
            style={styles.input}
            value={sessionId}
            onChangeText={setSessionId}
            placeholder="행원 ID를 입력하세요 (예: EMP001)"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            <Text style={styles.buttonText}>
              {isConnecting ? '연결 중...' : '🔗 연결하기'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.divider}>또는</Text>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              // QR 코드 스캔 기능은 나중에 구현
              Alert.alert('QR 스캔', 'QR 코드 스캔 기능은 개발 중입니다. 세션 ID를 직접 입력해주세요.');
            }}
            disabled={isConnecting}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              📷 QR 코드 스캔
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleUseDefault}
            disabled={isConnecting}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              🧪 테스트 세션 사용
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>📋 사용 방법</Text>
          <Text style={styles.instructionText}>
            1. 웹 클라이언트에서 직원 로그인 후 생성된 세션 ID를 입력하세요{'\n'}
            2. 또는 "테스트 세션 사용" 버튼으로 새 세션을 생성하세요{'\n'}
            3. 연결 완료 후 대기 상태로 전환됩니다{'\n'}
            4. 행원이 "보여주기" 버튼을 누르면 화면에 표시됩니다
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00857C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#00857C',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00857C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#00857C',
  },
  divider: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 16,
  },
  instructions: {
    backgroundColor: '#e8f5f4',
    borderRadius: 12,
    padding: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00857C',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default SessionConnector;
