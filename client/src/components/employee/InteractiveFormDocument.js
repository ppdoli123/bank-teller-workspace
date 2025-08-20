import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import SignatureCanvas from 'react-signature-canvas';

const FormContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  overflow: auto;
  padding: 20px;
`;

const FormDocument = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-mint-dark) 100%);
  color: white;
  padding: 32px;
  text-align: center;
`;

const FormTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: bold;
`;

const FormSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
`;

const FormBody = styled.div`
  padding: 40px;
`;

const FormSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: var(--hana-mint);
  margin: 0 0 16px 0;
  font-size: 20px;
  border-bottom: 2px solid var(--hana-mint);
  padding-bottom: 8px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FormField = styled.div`
  flex: ${props => props.flex || 1};
  min-width: 0;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  
  &.required::after {
    content: ' *';
    color: #ff4444;
  }
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Hana2', sans-serif;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--hana-mint);
    box-shadow: 0 0 0 3px rgba(0, 133, 122, 0.1);
  }
  
  &.filled {
    background: rgba(76, 175, 80, 0.05);
    border-color: #4caf50;
  }
  
  &.error {
    border-color: #ff4444;
    background: rgba(255, 68, 68, 0.05);
  }
`;

const FieldSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Hana2', sans-serif;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--hana-mint);
    box-shadow: 0 0 0 3px rgba(0, 133, 122, 0.1);
  }
`;

const SignatureField = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fafafa;
  transition: all 0.3s ease;
  
  &.active {
    border-color: var(--hana-mint);
    background: rgba(0, 133, 122, 0.05);
  }
  
  &.signed {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }
`;

const SignatureButton = styled.button`
  background: var(--hana-mint);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--hana-mint-dark);
  }
`;

const SignatureModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const SignatureContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  
  button {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.primary {
      background: var(--hana-mint);
      color: white;
      
      &:hover {
        background: var(--hana-mint-dark);
      }
    }
    
    &.secondary {
      background: #f5f5f5;
      color: #333;
      
      &:hover {
        background: #e0e0e0;
      }
    }
    
    &.danger {
      background: #ff4444;
      color: white;
      
      &:hover {
        background: #cc3333;
      }
    }
  }
`;

const StatusBar = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
`;

const StatusTitle = styled.h4`
  margin: 0 0 12px 0;
  color: var(--hana-mint);
  font-size: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 14px;
  
  .status {
    color: ${props => props.completed ? '#4caf50' : '#ff9800'};
    font-weight: bold;
  }
`;

const SubmitButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : 'var(--hana-mint)'};
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-top: 32px;
  width: 100%;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--hana-mint-dark);
    transform: translateY(-2px);
  }
