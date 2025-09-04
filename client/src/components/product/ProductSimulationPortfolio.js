import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import axios from "axios";

const ProductSimulationPortfolio = ({ product, onClose }) => {
  const [simulationData, setSimulationData] = useState({
    amount: 10000000, // 1천만원 기본값
    period: 12, // 12개월 기본값
    interestRate: 0,
    bonusRate: 0,
    totalRate: 0,
    monthlyPayment: 0,
    totalInterest: 0,
    maturityAmount: 0,
  });

  const [productRates, setProductRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState({
    ageGroup: "30-40",
    incomeLevel: "middle",
    existingCustomer: false,
    salaryAccount: false,
    multipleProducts: false,
  });

  // 상품 금리 정보 가져오기
  useEffect(() => {
    if (product?.productId) {
      fetchProductRates(product.productId);
    }
  }, [product]);

  // 시뮬레이션 계산
  useEffect(() => {
    calculateSimulation();
  }, [
    simulationData.amount,
    simulationData.period,
    productRates,
    selectedConditions,
  ]);

  const fetchProductRates = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employee/products/${productId}/rates`
      );
      if (response.data.success) {
        setProductRates(response.data.data);
        // 기본 금리 설정
        if (response.data.data.length > 0) {
          const defaultRate = response.data.data[0];
          setSimulationData((prev) => ({
            ...prev,
            interestRate: defaultRate.baserate || 0,
            bonusRate: defaultRate.bonusrate || 0,
            totalRate: defaultRate.totalrate || 0,
          }));
        }
      }
    } catch (error) {
      console.error("상품 금리 조회 실패:", error);
      // 기본값 설정
      setSimulationData((prev) => ({
        ...prev,
        interestRate: 3.0,
        bonusRate: 0.5,
        totalRate: 3.5,
      }));
    } finally {
      setLoading(false);
    }
  };

  const calculateSimulation = () => {
    const { amount, period, totalRate } = simulationData;

    // 우대금리 계산
    let finalRate = totalRate;
    if (selectedConditions.salaryAccount) finalRate += 0.2;
    if (selectedConditions.existingCustomer) finalRate += 0.1;
    if (selectedConditions.multipleProducts) finalRate += 0.15;

    // 월 납입금 계산 (적금의 경우)
    const monthlyPayment = amount / period;

    // 총 이자 계산
    const totalInterest = (((amount * finalRate) / 100) * period) / 12;

    // 만기금액 계산
    const maturityAmount = amount + totalInterest;

    setSimulationData((prev) => ({
      ...prev,
      totalRate: finalRate,
      monthlyPayment,
      totalInterest,
      maturityAmount,
    }));
  };

  // 차트 데이터 생성
  const getPortfolioData = () => {
    const { amount, totalInterest } = simulationData;
    return [
      { name: "원금", value: amount, color: "#4F46E5" },
      { name: "이자", value: totalInterest, color: "#10B981" },
    ];
  };

  const getRateComparisonData = () => {
    return productRates.map((rate) => ({
      period: rate.period,
      baseRate: rate.baserate,
      bonusRate: rate.bonusrate,
      totalRate: rate.totalrate,
    }));
  };

  const getMonthlyPaymentData = () => {
    const { period, monthlyPayment } = simulationData;
    const data = [];
    for (let i = 1; i <= period; i++) {
      data.push({
        month: `${i}개월`,
        payment: monthlyPayment,
        cumulative: monthlyPayment * i,
      });
    }
    return data;
  };

  if (!product) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--hana-space-4)",
      }}
    >
      <div
        style={{
          background: "var(--hana-white)",
          borderRadius: "var(--hana-radius-lg)",
          width: "90%",
          maxWidth: "1200px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "var(--hana-shadow-large)",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--hana-primary) 0%, var(--hana-mint) 100%)",
            color: "white",
            padding: "var(--hana-space-6)",
            borderRadius: "var(--hana-radius-lg) var(--hana-radius-lg) 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "var(--hana-font-size-2xl)" }}>
              🎯 {product.productName || product.product_name} 시뮬레이션
            </h2>
            <p style={{ margin: "var(--hana-space-2) 0 0 0", opacity: 0.9 }}>
              What-If 시나리오로 최적의 투자 전략을 찾아보세요
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "var(--hana-space-6)" }}>
          {/* 입력 섹션 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--hana-space-6)",
              marginBottom: "var(--hana-space-6)",
            }}
          >
            {/* 투자 조건 입력 */}
            <div
              style={{
                background: "#F8FAFC",
                padding: "var(--hana-space-4)",
                borderRadius: "var(--hana-radius-md)",
                border: "1px solid var(--hana-border)",
              }}
            >
              <h3
                style={{
                  color: "var(--hana-primary)",
                  marginBottom: "var(--hana-space-4)",
                }}
              >
                💰 투자 조건
              </h3>

              <div style={{ display: "grid", gap: "var(--hana-space-3)" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "var(--hana-space-2)",
                      fontWeight: "500",
                    }}
                  >
                    투자 금액 (원)
                  </label>
                  <input
                    type="number"
                    value={simulationData.amount}
                    onChange={(e) =>
                      setSimulationData((prev) => ({
                        ...prev,
                        amount: parseInt(e.target.value) || 0,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "var(--hana-space-3)",
                      border: "2px solid var(--hana-border)",
                      borderRadius: "var(--hana-radius)",
                      fontSize: "var(--hana-font-size-base)",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "var(--hana-space-2)",
                      fontWeight: "500",
                    }}
                  >
                    투자 기간 (개월)
                  </label>
                  <select
                    value={simulationData.period}
                    onChange={(e) =>
                      setSimulationData((prev) => ({
                        ...prev,
                        period: parseInt(e.target.value),
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "var(--hana-space-3)",
                      border: "2px solid var(--hana-border)",
                      borderRadius: "var(--hana-radius)",
                      fontSize: "var(--hana-font-size-base)",
                    }}
                  >
                    <option value={6}>6개월</option>
                    <option value={12}>12개월</option>
                    <option value={24}>24개월</option>
                    <option value={36}>36개월</option>
                    <option value={60}>60개월</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 우대 조건 선택 */}
            <div
              style={{
                background: "#F8FAFC",
                padding: "var(--hana-space-4)",
                borderRadius: "var(--hana-radius-md)",
                border: "1px solid var(--hana-border)",
              }}
            >
              <h3
                style={{
                  color: "var(--hana-primary)",
                  marginBottom: "var(--hana-space-4)",
                }}
              >
                ⭐ 우대 조건
              </h3>

              <div style={{ display: "grid", gap: "var(--hana-space-3)" }}>
                {[
                  {
                    key: "salaryAccount",
                    label: "급여통장 보유 (+0.2%)",
                    emoji: "💳",
                  },
                  {
                    key: "existingCustomer",
                    label: "기존 고객 (+0.1%)",
                    emoji: "👤",
                  },
                  {
                    key: "multipleProducts",
                    label: "다중 상품 보유 (+0.15%)",
                    emoji: "📊",
                  },
                ].map((condition) => (
                  <label
                    key={condition.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--hana-space-2)",
                      cursor: "pointer",
                      padding: "var(--hana-space-2)",
                      borderRadius: "var(--hana-radius)",
                      background: selectedConditions[condition.key]
                        ? "var(--hana-primary-light)"
                        : "transparent",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedConditions[condition.key]}
                      onChange={(e) =>
                        setSelectedConditions((prev) => ({
                          ...prev,
                          [condition.key]: e.target.checked,
                        }))
                      }
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: "1.2rem" }}>
                      {condition.emoji}
                    </span>
                    <span style={{ fontSize: "var(--hana-font-size-sm)" }}>
                      {condition.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 결과 섹션 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--hana-space-4)",
              marginBottom: "var(--hana-space-6)",
            }}
          >
            {/* 포트폴리오 구성 */}
            <div
              style={{
                background: "var(--hana-white)",
                padding: "var(--hana-space-4)",
                borderRadius: "var(--hana-radius-md)",
                border: "1px solid var(--hana-border)",
                boxShadow: "var(--hana-shadow-light)",
              }}
            >
              <h3
                style={{
                  color: "var(--hana-primary)",
                  marginBottom: "var(--hana-space-3)",
                }}
              >
                📊 포트폴리오 구성
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getPortfolioData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getPortfolioData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${value.toLocaleString()}원`,
                      "금액",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 금리 비교 */}
            <div
              style={{
                background: "var(--hana-white)",
                padding: "var(--hana-space-4)",
                borderRadius: "var(--hana-radius-md)",
                border: "1px solid var(--hana-border)",
                boxShadow: "var(--hana-shadow-light)",
              }}
            >
              <h3
                style={{
                  color: "var(--hana-primary)",
                  marginBottom: "var(--hana-space-3)",
                }}
              >
                📈 금리 비교
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getRateComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "금리"]} />
                  <Legend />
                  <Bar dataKey="baseRate" fill="#4F46E5" name="기본금리" />
                  <Bar dataKey="bonusRate" fill="#10B981" name="우대금리" />
                  <Bar dataKey="totalRate" fill="#F59E0B" name="총금리" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 월 납입 현황 */}
          <div
            style={{
              background: "var(--hana-white)",
              padding: "var(--hana-space-4)",
              borderRadius: "var(--hana-radius-md)",
              border: "1px solid var(--hana-border)",
              boxShadow: "var(--hana-shadow-light)",
              marginBottom: "var(--hana-space-6)",
            }}
          >
            <h3
              style={{
                color: "var(--hana-primary)",
                marginBottom: "var(--hana-space-3)",
              }}
            >
              📅 월 납입 현황
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={getMonthlyPaymentData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()}원`, "금액"]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.3}
                  name="누적 납입금"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 시뮬레이션 결과 요약 */}
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-primary) 100%)",
              color: "white",
              padding: "var(--hana-space-6)",
              borderRadius: "var(--hana-radius-md)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "var(--hana-space-4)",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "var(--hana-space-2)",
                }}
              >
                💰
              </div>
              <div
                style={{ fontSize: "var(--hana-font-size-sm)", opacity: 0.9 }}
              >
                월 납입금
              </div>
              <div
                style={{
                  fontSize: "var(--hana-font-size-lg)",
                  fontWeight: "bold",
                }}
              >
                {simulationData.monthlyPayment.toLocaleString()}원
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "var(--hana-space-2)",
                }}
              >
                📊
              </div>
              <div
                style={{ fontSize: "var(--hana-font-size-sm)", opacity: 0.9 }}
              >
                적용 금리
              </div>
              <div
                style={{
                  fontSize: "var(--hana-font-size-lg)",
                  fontWeight: "bold",
                }}
              >
                {simulationData.totalRate.toFixed(2)}%
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "var(--hana-space-2)",
                }}
              >
                💎
              </div>
              <div
                style={{ fontSize: "var(--hana-font-size-sm)", opacity: 0.9 }}
              >
                총 이자
              </div>
              <div
                style={{
                  fontSize: "var(--hana-font-size-lg)",
                  fontWeight: "bold",
                }}
              >
                {simulationData.totalInterest.toLocaleString()}원
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "var(--hana-space-2)",
                }}
              >
                🎯
              </div>
              <div
                style={{ fontSize: "var(--hana-font-size-sm)", opacity: 0.9 }}
              >
                만기금액
              </div>
              <div
                style={{
                  fontSize: "var(--hana-font-size-lg)",
                  fontWeight: "bold",
                }}
              >
                {simulationData.maturityAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSimulationPortfolio;
