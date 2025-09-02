import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  getProductInterestRates,
  getBestRateForPeriod,
} from "../../utils/interestRateUtils";
import {
  productCategories,
  productDetails,
  productIcons,
  productColors,
} from "../../data/hanaProducts";

const ExplorerContainer = styled.div`
  padding: var(--hana-space-8);
  height: 100%;
  overflow: auto;
  background: var(--hana-bg-gray);
  font-family: var(--hana-font-family);
`;

const SearchBar = styled.div`
  display: flex;
  gap: var(--hana-space-4);
  margin-bottom: var(--hana-space-8);
  align-items: center;
  background: var(--hana-white);
  padding: var(--hana-space-6);
  border-radius: var(--hana-radius-lg);
  box-shadow: var(--hana-shadow-light);
  border: var(--hana-border-light);
`;

const SearchInput = styled.input`
  flex: 1;
  padding: var(--hana-space-4);
  border: 2px solid var(--hana-light-gray);
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-base);
  font-family: var(--hana-font-family);
  transition: all var(--hana-transition-base);

  &:focus {
    outline: none;
    border-color: var(--hana-primary);
    box-shadow: 0 0 0 3px rgba(0, 133, 122, 0.1);
  }

  &::placeholder {
    color: var(--hana-gray);
    font-weight: 500;
  }
`;

const FilterSelect = styled.select`
  padding: var(--hana-space-4);
  border: 2px solid var(--hana-light-gray);
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-base);
  font-family: var(--hana-font-family);
  background: var(--hana-white);
  min-width: 200px;
  font-weight: 600;
  color: var(--hana-primary);
  transition: all var(--hana-transition-base);

  &:focus {
    outline: none;
    border-color: var(--hana-primary);
    box-shadow: 0 0 0 3px rgba(0, 133, 122, 0.1);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--hana-space-6);
  margin-bottom: var(--hana-space-8);
`;

const ProductCard = styled.div`
  background: var(--hana-white);
  border-radius: var(--hana-radius-lg);
  box-shadow: var(--hana-shadow-light);
  overflow: hidden;
  transition: all var(--hana-transition-base);
  cursor: pointer;
  border: var(--hana-border-light);
  position: relative;

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--hana-shadow-heavy);
    border-color: var(--hana-primary);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--hana-primary),
      var(--hana-mint),
      var(--hana-orange)
    );
    opacity: 0;
    transition: all var(--hana-transition-base);
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ProductHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.bgColor || "var(--hana-primary)"} 0%,
    ${(props) => (props.bgColor ? props.bgColor + "DD" : "var(--hana-mint)")}
      100%
  );
  color: var(--hana-white);
  padding: var(--hana-space-6);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ProductType = styled.div`
  font-size: var(--hana-font-size-sm);
  opacity: 0.95;
  margin-bottom: var(--hana-space-2);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--hana-space-2);
`;

const ProductName = styled.h3`
  font-size: var(--hana-font-size-xl);
  font-weight: 900;
  margin-bottom: var(--hana-space-2);
  line-height: 1.3;
`;

const ProductDescription = styled.p`
  font-size: var(--hana-font-size-sm);
  opacity: 0.95;
  line-height: 1.5;
  margin: 0;
`;

const ProductBody = styled.div`
  padding: var(--hana-space-6);
`;

const ProductDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--hana-space-3);
  margin-bottom: var(--hana-space-6);
`;

const DetailItem = styled.div`
  text-align: center;
  padding: var(--hana-space-4);
  background: var(--hana-primary-light);
  border-radius: var(--hana-radius-md);
  border: 1px solid rgba(0, 133, 122, 0.1);
  transition: all var(--hana-transition-base);

  &:hover {
    background: rgba(0, 133, 122, 0.1);
    transform: scale(1.02);
  }
`;

const DetailLabel = styled.div`
  font-size: var(--hana-font-size-xs);
  color: var(--hana-gray);
  margin-bottom: var(--hana-space-1);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-size: var(--hana-font-size-base);
  font-weight: 700;
  color: var(--hana-primary);
  line-height: 1.4;
`;

const ProductActions = styled.div`
  display: flex;
  gap: var(--hana-space-3);
`;