`;

const InteractiveFormDocument = ({ formConfig, onFieldChange, onSignature, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [signatures, setSignatures] = useState({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState(null);
  const [errors, setErrors] = useState({});
  
  const signatureRef = useRef();

  const handleInputChange = (fieldId, value) => {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);
    
    // 에러 제거
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: false }));
    }
    
    onFieldChange && onFieldChange(fieldId, value);
  };

  const handleSignatureClick = (fieldId) => {
    setCurrentSignatureField(fieldId);
    setShowSignatureModal(true);
  };

  const saveSignature = () => {
    if (signatureRef.current && currentSignatureField) {
      const signatureData = signatureRef.current.toDataURL();
      const newSignatures = { ...signatures, [currentSignatureField]: signatureData };
      setSignatures(newSignatures);
      onSignature && onSignature(currentSignatureField, signatureData);
      setShowSignatureModal(false);
      setCurrentSignatureField(null);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    formConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          if (field.type === 'signature') {
            if (!signatures[field.id]) {
              newErrors[field.id] = true;
              isValid = false;
            }
          } else {
            if (!formData[field.id] || formData[field.id].trim() === '') {
              newErrors[field.id] = true;
              isValid = false;
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit && onSubmit({
        formData,
        signatures,
        submittedAt: new Date().toISOString()
      });
    } else {
      alert('필수 항목을 모두 입력해주세요.');
    }
  };

  // 완성도 계산
  const getCompletionStatus = () => {
    const allFields = [];
    formConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          allFields.push(field);
        }
      });
    });

    const completedFields = allFields.filter(field => {
      if (field.type === 'signature') {
        return signatures[field.id];
      } else {
        return formData[field.id] && formData[field.id].trim() !== '';
      }
    });

    return {
      total: allFields.length,
      completed: completedFields.length,
      fields: allFields.map(field => ({
        ...field,
        completed: field.type === 'signature' 
          ? !!signatures[field.id] 
          : !!(formData[field.id] && formData[field.id].trim() !== '')
      }))
    };
  };

  const status = getCompletionStatus();

  return (
    <FormContainer>
      <FormDocument>
        <FormHeader>
          <FormTitle>{formConfig.title}</FormTitle>
          <FormSubtitle>{formConfig.description}</FormSubtitle>
        </FormHeader>

        <FormBody>
          {formConfig.sections.map((section, sectionIndex) => (
            <FormSection key={sectionIndex}>
              <SectionTitle>{section.title}</SectionTitle>
              
              {section.fields.map((field, fieldIndex) => {
                if (field.type === 'row') {
                  return (
                    <FormRow key={fieldIndex}>
                      {field.fields.map(rowField => (
                        <FormField key={rowField.id} flex={rowField.flex}>
                          <FieldLabel className={rowField.required ? 'required' : ''}>
                            {rowField.label}
                          </FieldLabel>
                          {renderField(rowField)}
                        </FormField>
                      ))}
                    </FormRow>
                  );
                } else {
                  return (
                    <FormField key={field.id}>
                      <FieldLabel className={field.required ? 'required' : ''}>
                        {field.label}
                      </FieldLabel>
                      {renderField(field)}
                    </FormField>
                  );
                }
              })}
            </FormSection>
          ))}

          <SubmitButton
            disabled={status.completed < status.total}
            onClick={handleSubmit}
          >
            {status.completed === status.total ? '✅ 제출하기' : `📝 ${status.completed}/${status.total} 완료`}
          </SubmitButton>
        </FormBody>
      </FormDocument>

      {/* 상태 표시 */}
      <StatusBar>
        <StatusTitle>📋 작성 현황</StatusTitle>
        {status.fields.map(field => (
          <StatusItem key={field.id} completed={field.completed}>
            <span>{field.label}</span>
            <span className="status">
              {field.completed ? '✓' : '⏳'}
            </span>
          </StatusItem>
        ))}
      </StatusBar>

      {/* 서명 모달 */}
      {showSignatureModal && (
        <SignatureModal onClick={() => setShowSignatureModal(false)}>
          <SignatureContent onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--hana-mint)' }}>
              서명해주세요
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666' }}>
              아래 영역에 손가락으로 서명해주세요
            </p>
            
            <div style={{ border: '2px dashed #ccc', borderRadius: '8px', marginBottom: '16px' }}>
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 500,
                  height: 200,
                  style: { width: '100%', height: '200px' }
                }}
                backgroundColor="rgba(255, 255, 255, 0.9)"
              />
            </div>
            
            <ButtonGroup>
              <button className="danger" onClick={clearSignature}>
                지우기
              </button>
              <button className="secondary" onClick={() => setShowSignatureModal(false)}>
                취소
              </button>
              <button className="primary" onClick={saveSignature}>
                저장
              </button>
            </ButtonGroup>
          </SignatureContent>
        </SignatureModal>
      )}
    </FormContainer>
  );

  function renderField(field) {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <FieldInput
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`
              ${formData[field.id] ? 'filled' : ''}
              ${errors[field.id] ? 'error' : ''}
            `}
          />
        );
      
      case 'date':
        return (
          <FieldInput
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`
              ${formData[field.id] ? 'filled' : ''}
              ${errors[field.id] ? 'error' : ''}
            `}
          />
        );
      
      case 'select':
        return (
          <FieldSelect
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          >
            <option value="">선택해주세요</option>
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FieldSelect>
        );
      
      case 'signature':
        return (
          <SignatureField
            className={`
              ${currentSignatureField === field.id ? 'active' : ''}
              ${signatures[field.id] ? 'signed' : ''}
            `}
            onClick={() => handleSignatureClick(field.id)}
          >
            {signatures[field.id] ? (
              <img 
                src={signatures[field.id]} 
                alt="서명"
                style={{ maxWidth: '200px', maxHeight: '100px' }}
              />
            ) : (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✍️</div>
                <SignatureButton>여기를 터치하여 서명</SignatureButton>
              </div>
            )}
          </SignatureField>
        );
      
      default:
        return null;
    }
  }
};

export default InteractiveFormDocument;
