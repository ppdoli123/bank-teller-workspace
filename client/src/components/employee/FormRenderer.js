import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// PDF 스타일 컨테이너
const PDFContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  background: white;
  margin: 0 auto;
  padding: 0;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
  font-size: 9pt;
  line-height: 1.2;
  overflow: hidden;
  position: relative;
`;

// 서식 헤더
const FormHeader = styled.div`
  background: ${props => props.headerColor || '#666666'};
  color: white;
  text-align: center;
  font-size: ${props => props.titleSize || '16pt'};
  font-weight: bold;
  padding: 8px 0;
  margin: 0;
`;

// 메인 컨텐츠
const MainContent = styled.div`
  padding: 10px;
`;

// 테이블 스타일
const FormTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
  
  td, th {
    border: 1px solid #000;
    padding: 3px 5px;
    font-size: 8pt;
    vertical-align: middle;
    line-height: 1.2;
  }
  
  th {
    background: #f0f0f0;
    font-weight: bold;
    text-align: center;
  }
`;

// 클릭 가능한 입력 영역
const ClickableField = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 2px;
  min-height: 18px;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #e8f4fd;
    outline: 1px dashed #0066cc;
  }
  
  &.active {
    background: #d4edda;
    outline: 2px solid #28a745;
  }
  
  &.filled {
    background: rgba(76, 175, 80, 0.1);
    color: #2e7d32;
    font-weight: 500;
  }
`;

// 서명 영역
const SignatureArea = styled.div`
  border: 1px solid #000;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.hasSignature ? 'rgba(76, 175, 80, 0.1)' : '#f9f9f9'};
  cursor: pointer;
  
  &:hover {
    background: #e8f4fd;
  }
  
  &.active {
    background: #d4edda;
    outline: 2px solid #28a745;
  }
`;

// 체크박스
const CheckboxField = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  .checkbox {
    width: 12px;
    height: 12px;
    border: 1px solid #000;
    margin-right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.checked {
      background: #000;
      color: white;
      font-size: 8px;
    }
  }
`;

const FormRenderer = ({ 
  formConfig, 
  formData = {}, 
  onFieldClick, 
  activeField,
  sharedData = {} // 공유 데이터 (예금주명 등)
}) => {
  const [localFormData, setLocalFormData] = useState(formData);

  // 공유 데이터와 로컬 데이터 병합
  useEffect(() => {
    setLocalFormData(prev => ({
      ...prev,
      ...formData,
      ...sharedData // 공유 데이터로 덮어쓰기
    }));
  }, [formData, sharedData]);

  // 필드 클릭 핸들러
  const handleFieldClick = (fieldId, fieldLabel, fieldType = 'text', fieldConfig = {}) => {
    if (onFieldClick) {
      onFieldClick(fieldId, fieldLabel, fieldType, fieldConfig);
    }
  };

  // 필드 값 렌더링
  const renderFieldValue = (fieldId, fieldConfig) => {
    const value = localFormData[fieldId];
    
    if (fieldConfig.type === 'signature') {
      return (
        <SignatureArea 
          className={activeField === fieldId ? 'active' : ''}
          hasSignature={!!value}
          onClick={() => handleFieldClick(fieldId, fieldConfig.label, 'signature', fieldConfig)}
        >
          {value ? '✓ 서명완료' : '클릭하여 서명'}
        </SignatureArea>
      );
    }
    
    if (fieldConfig.type === 'checkbox') {
      return (
        <CheckboxField 
          onClick={() => handleFieldClick(fieldId, fieldConfig.label, 'checkbox', fieldConfig)}
        >
          <div className={`checkbox ${value ? 'checked' : ''}`}>
            {value && '✓'}
          </div>
          {fieldConfig.label}
        </CheckboxField>
      );
    }
    
    return (
      <ClickableField 
        className={`${activeField === fieldId ? 'active' : ''} ${value ? 'filled' : ''}`}
        onClick={() => handleFieldClick(fieldId, fieldConfig.label, fieldConfig.type || 'text', fieldConfig)}
      >
        {value || fieldConfig.placeholder || '클릭하여 입력'}
      </ClickableField>
    );
  };

  // 테이블 셀 렌더링
  const renderTableCell = (cell) => {
    if (cell.type === 'field') {
      return renderFieldValue(cell.fieldId, cell.config);
    }
    
    if (cell.type === 'text') {
      return cell.content;
    }
    
    if (cell.type === 'label') {
      return (
        <div style={{ 
          background: '#f0f0f0', 
          textAlign: 'center', 
          fontWeight: 'bold',
          fontSize: cell.fontSize || '8pt'
        }}>
          {cell.content}
        </div>
      );
    }
    
    return cell.content || '';
  };

  // 테이블 렌더링
  const renderTable = (tableConfig) => {
    return (
      <FormTable style={tableConfig.style}>
        <tbody>
          {tableConfig.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  colSpan={cell.colSpan || 1}
                  rowSpan={cell.rowSpan || 1}
                  style={cell.style}
                >
                  {renderTableCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </FormTable>
    );
  };

  // 섹션 렌더링
  const renderSection = (section) => {
    return (
      <div key={section.id} style={{ marginBottom: section.marginBottom || '15px' }}>
        {section.title && (
          <div style={{ 
            fontSize: '10pt', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#333'
          }}>
            {section.title}
          </div>
        )}
        
        {section.content.map((item, index) => {
          if (item.type === 'table') {
            return renderTable(item);
          }
          
          if (item.type === 'text') {
            return (
              <div key={index} style={{ 
                fontSize: '9pt', 
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                {item.content}
              </div>
            );
          }
          
          if (item.type === 'field') {
            return (
              <div key={index} style={{ marginBottom: '8px' }}>
                <div style={{ 
                  fontSize: '8pt', 
                  fontWeight: 'bold',
                  marginBottom: '2px'
                }}>
                  {item.label}
                </div>
                {renderFieldValue(item.fieldId, item)}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };

  if (!formConfig) {
    return <div>서식 설정을 불러올 수 없습니다.</div>;
  }

  return (
    <PDFContainer>
      <FormHeader 
        headerColor={formConfig.headerColor}
        titleSize={formConfig.titleSize}
      >
        {formConfig.title}
      </FormHeader>
      
      <MainContent>
        {formConfig.description && (
          <div style={{ 
            fontSize: '9pt', 
            marginBottom: '15px', 
            lineHeight: '1.3' 
          }}>
            {formConfig.description}
          </div>
        )}
        
        {formConfig.sections.map((section, index) => (
          <div key={index}>
            {renderSection(section)}
          </div>
        ))}
        
        {/* 하단 로고/정보 */}
        {formConfig.footer && (
          <div style={{ 
            position: 'relative', 
            height: '40px', 
            marginTop: '20px',
            borderTop: '1px solid #000',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '5px 10px',
            fontSize: '7pt'
          }}>
            <div>{formConfig.footer.left}</div>
            <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>
              📱 하나은행
            </div>
          </div>
        )}
      </MainContent>
    </PDFContainer>
  );
};

export default FormRenderer;

