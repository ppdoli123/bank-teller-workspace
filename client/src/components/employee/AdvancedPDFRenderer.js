import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { getTemplateByFilename, getTemplateByTitle } from '../../data/pdfTemplates';

// A4 크기 스타일링
const A4Container = styled.div`
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20mm;
  box-sizing: border-box;
  font-family: 'Malgun Gothic', Arial, sans-serif;
  position: relative;
  overflow: hidden;
`;

const PageContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 섹션별 스타일링
const Section = styled.div`
  margin-bottom: ${props => props.marginBottom || '15px'};
`;

const Header = styled.div`
  text-align: ${props => props.textAlign || 'left'};
  font-size: ${props => props.fontSize || '12px'};
  font-weight: ${props => props.fontWeight || 'normal'};
  margin-bottom: ${props => props.marginBottom || '10px'};
  line-height: ${props => props.lineHeight || '1.4'};
`;

const TableContainer = styled.div`
  margin: 15px 0;
  border: 1px solid #000;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
`;

const TableHeader = styled.th`
  border: 1px solid #000;
  padding: 4px 6px;
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
`;

const TableCell = styled.td`
  border: 1px solid #000;
  padding: 4px 6px;
  vertical-align: middle;
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  margin: 0;
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

const CheckboxField = styled.input`
  margin-right: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  margin: 0;
  resize: none;
  min-height: 20px;
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

const SignatureField = styled.div`
  width: 100%;
  height: 40px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fafafa;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Instructions = styled.div`
  margin: 15px 0;
  padding: 10px;
  background: #f9f9f9;
  border-left: 3px solid #007bff;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 8px;
  color: #666;
`;

const BankLogo = styled.div`
  font-weight: bold;
  color: #007bff;
