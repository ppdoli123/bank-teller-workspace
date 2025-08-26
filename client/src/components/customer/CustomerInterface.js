import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import io from "socket.io-client";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";

const CustomerContainer = styled.div`
  min-height: calc(100vh - 120px);
  background: var(--hana-gray);
  padding: 2rem;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(
    135deg,
    var(--hana-mint) 0%,
    var(--hana-mint-dark) 100%
  );
  color: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "👋";
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 6rem;
    opacity: 0.3;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const ContentCard = styled.div`
  background: var(--hana-white);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 132, 133, 0.15);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ContentHeader = styled.div`
  background: var(--hana-mint);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const ContentTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ContentSubtitle = styled.p`
  opacity: 0.9;
`;

const ContentBody = styled.div`
  padding: 2rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--hana-mint);
    box-shadow: 0 4px 12px rgba(0, 132, 133, 0.1);
  }
`;

const ProductName = styled.h3`
  color: var(--hana-mint);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const ProductDescription = styled.p`
  color: var(--hana-dark-gray);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const ProductDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductRate = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--hana-mint);
`;

const SimulationResult = styled.div`
  background: linear-gradient(
    135deg,
    var(--hana-mint-light) 0%,
    var(--hana-mint) 100%
  );
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ResultItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
`;

const ResultLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const SignatureSection = styled.div`
  background: var(--hana-white);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 2px dashed var(--hana-mint);
`;

const SignatureTitle = styled.h3`
  color: var(--hana-mint);
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const SignatureCanvasContainer = styled.div`
  border: 2px solid var(--hana-mint);
  border-radius: 8px;
  margin: 1rem auto;
  width: fit-content;
`;

const SignatureButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
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
    background: var(--hana-white);
    color: var(--hana-mint);
    border: 2px solid var(--hana-mint);

    &:hover {
      background: var(--hana-mint);
      color: white;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingCard = styled.div`
  background: var(--hana-white);
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;

  &.connected {
    background: var(--hana-success);
    color: white;
  }

  &.waiting {
    background: var(--hana-warning);
    color: var(--hana-black);
  }
