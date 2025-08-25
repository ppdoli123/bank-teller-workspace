package com.hanabank.smartconsulting.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionItem {
    private String category;   // 예: 자산, 대출, 목표 등
    private String question;   // 실제 질문 문장
    private String rationale;  // 왜 이 질문이 필요한지 간단한 근거
    private String priority;   // high | medium | low
}


