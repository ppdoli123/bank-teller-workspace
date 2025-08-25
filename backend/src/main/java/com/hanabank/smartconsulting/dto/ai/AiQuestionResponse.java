package com.hanabank.smartconsulting.dto.ai;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQuestionResponse {
    private List<QuestionItem> questions;
    private String summary; // 요약 코멘트
}