const ActionButton = styled.button`
  flex: 1;
  padding: var(--hana-space-3) var(--hana-space-4);
  border: none;
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-sm);
  font-weight: 700;
  font-family: var(--hana-font-family);
  cursor: pointer;
  transition: all var(--hana-transition-base);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left var(--hana-transition-slow);
  }

  &:hover::before {
    left: 100%;
  }

  &.primary {
    background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
    color: var(--hana-white);
    box-shadow: var(--hana-shadow-light);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--hana-shadow-medium);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  &.secondary {
    background: var(--hana-white);
    color: var(--hana-primary);
    border: 2px solid var(--hana-primary);

    &:hover {
      background: var(--hana-primary-light);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      border-color: var(--hana-light-gray);
      color: var(--hana-gray);
    }
  }
`;

const ComparisonBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    135deg,
    var(--hana-white),
    var(--hana-primary-light)
  );
  border-top: 3px solid var(--hana-primary);
  padding: var(--hana-space-4) var(--hana-space-8);
  box-shadow: var(--hana-shadow-heavy);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(10px);
`;

const ComparisonItems = styled.div`
  display: flex;
  gap: var(--hana-space-4);
  align-items: center;

  > span {
    font-weight: 700;
    color: var(--hana-primary);
    font-size: var(--hana-font-size-lg);
  }
`;

const ComparisonItem = styled.div`
  background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
  color: var(--hana-white);
  padding: var(--hana-space-2) var(--hana-space-4);
  border-radius: var(--hana-radius-full);
  font-size: var(--hana-font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--hana-space-2);
  box-shadow: var(--hana-shadow-light);

  &:hover {
    transform: scale(1.05);
  }
`;

const RemoveButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: var(--hana-white);
  cursor: pointer;
  font-size: var(--hana-font-size-lg);
  width: 24px;
  height: 24px;
  border-radius: var(--hana-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--hana-transition-base);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const CompareButton = styled.button`
  background: linear-gradient(135deg, var(--hana-orange), var(--hana-primary));
  color: var(--hana-white);
  border: none;
  padding: var(--hana-space-4) var(--hana-space-8);
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-lg);
  font-weight: 700;
  font-family: var(--hana-font-family);
  cursor: pointer;
  transition: all var(--hana-transition-base);
  box-shadow: var(--hana-shadow-light);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--hana-shadow-medium);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 133, 122, 0.3);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: hanaFadeIn 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: var(--hana-white);
  width: 95%;
  max-width: 900px;
  max-height: 90%;
  overflow-y: auto;
  border-radius: var(--hana-radius-xl);
  padding: var(--hana-space-8);
  position: relative;
  box-shadow: var(--hana-shadow-heavy);
  border: var(--hana-border-light);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--hana-space-8);
  padding-bottom: var(--hana-space-6);
  border-bottom: 3px solid var(--hana-primary-light);
  background: linear-gradient(
    135deg,
    var(--hana-primary-light),
    rgba(0, 193, 178, 0.1)
  );
  margin: calc(-1 * var(--hana-space-8)) calc(-1 * var(--hana-space-8))
    var(--hana-space-8);
  padding: var(--hana-space-6) var(--hana-space-8);
  border-radius: var(--hana-radius-xl) var(--hana-radius-xl) 0 0;
`;

const ModalTitle = styled.h2`
  color: var(--hana-primary);
  font-size: var(--hana-font-size-3xl);
  margin: 0;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: var(--hana-space-3);

  &::before {
    content: "🏦";
    font-size: var(--hana-font-size-2xl);
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--hana-light-gray);
  font-size: var(--hana-font-size-2xl);
  cursor: pointer;
  color: var(--hana-gray);
  width: 48px;
  height: 48px;
  border-radius: var(--hana-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--hana-transition-base);
  font-weight: 700;

  &:hover {
    color: var(--hana-error);
    border-color: var(--hana-error);
    background: var(--hana-error-light);
    transform: scale(1.1);
  }
`;

const DetailSection = styled.div`
  margin-bottom: var(--hana-space-6);
  padding: var(--hana-space-4);
  background: var(--hana-primary-light);
  border-radius: var(--hana-radius-lg);
  border-left: 4px solid var(--hana-primary);

  h3 {
    color: var(--hana-primary);
    margin-bottom: var(--hana-space-3);
    font-size: var(--hana-font-size-xl);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: var(--hana-space-2);

    &::before {
      content: "▶";
      color: var(--hana-mint);
    }
  }

  p {
    line-height: 1.7;
    color: var(--hana-black);
    font-weight: 500;
    font-size: var(--hana-font-size-base);
  }
