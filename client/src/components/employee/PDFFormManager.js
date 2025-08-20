import React, { useState } from 'react';
import styled from 'styled-components';
import InteractiveFormDocument from './InteractiveFormDocument';
import ActualBankForm from './ActualBankForm';
import { formTemplates } from '../../data/formTemplates';

const FormManagerContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const FormLibrary = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
`;

const FormViewer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const LibraryHeader = styled.h3`
  margin: 0 0 20px 0;
  color: var(--hana-mint);
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormCard = styled.div`
  background: ${props => props.selected ? 'rgba(0, 133, 122, 0.1)' : '#f8f9fa'};
  border: 2px solid ${props => props.selected ? 'var(--hana-mint)' : '#e9ecef'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--hana-mint);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 133, 122, 0.2);
  }
`;

const FormTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  font-weight: bold;
`;

const FormDescription = styled.p`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
`;

const FormMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => {
      switch (props.status) {
        case 'completed': return '#4caf50';
        case 'in-progress': return '#ff9800';
        default: return '#e0e0e0';
      }
    }};
  }
`;

const ViewerHeader = styled.div`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewerTitle = styled.h2`
  margin: 0;
  color: var(--hana-mint);
  font-size: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? 'var(--hana-mint)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--hana-mint)'};
  border: 2px solid var(--hana-mint);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.primary ? 'var(--hana-mint-dark)' : 'rgba(0, 133, 122, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  text-align: center;
  padding: 40px;

  .emoji {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px 0;
    color: #666;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }
`;

const FormProgress = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(0, 133, 122, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 133, 122, 0.2);
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
  
  .fill {
    height: 100%;
    background: var(--hana-mint);
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 11px;
  color: var(--hana-mint);
  font-weight: bold;
  text-align: center;
`;

const PDFFormManager = ({ onFormComplete, onFormSelect }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [signatures, setSignatures] = useState({});
  const [formProgress, setFormProgress] = useState({});
  
  // 폼 라이브러리 - 실제 하나은행 템플릿과 연동
  const formLibrary = [
    {
      id: 'loan',
      title: formTemplates.loan.title,
      description: formTemplates.loan.description,
      category: '자동이체',
      template: formTemplates.loan,
      status: formProgress.loan?.status || 'empty',
      progress: formProgress.loan?.progress || 0,
      fields: formTemplates.loan.sections.reduce((total, section) => total + section.fields.length, 0)
    },
    {
      id: 'account',
      title: formTemplates.account.title,
      description: formTemplates.account.description,
      category: '계좌개설',
      template: formTemplates.account,
      status: formProgress.account?.status || 'empty',
      progress: formProgress.account?.progress || 0,
      fields: formTemplates.account.sections.reduce((total, section) => total + section.fields.length, 0)
    },
    {
      id: 'card',
      title: formTemplates.card.title,
      description: formTemplates.card.description,
      category: '증명서발급',
      template: formTemplates.card,
      status: formProgress.card?.status || 'empty',
      progress: formProgress.card?.progress || 0,
      fields: formTemplates.card.sections.reduce((total, section) => total + section.fields.length, 0)
    }
  ];

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setFormData({});
    setSignatures({});
    onFormSelect && onFormSelect({
      ...form.template,
      id: form.id
    });
  };

  const handleFieldChange = (fieldId, value) => {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);
    
    if (selectedForm) {
      updateFormProgress(selectedForm.id, newData, signatures);
    }
  };

  const handleSignature = (fieldId, signatureData) => {
    const newSignatures = { ...signatures, [fieldId]: signatureData };
    setSignatures(newSignatures);
    
    if (selectedForm) {
      updateFormProgress(selectedForm.id, formData, newSignatures);
    }
  };

  const updateFormProgress = (formId, data, sigs) => {
    const form = formLibrary.find(f => f.id === formId);
    if (!form) return;

    // 필수 필드 계산
    const requiredFields = [];
    form.template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'row') {
          field.fields.forEach(rowField => {
            if (rowField.required) requiredFields.push(rowField);
          });
        } else if (field.required) {
          requiredFields.push(field);
        }
      });
    });

    // 완성된 필드 계산
    const completedFields = requiredFields.filter(field => {
      if (field.type === 'signature') {
        return sigs[field.id];
      } else {
        return data[field.id] && data[field.id].trim() !== '';
      }
    });

    const progress = requiredFields.length > 0 
      ? Math.round((completedFields.length / requiredFields.length) * 100)
      : 0;

    const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'empty';

    setFormProgress(prev => ({
      ...prev,
      [formId]: { progress, status }
    }));
  };

  const handleFormSubmit = (submissionData) => {
    if (selectedForm) {
      const completedForm = {
        id: selectedForm.id,
        title: selectedForm.title,
        template: selectedForm.template,
        ...submissionData,
        status: 'completed'
      };
      
      onFormComplete && onFormComplete(completedForm);
      
      // 고객 태블릿으로 폼 데이터 전송
      if (window.wsConnection && window.wsConnection.readyState === WebSocket.OPEN) {
        window.wsConnection.send(JSON.stringify({
          type: 'FORM_UPDATE',
          form: {
            ...selectedForm.template,
            id: selectedForm.id,
            formData: submissionData.formData,
            signatures: submissionData.signatures,
            status: 'completed'
          }
        }));
      }
      
      alert('서식이 성공적으로 제출되었습니다!');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '작성중';
      default: return '미작성';
    }
  };

  return (
    <FormManagerContainer>
      <FormLibrary>
        <LibraryHeader>
          📋 서식 라이브러리
        </LibraryHeader>
        
        {formLibrary.map(form => (
          <FormCard
            key={form.id}
            selected={selectedForm?.id === form.id}
            onClick={() => handleFormSelect(form)}
          >
            <FormTitle>{form.title}</FormTitle>
            <FormDescription>{form.description}</FormDescription>
            
            <FormMeta>
              <span>{form.category}</span>
              <StatusIndicator status={form.status}>
                <span className="status-dot"></span>
                <span>{getStatusText(form.status)}</span>
              </StatusIndicator>
            </FormMeta>

            {form.progress > 0 && (
              <FormProgress>
                <ProgressBar progress={form.progress}>
                  <div className="fill"></div>
                </ProgressBar>
                <ProgressText>{form.progress}% 완료</ProgressText>
              </FormProgress>
            )}
          </FormCard>
        ))}
      </FormLibrary>

      <FormViewer>
        {selectedForm ? (
          <>
            <ViewerHeader>
              <ViewerTitle>{selectedForm.title}</ViewerTitle>
              <ActionButtons>
                <ActionButton onClick={() => setSelectedForm(null)}>
                  목록으로
                </ActionButton>
              </ActionButtons>
            </ViewerHeader>
            
            {/* 실제 하나은행 서식 레이아웃 표시 */}
            {selectedForm.id === 'loan' ? (
              <ActualBankForm 
                onFormComplete={handleFormSubmit}
              />
            ) : (
              <InteractiveFormDocument
                formConfig={selectedForm.template}
                onFieldChange={handleFieldChange}
                onSignature={handleSignature}
                onSubmit={handleFormSubmit}
              />
            )}
          </>
        ) : (
          <EmptyState>
            <div className="emoji">📋</div>
            <h3>서식을 선택해주세요</h3>
            <p>
              왼쪽 목록에서 작성할 서식을 선택하시면<br />
              대화형 서식 작성이 시작됩니다.
            </p>
          </EmptyState>
        )}
      </FormViewer>
    </FormManagerContainer>
  );
};

export default PDFFormManager;
