import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface TabletFieldInputProps {
  fieldData: {
    id: string;
    name: string;
    type: string;
    label: string;
    required?: boolean;
  };
  onComplete: (value: string) => void;
  onCancel: () => void;
}

const TabletFieldInput: React.FC<TabletFieldInputProps> = ({
  fieldData,
  onComplete,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleComplete = () => {
    if (fieldData.required && !inputValue.trim()) {
      return;
    }
    onComplete(inputValue);
  };

  const getKeyboardType = () => {
    switch (fieldData.type) {
      case 'number':
        return 'numeric';
      case 'phone':
        return 'phone-pad';
      case 'email':
        return 'email-address';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>필드 입력</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.fieldLabel}>
              {fieldData.label}
              {fieldData.required && <Text style={styles.required}> *</Text>}
            </Text>

            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`${fieldData.label}을(를) 입력해주세요`}
              keyboardType={getKeyboardType()}
              autoFocus={true}
              multiline={fieldData.type === 'textarea'}
              numberOfLines={fieldData.type === 'textarea' ? 4 : 1}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.completeButton,
                  !inputValue.trim() &&
                    fieldData.required &&
                    styles.disabledButton,
                ]}
                onPress={handleComplete}
                disabled={!inputValue.trim() && fieldData.required}
              >
                <Text style={styles.completeButtonText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: width * 0.8,
    maxWidth: 500,
    maxHeight: height * 0.7,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b894',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  required: {
    color: '#e74c3c',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#00b894',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default TabletFieldInput;
