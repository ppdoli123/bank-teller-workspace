import React, { useState, useEffect } from "react";
import "./AiQuestionGenerator.css";
import { getApiUrl } from "../../config/api";

const AiQuestionGenerator = ({ customerInfo, onQuestionsGenerated }) => {
  const [employeeNotes, setEmployeeNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());

  const generateQuestions = async () => {
    if (!employeeNotes.trim()) {
      setError("행원 메모를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        getApiUrl('/api/ai/questions'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: customerInfo?.customerId || "CUST-0001",
            employeeNotes: employeeNotes,
            customerSnapshotJson: JSON.stringify(
              customerInfo || {
                age: 35,
                income: 4200,
                assets: 28600000,
                goals: ["주택구매"],
              }
            ),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("질문 생성에 실패했습니다.");
      }

      const data = await response.json();
      setQuestions(data.questions || []);

      if (onQuestionsGenerated) {
        onQuestionsGenerated(data.questions);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error generating questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionSelection = (questionIndex) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionIndex)) {
      newSelected.delete(questionIndex);
    } else {
      newSelected.add(questionIndex);
    }
    setSelectedQuestions(newSelected);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#747d8c";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "높음";
      case "medium":
        return "보통";
      case "low":
        return "낮음";
      default:
        return "미정";
    }
  };

  const groupedQuestions = questions.reduce((acc, question, index) => {
    const category = question.category || "기타";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...question, index });
    return acc;
  }, {});

  return (
    <div className="ai-question-generator">
      <div className="ai-header">
        <h2>🤖 AI 질문 생성기</h2>
        <p>고객 정보와 행원 메모를 바탕으로 맞춤형 질문을 생성합니다.</p>
      </div>

      <div className="ai-input-section">
        <div className="customer-info-display">
          <h3>📋 고객 정보</h3>
          <div className="customer-info-grid">
            <div className="info-item">
              <span className="label">이름:</span>
              <span className="value">{customerInfo?.name || "김철수"}</span>
            </div>
            <div className="info-item">
              <span className="label">나이:</span>
              <span className="value">{customerInfo?.age || 35}세</span>
            </div>
            <div className="info-item">
              <span className="label">소득:</span>
              <span className="value">{customerInfo?.income || 4200}만원</span>
            </div>
            <div className="info-item">
              <span className="label">자산:</span>
              <span className="value">{customerInfo?.assets || 2860}만원</span>
            </div>
          </div>
        </div>

        <div className="notes-input">
          <h3>✍️ 행원 메모</h3>
          <textarea
            value={employeeNotes}
            onChange={(e) => setEmployeeNotes(e.target.value)}
            placeholder="고객의 요구사항, 특별한 상황, 추가로 확인해야 할 사항 등을 자유롭게 입력해주세요..."
            rows={4}
            className="notes-textarea"
          />
          <button
            onClick={generateQuestions}
            disabled={isLoading || !employeeNotes.trim()}
            className="generate-btn"
          >
            {isLoading ? "질문 생성 중..." : "🤖 AI 질문 생성"}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {questions.length > 0 && (
        <div className="questions-section">
          <div className="questions-header">
            <h3>📝 생성된 질문 목록</h3>
            <div className="questions-stats">
              <span>총 {questions.length}개 질문</span>
              <span>선택됨: {selectedQuestions.size}개</span>
            </div>
          </div>

          <div className="questions-container">
            {Object.entries(groupedQuestions).map(
              ([category, categoryQuestions]) => (
                <div key={category} className="question-category">
                  <h4 className="category-title">📂 {category}</h4>
                  <div className="category-questions">
                    {categoryQuestions.map(
                      ({ index, question, rationale, priority }) => (
                        <div
                          key={index}
                          className={`question-item ${
                            selectedQuestions.has(index) ? "selected" : ""
                          }`}
                          onClick={() => toggleQuestionSelection(index)}
                        >
                          <div className="question-header">
                            <div className="question-text">{question}</div>
                            <div
                              className="priority-badge"
                              style={{
                                backgroundColor: getPriorityColor(priority),
                              }}
                            >
                              {getPriorityText(priority)}
                            </div>
                          </div>
                          <div className="question-rationale">
                            <strong>이유:</strong> {rationale}
                          </div>
                          <div className="question-actions">
                            <button
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 질문을 태블릿으로 전송하는 로직
                                console.log("Send to tablet:", question);
                              }}
                            >
                              📱 태블릿 전송
                            </button>
                            <button
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 질문을 수정하는 로직
                                console.log("Edit question:", question);
                              }}
                            >
                              ✏️ 수정
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="questions-actions">
            <button
              className="action-btn primary"
              onClick={() => {
                const selectedQuestionsList = Array.from(selectedQuestions).map(
                  (i) => questions[i]
                );
                console.log("Selected questions:", selectedQuestionsList);
                // 선택된 질문들을 태블릿으로 일괄 전송
              }}
              disabled={selectedQuestions.size === 0}
            >
              📱 선택된 질문들 태블릿 전송 ({selectedQuestions.size}개)
            </button>
            <button
              className="action-btn secondary"
              onClick={() =>
                setSelectedQuestions(new Set(questions.map((_, i) => i)))
              }
            >
              전체 선택
            </button>
            <button
              className="action-btn secondary"
              onClick={() => setSelectedQuestions(new Set())}
            >
              선택 해제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiQuestionGenerator;