`;

// 고급 PDF 렌더러 컴포넌트
const AdvancedPDFRenderer = ({ formConfig, onFieldChange, formData = {} }) => {
  const [signatures, setSignatures] = useState({});
  const signatureRefs = useRef({});

  // 필드 변경 핸들러
  const handleFieldChange = (fieldName, value) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value);
    }
  };

  // 서명 필드 핸들러
  const handleSignatureClick = (fieldName) => {
    // 태블릿에 서명 요청
    if (window.stompClient && window.stompClient.connected) {
      window.stompClient.send("/app/requestSignature", {}, JSON.stringify({
        fieldName: fieldName,
        formId: formConfig.id
      }));
    }
    
    // 임시로 서명 완료 표시
    setSignatures(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // 템플릿 가져오기
  const getTemplate = () => {
    if (formConfig.filename) {
      return getTemplateByFilename(formConfig.filename);
    }
    if (formConfig.title) {
      return getTemplateByTitle(formConfig.title);
    }
    return null;
  };

  const template = getTemplate();

  // 템플릿이 없으면 기본 렌더링
  if (!template) {
    return (
      <A4Container>
        <PageContent>
          <Header fontSize="16px" fontWeight="bold" textAlign="center">
            {formConfig.title || "서식 제목"}
          </Header>
          <div style={{ padding: '20px' }}>
            <p>이 서식은 아직 템플릿이 정의되지 않았습니다.</p>
            <p>파일명: {formConfig.filename}</p>
            <p>카테고리: {formConfig.category}</p>
          </div>
        </PageContent>
      </A4Container>
    );
  }

  // 섹션 렌더링 함수들
  const renderHeader = (section) => {
    const { content, style } = section;
    return (
      <Header {...style}>
        {content.bankInfo && <div>{content.bankInfo}</div>}
        {content.title && <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
          {content.title}
        </div>}
        {content.subtitle && <div style={{ fontSize: '14px', marginBottom: '10px' }}>
          {content.subtitle}
        </div>}
        {content.branchField && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{content.bankInfo}</span>
            <InputField
              type="text"
              placeholder={content.branchField.placeholder}
              style={{ width: content.branchField.width }}
              value={formData.branch || ''}
              onChange={(e) => handleFieldChange('branch', e.target.value)}
            />
            <span>{content.reportTitle}</span>
            <InputField
              type="text"
              placeholder={content.yearField.placeholder}
              style={{ width: content.yearField.width }}
              value={formData.year || ''}
              onChange={(e) => handleFieldChange('year', e.target.value)}
            />
          </div>
        )}
        {content.unit && <div style={{ textAlign: 'right' }}>{content.unit}</div>}
      </Header>
    );
  };

  const renderTable = (section) => {
    const { structure } = section;
    const { columns, rows } = structure;

    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <TableHeader
                  key={index}
                  colSpan={col.subColumns ? col.subColumns.length : 1}
                  style={{ width: col.width, textAlign: col.align }}
                >
                  {col.name}
                  {col.subColumns && (
                    <div style={{ fontSize: '8px', fontWeight: 'normal' }}>
                      {col.subColumns.map((subCol, subIndex) => (
                        <div key={subIndex}>{subCol}</div>
                      ))}
                    </div>
                  )}
                </TableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              if (row.type === 'header') {
                return (
                  <tr key={rowIndex}>
                    {row.cells.map((cell, cellIndex) => (
                      <TableHeader key={cellIndex} colSpan={cell.colspan}>
                        {cell.content}
                      </TableHeader>
                    ))}
                  </tr>
                );
              }
              
              if (row.type === 'subheader') {
                return (
                  <tr key={rowIndex}>
                    {row.cells.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} colSpan={cell.colspan} style={{ fontSize: '8px', fontStyle: 'italic' }}>
                        {cell.content}
                      </TableCell>
                    ))}
                  </tr>
                );
              }

              if (row.type === 'group') {
                return (
                  <React.Fragment key={rowIndex}>
                    <tr>
                      <TableCell colSpan={columns.length} style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                        {row.title}
                      </TableCell>
                    </tr>
                    {row.rows.map((groupRow, groupRowIndex) => (
                      <tr key={`${rowIndex}-${groupRowIndex}`}>
                        {groupRow.cells.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell.type === 'checkbox' ? (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CheckboxField
                                  type="checkbox"
                                  checked={formData[`checkbox_${rowIndex}_${groupRowIndex}_${cellIndex}`] || false}
                                  onChange={(e) => handleFieldChange(`checkbox_${rowIndex}_${groupRowIndex}_${cellIndex}`, e.target.checked)}
                                />
                                <span>{cell.content}</span>
                              </div>
                            ) : cell.type === 'number' ? (
                              <InputField
                                type="number"
                                placeholder={cell.placeholder}
                                value={formData[`field_${rowIndex}_${groupRowIndex}_${cellIndex}`] || ''}
                                onChange={(e) => handleFieldChange(`field_${rowIndex}_${groupRowIndex}_${cellIndex}`, e.target.value)}
                                readOnly={cell.readonly}
                              />
                            ) : cell.type === 'text' ? (
                              cell.bold ? (
                                <div style={{ fontWeight: 'bold' }}>{cell.content}</div>
                              ) : (
                                <InputField
                                  type="text"
                                  placeholder={cell.placeholder}
                                  value={formData[`field_${rowIndex}_${groupRowIndex}_${cellIndex}`] || ''}
                                  onChange={(e) => handleFieldChange(`field_${rowIndex}_${groupRowIndex}_${cellIndex}`, e.target.value)}
                                  readOnly={cell.readonly}
                                />
                              )
                            ) : (
                              <div style={{ whiteSpace: 'pre-line' }}>{cell.content}</div>
                            )}
                          </TableCell>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              }

              return (
                <tr key={rowIndex}>
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell 
                      key={cellIndex}
                      style={row.type === 'total' ? { backgroundColor: '#e8f4f8', fontWeight: 'bold' } : {}}
                    >
                      {cell.type === 'checkbox' ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <CheckboxField
                            type="checkbox"
                            checked={formData[`checkbox_${rowIndex}_${cellIndex}`] || false}
                            onChange={(e) => handleFieldChange(`checkbox_${rowIndex}_${cellIndex}`, e.target.checked)}
                          />
                          <span>{cell.content}</span>
                        </div>
                      ) : cell.type === 'number' ? (
                        <InputField
                          type="number"
                          placeholder={cell.placeholder}
                          value={formData[`field_${rowIndex}_${cellIndex}`] || ''}
                          onChange={(e) => handleFieldChange(`field_${rowIndex}_${cellIndex}`, e.target.value)}
                          readOnly={cell.readonly}
                        />
                      ) : cell.type === 'text' ? (
                        cell.bold ? (
                          <div style={{ fontWeight: 'bold', whiteSpace: 'pre-line' }}>{cell.content}</div>
                        ) : (
                          <InputField
                            type="text"
                            placeholder={cell.placeholder}
                            value={formData[`field_${rowIndex}_${cellIndex}`] || ''}
                            onChange={(e) => handleFieldChange(`field_${rowIndex}_${cellIndex}`, e.target.value)}
                            readOnly={cell.readonly}
                          />
                        )
                      ) : (
                        <div style={{ whiteSpace: 'pre-line' }}>{cell.content}</div>
                      )}
                    </TableCell>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    );
  };

  const renderConsent = (section) => {
    const { title, content, fields } = section;
    return (
      <Section>
        <Header fontSize="12px" fontWeight="bold">{title}</Header>
        {content.map((text, index) => (
          <div key={index} style={{ marginBottom: '8px', fontSize: '10px' }}>{text}</div>
        ))}
        {fields && (
          <div style={{ marginTop: '15px' }}>
            {fields.map((field, index) => (
              <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '120px', fontSize: '10px' }}>{field.label}:</span>
                <InputField
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  };

  const renderCustomerInfo = (section) => {
    const { title, fields } = section;
    return (
      <Section>
        <Header fontSize="12px" fontWeight="bold">{title}</Header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {fields.map((field, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <span style={{ display: 'block', fontSize: '10px', marginBottom: '4px' }}>{field.label}:</span>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">선택하세요</option>
                  {field.options.map((option, optIndex) => (
                    <option key={optIndex} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <TextArea
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  rows={3}
                />
              ) : (
                <InputField
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      </Section>
    );
  };

  const renderApplicantInfo = renderCustomerInfo;
  const renderMemberInfo = renderCustomerInfo;
  const renderLoanInfo = renderCustomerInfo;
  const renderHouseInfo = renderCustomerInfo;
  const renderPensionInfo = renderCustomerInfo;

  const renderCheckbox = (section) => {
    const { title, items } = section;
    return (
      <Section>
        <Header fontSize="12px" fontWeight="bold">{title}</Header>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
            <CheckboxField
              type="checkbox"
              checked={formData[`checkbox_${title}_${index}`] || false}
              onChange={(e) => handleFieldChange(`checkbox_${title}_${index}`, e.target.checked)}
            />
            <span style={{ fontSize: '10px' }}>{item}</span>
          </div>
        ))}
      </Section>
    );
  };

  const renderSignature = (section) => {
    const { title, fields } = section;
    return (
      <Section>
        <Header fontSize="12px" fontWeight="bold">{title}</Header>
        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '120px', fontSize: '10px' }}>{field.label}:</span>
            {field.type === 'signature' ? (
              <SignatureField
                onClick={() => handleSignatureClick(field.name)}
                ref={el => signatureRefs.current[field.name] = el}
              >
                {signatures[field.name] ? '✓ 서명 완료' : field.placeholder}
              </SignatureField>
            ) : (
              <InputField
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                style={{ flex: 1 }}
              />
            )}
          </div>
        ))}
      </Section>
    );
  };

  const renderInstructions = (section) => {
    const { title, content } = section;
    return (
      <Instructions>
        <Header fontSize="11px" fontWeight="bold">{title}</Header>
        {content.map((text, index) => (
          <div key={index} style={{ marginBottom: '5px', fontSize: '9px' }}>• {text}</div>
        ))}
      </Instructions>
    );
  };

  const renderFooter = (section) => {
    const { content } = section;
    return (
      <Footer>
        <div>
          <div>{content.documentId}</div>
          <div>{content.retention}</div>
        </div>
        <BankLogo>{content.bankLogo}</BankLogo>
      </Footer>
    );
  };

  // 섹션 렌더링 매핑
  const renderSection = (section, index) => {
    switch (section.type) {
      case 'header':
        return renderHeader(section);
      case 'table':
        return renderTable(section);
      case 'consent':
        return renderConsent(section);
      case 'customer_info':
        return renderCustomerInfo(section);
      case 'applicant_info':
        return renderApplicantInfo(section);
      case 'member_info':
        return renderMemberInfo(section);
      case 'loan_info':
        return renderLoanInfo(section);
      case 'house_info':
        return renderHouseInfo(section);
      case 'pension_info':
        return renderPensionInfo(section);
      case 'checkbox':
        return renderCheckbox(section);
      case 'signature':
        return renderSignature(section);
      case 'instructions':
        return renderInstructions(section);
      case 'footer':
        return renderFooter(section);
      default:
        return <div key={index}>Unknown section type: {section.type}</div>;
    }
  };

  return (
    <A4Container>
      <PageContent>
        {template.layout.sections.map((section, index) => (
          <div key={index}>
            {renderSection(section, index)}
          </div>
        ))}
      </PageContent>
    </A4Container>
  );
};

export default AdvancedPDFRenderer;
