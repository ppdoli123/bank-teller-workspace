import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FieldInputContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const InputModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const FieldLabel = styled.h2`
  color: #00857a;
  font-size: 28pt;
  margin-bottom: 20px;
  font-weight: bold;
`;

const LargeInput = styled.input`
  width: 100%;
  height: 80px;
  font-size: 24pt;
  padding: 20px;
  border: 3px solid #00857a;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 30px;
  
  &:focus {
    outline: none;
    border-color: #005c52;
    box-shadow: 0 0 20px rgba(0, 133, 122, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 15px 40px;
  font-size: 18pt;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  
  &.confirm {
    background: #00857a;
    color: white;
    
    &:hover {
      background: #005c52;
    }
  }
  
  &.cancel {
    background: #e0e0e0;
    color: #666;
    
    &:hover {
      background: #d0d0d0;
    }
  }
`;

const Placeholder = styled.div`
  color: #999;
  font-size: 14pt;
  margin-bottom: 20px;
  font-style: italic;
`;

const TabletFieldInput = ({ fieldData, onComplete, onCancel }) => {
  const [inputValue, setInputValue] = useState(fieldData?.currentValue || '');

  useEffect(() => {
    setInputValue(fieldData?.currentValue || '');
  }, [fieldData]);

  const handleConfirm = () => {
    onComplete(inputValue);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!fieldData) return null;

  return (
    <FieldInputContainer>
      <InputModal>
        <FieldLabel>{fieldData.label}</FieldLabel>
        
        <Placeholder>{fieldData.placeholder}</Placeholder>
        
        <LargeInput
          type={fieldData.type}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={fieldData.placeholder}
          autoFocus
        />
        
        <ButtonGroup>
          <ActionButton className="cancel" onClick={handleCancel}>
            취소
          </ActionButton>
          <ActionButton className="confirm" onClick={handleConfirm}>
            확인
          </ActionButton>
        </ButtonGroup>
      </InputModal>
    </FieldInputContainer>
  );
};

export default TabletFieldInput;
