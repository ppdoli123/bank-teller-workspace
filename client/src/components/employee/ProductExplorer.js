import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ExplorerContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow: auto;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--hana-mint);
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--hana-mint);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProductCard = styled.div`
  background: var(--hana-white);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 132, 133, 0.15);
  }
`;

const ProductHeader = styled.div`
  background: linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-mint-dark) 100%);
  color: white;
  padding: 1.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--hana-mint-light);
  }
`;

const ProductType = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProductName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const ProductBody = styled.div`
  padding: 1.5rem;
`;

const ProductDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: var(--hana-gray);
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: var(--hana-dark-gray);
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--hana-mint);
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
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
    background: transparent;
    color: var(--hana-mint);
    border: 1px solid var(--hana-mint);
    
    &:hover {
      background: var(--hana-mint);
      color: white;
    }
  }
`;

const ComparisonBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--hana-white);
  border-top: 2px solid var(--hana-mint);
  padding: 1rem 2rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
`;

const ComparisonItems = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ComparisonItem = styled.div`
  background: var(--hana-mint);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    opacity: 0.7;
  }
`;

const CompareButton = styled.button`
  background: var(--hana-mint);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--hana-mint-dark);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 90%;
  max-width: 800px;
  max-height: 90%;
  overflow-y: auto;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f4;
`;

const ModalTitle = styled.h2`
  color: var(--hana-mint);
  font-size: 1.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: var(--hana-mint);
  }
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    color: var(--hana-mint);
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  p {
    line-height: 1.6;
    color: #333;
  }
`;

const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

const formatRate = (rate) => {
  if (!rate) return '-';
  return rate.toFixed(2) + '%';
};

const getProductIcon = (type) => {
  const icons = {
    'Savings': '💰',
    'Deposit': '🏦',
    'Card': '💳',
    'Loan': '📋',
    'Investment': '📈'
  };
  return icons[type] || '📄';
};

