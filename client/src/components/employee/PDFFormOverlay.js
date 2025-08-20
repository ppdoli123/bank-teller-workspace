import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import styled from 'styled-components';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FormOverlayContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  overflow: auto;
`;

const PDFContainer = styled.div`
  position: relative;
  margin: 20px auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  width: fit-content;
`;

const InputOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const InteractiveField = styled.div`
  position: absolute;
  border: 2px dashed transparent;
  background: rgba(0, 133, 122, 0.1);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--hana-mint);
    background: rgba(0, 133, 122, 0.2);
  }
  
  &.active {
    border-color: #ff4444;
    background: rgba(255, 68, 68, 0.1);
    z-index: 1000;
  }
  
  &.filled {
    background: rgba(76, 175, 80, 0.1);
    border-color: #4caf50;
  }
`;

const FieldInput = styled.input`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font-size: ${props => props.fontSize || '14px'};
  font-family: 'Hana2', sans-serif;
  padding: 2px 4px;
  outline: none;
  
  &:focus {
    background: rgba(255, 255, 255, 0.9);
  }
`;

const SignatureField = styled.div`
  width: 100%;
  height: 100%;
  border: 2px dashed #ff9800;
  background: rgba(255, 152, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #ff9800;
  cursor: pointer;
  
  &.signed {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
`;

const MobileInputModal = styled.div`
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

const MobileInputContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
`;

const MobileInput = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 18px;
  border: 2px solid var(--hana-mint);
  border-radius: 8px;
  margin: 16px 0;
  font-family: 'Hana2', sans-serif;
`;

const SignatureModal = styled.div`
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

const PDFFormOverlay = ({ pdfUrl, formFields, onFieldChange, onSignature }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [activeField, setActiveField] = useState(null);
  const [showMobileInput, setShowMobileInput] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [signatures, setSignatures] = useState({});
  
  const signatureRef = useRef();
  const containerRef = useRef();

  // 기본 폼 필드 정의 (PDF 좌표계 기준)
  const defaultFormFields = [
    {
      id: 'depositor_name',
      type: 'text',
      label: '예금주 성명',
      x: 120, y: 180, width: 200, height: 30,
      page: 1,
      required: true
    },
    {
      id: 'account_number',
      type: 'text',
      label: '계좌번호',
      x: 400, y: 180, width: 150, height: 30,
      page: 1,
      required: true
    },
    {
      id: 'phone_number',
      type: 'text',
      label: '연락처',
      x: 120, y: 220, width: 200, height: 30,
      page: 1,
      required: true
    },
    {
      id: 'address',
      type: 'text',
      label: '주소',
      x: 120, y: 260, width: 400, height: 30,
      page: 1,
      required: true
    },
    {
      id: 'signature_1',
      type: 'signature',
      label: '서명',
      x: 450, y: 350, width: 120, height: 60,
      page: 1,
      required: true
    },
    {
      id: 'date',
      type: 'date',
      label: '날짜',
      x: 120, y: 350, width: 150, height: 30,
      page: 1,
      required: true
    }
  ];

  const fields = formFields || defaultFormFields;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleFieldClick = (field) => {
    setActiveField(field);
    
    if (field.type === 'signature') {
      setShowSignatureModal(true);
    } else {
      // 모바일/태블릿에서는 확대된 입력 모달 표시
      if (window.innerWidth <= 768) {
        setShowMobileInput(true);
      }
    }
  };

  const handleInputChange = (fieldId, value) => {
    const newValues = { ...fieldValues, [fieldId]: value };
    setFieldValues(newValues);
    onFieldChange && onFieldChange(fieldId, value);
  };

  const handleSignatureSave = () => {
    if (signatureRef.current && activeField) {
      const signatureData = signatureRef.current.toDataURL();
      const newSignatures = { ...signatures, [activeField.id]: signatureData };
      setSignatures(newSignatures);
      onSignature && onSignature(activeField.id, signatureData);
      setShowSignatureModal(false);
      setActiveField(null);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setActiveField(null);
  };

  const closeMobileInput = () => {
    setShowMobileInput(false);
    setActiveField(null);
  };

  const isMobile = () => window.innerWidth <= 768;

  return (
    <FormOverlayContainer ref={containerRef}>
      <PDFContainer>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          options={{
            cMapUrl: 'cmaps/',
            cMapPacked: true,
          }}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
          
          <InputOverlay>
            {fields
              .filter(field => field.page === pageNumber)
              .map(field => (
                <InteractiveField
                  key={field.id}
                  className={`
                    ${activeField?.id === field.id ? 'active' : ''}
                    ${fieldValues[field.id] || signatures[field.id] ? 'filled' : ''}
                  `}
                  style={{
                    left: field.x * scale,
                    top: field.y * scale,
                    width: field.width * scale,
                    height: field.height * scale,
                  }}
                  onClick={() => handleFieldClick(field)}
                >
                  {field.type === 'signature' ? (
                    <SignatureField className={signatures[field.id] ? 'signed' : ''}>
                      {signatures[field.id] ? (
                        <img 
                          src={signatures[field.id]} 
                          alt="서명"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        '서명 클릭'
                      )}
                    </SignatureField>
                  ) : (
                    !isMobile() && (
                      <FieldInput
                        type={field.type === 'date' ? 'date' : 'text'}
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.label}
                        fontSize={`${12 * scale}px`}
                      />
                    )
                  )}
                </InteractiveField>
              ))}
          </InputOverlay>
        </Document>
      </PDFContainer>

      {/* 모바일 입력 모달 */}
      {showMobileInput && activeField && (
        <MobileInputModal onClick={closeMobileInput}>
          <MobileInputContent onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--hana-mint)' }}>
              {activeField.label} 입력
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              아래 입력창을 터치하여 내용을 입력해주세요
            </p>
            
            <MobileInput
              type={activeField.type === 'date' ? 'date' : 'text'}
              value={fieldValues[activeField.id] || ''}
              onChange={(e) => handleInputChange(activeField.id, e.target.value)}
              placeholder={`${activeField.label}을(를) 입력하세요`}
              autoFocus
            />
            
            <ButtonGroup>
              <button className="secondary" onClick={closeMobileInput}>
                취소
              </button>
              <button className="primary" onClick={closeMobileInput}>
                완료
              </button>
            </ButtonGroup>
          </MobileInputContent>
        </MobileInputModal>
      )}

      {/* 서명 모달 */}
      {showSignatureModal && (
        <MobileInputModal onClick={closeSignatureModal}>
          <SignatureModal onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--hana-mint)' }}>
              서명해주세요
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              아래 영역에 손가락으로 서명해주세요
            </p>
            
            <div style={{ border: '2px dashed #ccc', borderRadius: '8px', marginBottom: '16px' }}>
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'signature-canvas',
                  style: { width: '100%', height: '200px' }
                }}
                backgroundColor="rgba(255, 255, 255, 0.9)"
              />
            </div>
            
            <ButtonGroup>
              <button className="danger" onClick={clearSignature}>
                지우기
              </button>
              <button className="secondary" onClick={closeSignatureModal}>
                취소
              </button>
              <button className="primary" onClick={handleSignatureSave}>
                저장
              </button>
            </ButtonGroup>
          </SignatureModal>
        </MobileInputModal>
      )}

      {/* 페이지 네비게이션 */}
      {numPages > 1 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '12px 24px',
          borderRadius: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            style={{
              background: pageNumber <= 1 ? '#ccc' : 'var(--hana-mint)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            이전
          </button>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            style={{
              background: pageNumber >= numPages ? '#ccc' : 'var(--hana-mint)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer'
            }}
          >
            다음
          </button>
        </div>
      )}
    </FormOverlayContainer>
  );
};

export default PDFFormOverlay;
