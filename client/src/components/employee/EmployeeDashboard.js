import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getWebSocketUrl } from "../../config/api";
import Webcam from "react-webcam";
import SessionQRCode from "./SessionQRCode";

import ProductExplorer from "./ProductExplorer";
import SimulationPanel from "./SimulationPanel";
import CustomerInfo from "./CustomerInfo";
import FormSelector from "./FormSelector";
import FormManager from "./FormManager";
import AiQuestionGenerator from "./AiQuestionGenerator";
import PDFViewer from "../customer/PDFViewer";
import ForeignCurrencyRemittanceForm from "../customer/ForeignCurrencyRemittanceForm";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: var(--hana-bg-gray);
  font-family: var(--hana-font-family);
  position: relative;
`;

const SidebarToggle = styled.button`
  position: fixed;
  top: 20px;
  left: ${(props) => (props.isOpen ? "320px" : "20px")};
  z-index: 1001;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const Sidebar = styled.div`
  position: fixed;
  left: ${(props) => (props.isOpen ? "0" : "-320px")};
  top: 0;
  width: 320px;
  height: 100vh;
  background: var(--hana-white);
  border-right: var(--hana-border-light);
  display: flex;
  flex-direction: column;
  box-shadow: var(--hana-shadow-light);
  z-index: 1000;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  padding: 2rem;
`;

const MainContent = styled.div`
  margin-left: ${(props) => (props.sidebarOpen ? "320px" : "0")};
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SessionStatus = styled.div`
  padding: var(--hana-space-4) var(--hana-space-6);
  border-radius: var(--hana-radius-full);
  font-size: var(--hana-font-size-base);
  font-weight: 700;
  background: ${(props) =>
    props.active ? "var(--hana-success)" : "rgba(255, 255, 255, 0.2)"};
  color: var(--hana-white);
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: var(--hana-space-3);
  min-width: 200px;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${(props) =>
      props.active ? "var(--hana-white)" : "rgba(255, 255, 255, 0.6)"};
    animation: ${(props) => (props.active ? "pulse 2s infinite" : "none")};
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Section = styled.div`
  padding: var(--hana-space-6);
  border-bottom: var(--hana-border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  color: var(--hana-primary);
  margin-bottom: var(--hana-space-4);
  font-size: var(--hana-font-size-xl);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--hana-space-2);

  &::before {
    content: "";
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, var(--hana-primary), var(--hana-mint));
    border-radius: var(--hana-radius-sm);
  }
`;

const Button = styled.button`
  padding: var(--hana-space-3) var(--hana-space-6);
  border: none;
  border-radius: var(--hana-radius-md);
  font-size: var(--hana-font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--hana-transition-base);
  margin-bottom: var(--hana-space-3);
  width: 100%;
  font-family: var(--hana-font-family);
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
      background: linear-gradient(
        135deg,
        var(--hana-primary-dark),
        var(--hana-primary)
      );
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.secondary {
    background: linear-gradient(
      135deg,
      var(--hana-white),
      rgba(255, 255, 255, 0.9)
    );
    color: var(--hana-primary);
    border: 2px solid var(--hana-primary);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    font-weight: 700;

    &:hover {
      background: linear-gradient(
        135deg,
        var(--hana-primary-light),
        var(--hana-white)
      );
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--hana-primary-dark);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.outlined {
    background: transparent;
    color: var(--hana-primary);
    border: 1px solid var(--hana-light-gray);

    &:hover {
      border-color: var(--hana-primary);
      background: var(--hana-primary-light);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;

    &:hover {
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: var(--hana-space-4);
  margin: 0;
  align-items: center;
  flex-wrap: wrap;
`;

const NavTab = styled.button`
  padding: var(--hana-space-4) var(--hana-space-6);
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))"
      : "rgba(255, 255, 255, 0.15)"};
  border: 2px solid
    ${(props) =>
      props.active ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.3)"};
  border-radius: var(--hana-radius-lg);
  color: var(--hana-white);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: var(--hana-font-size-base);
  min-width: 120px;
  text-align: center;
  box-shadow: ${(props) =>
    props.active
      ? "0 8px 25px rgba(0, 0, 0, 0.15)"
      : "0 4px 15px rgba(0, 0, 0, 0.1)"};
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
    transition: left 0.5s;
  }

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))"
        : "rgba(255, 255, 255, 0.25)"};
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: 100px;
    padding: var(--hana-space-3) var(--hana-space-4);
    font-size: var(--hana-font-size-sm);
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: var(--hana-white);
  border-bottom: var(--hana-border-light);
  box-shadow: var(--hana-shadow-light);
`;

const Tab = styled.button`
  flex: 1;
  padding: var(--hana-space-4) var(--hana-space-6);
  border: none;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))"
      : "transparent"};
  color: ${(props) =>
    props.active ? "var(--hana-white)" : "var(--hana-gray)"};
  font-size: var(--hana-font-size-base);
  font-weight: ${(props) => (props.active ? "700" : "500")};
  cursor: pointer;
  transition: all var(--hana-transition-base);
  border-bottom: 3px solid
    ${(props) => (props.active ? "transparent" : "transparent")};
  font-family: var(--hana-font-family);
  position: relative;

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))"
        : "var(--hana-primary-light)"};
    color: ${(props) =>
      props.active ? "var(--hana-white)" : "var(--hana-primary)"};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) =>
      props.active ? "var(--hana-orange)" : "transparent"};
    transition: all var(--hana-transition-base);
  }
`;

const CustomerCard = styled.div`
  background: var(--hana-white);
  border: var(--hana-border-light);
  border-radius: var(--hana-radius-lg);
  padding: var(--hana-space-4);
  margin-bottom: var(--hana-space-3);
  cursor: pointer;
  transition: all var(--hana-transition-base);
  box-shadow: var(--hana-shadow-light);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--hana-shadow-medium);
    border-color: var(--hana-primary);
  }

  &.selected {
    border-color: var(--hana-primary);
    background: var(--hana-primary-light);
    box-shadow: var(--hana-shadow-medium);
  }
`;

const CustomerName = styled.div`
  font-size: var(--hana-font-size-lg);
  font-weight: 700;
  color: var(--hana-black);
  margin-bottom: var(--hana-space-1);
`;

const CustomerDetails = styled.div`
  font-size: var(--hana-font-size-sm);
  color: var(--hana-gray);
  display: flex;
  flex-direction: column;
  gap: var(--hana-space-1);

  .customer-id {
    font-weight: 600;
    color: var(--hana-primary);
  }

  .customer-phone {
    color: var(--hana-dark-gray);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--hana-space-1) var(--hana-space-3);
  font-size: var(--hana-font-size-xs);
  font-weight: 600;
  border-radius: var(--hana-radius-full);
  margin-top: var(--hana-space-2);

  &.waiting {
    background: var(--hana-orange-light);
    color: var(--hana-orange);
  }

  &.in-progress {
    background: var(--hana-mint-light);
    color: var(--hana-primary);
  }

  &.completed {
    background: var(--hana-success-light);
    color: var(--hana-success);
  }
`;

const CameraContainer = styled.div`
  position: relative;
  margin-bottom: var(--hana-space-4);
  border-radius: var(--hana-radius-lg);
  overflow: hidden;
  background: var(--hana-black);
  box-shadow: var(--hana-shadow-medium);
`;

const CameraOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--hana-white);
  text-align: center;
  z-index: 2;
  background: rgba(0, 0, 0, 0.8);
  padding: var(--hana-space-4);
  border-radius: var(--hana-radius-md);
  backdrop-filter: blur(4px);
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 0.75rem 1.5rem;
  background: var(--hana-mint);
  color: white;
  border-radius: var(--hana-radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--hana-transition-base);
  margin-bottom: var(--hana-space-3);
  padding: var(--hana-space-4);
  background: var(--hana-white);
  border: 2px dashed var(--hana-light-gray);
  color: var(--hana-primary);
  font-weight: 600;

  &:hover {
    border-color: var(--hana-primary);
    background: var(--hana-primary-light);
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: auto;
  background: var(--hana-white);
`;

// 고객 정보 표시 컴포넌트
const CustomerInfoDisplay = ({
  customer,
  detailed = false,
  onSendToTablet,
  customerProducts = [],
  loadingProducts = false,
}) => {
  if (!customer) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--hana-space-8)",
          color: "var(--hana-gray)",
          background: "var(--hana-white)",
          borderRadius: "var(--hana-radius-lg)",
          margin: "var(--hana-space-4)",
          border: "var(--hana-border-light)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "var(--hana-space-4)" }}>
          👤
        </div>
        <h3
          style={{
            color: "var(--hana-primary)",
            marginBottom: "var(--hana-space-2)",
            fontSize: "var(--hana-font-size-xl)",
          }}
        >
          고객 정보 없음
        </h3>
        <p style={{ color: "var(--hana-gray)" }}>
          신분증을 업로드하거나 테스트 고객을 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--hana-space-4)" }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--hana-primary) 0%, var(--hana-mint) 100%)",
          color: "var(--hana-white)",
          padding: "var(--hana-space-6)",
          borderRadius: "var(--hana-radius-lg)",
          marginBottom: "var(--hana-space-6)",
          boxShadow: "var(--hana-shadow-medium)",
        }}
      >
        <h2
          style={{
            margin: "0 0 var(--hana-space-4) 0",
            fontSize: "var(--hana-font-size-2xl)",
            fontWeight: "700",
          }}
        >
          {customer.Name} 고객님
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--hana-space-4)",
          }}
        >
          <div>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>연락처:</strong> {customer.Phone}
            </p>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>나이:</strong> {customer.Age}세
            </p>
          </div>
          <div>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>고객 ID:</strong> {customer.CustomerID}
            </p>
            <p style={{ margin: "0.5rem 0", opacity: 0.9 }}>
              <strong>주소:</strong> {customer.Address}
            </p>
          </div>
        </div>
      </div>

      {detailed && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4 style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}>
              💰 재정 정보
            </h4>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>연소득:</strong> {customer.Income?.toLocaleString()}원
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>총 자산:</strong> {customer.Assets?.toLocaleString()}원
            </p>
          </div>

          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4 style={{ color: "var(--hana-mint)", marginBottom: "0.5rem" }}>
              🎯 투자 성향
            </h4>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>투자 목적:</strong> {customer.InvestmentGoal}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>위험 성향:</strong> {customer.RiskTolerance}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>투자 기간:</strong> {customer.InvestmentPeriod}개월
            </p>
          </div>
        </div>
      )}

      {/* 고객 상품 정보 섹션 */}
      {detailed && (
        <div
          style={{
            marginTop: "var(--hana-space-6)",
            background: "var(--hana-white)",
            borderRadius: "var(--hana-radius-lg)",
            border: "var(--hana-border-light)",
            overflow: "hidden",
            boxShadow: "var(--hana-shadow-light)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--hana-mint) 0%, var(--hana-primary) 100%)",
              color: "white",
              padding: "var(--hana-space-4)",
              borderBottom: "var(--hana-border-light)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "var(--hana-font-size-xl)",
                fontWeight: "700",
              }}
            >
              💰 가입 상품 정보
            </h3>
          </div>

          <div style={{ padding: "var(--hana-space-4)" }}>
            {loadingProducts ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-6)",
                  color: "var(--hana-gray)",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: "var(--hana-space-2)",
                  }}
                >
                  ⏳
                </div>
                <p>상품 정보를 불러오는 중...</p>
              </div>
            ) : customerProducts && customerProducts.length > 0 ? (
              <div style={{ display: "grid", gap: "var(--hana-space-4)" }}>
                {customerProducts.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f8f9fa",
                      padding: "var(--hana-space-4)",
                      borderRadius: "var(--hana-radius-md)",
                      border: "1px solid #e9ecef",
                      borderLeft: "4px solid var(--hana-mint)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "var(--hana-space-2)",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          color: "var(--hana-primary)",
                          fontSize: "var(--hana-font-size-lg)",
                        }}
                      >
                        {product.productName || product.product_name}
                      </h4>
                      <span
                        style={{
                          background:
                            product.status === "active"
                              ? "var(--hana-success)"
                              : "var(--hana-orange)",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "var(--hana-radius-full)",
                          fontSize: "var(--hana-font-size-sm)",
                          fontWeight: "600",
                        }}
                      >
                        {product.status === "active" ? "활성" : "비활성"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--hana-space-3)",
                        marginBottom: "var(--hana-space-2)",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0.25rem 0",
                            fontSize: "var(--hana-font-size-sm)",
                          }}
                        >
                          <strong>상품 타입:</strong>{" "}
                          {product.productType || product.product_type}
                        </p>
                        <p
                          style={{
                            margin: "0.25rem 0",
                            fontSize: "var(--hana-font-size-sm)",
                          }}
                        >
                          <strong>계좌번호:</strong>{" "}
                          {product.accountNumber ||
                            product.account_number ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            margin: "0.25rem 0",
                            fontSize: "var(--hana-font-size-sm)",
                          }}
                        >
                          <strong>가입일:</strong>{" "}
                          {product.enrollmentDate ||
                            product.enrollment_date ||
                            "N/A"}
                        </p>
                        <p
                          style={{
                            margin: "0.25rem 0",
                            fontSize: "var(--hana-font-size-sm)",
                          }}
                        >
                          <strong>잔액:</strong>{" "}
                          {(
                            product.balance ||
                            product.amount ||
                            0
                          ).toLocaleString()}
                          원
                        </p>
                      </div>
                    </div>

                    {product.description && (
                      <p
                        style={{
                          margin: "0.5rem 0 0 0",
                          fontSize: "var(--hana-font-size-sm)",
                          color: "var(--hana-gray)",
                          fontStyle: "italic",
                        }}
                      >
                        {product.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-6)",
                  color: "var(--hana-gray)",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: "var(--hana-space-2)",
                  }}
                >
                  📋
                </div>
                <p>가입된 상품이 없습니다.</p>
                <p
                  style={{
                    fontSize: "var(--hana-font-size-sm)",
                    marginTop: "var(--hana-space-2)",
                  }}
                >
                  새로운 상품을 추천해보세요!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 태블릿에 보여주기 버튼 */}
      {detailed && onSendToTablet && (
        <div
          style={{
            marginTop: "var(--hana-space-4)",
            textAlign: "center",
            padding: "var(--hana-space-4)",
            borderTop: "1px solid #eee",
          }}
        >
          <button
            onClick={() => onSendToTablet(customer)}
            style={{
              background:
                "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))",
              color: "white",
              border: "none",
              borderRadius: "var(--hana-radius-md)",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "var(--hana-shadow-light)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "var(--hana-shadow-medium)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--hana-shadow-light)";
            }}
          >
            📱 태블릿에 보여주기
          </button>
        </div>
      )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [activeTab, setActiveTab] = useState("customer");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testCustomers, setTestCustomers] = useState([]);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0); // 화면 강제 업데이트용
  const [customerProducts, setCustomerProducts] = useState([]); // 고객이 가입한 상품 정보
  const [loadingCustomerProducts, setLoadingCustomerProducts] = useState(false);

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // WebSocket 연결 함수
  const connectWebSocket = (sessionId, employee) => {
    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = getWebSocketUrl();
        console.log("WebSocket 연결 시도:", wsUrl);
        return new SockJS(wsUrl);
      },
      connectHeaders: {},
      debug: function (str) {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
      console.log("STOMP 연결 성공:", frame);
      setStompClient(client);

      // 전역 STOMP 클라이언트 설정 (ActualBankForm에서 사용)
      window.stompClient = client;

      // 세션 ID 확인
      console.log("사용할 세션 ID:", sessionId);

      // 세션 참여
      client.publish({
        destination: "/app/join-session",
        body: JSON.stringify({
          sessionId: sessionId,
          userType: "employee",
          userId: employee.employeeId,
        }),
      });

      // 세션 메시지 구독 (태블릿과 통신용)
      client.subscribe("/topic/session/" + sessionId, function (message) {
        const data = JSON.parse(message.body);
        console.log("🔍 직원이 세션 메시지 수신:", data);
        console.log("🔍 메시지 타입:", data.type);

        // 메시지 타입별 처리
        switch (data.type) {
          case "tablet-connected":
            console.log("태블릿 연결됨:", data);
            break;
          case "customer-selected":
            console.log("태블릿에서 고객 선택됨:", data);
            if (data.customerData) {
              setCurrentCustomer(data.customerData);
              console.log(
                "✅ 직원 화면에 고객 정보 업데이트:",
                data.customerData.name
              );
            }
            break;
          case "customer-info-confirmed":
            console.log("태블릿에서 고객 정보 확인 완료:", data);
            break;
          case "customer-info-display":
            console.log("고객 정보 표시 메시지 수신:", data);
            // 태블릿에서 고객 정보 표시 요청을 받았을 때의 처리
            if (data.data && data.data.customer) {
              console.log("고객 정보:", data.data.customer);
            }
            break;
          case "FIELD_INPUT_COMPLETED":
            console.log("태블릿에서 필드 입력 완료:", data);
            // 폼 필드 업데이트 처리
            if (data.field && window.updateFormField) {
              window.updateFormField(data.field, data.value);
            }
            break;
          case "field-input-completed":
            console.log("📝 태블릿에서 필드 입력 완료:", data);
            console.log("📝 전체 메시지 데이터:", data);

            // 태블릿에서 보내는 메시지 구조에 맞게 수정
            const { fieldId, fieldValue, fieldLabel } = data;
            console.log(`✅ 필드 입력 완료: ${fieldLabel} = ${fieldValue}`);

            // PC 화면에서 해당 필드에 입력된 값 표시
            if (
              enrollmentData &&
              enrollmentData.forms &&
              enrollmentData.forms[currentFormIndex]
            ) {
              // 현재 서식의 필드 데이터 업데이트
              const updatedForms = [...enrollmentData.forms];
              const currentForm = updatedForms[currentFormIndex];

              try {
                const schema = JSON.parse(currentForm.formSchema);
                if (schema.fields) {
                  const fieldIndex = schema.fields.findIndex(
                    (f) => f.id === fieldId
                  );
                  if (fieldIndex !== -1) {
                    // 필드값 업데이트
                    schema.fields[fieldIndex].value = fieldValue;
                    currentForm.formSchema = JSON.stringify(schema);

                    // 상태 업데이트
                    setEnrollmentData({
                      ...enrollmentData,
                      forms: updatedForms,
                    });

                    console.log(
                      `✅ 필드 "${fieldLabel}" 값 "${fieldValue}"로 업데이트 완료`
                    );
                  }
                }
              } catch (e) {
                console.error("서식 스키마 파싱 오류:", e);
              }
            }
            break;

          case "field-input-complete":
            console.log("📝 태블릿에서 필드 입력 완료 (기존 형식):", data);
            console.log("📝 전체 메시지 데이터:", data);

            // 기존 메시지 구조 처리
            let existingFieldId, existingFieldValue, existingFieldLabel;

            if (data.data && data.data.value) {
              // 새로운 구조
              existingFieldId = data.data.fieldId || "unknown";
              existingFieldValue = data.data.value;
              existingFieldLabel = data.data.fieldName || "알 수 없는 필드";
            } else {
              // 기존 구조
              existingFieldId = data.fieldId || "unknown";
              existingFieldValue = data.value || data.fieldValue || "";
              existingFieldLabel =
                data.fieldLabel || data.fieldName || "알 수 없는 필드";
            }

            console.log(
              `✅ 필드 입력 완료: ${existingFieldLabel} = ${existingFieldValue}`
            );

            // PC 화면에서 해당 필드에 입력된 값 표시
            console.log(
              "🔍 필드 업데이트 시작 - enrollmentData:",
              enrollmentData
            );
            console.log("🔍 현재 폼 인덱스:", currentFormIndex);

            // 전역 변수에서 enrollmentData 가져오기 (React 상태가 null일 때)
            const currentEnrollmentData =
              enrollmentData || window.enrollmentData;
            const currentFormIdx = currentFormIndex || window.currentFormIndex;

            console.log("🔍 전역 변수 enrollmentData:", window.enrollmentData);
            console.log("🔍 사용할 enrollmentData:", currentEnrollmentData);

            if (
              currentEnrollmentData &&
              currentEnrollmentData.forms &&
              currentEnrollmentData.forms[currentFormIdx]
            ) {
              console.log("✅ enrollmentData와 forms 존재 확인");

              // 현재 서식의 필드 데이터 업데이트
              const updatedForms = [...currentEnrollmentData.forms];
              const currentForm = updatedForms[currentFormIdx];

              console.log("🔍 현재 폼:", currentForm);
              console.log("🔍 폼 스키마:", currentForm.formSchema);

              try {
                const schema = JSON.parse(currentForm.formSchema);
                console.log("🔍 파싱된 스키마:", schema);
                console.log("🔍 스키마 필드들:", schema.fields);

                if (schema.fields) {
                  console.log("🔍 찾을 필드 ID:", existingFieldId);
                  const fieldIndex = schema.fields.findIndex(
                    (f) => f.id === existingFieldId
                  );
                  console.log("🔍 찾은 필드 인덱스:", fieldIndex);

                  if (fieldIndex !== -1) {
                    console.log("🔍 필드 찾음 - 업데이트 시작");
                    // 필드값 업데이트
                    schema.fields[fieldIndex].value = existingFieldValue;
                    currentForm.formSchema = JSON.stringify(schema);

                    // 상태 업데이트
                    const newEnrollmentData = {
                      ...currentEnrollmentData,
                      forms: updatedForms,
                    };
                    setEnrollmentData(newEnrollmentData);

                    // 전역 변수도 업데이트
                    window.enrollmentData = newEnrollmentData;

                    console.log(
                      `✅ 필드 "${existingFieldLabel}" 값 "${existingFieldValue}"로 업데이트 완료`
                    );

                    // PC 화면 강제 업데이트를 위한 상태 변경
                    setForceUpdate((prev) => prev + 1);

                    // 필드 업데이트 후 즉시 화면 반영을 위한 로그
                    console.log("🔄 PC 화면 업데이트 트리거됨");
                  } else {
                    console.log(
                      "❌ 필드를 찾을 수 없음 - existingFieldId:",
                      existingFieldId
                    );
                    console.log(
                      "❌ 사용 가능한 필드 ID들:",
                      schema.fields.map((f) => f.id)
                    );
                  }
                } else {
                  console.log("❌ 스키마에 fields가 없음");
                }
              } catch (e) {
                console.error("서식 스키마 파싱 오류:", e);
              }
            } else {
              console.log("❌ enrollmentData 또는 forms가 없음");
              console.log("❌ enrollmentData:", enrollmentData);
              console.log("❌ currentFormIndex:", currentFormIndex);
            }
            break;
          case "product-enrollment":
            console.log("🔍 PC에서 product-enrollment 메시지 수신:", data);
            console.log("🔍 PC에서 data.action:", data.action);
            console.log("🔍 PC에서 data.data:", data.data);
            if (data.action === "start_enrollment" && data.data) {
              // 백엔드에서 보내는 실제 서식 데이터 사용
              console.log("🔍 백엔드에서 받은 서식 데이터:", data.data);
              console.log("🔍 서식 개수:", data.data.forms?.length || 0);

              if (data.data.forms && data.data.forms.length > 0) {
                // 실제 서식 데이터 사용
                console.log("🔍 setEnrollmentData 호출 전:", data.data);
                setEnrollmentData(data.data);
                setCurrentFormIndex(0);
                setActiveTab("pdf-forms"); // 서식 작성 탭으로 전환
                console.log(
                  "✅ 직원 화면에 실제 서식 데이터 설정:",
                  data.data.forms.length,
                  "개 서식"
                );

                // 상태 업데이트는 useEffect에서 감지됨
              } else {
                console.log(
                  "⚠️ 백엔드에서 서식이 없습니다. 하드코딩된 서식 사용"
                );
                // 백엔드에 서식이 없을 때만 하드코딩된 서식 사용
                const enrollmentWithForms = {
                  ...data.data,
                  forms: [
                    {
                      formId: "FORM-IRP-001",
                      formName: "퇴직연금 거래신청서(개인형IRP)",
                      formType: "deposit",
                      formSchema:
                        '{"fields": [{"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, {"id": "phone_number", "name": "phoneNumber", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "address", "name": "address", "type": "text", "label": "주소", "required": true, "placeholder": "주소를 입력하세요"}, {"id": "account_number", "name": "accountNumber", "type": "text", "label": "계좌번호", "required": true, "placeholder": "계좌번호를 입력하세요"}]}',
                    },
                  ],
                };
                setEnrollmentData(enrollmentWithForms);
                setCurrentFormIndex(0);
                setActiveTab("pdf-forms");
                console.log("✅ 하드코딩된 서식 데이터 설정");
              }
            }
            break;
          default:
            console.log("알 수 없는 메시지 타입:", data.type);
            break;
        }
      });

      console.log("직원 세션 참여:", sessionId);
    };

    client.onStompError = function (frame) {
      console.error("STOMP 오류:", frame.headers["message"]);
    };

    client.activate();
    return client;
  };

  // 태블릿에 고객 정보 전송
  const sendCustomerInfoToTablet = (customerData) => {
    console.log("=== 메시지 전송 시작 ===");
    console.log("stompClient 상태:", !!stompClient);
    console.log("stompClient.active:", stompClient?.active);
    console.log("sessionId:", sessionId);
    console.log("customerData:", customerData);
    console.log("현재 시간:", new Date().toLocaleTimeString());

    if (stompClient && sessionId && stompClient.active) {
      const messagePayload = {
        sessionId: sessionId,
        type: "customer-info-display",
        data: {
          customer: customerData,
          timestamp: Date.now(),
        },
      };

      console.log(
        "전송할 메시지 페이로드:",
        JSON.stringify(messagePayload, null, 2)
      );
      console.log("전송 대상 토픽:", `/app/send-to-session`);
      console.log("실제 브로드캐스트될 토픽:", `/topic/session/${sessionId}`);

      try {
        stompClient.publish({
          destination: "/app/send-to-session",
          body: JSON.stringify(messagePayload),
        });

        console.log("✅ 메시지 전송 완료");
        console.log("전송된 세션 ID:", sessionId);
        alert("고객 정보가 태블릿에 전송되었습니다!");
      } catch (error) {
        console.error("❌ 메시지 전송 실패:", error);
        alert("메시지 전송에 실패했습니다: " + error.message);
      }
    } else {
      console.error("❌ 연결 상태 확인:");
      console.error("- stompClient 존재:", !!stompClient);
      console.error("- sessionId 존재:", !!sessionId, "값:", sessionId);
      console.error("- stompClient 활성화:", stompClient?.active);
      alert("태블릿이 연결되어 있지 않습니다. 태블릿 연결을 확인해주세요.");
    }
  };

  useEffect(() => {
    // 로그인된 직원 정보 확인
    const employeeData = localStorage.getItem("employee");
    const sessionData = localStorage.getItem("sessionId");
    if (!employeeData) {
      navigate("/employee/login");
      return;
    }

    const employee = JSON.parse(employeeData);
    setEmployee(employee);

    // 기존 방식으로 되돌림 - Railway 백엔드와 호환
    const finalSessionId = "tablet_main";
    setSessionId(finalSessionId);

    // sessionId가 없었다면 localStorage에 저장
    if (!sessionData) {
      localStorage.setItem("sessionId", finalSessionId);
      console.log("세션 ID 생성 및 저장:", finalSessionId);
    } else {
      console.log("기존 세션 ID 사용:", finalSessionId);
    }

    // WebSocket 연결
    const client = connectWebSocket(finalSessionId, employee);

    // 테스트 고객 목록 가져오기
    fetchTestCustomers();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [navigate]);

  // currentCustomer 상태 변화 감지
  useEffect(() => {
    console.log("currentCustomer 상태 변경됨:", currentCustomer);
  }, [currentCustomer]);

  // enrollmentData 상태 변화 감지
  useEffect(() => {
    console.log("🔍 enrollmentData 상태 변경됨:", enrollmentData);
    if (enrollmentData) {
      console.log("✅ enrollmentData 설정 완료:");
      console.log("  - productId:", enrollmentData.productId);
      console.log("  - productName:", enrollmentData.productName);
      console.log("  - forms 개수:", enrollmentData.forms?.length || 0);
      console.log("  - currentFormIndex:", enrollmentData.currentFormIndex);

      // 전역 변수에 React 상태 동기화
      window.enrollmentData = enrollmentData;
      window.currentFormIndex = currentFormIndex;
      console.log("🌐 전역 변수 동기화 완료");
    }
  }, [enrollmentData, currentFormIndex]);

  // forceUpdate 상태 변화 감지 (화면 강제 업데이트용)
  useEffect(() => {
    if (forceUpdate > 0) {
      console.log("🔄 PC 화면 강제 업데이트 실행:", forceUpdate);
      // 화면을 강제로 다시 렌더링하기 위한 상태 변경
      setForceUpdate(0); // 초기화
    }
  }, [forceUpdate]);

  // 고객 상품 정보 가져오기
  const fetchCustomerProducts = async (customerId) => {
    if (!customerId) return;

    setLoadingCustomerProducts(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/employee/customers/${customerId}/products`
      );
      if (response.data.success) {
        setCustomerProducts(response.data.data);
        console.log("고객 상품 정보 로드 완료:", response.data.data);
      } else {
        console.error("고객 상품 정보 로드 실패:", response.data.message);
        setCustomerProducts([]);
      }
    } catch (error) {
      console.error("고객 상품 정보 로드 중 오류:", error);
      setCustomerProducts([]);
    } finally {
      setLoadingCustomerProducts(false);
    }
  };

  const fetchTestCustomers = async () => {
    console.log("실제 고객 데이터를 로드합니다...");

    try {
      const response = await axios.get(
        "http://localhost:8080/api/employee/customers"
      );
      if (response.data.success) {
        // API 응답 형태를 기존 코드와 맞추기 위해 변환
        const testCustomerData = response.data.data.map((customer) => ({
          customer_id: customer.customerId,
          name: customer.name,
          age: customer.age,
          phone: customer.phone,
          address: customer.address,
          income: customer.income,
          assets: customer.assets,
          investment_goal: customer.investmentGoal,
          risk_tolerance: customer.riskTolerance,
          investment_period: customer.investmentPeriod,
          id_number: customer.idNumber,
        }));

        setTestCustomers(testCustomerData);
        console.log(
          "실제 고객 데이터 로드 완료:",
          testCustomerData.length,
          "명"
        );
      } else {
        console.error("고객 데이터 로드 실패:", response.data.message);
      }
    } catch (error) {
      console.error("고객 데이터 로드 중 오류:", error);
      // 오류 시 기본 테스트 데이터 사용
      const fallbackData = [
        {
          customer_id: "C001",
          name: "김철수",
          age: 35,
          phone: "010-1234-5678",
          address: "서울시 강남구 역삼동",
          income: 50000000,
          assets: 100000000,
          investment_goal: "주택 구매",
          risk_tolerance: "medium",
          investment_period: 60,
          id_number: "850315-1******",
        },
      ];
      setTestCustomers(fallbackData);
    }
  };

  const selectTestCustomer = async (customerId) => {
    console.log("selectTestCustomer 호출됨 - customerId:", customerId);
    setLoading(true);
    try {
      // 임시로 클라이언트에서 직접 고객 데이터 생성
      const selectedCustomer = testCustomers.find(
        (customer) => customer.customer_id === customerId
      );
      console.log("찾은 고객:", selectedCustomer);

      if (selectedCustomer) {
        // OCR 결과와 같은 형태로 변환
        const customerData = {
          CustomerID: selectedCustomer.customer_id,
          Name: selectedCustomer.name,
          Phone: selectedCustomer.phone,
          Age: selectedCustomer.age,
          Address: selectedCustomer.address,
          IdNumber: selectedCustomer.id_number || "******-*******",
          Income: selectedCustomer.income,
          Assets: selectedCustomer.assets,
          InvestmentGoal: selectedCustomer.investment_goal,
          RiskTolerance: selectedCustomer.risk_tolerance,
          InvestmentPeriod: selectedCustomer.investment_period,
        };

        console.log("변환된 고객 데이터:", customerData);

        setCurrentCustomer(customerData);
        setShowCustomerSelect(false);

        // 고객 상품 정보 가져오기
        await fetchCustomerProducts(customerData.CustomerID);

        console.log("선택된 고객:", customerData.Name);
        console.log("currentCustomer 상태 업데이트됨");
        console.log("STOMP 상태:", stompClient ? "연결됨" : "연결안됨");
        console.log("세션 ID:", sessionId);

        // Socket을 통해 고객 태블릿에 정보 전송
        if (stompClient && sessionId && stompClient.active) {
          console.log("고객 정보를 태블릿에 전송합니다...");

          // 고객 정보 업데이트 이벤트 전송
          stompClient.publish({
            destination: "/app/customer-info-update",
            body: JSON.stringify({
              sessionId: sessionId,
              ...customerData,
            }),
          });

          // OCR 결과 이벤트도 전송 (호환성을 위해)
          stompClient.publish({
            destination: "/app/send-message",
            body: JSON.stringify({
              sessionId: sessionId,
              customerData: customerData,
            }),
          });
        } else {
          console.error("Socket 또는 세션 ID가 없습니다!");
        }

        await createConsultationSession(customerData.CustomerID);
      } else {
        alert("고객 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("테스트 고객 선택 오류:", error);
      alert("고객 선택에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");
    if (stompClient && stompClient.active) stompClient.deactivate();
    navigate("/employee/login");
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Base64를 Blob으로 변환
      const byteCharacters = atob(imageSrc.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      processOCR(blob);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processOCR(file);
    }
  };

  const processOCR = async (imageFile) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("idCard", imageFile);

      const response = await axios.post(
        "http://localhost:8080/api/ocr/id-card",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.customer) {
        const ocrCustomerData = response.data.customer;

        // OCR 데이터가 이미 올바른 형태인지 확인하고, 필요시 변환
        const transformedOcrData = {
          CustomerID: ocrCustomerData.CustomerID || ocrCustomerData.customerId,
          Name: ocrCustomerData.Name || ocrCustomerData.name,
          Phone: ocrCustomerData.Phone || ocrCustomerData.phone,
          Age: ocrCustomerData.Age || ocrCustomerData.age,
          Address: ocrCustomerData.Address || ocrCustomerData.address,
          IdNumber:
            ocrCustomerData.IdNumber ||
            ocrCustomerData.idNumber ||
            "******-*******",
          Income: ocrCustomerData.Income || ocrCustomerData.income,
          Assets: ocrCustomerData.Assets || ocrCustomerData.assets,
          InvestmentGoal:
            ocrCustomerData.InvestmentGoal || ocrCustomerData.investmentGoal,
          RiskTolerance:
            ocrCustomerData.RiskTolerance || ocrCustomerData.riskTolerance,
          InvestmentPeriod:
            ocrCustomerData.InvestmentPeriod ||
            ocrCustomerData.investmentPeriod,
        };

        setCurrentCustomer(transformedOcrData);
        console.log("OCR 고객 데이터 변환 완료:", transformedOcrData);

        // Socket을 통해 고객 태블릿에 정보 전송
        if (stompClient && sessionId && stompClient.active) {
          stompClient.publish({
            destination: "/app/send-message",
            body: JSON.stringify({
              sessionId: sessionId,
              customerData: transformedOcrData,
            }),
          });
        }

        await createConsultationSession(transformedOcrData.CustomerID);
      } else {
        alert("등록되지 않은 고객입니다. 신규 고객 등록이 필요합니다.");
      }
    } catch (error) {
      console.error("OCR 처리 오류:", error);
      alert("신분증 인식에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setCameraActive(false);
    }
  };

  const createConsultationSession = async (customerId) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/consultation/sessions",
        {
          employeeId: employee.employeeId,
          customerId: customerId,
        }
      );

      if (response.data.success) {
        const sharedSessionId = "tablet_main";
        setSessionId(sharedSessionId);

        // STOMP에 세션 참여
        stompClient.publish({
          destination: "/app/join-session",
          body: JSON.stringify({
            sessionId: sharedSessionId,
            userType: "employee",
            userId: employee.employeeId,
          }),
        });

        // 고객 상세 정보 조회
        const customerResponse = await axios.get(
          `http://localhost:8080/api/employee/customers/${customerId}`
        );
        const backendCustomerData = customerResponse.data.data;

        // 백엔드 데이터를 프론트엔드가 기대하는 형태로 변환
        const transformedCustomerData = {
          CustomerID: backendCustomerData.customerId,
          Name: backendCustomerData.name,
          Phone: backendCustomerData.phone,
          Age: backendCustomerData.age,
          Address: backendCustomerData.address,
          IdNumber: backendCustomerData.idNumber || "******-*******",
          Income: backendCustomerData.income,
          Assets: backendCustomerData.assets,
          InvestmentGoal: backendCustomerData.investmentGoal,
          RiskTolerance: backendCustomerData.riskTolerance,
          InvestmentPeriod: backendCustomerData.investmentPeriod,
        };

        setCurrentCustomer(transformedCustomerData);
        console.log(
          "백엔드에서 가져온 고객 데이터 변환 완료:",
          transformedCustomerData
        );
      }
    } catch (error) {
      console.error("세션 생성 오류:", error);
      alert("상담 세션 생성에 실패했습니다.");
    }
  };

  const syncScreenToCustomer = (screenData) => {
    console.log("🔍 syncScreenToCustomer 호출:", screenData);
    console.log("🔍 stompClient 상태:", stompClient ? "존재" : "없음");
    console.log("🔍 sessionId:", sessionId);
    console.log("🔍 stompClient.active:", stompClient?.active);

    if (stompClient && sessionId && stompClient.active) {
      // 상품 상세보기 동기화
      if (screenData.type === "product-detail-sync") {
        console.log("🔍 product-detail-sync 메시지 전송");
        stompClient.publish({
          destination: "/app/product-detail-sync",
          body: JSON.stringify({
            sessionId: sessionId,
            productData: screenData.data,
          }),
        });
      } else if (screenData.type === "product-enrollment") {
        // 상품 가입 시작
        console.log("🔍 product-enrollment 메시지 전송");
        console.log("🔍 전송할 데이터:", {
          sessionId: sessionId,
          productId: screenData.data.productId,
          customerId: screenData.data.customerId,
        });
        stompClient.publish({
          destination: "/app/product-enrollment",
          body: JSON.stringify({
            sessionId: sessionId,
            productId: screenData.data.productId,
            customerId: screenData.data.customerId,
          }),
        });

        // 임시 해결책: 백엔드를 거치지 않고 직접 태블릿에 메시지 전송
        console.log("🔧 임시 해결책: 직접 태블릿에 메시지 전송");
        const directMessage = {
          type: "product-enrollment",
          action: "start_enrollment",
          data: {
            productId: screenData.data.productId,
            productName: screenData.data.productName,
            productType: screenData.data.productType,
            customerId: screenData.data.customerId,
            forms: [
              {
                formId: "FORM-IRP-001",
                formName: "퇴직연금 거래신청서(개인형IRP)",
                formType: "deposit",
                formSchema:
                  '{"fields": [{"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, {"id": "phone_number", "name": "phoneNumber", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "address", "name": "address", "type": "text", "label": "주소", "required": true, "placeholder": "주소를 입력하세요"}, {"id": "account_number", "name": "accountNumber", "type": "text", "label": "계좌번호", "required": true, "placeholder": "계좌번호를 입력하세요"}]}',
              },
              {
                formId: "FORM-HOUSING-001",
                formName: "주택도시기금 대출신청서(가계용)",
                formType: "loan",
                formSchema:
                  '{"fields": [{"id": "applicant_name", "name": "applicantName", "type": "text", "label": "신청인 성명", "required": true, "placeholder": "신청인 성명을 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "phone", "name": "phone", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "address", "name": "address", "type": "text", "label": "주소", "required": true, "placeholder": "주소를 입력하세요"}, {"id": "loan_amount", "name": "loanAmount", "type": "number", "label": "대출신청금액", "required": true, "placeholder": "대출신청금액을 입력하세요"}, {"id": "loan_purpose", "name": "loanPurpose", "type": "text", "label": "대출목적", "required": true, "placeholder": "대출목적을 입력하세요"}]}',
              },
              {
                formId: "FORM-PRIVACY-001",
                formName: "개인신용정보 수집이용동의서(비여신금융거래)",
                formType: "deposit",
                formSchema:
                  '{"fields": [{"id": "customer_name", "name": "customerName", "type": "text", "label": "고객명", "required": true, "placeholder": "고객명을 입력하세요"}, {"id": "resident_number", "name": "residentNumber", "type": "text", "label": "주민등록번호", "required": true, "placeholder": "주민등록번호를 입력하세요"}, {"id": "phone", "name": "phone", "type": "text", "label": "연락처", "required": true, "placeholder": "연락처를 입력하세요"}, {"id": "consent_date", "name": "consentDate", "type": "date", "label": "동의일자", "required": true, "placeholder": "동의일자를 선택하세요"}, {"id": "signature", "name": "signature", "type": "signature", "label": "서명", "required": true, "placeholder": "서명해주세요"}]}',
              },
            ],
          },
          timestamp: Date.now(),
        };

        // 태블릿에 직접 메시지 전송
        stompClient.publish({
          destination: "/topic/session/" + sessionId,
          body: JSON.stringify(directMessage),
        });
      } else {
        stompClient.publish({
          destination: "/app/screen-sync",
          body: JSON.stringify({
            sessionId,
            screenData,
          }),
        });
      }
    }
  };

  if (!employee) {
    return <div>로딩 중...</div>;
  }

  return (
    <DashboardContainer>
      {/* 사이드바 오버레이 */}
      <SidebarOverlay isOpen={sidebarOpen} onClick={toggleSidebar} />

      {/* 사이드바 */}
      <Sidebar isOpen={sidebarOpen}>
        {/* 태블릿 연결 상태 및 QR 코드 */}
        {sessionId && employee && (
          <SessionQRCode sessionId={sessionId} employeeName={employee.name} />
        )}

        <Section>
          <SectionTitle>탭 네비게이션</SectionTitle>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <Button
              className={activeTab === "customer" ? "primary" : "secondary"}
              onClick={() => setActiveTab("customer")}
              style={{ justifyContent: "flex-start", textAlign: "left" }}
            >
              👤 고객 정보
            </Button>
            <Button
              className={activeTab === "products" ? "primary" : "secondary"}
              onClick={() => setActiveTab("products")}
              style={{ justifyContent: "flex-start", textAlign: "left" }}
            >
              💰 상품 탐색
            </Button>
            <Button
              className={activeTab === "pdf-forms" ? "primary" : "secondary"}
              onClick={() => setActiveTab("pdf-forms")}
              style={{ justifyContent: "flex-start", textAlign: "left" }}
            >
              📝 서식 작성
            </Button>
            <Button
              className={activeTab === "simulation" ? "primary" : "secondary"}
              onClick={() => setActiveTab("simulation")}
              style={{ justifyContent: "flex-start", textAlign: "left" }}
            >
              🎯 혜택 시뮬레이션
            </Button>
            <Button
              className={activeTab === "ai" ? "primary" : "secondary"}
              onClick={() => setActiveTab("ai")}
              style={{ justifyContent: "flex-start", textAlign: "left" }}
            >
              🤖 AI 질문 생성
            </Button>
          </div>
        </Section>

        <Section>
          <SectionTitle>고객 인식</SectionTitle>

          {!cameraActive ? (
            <div>
              <Button className="primary" onClick={() => setCameraActive(true)}>
                📷 카메라로 신분증 스캔
              </Button>

              <FileInputLabel htmlFor="file-upload">
                📁 파일에서 신분증 업로드
              </FileInputLabel>
              <FileInput
                id="file-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />

              <Button
                className="secondary"
                onClick={() => setShowCustomerSelect(true)}
                style={{ marginTop: "0.5rem" }}
              >
                🧪 테스트 고객 선택
              </Button>
            </div>
          ) : (
            <CameraContainer>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height={200}
              />
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                <Button className="primary" onClick={capturePhoto}>
                  📸 촬영
                </Button>
                <Button
                  className="secondary"
                  onClick={() => setCameraActive(false)}
                >
                  취소
                </Button>
              </div>
            </CameraContainer>
          )}

          {loading && <div>신분증 인식 중...</div>}
        </Section>

        {currentCustomer ? (
          <Section>
            <CustomerInfoDisplay customer={currentCustomer} />
          </Section>
        ) : (
          <Section>
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "var(--hana-dark-gray)",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "2px dashed #dee2e6",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>👤</div>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--hana-mint)" }}>
                고객 정보
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                신분증을 촬영하거나
                <br />
                테스트 고객을 선택해주세요
              </p>
            </div>
          </Section>
        )}
      </Sidebar>

      <MainContent sidebarOpen={sidebarOpen}>
        {/* 사이드바 토글 버튼 */}
        <SidebarToggle isOpen={sidebarOpen} onClick={toggleSidebar}>
          {sidebarOpen ? "✕" : "☰"}
        </SidebarToggle>

        <TabContent>
          {activeTab === "customer" &&
            (currentCustomer ? (
              <CustomerInfoDisplay
                customer={currentCustomer}
                detailed
                onSendToTablet={sendCustomerInfoToTablet}
                customerProducts={customerProducts}
                loadingProducts={loadingCustomerProducts}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  👤
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  고객 정보 없음
                </h3>
                <p
                  style={{
                    color: "var(--hana-gray)",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  왼쪽 사이드바에서 신분증을 업로드하거나 테스트 고객을
                  선택해주세요.
                </p>
              </div>
            ))}

          {activeTab === "products" && (
            <ProductExplorer
              onScreenSync={syncScreenToCustomer}
              onProductSelected={setSelectedProduct}
              customerId={currentCustomer?.CustomerID}
              stompClient={stompClient}
              sessionId={sessionId}
            />
          )}

          {activeTab === "pdf-forms" &&
            (enrollmentData ? (
              <div style={{ padding: "2rem" }}>
                <h2
                  style={{ color: "var(--hana-primary)", marginBottom: "1rem" }}
                >
                  📝 상품 가입 서식
                </h2>
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "var(--hana-shadow-light)",
                  }}
                >
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>{enrollmentData.productName}</strong> 가입 서식
                  </div>

                  {enrollmentData.forms && enrollmentData.forms.length > 0 && (
                    <>
                      <div
                        style={{
                          background: "#e8f5e8",
                          border: "1px solid #4caf50",
                          borderRadius: "8px",
                          padding: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#2e7d32",
                            marginBottom: "0.5rem",
                          }}
                        >
                          서식 {currentFormIndex + 1} /{" "}
                          {enrollmentData.forms.length}
                        </div>
                        <div style={{ color: "#2e7d32" }}>
                          {enrollmentData.forms[currentFormIndex]?.formName}
                        </div>
                      </div>

                      {/* 서식 필드 표시 */}
                      {enrollmentData.forms[currentFormIndex]?.formSchema && (
                        <div
                          style={{
                            background: "#f8f9fa",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "1.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "1rem",
                              color: "#008485",
                            }}
                          >
                            📄 PDF 서식 뷰어
                          </div>

                          {/* PDF 뷰어 컴포넌트 */}
                          <PDFViewer
                            pdfUrl={
                              enrollmentData.forms[currentFormIndex]
                                ?.formTemplatePath
                            }
                            formSchema={
                              enrollmentData.forms[currentFormIndex]?.formSchema
                            }
                            fieldValues={(() => {
                              try {
                                const schema = JSON.parse(
                                  enrollmentData.forms[currentFormIndex]
                                    ?.formSchema || "{}"
                                );
                                const values = {};
                                schema.fields?.forEach((field) => {
                                  if (field.value) {
                                    values[field.id] = field.value;
                                  }
                                });
                                return values;
                              } catch (e) {
                                return {};
                              }
                            })()}
                            onFieldClick={(field) => {
                              // PC에서 필드 클릭 시 태블릿에 필드 확대 메시지 전송
                              if (stompClient && sessionId) {
                                const fieldFocusMessage = {
                                  type: "field-focus",
                                  data: {
                                    fieldId: field.id,
                                    fieldName: field.name,
                                    fieldLabel: field.label,
                                    fieldType: field.type,
                                    fieldPlaceholder: field.placeholder,
                                    formIndex: currentFormIndex,
                                    formName:
                                      enrollmentData.forms[currentFormIndex]
                                        .formName,
                                  },
                                  timestamp: Date.now(),
                                };

                                stompClient.publish({
                                  destination: "/topic/session/" + sessionId,
                                  body: JSON.stringify(fieldFocusMessage),
                                });

                                console.log(
                                  "📤 PC에서 field-focus 메시지 전송:",
                                  fieldFocusMessage
                                );
                              }
                            }}
                            highlightedField={null}
                            isFieldFocusMode={false}
                          />

                          {/* 필드 목록 (백업용) */}
                          <details style={{ marginTop: "1rem" }}>
                            <summary
                              style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                                color: "#666",
                              }}
                            >
                              📋 필드 목록 보기
                            </summary>
                            {(() => {
                              try {
                                const schema = JSON.parse(
                                  enrollmentData.forms[currentFormIndex]
                                    .formSchema
                                );
                                return schema.fields?.map((field, index) => (
                                  <div
                                    key={index}
                                    onClick={() => {
                                      // PC에서 필드 클릭 시 태블릿에 필드 확대 메시지 전송
                                      if (stompClient && sessionId) {
                                        const fieldFocusMessage = {
                                          type: "field-focus",
                                          data: {
                                            fieldId: field.id,
                                            fieldName: field.name,
                                            fieldLabel: field.label,
                                            fieldType: field.type,
                                            fieldPlaceholder: field.placeholder,
                                            formIndex: currentFormIndex,
                                            formName:
                                              enrollmentData.forms[
                                                currentFormIndex
                                              ].formName,
                                          },
                                          timestamp: Date.now(),
                                        };

                                        stompClient.publish({
                                          destination:
                                            "/topic/session/" + sessionId,
                                          body: JSON.stringify(
                                            fieldFocusMessage
                                          ),
                                        });

                                        console.log(
                                          "📤 PC에서 field-focus 메시지 전송:",
                                          fieldFocusMessage
                                        );
                                      }
                                    }}
                                    style={{
                                      marginBottom: "0.5rem",
                                      padding: "0.5rem",
                                      background: "white",
                                      borderRadius: "4px",
                                      border: "1px solid #e9ecef",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "#f8f9fa";
                                      e.target.style.borderColor =
                                        "var(--hana-mint)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = "white";
                                      e.target.style.borderColor = "#e9ecef";
                                    }}
                                  >
                                    <span style={{ fontWeight: "bold" }}>
                                      {field.label}
                                    </span>
                                    {field.required && (
                                      <span style={{ color: "red" }}> *</span>
                                    )}
                                    <span
                                      style={{
                                        color: "#666",
                                        fontSize: "0.9rem",
                                        marginLeft: "0.5rem",
                                      }}
                                    >
                                      ({field.type})
                                    </span>
                                    {field.value && (
                                      <div
                                        style={{
                                          fontSize: "0.9rem",
                                          color: "var(--hana-mint)",
                                          fontWeight: "bold",
                                          marginTop: "0.25rem",
                                          padding: "0.25rem 0.5rem",
                                          background: "#e8f5e8",
                                          borderRadius: "4px",
                                          border: "1px solid #4caf50",
                                        }}
                                      >
                                        ✅ 입력됨: {field.value}
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        fontSize: "0.8rem",
                                        color: "#999",
                                        marginTop: "0.25rem",
                                      }}
                                    >
                                      클릭하여 태블릿에서 입력
                                    </div>
                                  </div>
                                ));
                              } catch (e) {
                                return (
                                  <div style={{ color: "red" }}>
                                    서식 데이터를 불러올 수 없습니다.
                                  </div>
                                );
                              }
                            })()}
                          </details>
                        </div>
                      )}

                      {/* PC 전용 네비게이션 버튼 */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "1rem",
                        }}
                      >
                        <button
                          onClick={() => {
                            if (currentFormIndex > 0) {
                              setCurrentFormIndex(currentFormIndex - 1);
                              // 태블릿에 서식 변경 알림
                              if (stompClient && sessionId) {
                                stompClient.publish({
                                  destination: "/topic/session/" + sessionId,
                                  body: JSON.stringify({
                                    type: "form-navigation",
                                    data: {
                                      currentFormIndex: currentFormIndex - 1,
                                      totalForms: enrollmentData.forms.length,
                                      currentForm:
                                        enrollmentData.forms[
                                          currentFormIndex - 1
                                        ],
                                    },
                                    timestamp: Date.now(),
                                  }),
                                });
                              }
                            }
                          }}
                          disabled={currentFormIndex === 0}
                          style={{
                            padding: "0.75rem 1.5rem",
                            background:
                              currentFormIndex === 0
                                ? "#ccc"
                                : "var(--hana-mint)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor:
                              currentFormIndex === 0
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          ← 이전 서식
                        </button>
                        <button
                          onClick={() => {
                            if (
                              currentFormIndex <
                              enrollmentData.forms.length - 1
                            ) {
                              setCurrentFormIndex(currentFormIndex + 1);
                              // 태블릿에 서식 변경 알림
                              if (stompClient && sessionId) {
                                stompClient.publish({
                                  destination: "/topic/session/" + sessionId,
                                  body: JSON.stringify({
                                    type: "form-navigation",
                                    data: {
                                      currentFormIndex: currentFormIndex + 1,
                                      totalForms: enrollmentData.forms.length,
                                      currentForm:
                                        enrollmentData.forms[
                                          currentFormIndex + 1
                                        ],
                                    },
                                    timestamp: Date.now(),
                                  }),
                                });
                              }
                            }
                          }}
                          disabled={
                            currentFormIndex === enrollmentData.forms.length - 1
                          }
                          style={{
                            padding: "0.75rem 1.5rem",
                            background:
                              currentFormIndex ===
                              enrollmentData.forms.length - 1
                                ? "#ccc"
                                : "var(--hana-mint)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor:
                              currentFormIndex ===
                              enrollmentData.forms.length - 1
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          다음 서식 →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : currentCustomer ? (
              <FormManager
                customerData={currentCustomer}
                selectedProduct={selectedProduct}
                isEmployee={true}
                sessionId={sessionId}
                onFormComplete={(formData) => {
                  console.log("서식 작성 완료:", formData);
                  // 백엔드에 서식 데이터 저장
                  axios
                    .post("http://localhost:8080/api/forms/submit", {
                      customerId: currentCustomer.CustomerID,
                      ...formData,
                    })
                    .catch((error) => console.error("서식 제출 오류:", error));
                }}
                onScreenSync={syncScreenToCustomer}
                onFormDataUpdate={(updatedFormData) => {
                  console.log("고객이 입력한 데이터:", updatedFormData);
                  // 고객이 입력한 데이터를 직원 화면에 실시간 반영
                  // FormViewer에서 데이터 업데이트
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  📝
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  서식 작성
                </h3>
                <p style={{ color: "var(--hana-gray)" }}>
                  고객 정보를 먼저 입력해주세요.
                </p>
              </div>
            ))}

          {activeTab === "simulation" &&
            (currentCustomer ? (
              <SimulationPanel
                customer={currentCustomer}
                onScreenSync={syncScreenToCustomer}
                sessionId={sessionId}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  📊
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  혜택 시뮬레이션
                </h3>
                <p style={{ color: "var(--hana-gray)" }}>
                  고객 정보를 먼저 입력해주세요.
                </p>
              </div>
            ))}

          {activeTab === "ai" &&
            (currentCustomer ? (
              <AiQuestionGenerator
                customerInfo={{
                  customerId: currentCustomer.CustomerID,
                  name: currentCustomer.Name,
                  age: currentCustomer.Age,
                  income: currentCustomer.Income,
                  assets: currentCustomer.Assets,
                  goals: [currentCustomer.InvestmentGoal],
                }}
                onQuestionsGenerated={(questions) => {
                  console.log("AI 질문 생성 완료:", questions);
                  // 선택된 질문들을 태블릿으로 전송하는 로직 추가 가능
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--hana-space-8)",
                  color: "var(--hana-gray)",
                  background: "var(--hana-white)",
                  borderRadius: "var(--hana-radius-lg)",
                  margin: "var(--hana-space-4)",
                  border: "var(--hana-border-light)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--hana-space-4)",
                  }}
                >
                  🤖
                </div>
                <h3
                  style={{
                    color: "var(--hana-primary)",
                    marginBottom: "var(--hana-space-2)",
                    fontSize: "var(--hana-font-size-xl)",
                  }}
                >
                  AI 질문 생성
                </h3>
                <p style={{ color: "var(--hana-gray)" }}>
                  고객 정보를 먼저 입력해주세요.
                </p>
              </div>
            ))}
        </TabContent>
      </MainContent>

      {/* 테스트 고객 선택 모달 */}
      {showCustomerSelect && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 133, 122, 0.3)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "hanaFadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: "var(--hana-white)",
              borderRadius: "var(--hana-radius-xl)",
              padding: "var(--hana-space-8)",
              maxWidth: "700px",
              width: "90%",
              maxHeight: "85%",
              overflow: "auto",
              boxShadow: "var(--hana-shadow-heavy)",
              border: "var(--hana-border-light)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--hana-space-6)",
                borderBottom: "3px solid var(--hana-primary-light)",
                paddingBottom: "var(--hana-space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--hana-space-3)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, var(--hana-primary), var(--hana-mint))",
                    borderRadius: "var(--hana-radius-full)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--hana-font-size-xl)",
                    color: "var(--hana-white)",
                  }}
                >
                  👥
                </div>
                <h2
                  style={{
                    color: "var(--hana-primary)",
                    margin: 0,
                    fontSize: "var(--hana-font-size-2xl)",
                    fontWeight: "700",
                  }}
                >
                  테스트 고객 선택
                </h2>
              </div>
              <button
                onClick={() => setShowCustomerSelect(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "var(--hana-font-size-2xl)",
                  cursor: "pointer",
                  color: "var(--hana-gray)",
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--hana-radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all var(--hana-transition-base)",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "var(--hana-error-light)";
                  e.target.style.color = "var(--hana-error)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "none";
                  e.target.style.color = "var(--hana-gray)";
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: "var(--hana-space-4)" }}>
              {testCustomers.map((customer) => (
                <CustomerCard
                  key={customer.customer_id}
                  onClick={() => selectTestCustomer(customer.customer_id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <CustomerName>
                        {customer.name} ({customer.age}세)
                      </CustomerName>
                      <CustomerDetails>
                        <div className="customer-id">
                          ID: {customer.customer_id}
                        </div>
                        <div className="customer-phone">
                          📞 {customer.phone}
                        </div>
                        <div>📍 {customer.address}</div>
                        <div>
                          💰 연소득: {customer.income?.toLocaleString()}원
                        </div>
                        <div>🎯 목표: {customer.investment_goal}</div>
                      </CustomerDetails>
                    </div>
                    <StatusBadge className="waiting">선택 가능</StatusBadge>
                  </div>
                </CustomerCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default EmployeeDashboard;