const ProductExplorer = ({ onScreenSync, customerId }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [comparisonList, setComparisonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedType]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products?limit=100');
      console.log('Products response:', response.data); // 디버깅용
      if (response.data.success && response.data.data.products) {
        setProducts(response.data.data.products);
      } else {
        console.error('상품 데이터 형식 오류:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('상품 조회 오류:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.product_name && product.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.product_features && product.product_features.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType) {
      filtered = filtered.filter(product => product.product_type === selectedType);
    }

    setFilteredProducts(filtered);
  };

  const addToComparison = (product) => {
    if (comparisonList.length < 3 && !comparisonList.find(p => p.id === product.id)) {
      const newList = [...comparisonList, product];
      setComparisonList(newList);
      
      // 고객 화면에 동기화
      onScreenSync({
        type: 'product-comparison-updated',
        data: newList
      });
    }
  };

  const removeFromComparison = (productId) => {
    const newList = comparisonList.filter(p => p.id !== productId);
    setComparisonList(newList);
    
    // 고객 화면에 동기화
    onScreenSync({
      type: 'product-comparison-updated',
      data: newList
    });
  };

  const handleCompare = () => {
    if (comparisonList.length >= 2) {
      onScreenSync({
        type: 'show-comparison',
        data: comparisonList
      });
    }
  };

  const handleProductDetail = (product) => {
    console.log('🚀 === 상품 상세보기 클릭 시작 ===');
    console.log('클릭한 상품 전체:', JSON.stringify(product, null, 2));
    console.log('상품명:', product.productName);
    console.log('상품 특징:', `"${product.productFeatures}"`);
    console.log('가입 대상:', `"${product.targetCustomers}"`);
    console.log('가입 금액:', `"${product.depositAmount}"`);
    console.log('기본 금리:', `"${product.interestRate}"`);
    console.log('모달 열기 전 showModal 상태:', showModal);
    
    setSelectedProduct(product);
    setShowModal(true);
    
    console.log('setSelectedProduct 호출 완료');
    console.log('setShowModal(true) 호출 완료');
    console.log('🚀 === 상품 상세보기 클릭 종료 ===');
    
    // 고객 화면에도 상품 상세정보 전송
    if (onScreenSync) {
      console.log('🔄 고객 화면으로 데이터 전송:', product);
      onScreenSync({
        type: 'product-detail-sync',
        data: product
      });
    }
  };

  const productTypes = [...new Set(products.map(p => p.productType || p.product_type).filter(Boolean))];

  if (loading) {
    return (
      <ExplorerContainer>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </ExplorerContainer>
    );
  }

  return (
    <>
      <ExplorerContainer>

        <SearchBar>
          <SearchInput
            type="text"
            placeholder="상품명 또는 설명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">전체 상품</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </FilterSelect>
        </SearchBar>

        <ProductGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id}>
              <ProductHeader>
                <ProductType>
                  {getProductIcon(product.productType || product.product_type)} {product.productType || product.product_type}
                </ProductType>
                <ProductName>{product.productName || product.product_name}</ProductName>
                <ProductDescription>{product.productFeatures || product.product_features}</ProductDescription>
              </ProductHeader>
              
              <ProductBody>
                <ProductDetails>
                  <DetailItem>
                    <DetailLabel>가입 금액</DetailLabel>
                    <DetailValue>{product.depositAmount || product.deposit_amount || 'N/A'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>기본 금리</DetailLabel>
                    <DetailValue>{product.interestRate || product.interest_rate || 'N/A'}</DetailValue>
                  </DetailItem>
                </ProductDetails>
                
                <ProductActions>
                  <ActionButton 
                    className="secondary"
                    onClick={() => addToComparison(product)}
                    disabled={comparisonList.length >= 3 || comparisonList.find(p => p.id === product.id)}
                  >
                    비교함 추가
                  </ActionButton>
                  <ActionButton 
                    className="primary"
                    onClick={() => handleProductDetail(product)}
                  >
                    자세히 보기
                  </ActionButton>
                </ProductActions>
              </ProductBody>
            </ProductCard>
          ))}
        </ProductGrid>
      </ExplorerContainer>

      {comparisonList.length > 0 && (
        <ComparisonBar>
          <ComparisonItems>
            <span>비교함 ({comparisonList.length}/3):</span>
            {comparisonList.map(product => (
              <ComparisonItem key={product.id}>
                {product.productName || product.product_name}
                <RemoveButton onClick={() => removeFromComparison(product.id)}>
                  ×
                </RemoveButton>
              </ComparisonItem>
            ))}
          </ComparisonItems>
          
          <CompareButton 
            onClick={handleCompare}
            disabled={comparisonList.length < 2}
          >
            상품 비교하기
          </CompareButton>
        </ComparisonBar>
      )}
      
      {console.log('모달 렌더링 조건 확인 - showModal:', showModal, 'selectedProduct:', !!selectedProduct)}
      {showModal && selectedProduct && (
        <Modal onClick={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {console.log('모달이 렌더링됨! selectedProduct:', selectedProduct)}
            <ModalHeader>
              <ModalTitle>{selectedProduct.productName || selectedProduct.product_name}</ModalTitle>
              <CloseButton onClick={() => {
                setShowModal(false);
                setSelectedProduct(null);
              }}>×</CloseButton>
            </ModalHeader>
            
            <DetailSection>
              <h3>상품 타입</h3>
              <p>{selectedProduct.productType || selectedProduct.product_type || '일반 상품'}</p>
            </DetailSection>
            
            <DetailSection>
              <h3>상품 특징</h3>
              {console.log('=== 🔍 상품 특징 완전 디버깅 ===')}
              {console.log('selectedProduct 전체:', JSON.stringify(selectedProduct, null, 2))}
              {console.log('productFeatures 값:', `"${selectedProduct.productFeatures}"`)}
              {console.log('productFeatures === null:', selectedProduct.productFeatures === null)}
              {console.log('productFeatures === undefined:', selectedProduct.productFeatures === undefined)}
              {console.log('productFeatures === "":', selectedProduct.productFeatures === "")}
              {console.log('Boolean(productFeatures):', Boolean(selectedProduct.productFeatures))}
              {console.log('productFeatures != null:', selectedProduct.productFeatures != null)}
              {console.log('조건 결과:', selectedProduct.productFeatures != null ? '데이터 있음' : '정보 없음')}
              {console.log('실제 렌더링 값:', selectedProduct.productFeatures != null ? selectedProduct.productFeatures : '정보 없음')}
              {console.log('=================================')}
              <div style={{border: '2px solid red', padding: '10px', margin: '10px 0'}}>
                <strong>디버깅 정보:</strong>
                <br/>값: "{selectedProduct.productFeatures}"
                <br/>타입: {typeof selectedProduct.productFeatures}
                <br/>null 체크: {String(selectedProduct.productFeatures != null)}
                <br/>Boolean 변환: {String(Boolean(selectedProduct.productFeatures))}
              </div>
              <p style={{
                whiteSpace: 'pre-line',
                color: '#000 !important',
                backgroundColor: '#f0f0f0',
                padding: '10px',
                border: '2px solid #007bff',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: '9999',
                position: 'relative'
              }}>
                {selectedProduct.productFeatures != null ? selectedProduct.productFeatures : '정보 없음'}
              </p>
            </DetailSection>
            
            <DetailSection>
              <h3>가입 대상</h3>
              <p style={{
                whiteSpace: 'pre-line',
                color: '#000 !important',
                backgroundColor: '#f9f9f9',
                padding: '10px',
                border: '1px solid #28a745',
                fontSize: '14px',
                position: 'relative'
              }}>
                {selectedProduct.targetCustomers != null ? selectedProduct.targetCustomers : '정보 없음'}
              </p>
            </DetailSection>
            
            <DetailSection>
              <h3>가입 금액</h3>
              <p style={{
                whiteSpace: 'pre-line',
                color: '#000 !important',
                backgroundColor: '#f9f9f9',
                padding: '10px',
                border: '1px solid #ffc107',
                fontSize: '14px',
                position: 'relative'
              }}>
                {selectedProduct.depositAmount != null ? selectedProduct.depositAmount : '정보 없음'}
              </p>
            </DetailSection>
            
            <DetailSection>
              <h3>가입 기간</h3>
              <p style={{
                color: '#000 !important',
                backgroundColor: '#f9f9f9',
                padding: '10px',
                border: '1px solid #17a2b8',
                fontSize: '14px',
                position: 'relative'
              }}>
                {selectedProduct.depositPeriod != null ? selectedProduct.depositPeriod : '정보 없음'}
              </p>
            </DetailSection>
            
            <DetailSection>
              <h3>기본 금리</h3>
              <p style={{
                color: '#000 !important',
                backgroundColor: '#f9f9f9',
                padding: '10px',
                border: '1px solid #dc3545',
                fontSize: '14px',
                position: 'relative'
              }}>
                {selectedProduct.interestRate != null ? selectedProduct.interestRate : '정보 없음'}
              </p>
            </DetailSection>
            
            {selectedProduct.preferentialRate != null && selectedProduct.preferentialRate !== '' && (
              <DetailSection>
                <h3>우대 금리</h3>
                <p style={{whiteSpace: 'pre-line'}}>
                  {selectedProduct.preferentialRate}
                </p>
              </DetailSection>
            )}
            
            {selectedProduct.taxBenefits != null && selectedProduct.taxBenefits !== '' && (
              <DetailSection>
                <h3>세제 혜택</h3>
                <p style={{whiteSpace: 'pre-line'}}>
                  {selectedProduct.taxBenefits}
                </p>
              </DetailSection>
            )}
            
            {(selectedProduct.notes || selectedProduct.notes) && (
              <DetailSection>
                <h3>유의사항</h3>
                <p>{selectedProduct.notes}</p>
              </DetailSection>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '2rem', 
              paddingTop: '1rem',
              borderTop: '1px solid #e9ecef' 
            }}>
              <button
                onClick={() => {
                  if (onScreenSync) {
                    onScreenSync({
                      type: 'product-detail-sync',
                      data: selectedProduct
                    });
                  }
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'var(--hana-mint)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#009688'}
                onMouseOut={(e) => e.target.style.background = 'var(--hana-mint)'}
              >
                📱 고객에게 보여주기
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '1rem 2rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ProductExplorer; 