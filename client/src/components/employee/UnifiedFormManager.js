import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import FormRenderer from "./FormRenderer";
import AdvancedPDFRenderer from "./AdvancedPDFRenderer";
import {
  hanaFormConfigs,
  searchForms,
  formCategories,
  sharedFieldMappings,
  calculateFormCompletion,
} from "../../data/hanaFormConfigs";
import {
  generateAllFormConfigs,
  searchGeneratedForms as searchGeneratedFormsUtil,
} from "../../utils/formDataGenerator";

const ManagerContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 350px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: var(--hana-mint);
  color: white;
`;

const SidebarTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 18px;
`;

const SearchBox = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--hana-mint);
  }
`;

const CategoryFilter = styled.select`
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--hana-mint);
  }
`;

const FormList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const FormCard = styled.div`
  background: ${(props) =>
    props.selected ? "rgba(0, 133, 122, 0.1)" : "#f8f9fa"};
  border: 2px solid
    ${(props) => (props.selected ? "var(--hana-mint)" : "#e9ecef")};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--hana-mint);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 133, 122, 0.2);
  }
`;

const FormTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  font-weight: bold;
`;

const FormDescription = styled.p`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
`;

const FormMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
`;

const CategoryBadge = styled.span`
  background: var(--hana-mint);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;

  .fill {
    height: 100%;
    background: var(--hana-mint);
    width: ${(props) => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const Toolbar = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ToolbarTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 20px;
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--hana-mint);
  background: ${(props) => (props.primary ? "var(--hana-mint)" : "white")};
  color: ${(props) => (props.primary ? "white" : "var(--hana-mint)")};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) =>
      props.primary ? "var(--hana-mint-dark)" : "rgba(0, 133, 122, 0.1)"};
  }
`;

const FormViewer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
`;

const SharedDataPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`;

const SharedDataHeader = styled.div`
  padding: 15px;
  background: var(--hana-mint);
  color: white;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