`;

const formatRate = (rate) => {
  return rate ? rate.toFixed(2) + "%" : "0.00%";
};

const CustomerInterface = () => {
  const { sessionId } = useParams();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [screenData, setScreenData] = useState(null);
  const [loading, setLoading] = useState(false);

  const signatureRef = useRef();

  useEffect(() => {
    // Socket.IO 연결
    const newSocket = io();
    setSocket(newSocket);

    // 세션 참여
    newSocket.emit("join-session", {
      sessionId,
      userType: "customer",
      userId: "customer",
    });

    // 이벤트 리스너 설정
    newSocket.on("session-joined", () => {
      setConnected(true);
    });

    newSocket.on("screen-updated", (data) => {
      setScreenData(data);
      setCurrentScreen(data.type);
    });

    newSocket.on("simulation-updated", (data) => {
      setScreenData(data);
      setCurrentScreen("simulation");
    });

    return () => newSocket.close();
  }, [sessionId]);

  const handleSignature = async () => {
    if (!signatureRef.current.isEmpty()) {
      setLoading(true);

      try {
        const signatureData = signatureRef.current.toDataURL();

        await axios.post(
          "https://hana-backend-production.up.railway.app/api/signature/submit",
          {
            customerId: screenData?.customerId,
            sessionId: sessionId,
            productId: screenData?.product?.ProductID,
            signatureData: signatureData,
          }
        );

        setCurrentScreen("completion");
      } catch (error) {
        console.error("서명 처리 오류:", error);
        alert("서명 처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  const renderWelcomeScreen = () => (
    <div>
      <WelcomeCard>
        <WelcomeTitle>하나은행에 오신 것을 환영합니다!</WelcomeTitle>
        <WelcomeSubtitle>
          전문 상담사가 고객님께 최적의 금융 솔루션을 제안해드리겠습니다.
        </WelcomeSubtitle>
      </WelcomeCard>

      <ContentCard>
        <ContentHeader>
          <ContentTitle>상담 준비 중</ContentTitle>
          <ContentSubtitle>잠시만 기다려주세요...</ContentSubtitle>
        </ContentHeader>
        <ContentBody>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <StatusBadge className={connected ? "connected" : "waiting"}>
              {connected ? "✓ 상담사와 연결됨" : "⏳ 연결 대기 중"}
            </StatusBadge>
            <p>상담사가 고객님의 신분증을 확인하고 있습니다.</p>
          </div>
        </ContentBody>
      </ContentCard>
    </div>
  );

  const renderProductComparison = () => (
    <ContentCard>
      <ContentHeader>
        <ContentTitle>상품 비교</ContentTitle>
        <ContentSubtitle>선택하신 상품들을 비교해보세요</ContentSubtitle>
      </ContentHeader>
      <ContentBody>
        <ProductGrid>
          {screenData?.data?.map((product, index) => (
            <ProductCard key={index}>
              <ProductName>{product.ProductName}</ProductName>
              <ProductDescription>{product.Description}</ProductDescription>
              <ProductDetails>
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--hana-dark-gray)",
                    }}
                  >
                    기본 금리
                  </div>
                  <ProductRate>
                    {formatRate(product.BaseInterestRate)}
                  </ProductRate>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--hana-dark-gray)",
                    }}
                  >
                    상품 유형
                  </div>
                  <div style={{ fontWeight: "600" }}>{product.ProductType}</div>
                </div>
              </ProductDetails>
            </ProductCard>
          ))}
        </ProductGrid>
      </ContentBody>
    </ContentCard>
  );

  const renderSimulationResult = () => (
    <div>
      <ContentCard>
        <ContentHeader>
          <ContentTitle>혜택 시뮬레이션 결과</ContentTitle>
          <ContentSubtitle>
            {screenData?.data?.product?.ProductName}
          </ContentSubtitle>
        </ContentHeader>
        <ContentBody>
          <SimulationResult>
            <ResultGrid>
              <ResultItem>
                <ResultLabel>기본 금리</ResultLabel>
                <ResultValue>
                  {formatRate(screenData?.data?.result?.baseInterestRate)}
                </ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>최종 금리</ResultLabel>
                <ResultValue>
                  {formatRate(screenData?.data?.result?.totalInterestRate)}
                </ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>우대 혜택</ResultLabel>
                <ResultValue>
                  +
                  {formatRate(
                    (screenData?.data?.result?.totalInterestRate || 0) -
                      (screenData?.data?.result?.baseInterestRate || 0)
                  )}
                </ResultValue>
              </ResultItem>
            </ResultGrid>

            <div style={{ textAlign: "center" }}>
              <h4 style={{ marginBottom: "1rem" }}>🎉 축하합니다!</h4>
              <p>고객님의 조건으로 최대 우대혜택을 받으실 수 있습니다.</p>
            </div>
          </SimulationResult>
        </ContentBody>
      </ContentCard>
    </div>
  );

  const renderApplicationForm = () => (
    <ContentCard>
      <ContentHeader>
        <ContentTitle>상품 가입 신청</ContentTitle>
        <ContentSubtitle>
          {screenData?.data?.product?.ProductName}
        </ContentSubtitle>
      </ContentHeader>
      <ContentBody>
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: "var(--hana-mint)", marginBottom: "1rem" }}>
            가입 조건
          </h4>
          <div
            style={{
              background: "var(--hana-gray)",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>최종 금리:</strong>{" "}
              {formatRate(screenData?.data?.simulation?.totalInterestRate)}
            </p>
            <p>
              <strong>적용 혜택:</strong>{" "}
              {screenData?.data?.simulation?.benefits?.length || 0}개
            </p>
          </div>
        </div>

        <SignatureSection>
          <SignatureTitle>전자 서명</SignatureTitle>
          <p style={{ marginBottom: "1rem", color: "var(--hana-dark-gray)" }}>
            아래 서명란에 서명해주세요
          </p>

          <SignatureCanvasContainer>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 400,
                height: 200,
                className: "signature-canvas",
              }}
            />
          </SignatureCanvasContainer>

          <SignatureButtons>
            <Button className="secondary" onClick={clearSignature}>
              다시 작성
            </Button>
            <Button className="primary" onClick={handleSignature}>
              가입 완료
            </Button>
          </SignatureButtons>
        </SignatureSection>
      </ContentBody>
    </ContentCard>
  );

  const renderCompletionScreen = () => (
    <ContentCard>
      <ContentHeader>
        <ContentTitle>🎉 가입 완료!</ContentTitle>
        <ContentSubtitle>상품 가입이 성공적으로 완료되었습니다</ContentSubtitle>
      </ContentHeader>
      <ContentBody>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h3 style={{ color: "var(--hana-mint)", marginBottom: "1rem" }}>
            가입 신청이 완료되었습니다
          </h3>
          <p style={{ color: "var(--hana-dark-gray)" }}>
            영업일 기준 1-2일 내에 처리 결과를 안내드리겠습니다.
          </p>
        </div>
      </ContentBody>
    </ContentCard>
  );

  return (
    <CustomerContainer>
      {currentScreen === "welcome" && renderWelcomeScreen()}
      {currentScreen === "product-comparison-updated" &&
        renderProductComparison()}
      {currentScreen === "simulation-result" && renderSimulationResult()}
      {currentScreen === "show-application-form" && renderApplicationForm()}
      {currentScreen === "completion" && renderCompletionScreen()}

      {loading && (
        <LoadingOverlay>
          <LoadingCard>
            <div className="spinner"></div>
            <h3 style={{ marginTop: "1rem" }}>처리 중...</h3>
            <p>잠시만 기다려주세요</p>
          </LoadingCard>
        </LoadingOverlay>
      )}
    </CustomerContainer>
  );
};

export default CustomerInterface;