`;

const formatCurrency = (amount) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
};

const formatRate = (rate) => {
  if (!rate) return "-";
  return rate.toFixed(2) + "%";
};

const getProductIcon = (type) => {
  return productIcons[type] || "📄";
};

const ProductExplorer = ({
  onScreenSync,
  onProductSelected,
  customerId,
  stompClient,
  sessionId,
}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [comparisonList, setComparisonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 하이라이트 기능
  const highlightElement = (
    elementId,
    highlightType = "highlight",
    color = "#ffff00"
  ) => {
    if (stompClient && sessionId && stompClient.active) {
      stompClient.publish({
        destination: "/app/screen-highlight",
        body: JSON.stringify({
          sessionId: sessionId,
          elementId: elementId,
          highlightType: highlightType,
          color: color,
        }),
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedType]);

  // 실제 금리 조회 함수
  const getActualInterestRate = (productName, baseRate) => {
    const rates = getProductInterestRates(productName);

    if (rates.length === 0) {
      return baseRate || "시장금리 연동";
    }

    // 가장 일반적인 기간(1년 또는 12개월)의 금리를 우선 조회
    const commonRate = getBestRateForPeriod(productName, 12);
    if (commonRate) {
      return `${commonRate.rateDisplay}`;
    }

    // 첫 번째 금리 반환
    return rates[0].rateDisplay;
  };

  // 상품별 금리 상세 정보 조회
  const getRateDetails = (productName) => {
    const rates = getProductInterestRates(productName);
    return rates;
  };

  const fetchProducts = async () => {
    try {
      // 하나은행 실제 상품 데이터를 사용
      const hanaProducts = [];

      // 카테고리별 상품을 변환
      Object.entries(productCategories).forEach(([category, products]) => {
        products.forEach((productName) => {
          const detail = productDetails[productName];
          const actualRate = getActualInterestRate(
            productName,
            detail?.interestRate
          );

          if (detail) {
            hanaProducts.push({
              id: hanaProducts.length + 1,
              product_name: productName,
              product_type: category,
              product_features: detail.productFeatures,
              target_customers: detail.targetCustomers,
              deposit_period: detail.depositPeriod,
              deposit_amount: detail.depositAmount,
              interest_rate: actualRate,
              preferential_rate: detail.preferentialRate,
              tax_benefits: detail.taxBenefits,
              withdrawal_conditions: detail.withdrawalConditions,
              notes: detail.notes,
              eligibility_requirements: detail.targetCustomers,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            // 상세 정보가 없는 경우 기본 정보만 제공
            hanaProducts.push({
              id: hanaProducts.length + 1,
              product_name: productName,
              product_type: category,
              product_features: `${category} 상품입니다.`,
              target_customers: "실명의 개인 및 법인",
              deposit_period: "상품별 상이",
              deposit_amount: "상품별 상이",
              interest_rate: actualRate,
              preferential_rate: "",
              tax_benefits: "",
              withdrawal_conditions: "상품별 상이",
              notes: "자세한 내용은 영업점 문의",
              eligibility_requirements: "실명의 개인 및 법인",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        });
      });

      console.log("하나은행 상품 데이터 로드 완료:", hanaProducts.length, "개");
      setProducts(hanaProducts);
    } catch (error) {
      console.error("상품 데이터 로드 오류:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          (product.product_name &&
            product.product_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (product.product_features &&
            product.product_features
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType) {
      filtered = filtered.filter(
        (product) => product.product_type === selectedType
      );
    }

    setFilteredProducts(filtered);
  };

  const addToComparison = (product) => {
    if (
      comparisonList.length < 3 &&
      !comparisonList.find((p) => p.id === product.id)
    ) {
      const newList = [...comparisonList, product];
      setComparisonList(newList);

      // 고객 화면에 동기화
      onScreenSync({
        type: "product-comparison-updated",
        data: newList,
      });
    }
  };

  const removeFromComparison = (productId) => {
    const newList = comparisonList.filter((p) => p.id !== productId);
    setComparisonList(newList);

    // 고객 화면에 동기화
    onScreenSync({
      type: "product-comparison-updated",
      data: newList,
    });
  };

  const handleCompare = () => {
    if (comparisonList.length >= 2) {
      onScreenSync({
        type: "show-comparison",
        data: comparisonList,
      });
    }
  };

  const handleProductDetail = (product) => {
    console.log("🚀 === 상품 상세보기 클릭 시작 ===");
    console.log("클릭한 상품 전체:", JSON.stringify(product, null, 2));
    console.log("상품명:", product.productName);
    console.log("상품 특징:", `"${product.productFeatures}"`);
    console.log("가입 대상:", `"${product.targetCustomers}"`);
    console.log("가입 금액:", `"${product.depositAmount}"`);
    console.log("기본 금리:", `"${product.interestRate}"`);
    console.log("모달 열기 전 showModal 상태:", showModal);

    // 실제 데이터베이스에 존재하는 상품 ID로 매핑
    const productIdMapping = {
      "3·6·9 정기예금": "P033_아이_꿈하나_적금", // 임시로 적금 상품 ID 사용
      "(내맘) 적금": "P084_내맘_적금",
      "급여하나 월복리 적금": "P035_급여하나_월복리_적금",
      "달달 하나 적금": "P077_달달하나_적금",
      "대전하나 축구사랑 적금": "P070_대전하나_축구사랑_적금",
      "도전365 적금": "P089_도전_365_적금",
      "부자씨 적금": "P068_부자씨_적금",
      "손님케어 적금": "P052_손님케어적금",
      "하나 아이키움 적금": "P069_하나_아이키움_적금",
      "하나 중소기업재직자 우대저축": "P078_하나_중소기업재직자_우대저축",
      "내집마련 더블업(Double-Up)적금": "P093_내집마련더블업적금",
    };

    // 상품 ID 매핑 적용
    const mappedProduct = {
      ...product,
      productid:
        productIdMapping[product.productName] || "P033_아이_꿈하나_적금", // 기본값
    };

    console.log("🔍 매핑된 상품 ID:", mappedProduct.productid);

    setSelectedProduct(mappedProduct);
    setShowModal(true);

    // 상품 선택 이벤트 전달
    if (onProductSelected) {
      onProductSelected(mappedProduct);
    }

    console.log("setSelectedProduct 호출 완료");
    console.log("setShowModal(true) 호출 완료");
    console.log("🚀 === 상품 상세보기 클릭 종료 ===");

    // 고객 화면에도 상품 상세정보 전송
    if (onScreenSync) {
      console.log("🔄 고객 화면으로 데이터 전송:", mappedProduct);
      onScreenSync({
        type: "product-detail-sync",
        data: mappedProduct,
      });
    }
  };

  // 하나은행 상품 카테고리 사용
  const productTypes = Object.keys(productCategories);

  if (loading) {
    return (
      <ExplorerContainer>
        <div style={{ textAlign: "center", padding: "3rem" }}>
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
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {getProductIcon(type)} {type}
              </option>
            ))}
          </FilterSelect>
        </SearchBar>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--hana-dark-gray)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏦</div>
            <h3>하나은행 상품 정보를 불러오는 중...</h3>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--hana-dark-gray)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 키워드로 검색하거나 필터를 변경해보세요.</p>
          </div>
        ) : (
          <ProductGrid>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id}>
                <ProductHeader bgColor={productColors[product.product_type]}>
                  <ProductType>
                    {getProductIcon(
                      product.productType || product.product_type
                    )}{" "}
                    {product.productType || product.product_type}
                  </ProductType>
                  <ProductName>
                    {product.productName || product.product_name}
                  </ProductName>
                  <ProductDescription>
                    {product.productFeatures || product.product_features}
                  </ProductDescription>
                </ProductHeader>

                <ProductBody>
                  <ProductDetails>
                    <DetailItem>
                      <DetailLabel>가입 대상</DetailLabel>
                      <DetailValue style={{ fontSize: "0.8rem" }}>
                        {(
                          product.targetCustomers ||
                          product.target_customers ||
                          "N/A"
                        ).length > 20
                          ? (
                              product.targetCustomers ||
                              product.target_customers ||
                              "N/A"
                            ).substring(0, 20) + "..."
                          : product.targetCustomers ||
                            product.target_customers ||
                            "N/A"}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>가입 금액/기간</DetailLabel>
                      <DetailValue style={{ fontSize: "0.8rem" }}>
                        {(
                          product.depositAmount ||
                          product.deposit_amount ||
                          "N/A"
                        ).length > 20
                          ? (
                              product.depositAmount ||
                              product.deposit_amount ||
                              "N/A"
                            ).substring(0, 20) + "..."
                          : product.depositAmount ||
                            product.deposit_amount ||
                            "N/A"}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>기본 금리</DetailLabel>
                      <DetailValue>
                        {product.interestRate ||
                          product.interest_rate ||
                          "문의 필요"}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>우대 혜택</DetailLabel>
                      <DetailValue style={{ fontSize: "0.8rem" }}>
                        {product.preferentialRate || product.preferential_rate
                          ? (
                              product.preferentialRate ||
                              product.preferential_rate
                            ).length > 15
                            ? (
                                product.preferentialRate ||
                                product.preferential_rate
                              ).substring(0, 15) + "..."
                            : product.preferentialRate ||
                              product.preferential_rate
                          : "해당없음"}
                      </DetailValue>
                    </DetailItem>
                  </ProductDetails>

                  <ProductActions>
                    <ActionButton
                      className="secondary"
                      onClick={() => addToComparison(product)}
                      disabled={
                        comparisonList.length >= 3 ||
                        comparisonList.find((p) => p.id === product.id)
                      }
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
        )}
      </ExplorerContainer>

      {comparisonList.length > 0 && (
        <ComparisonBar>
          <ComparisonItems>
            <span>비교함 ({comparisonList.length}/3):</span>
            {comparisonList.map((product) => (
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

      {console.log(
        "모달 렌더링 조건 확인 - showModal:",
        showModal,
        "selectedProduct:",
        !!selectedProduct
      )}
      {showModal && selectedProduct && (
        <Modal
          onClick={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {console.log("모달이 렌더링됨! selectedProduct:", selectedProduct)}
            <ModalHeader>
              <ModalTitle>
                {selectedProduct.productName || selectedProduct.product_name}
              </ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowModal(false);
                  setSelectedProduct(null);
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>

            <DetailSection>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 id="product-type">상품 타입</h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() =>
                      highlightElement("product-type", "highlight", "#ffff00")
                    }
                    style={{
                      padding: "0.25rem 0.5rem",
                      background: "#ffff00",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🟡 하이라이트
                  </button>
                  <button
                    onClick={() =>
                      highlightElement("product-type", "underline", "#ff0000")
                    }
                    style={{
                      padding: "0.25rem 0.5rem",
                      background: "#ff0000",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🔴 밑줄
                  </button>
                </div>
              </div>
              <p>
                {selectedProduct.productType ||
                  selectedProduct.product_type ||
                  "일반 상품"}
              </p>
            </DetailSection>

            <DetailSection>
              <h3 id="product-features">상품 특징</h3>
              {console.log("=== 🔍 상품 특징 완전 디버깅 ===")}
              {console.log(
                "selectedProduct 전체:",
                JSON.stringify(selectedProduct, null, 2)
              )}
              {console.log(
                "productFeatures 값:",
                `"${selectedProduct.productFeatures}"`
              )}
              {console.log(
                "productFeatures === null:",
                selectedProduct.productFeatures === null
              )}
              {console.log(
                "productFeatures === undefined:",
                selectedProduct.productFeatures === undefined
              )}
              {console.log(
                'productFeatures === "":',
                selectedProduct.productFeatures === ""
              )}
              {console.log(
                "Boolean(productFeatures):",
                Boolean(selectedProduct.productFeatures)
              )}
              {console.log(
                "productFeatures != null:",
                selectedProduct.productFeatures != null
              )}
              {console.log(
                "조건 결과:",
                selectedProduct.productFeatures != null
                  ? "데이터 있음"
                  : "정보 없음"
              )}
              {console.log(
                "실제 렌더링 값:",
                selectedProduct.productFeatures != null
                  ? selectedProduct.productFeatures
                  : "정보 없음"
              )}
              {console.log("=================================")}
              <div
                style={{
                  border: "2px solid red",
                  padding: "10px",
                  margin: "10px 0",
                }}
              >
                <strong>디버깅 정보:</strong>
                <br />
                값: "{selectedProduct.productFeatures}"
                <br />
                타입: {typeof selectedProduct.productFeatures}
                <br />
                null 체크: {String(selectedProduct.productFeatures != null)}
                <br />
                Boolean 변환: {String(Boolean(selectedProduct.productFeatures))}
              </div>
              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#000 !important",
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  border: "2px solid #007bff",
                  fontSize: "16px",
                  fontWeight: "bold",
                  zIndex: "9999",
                  position: "relative",
                }}
              >
                {selectedProduct.productFeatures != null
                  ? selectedProduct.productFeatures
                  : "정보 없음"}
              </p>
            </DetailSection>

            <DetailSection>
              <h3>가입 대상</h3>
              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#000 !important",
                  backgroundColor: "#f9f9f9",
                  padding: "10px",
                  border: "1px solid #28a745",
                  fontSize: "14px",
                  position: "relative",
                }}
              >
                {selectedProduct.targetCustomers != null
                  ? selectedProduct.targetCustomers
                  : "정보 없음"}
              </p>
            </DetailSection>

            <DetailSection>
              <h3>가입 금액</h3>
              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#000 !important",
                  backgroundColor: "#f9f9f9",
                  padding: "10px",
                  border: "1px solid #ffc107",
                  fontSize: "14px",
                  position: "relative",
                }}
              >
                {selectedProduct.depositAmount != null
                  ? selectedProduct.depositAmount
                  : "정보 없음"}
              </p>
            </DetailSection>

            <DetailSection>
              <h3>가입 기간</h3>
              <p
                style={{
                  color: "#000 !important",
                  backgroundColor: "#f9f9f9",
                  padding: "10px",
                  border: "1px solid #17a2b8",
                  fontSize: "14px",
                  position: "relative",
                }}
              >
                {selectedProduct.depositPeriod != null
                  ? selectedProduct.depositPeriod
                  : "정보 없음"}
              </p>
            </DetailSection>

            <DetailSection>
              <h3>기본 금리</h3>
              <p
                style={{
                  color: "#000 !important",
                  backgroundColor: "#f9f9f9",
                  padding: "10px",
                  border: "1px solid #dc3545",
                  fontSize: "14px",
                  position: "relative",
                }}
              >
                {selectedProduct.interestRate != null
                  ? selectedProduct.interestRate
                  : "정보 없음"}
              </p>
              {(() => {
                const rateDetails = getRateDetails(
                  selectedProduct.product_name || selectedProduct.productName
                );
                if (rateDetails.length > 0) {
                  return (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "12px",
                        backgroundColor: "#e8f5e8",
                        border: "1px solid #4caf50",
                        borderRadius: "6px",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          color: "#2e7d32",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        💰 실시간 금리 정보
                      </h4>
                      <div style={{ display: "grid", gap: "6px" }}>
                        {rateDetails.map((rate, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "6px 10px",
                              backgroundColor: "white",
                              borderRadius: "4px",
                              border: "1px solid #c8e6c9",
                              fontSize: "13px",
                            }}
                          >
                            <span style={{ fontWeight: "500", color: "#333" }}>
                              {rate.period}
                            </span>
                            <span
                              style={{
                                fontWeight: "bold",
                                color: "#d32f2f",
                                fontSize: "14px",
                              }}
                            >
                              {rate.rateDisplay}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                          color: "#666",
                          textAlign: "center",
                        }}
                      >
                        ※ 실시간 시장금리 반영 (세전 기준)
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </DetailSection>

            {selectedProduct.preferentialRate != null &&
              selectedProduct.preferentialRate !== "" && (
                <DetailSection>
                  <h3>우대 금리</h3>
                  <p style={{ whiteSpace: "pre-line" }}>
                    {selectedProduct.preferentialRate}
                  </p>
                </DetailSection>
              )}

            {selectedProduct.taxBenefits != null &&
              selectedProduct.taxBenefits !== "" && (
                <DetailSection>
                  <h3>세제 혜택</h3>
                  <p style={{ whiteSpace: "pre-line" }}>
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

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e9ecef",
              }}
            >
              <button
                onClick={() => {
                  if (onScreenSync) {
                    onScreenSync({
                      type: "product-detail-sync",
                      data: selectedProduct,
                    });
                  }
                }}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "var(--hana-mint)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "#009688")}
                onMouseOut={(e) =>
                  (e.target.style.background = "var(--hana-mint)")
                }
              >
                📱 고객에게 보여주기
              </button>
              <button
                onClick={() => {
                  // 상품 가입 시작 - WebSocket으로 태블릿에 전송
                  if (onScreenSync) {
                    onScreenSync({
                      type: "product-enrollment",
                      data: {
                        productId:
                          selectedProduct.productid ||
                          selectedProduct.productId ||
                          selectedProduct.id,
                        productName:
                          selectedProduct.productname ||
                          selectedProduct.productName ||
                          selectedProduct.product_name,
                        productType:
                          selectedProduct.producttype ||
                          selectedProduct.productType ||
                          selectedProduct.product_type,
                        customerId: customerId,
                      },
                    });
                  }
                  // 모달을 닫지 않고 유지
                  // setShowModal(false);
                }}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "var(--hana-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "#00695c")}
                onMouseOut={(e) =>
                  (e.target.style.background = "var(--hana-primary)")
                }
              >
                📝 상품 가입하기
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "1rem 2rem",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
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