`;

const SharedDataContent = styled.div`
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
`;

const SharedField = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-size: 12px;
    font-weight: bold;
    color: #666;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--hana-mint);
    }
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 6px;
  margin: 10px;
  border: 1px solid #f5c6cb;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const UnifiedFormManager = ({ onFormComplete }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [formData, setFormData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [sharedData, setSharedData] = useState({});
  const [showSharedData, setShowSharedData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 필터링된 서식 목록 (기존 + 자동 생성)
  const existingForms = searchForms(
    searchQuery,
    selectedCategory === "전체" ? null : selectedCategory
  );

  // 자동 생성된 서식 목록 (오류 처리 추가)
  let generatedForms = [];
  try {
    generatedForms = searchGeneratedFormsUtil(
      searchQuery,
      selectedCategory === "전체" ? null : selectedCategory
    );
    console.log("=== 서식 로딩 디버깅 ===");
    console.log("자동 생성된 서식 수:", generatedForms.length);
    console.log("기존 서식 수:", existingForms.length);
    console.log("검색 쿼리:", searchQuery);
    console.log("선택된 카테고리:", selectedCategory);

    if (generatedForms.length > 0) {
      console.log("첫 번째 자동 생성 서식:", generatedForms[0]);
    }
  } catch (err) {
    console.error("자동 생성 서식 로드 오류:", err);
    setError("서식 데이터를 불러오는 중 오류가 발생했습니다: " + err.message);
  }

  const filteredForms = [...existingForms, ...generatedForms];
  console.log("총 서식 수:", filteredForms.length);

  // 필드 변경 핸들러
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // 공유 데이터 매핑 확인
    const sharedField = sharedFieldMappings[fieldName];
    if (sharedField) {
      setSharedData((prev) => ({
        ...prev,
        [sharedField]: value,
      }));
    }
  }, []);

  // 필드 클릭 핸들러
  const handleFieldClick = useCallback(
    (fieldId, fieldLabel, fieldType, fieldConfig) => {
      setActiveField(fieldId);

      // STOMP WebSocket으로 태블릿에 입력 요청 전송
      if (window.stompClient && window.stompClient.connected) {
        window.stompClient.publish({
          destination: "/app/send-message",
          body: JSON.stringify({
            sessionId: "tablet_main",
            type: "FIELD_INPUT_REQUEST",
            field: {
              id: fieldId,
              label: fieldLabel,
              type: fieldType,
              currentValue: formData[fieldId] || sharedData[fieldId] || "",
              placeholder:
                fieldConfig.placeholder || getPlaceholderForField(fieldId),
              config: fieldConfig,
            },
          }),
        });

        console.log("필드 입력 요청 전송:", fieldId, fieldLabel);
      } else {
        console.log("STOMP 클라이언트가 연결되지 않음");
      }
    },
    [formData, sharedData]
  );

  // 태블릿에서 입력 완료 시 받는 데이터
  useEffect(() => {
    const handleStompMessage = (message) => {
      if (!message || !message.body) return;

      try {
        const data = JSON.parse(message.body);
        console.log("UnifiedFormManager 메시지 수신:", data);

        let messageData = data;
        if (data.type === "receive-message" && data.data) {
          messageData = data.data;
        }

        if (messageData.type === "field-input-completed") {
          const { fieldId, fieldValue } = messageData;
          console.log("필드 입력 완료 처리:", fieldId, fieldValue);

          // 공유 필드인지 확인
          const isSharedField = Object.values(sharedFieldMappings).some(
            (fields) => fields.includes(fieldId)
          );

          if (isSharedField) {
            setSharedData((prev) => ({
              ...prev,
              [fieldId]: fieldValue,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              [fieldId]: fieldValue,
            }));
          }

          setActiveField(null);
        }
      } catch (error) {
        console.error("메시지 파싱 오류:", error);
      }
    };

    if (window.stompClient && window.stompClient.connected) {
      const subscription = window.stompClient.subscribe(
        "/topic/session/tablet_main",
        handleStompMessage
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, []);

  const getPlaceholderForField = (fieldId) => {
    const placeholders = {
      account_holder_name: "고객 성명을 입력해주세요",
      phone_number: "연락처를 입력해주세요 (예: 010-1234-5678)",
      customer_name: "고객 성명을 입력해주세요",
      resident_number: "주민등록번호를 입력해주세요",
      address: "주소를 입력해주세요",
    };
    return placeholders[fieldId] || "정보를 입력해주세요";
  };

  // 서식 선택
  const handleFormSelect = (form) => {
    setSelectedForm(form);
    setFormData({});
    setActiveField(null);
    setError(null);
  };

  // 서식 완료 처리
  const handleFormComplete = () => {
    if (selectedForm && onFormComplete) {
      const completion = calculateFormCompletion(selectedForm.id, {
        ...formData,
        ...sharedData,
      });
      onFormComplete({
        formId: selectedForm.id,
        formTitle: selectedForm.title,
        formData: { ...formData, ...sharedData },
        completion,
      });
    }
  };

  // 공유 데이터 업데이트
  const handleSharedDataChange = (fieldId, value) => {
    setSharedData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // 오류가 있는 경우 오류 메시지 표시
  if (error) {
    return (
      <ManagerContainer>
        <ErrorMessage>
          <strong>오류 발생:</strong> {error}
          <br />
          <ActionButton
            onClick={() => setError(null)}
            style={{ marginTop: "10px" }}
          >
            다시 시도
          </ActionButton>
        </ErrorMessage>
      </ManagerContainer>
    );
  }

  return (
    <ManagerContainer>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>
            📋 하나은행 서식 ({filteredForms.length}개)
          </SidebarTitle>
          <SearchBox
            placeholder="서식 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CategoryFilter
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="전체">전체 카테고리</option>
            {Object.keys(formCategories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </CategoryFilter>
        </SidebarHeader>

        <FormList>
          {loading ? (
            <LoadingMessage>서식을 불러오는 중...</LoadingMessage>
          ) : filteredForms.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#666" }}
            >
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredForms.map((form) => {
              const completion = calculateFormCompletion(form.id, formData);
              return (
                <FormCard
                  key={form.id}
                  selected={selectedForm?.id === form.id}
                  onClick={() => handleFormSelect(form)}
                >
                  <FormTitle>{form.title}</FormTitle>
                  <FormDescription>{form.description}</FormDescription>
                  <FormMeta>
                    <CategoryBadge>{form.category}</CategoryBadge>
                    <span>{completion}% 완료</span>
                  </FormMeta>
                  <ProgressBar progress={completion}>
                    <div className="fill"></div>
                  </ProgressBar>
                </FormCard>
              );
            })
          )}
        </FormList>
      </Sidebar>

      <MainContent>
        <Toolbar>
          <ToolbarTitle>
            {selectedForm ? selectedForm.title : "서식을 선택해주세요"}
          </ToolbarTitle>
          <ToolbarActions>
            <ActionButton onClick={() => setShowSharedData(!showSharedData)}>
              {showSharedData ? "공유데이터 숨기기" : "공유데이터 보기"}
            </ActionButton>
            {selectedForm && (
              <ActionButton primary onClick={handleFormComplete}>
                서식 완료
              </ActionButton>
            )}
          </ToolbarActions>
        </Toolbar>

        <FormViewer>
          {selectedForm ? (
            <AdvancedPDFRenderer
              formConfig={selectedForm}
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#666",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
              <h3>서식을 선택해주세요</h3>
              <p>
                왼쪽 목록에서 작성할 서식을 선택하시면
                <br />
                대화형 서식 작성이 시작됩니다.
              </p>
            </div>
          )}
        </FormViewer>
      </MainContent>

      {showSharedData && (
        <SharedDataPanel>
          <SharedDataHeader>🔄 공유 데이터</SharedDataHeader>
          <SharedDataContent>
            <SharedField>
              <label>고객 성명</label>
              <input
                type="text"
                value={sharedData.customer_name || ""}
                onChange={(e) =>
                  handleSharedDataChange("customer_name", e.target.value)
                }
                placeholder="고객 성명을 입력해주세요"
              />
            </SharedField>
            <SharedField>
              <label>연락처</label>
              <input
                type="tel"
                value={sharedData.phone_number || ""}
                onChange={(e) =>
                  handleSharedDataChange("phone_number", e.target.value)
                }
                placeholder="010-1234-5678"
              />
            </SharedField>
            <SharedField>
              <label>주민등록번호</label>
              <input
                type="text"
                value={sharedData.resident_number || ""}
                onChange={(e) =>
                  handleSharedDataChange("resident_number", e.target.value)
                }
                placeholder="000000-0000000"
              />
            </SharedField>
            <SharedField>
              <label>주소</label>
              <input
                type="text"
                value={sharedData.address || ""}
                onChange={(e) =>
                  handleSharedDataChange("address", e.target.value)
                }
                placeholder="고객 주소를 입력해주세요"
              />
            </SharedField>
          </SharedDataContent>
        </SharedDataPanel>
      )}
    </ManagerContainer>
  );
};

export default UnifiedFormManager;
