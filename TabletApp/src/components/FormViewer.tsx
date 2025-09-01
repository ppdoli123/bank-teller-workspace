import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

interface FormField {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  required?: boolean;
  options?: string[];
  mask?: string;
  format?: string;
  suffix?: string;
  text?: string;
}

interface FormViewerProps {
  formUrl: string;
  formData: any;
  formFields: FormField[];
  onFormDataChange: (data: any) => void;
  onClose: () => void;
  isCustomerInput?: boolean;
}

const FormViewer: React.FC<FormViewerProps> = ({
  formUrl,
  formData,
  formFields,
  onFormDataChange,
  onClose,
  isCustomerInput = true,
}) => {
  const [currentData, setCurrentData] = useState<any>(formData || {});
  const [signatureData, setSignatureData] = useState<any>({});

  useEffect(() => {
    setCurrentData(formData || {});
  }, [formData]);

  const handleInputChange = (fieldId: string, value: any) => {
    const updatedData = { ...currentData, [fieldId]: value };
    setCurrentData(updatedData);
    onFormDataChange(updatedData);
  };

  const handleSignatureCapture = (fieldId: string) => {
    // 간단한 서명 시뮬레이션
    Alert.alert('서명', '서명을 완료하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '완료',
        onPress: () => {
          const signatureUrl =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
          setSignatureData(prev => ({ ...prev, [fieldId]: signatureUrl }));
          handleInputChange(fieldId, signatureUrl);
        },
      },
    ]);
  };

  const formatValue = (value: any, field: FormField) => {
    if (!value) return '';

    if (field.format === 'currency') {
      return new Intl.NumberFormat('ko-KR').format(value);
    }

    if (field.suffix) {
      return `${value}${field.suffix}`;
    }

    return value;
  };

  const renderField = (field: FormField) => {
    const value = currentData[field.id] || '';

    if (field.type === 'signature') {
      return (
        <View key={field.id} style={styles.signatureContainer}>
          <Text style={styles.fieldLabel}>
            {field.label} {field.required && '*'}
          </Text>
          <TouchableOpacity
            style={styles.signatureBox}
            onPress={() => handleSignatureCapture(field.id)}
          >
            {value ? (
              <Text style={styles.signatureText}>서명 완료</Text>
            ) : (
              <Text style={styles.signaturePlaceholder}>서명하기</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <View key={field.id} style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => handleInputChange(field.id, !value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{field.text}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (field.type === 'select') {
      return (
        <View key={field.id} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label} {field.required && '*'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              {field.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    value === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleInputChange(field.id, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    if (field.type === 'date') {
      return (
        <View key={field.id} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label} {field.required && '*'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={text => handleInputChange(field.id, text)}
            placeholder={`${field.label}을(를) 입력하세요`}
            placeholderTextColor="#999"
          />
        </View>
      );
    }

    // 일반 텍스트/숫자 입력
    return (
      <View key={field.id} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.label} {field.required && '*'}
        </Text>
        <TextInput
          style={styles.textInput}
          value={formatValue(value, field)}
          onChangeText={text => {
            let inputValue = text;

            // 통화 포맷 제거
            if (field.format === 'currency') {
              inputValue = inputValue.replace(/[^\d]/g, '');
            }

            // 접미사 제거
            if (field.suffix) {
              inputValue = inputValue.replace(field.suffix, '');
            }

            handleInputChange(field.id, inputValue);
          }}
          placeholder={`${field.label}을(를) 입력하세요`}
          placeholderTextColor="#999"
          keyboardType={field.type === 'number' ? 'numeric' : 'default'}
          editable={isCustomerInput}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 서식 작성</Text>
        {isCustomerInput && (
          <Text style={styles.headerSubtitle}>고객 입력 모드</Text>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* PDF 뷰어 */}
        <View style={styles.pdfContainer}>
          <WebView
            source={{ uri: formUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </View>

        {/* 입력 필드 */}
        <ScrollView
          style={styles.fieldsContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.fieldsTitle}>입력 항목</Text>
          {formFields.map(renderField)}

          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>진행률</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(
                      (Object.values(currentData).filter(
                        (v: any) => v && v.toString().trim() !== '',
                      ).length /
                        formFields.length) *
                        100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {
                Object.values(currentData).filter(
                  (v: any) => v && v.toString().trim() !== '',
                ).length
              }{' '}
              / {formFields.length} 완료
            </Text>
          </View>
        </ScrollView>
      </View>
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
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  fieldsContainer: {
    width: 300,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  fieldsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  signatureContainer: {
    marginBottom: 15,
  },
  signatureBox: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  signatureText: {
    color: '#00b894',
    fontWeight: 'bold',
  },
  signaturePlaceholder: {
    color: '#999',
  },
  checkboxContainer: {
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#00b894',
  },
  optionText: {
    fontSize: 12,
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
  },
  progressContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00b894',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default FormViewer;

