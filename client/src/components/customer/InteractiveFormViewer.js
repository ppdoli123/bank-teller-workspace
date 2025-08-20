import React from 'react';
import styled from 'styled-components';

const FormViewerContainer = styled.div`
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

const FieldValue = styled.div`
  min-height: 48px;
  padding: 12px 16px;
  border: 2px solid #4caf50;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Hana2', sans-serif;
  background: rgba(76, 175, 80, 0.05);
  display: flex;
  align-items: center;
  color: #333;
  
  &.empty {
    border-color: #e0e0e0;
    background: #f9f9f9;
    color: #999;
    font-style: italic;
  }
`;

const SignatureValue = styled.div`
  min-height: 80px;
  padding: 12px;
  border: 2px solid ${props => props.filled ? '#4caf50' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.filled ? 'rgba(76, 175, 80, 0.05)' : '#f9f9f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  img {
    max-width: 200px;
    max-height: 60px;
  }
  
  .placeholder {
    color: #999;
    font-style: italic;
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

const CompletionRate = styled.div`
  text-align: center;
  
  .percentage {
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.completed ? '#4caf50' : '#ff9800'};
    margin-bottom: 8px;
  }
  
  .status {
    font-size: 14px;
    color: #666;
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
  
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--hana-mint) 0%, #4caf50 100%);
    width: ${props => props.progress}%;
    transition: width 0.5s ease;
  }
`;

const CompletionMessage = styled.div`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 32px;
  
  .emoji {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
  }
`;

const InteractiveFormViewer = ({ formData }) => {
  if (!formData) {
    return (
      <FormViewerContainer>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          color: '#666',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📋</div>
          <h3 style={{ margin: '0 0 12px 0' }}>서식 작성을 기다리고 있습니다</h3>
          <p style={{ margin: 0 }}>
            직원이 서식을 선택하고 작성을 시작하면<br/>
            여기에 실시간으로 표시됩니다.
          </p>
        </div>
      </FormViewerContainer>
    );
  }

  const { form, formData: fieldData, signatures } = formData;

  // 완성도 계산
  const getCompletionStatus = () => {
    const allFields = [];
    form.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'row') {
          field.fields.forEach(rowField => {
            if (rowField.required) allFields.push(rowField);
          });
        } else if (field.required) {
          allFields.push(field);
        }
      });
    });

    const completedFields = allFields.filter(field => {
      if (field.type === 'signature') {
        return signatures && signatures[field.id];
      } else {
        return fieldData && fieldData[field.id] && fieldData[field.id].trim() !== '';
      }
    });

    return {
      total: allFields.length,
      completed: completedFields.length,
      percentage: allFields.length > 0 ? Math.round((completedFields.length / allFields.length) * 100) : 0
    };
  };

  const renderFieldValue = (field) => {
    if (field.type === 'signature') {
      const signatureData = signatures && signatures[field.id];
      return (
        <SignatureValue filled={!!signatureData}>
          {signatureData ? (
            <img src={signatureData} alt="서명" />
          ) : (
            <div className="placeholder">서명 대기 중...</div>
          )}
        </SignatureValue>
      );
    } else {
      const value = fieldData && fieldData[field.id];
      return (
        <FieldValue className={value ? '' : 'empty'}>
          {value || '입력 대기 중...'}
        </FieldValue>
      );
    }
  };

  const status = getCompletionStatus();
  const isCompleted = status.percentage === 100;

  return (
    <FormViewerContainer>
      <FormDocument>
        <FormHeader>
          <FormTitle>{form.title}</FormTitle>
          <FormSubtitle>{form.description}</FormSubtitle>
        </FormHeader>

        <FormBody>
          {form.sections.map((section, sectionIndex) => (
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
                          {renderFieldValue(rowField)}
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
                      {renderFieldValue(field)}
                    </FormField>
                  );
                }
              })}
            </FormSection>
          ))}

          {isCompleted && (
            <CompletionMessage>
              <div className="emoji">✅</div>
              <h3>서식 작성이 완료되었습니다!</h3>
              <p>모든 필수 항목이 입력되었습니다.</p>
            </CompletionMessage>
          )}
        </FormBody>
      </FormDocument>

      {/* 상태 표시 */}
      <StatusBar>
        <StatusTitle>📋 작성 현황</StatusTitle>
        <CompletionRate completed={isCompleted}>
          <div className="percentage">{status.percentage}%</div>
          <div className="status">
            {status.completed} / {status.total} 완료
          </div>
        </CompletionRate>
        <ProgressBar progress={status.percentage}>
          <div className="fill"></div>
        </ProgressBar>
      </StatusBar>
    </FormViewerContainer>
  );
};

export default InteractiveFormViewer;
