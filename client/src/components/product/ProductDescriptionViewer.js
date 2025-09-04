import React, { useState, useEffect } from "react";
import styled from "styled-components";

const ProductDescriptionViewer = ({ product, onClose, onNext }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(80);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PDF URL 생성 (1부터 80까지)
  const getPdfUrl = (pageNumber) => {
    return `https://jhfjigeuxrxxbbsoflcd.supabase.co/storage/v1/object/public/hana_product/${pageNumber}.pdf`;
  };

  // PDF 로드 상태 확인
  useEffect(() => {
    const checkPdfExists = async () => {
      try {
        const response = await fetch(getPdfUrl(1), { method: "HEAD" });
        if (response.ok) {
          setLoading(false);
        } else {
          setError("상품설명서를 불러올 수 없습니다.");
          setLoading(false);
        }
      } catch (err) {
        setError("상품설명서를 불러올 수 없습니다.");
        setLoading(false);
      }
    };

    checkPdfExists();
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInput = (e) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <ModalOverlay>
        <ModalContent>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📄</div>
            <p>상품설명서를 불러오는 중...</p>
          </div>
        </ModalContent>
      </ModalOverlay>
    );
  }

  if (error) {
    return (
      <ModalOverlay>
        <ModalContent>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
            <p>{error}</p>
            <button
              onClick={onClose}
              style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
            >
              닫기
            </button>
          </div>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContent>
        {/* 헤더 */}
        <Header>
          <div>
            <h2>
              📋 {product?.productName || product?.product_name || "상품"}{" "}
              상품설명서
            </h2>
            <p>고객과 함께 상품 내용을 확인하세요</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </Header>

        {/* PDF 뷰어 */}
        <PdfContainer>
          <PdfFrame
            src={getPdfUrl(currentPage)}
            title={`상품설명서 ${currentPage}페이지`}
            onLoad={() => setLoading(false)}
            onError={() => setError("PDF를 불러올 수 없습니다.")}
          />
        </PdfContainer>

        {/* 페이지 네비게이션 */}
        <Navigation>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="nav-btn"
            >
              ◀ 이전
            </button>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>페이지:</span>
              <input
                type="number"
                value={currentPage}
                onChange={handlePageInput}
                min="1"
                max={totalPages}
                style={{
                  width: "60px",
                  padding: "0.25rem",
                  textAlign: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <span>/ {totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="nav-btn"
            >
              다음 ▶
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={onClose} className="secondary-btn">
              닫기
            </button>
            <button onClick={onNext} className="primary-btn">
              📊 시뮬레이션 보기
            </button>
          </div>
        </Navigation>
      </ModalContent>
    </ModalOverlay>
  );
};

// 스타일드 컴포넌트
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  background: linear-gradient(
    135deg,
    var(--hana-primary) 0%,
    var(--hana-mint) 100%
  );
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const PdfContainer = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  min-height: 600px;
`;

const PdfFrame = styled.iframe`
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Navigation = styled.div`
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e9ecef;

  .nav-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--hana-primary);
    background: white;
    color: var(--hana-primary);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--hana-primary);
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .primary-btn {
    padding: 0.75rem 1.5rem;
    background: var(--hana-primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s ease;

    &:hover {
      background: var(--hana-mint);
    }
  }

  .secondary-btn {
    padding: 0.75rem 1.5rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease;

    &:hover {
      background: #5a6268;
    }
  }
`;

export default ProductDescriptionViewer;
