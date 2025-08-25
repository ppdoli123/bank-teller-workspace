package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ai.AiQuestionRequest;
import com.hanabank.smartconsulting.dto.ai.AiQuestionResponse;
import com.hanabank.smartconsulting.service.AiQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiQuestionService aiQuestionService;

    @PostMapping("/questions")
    public ResponseEntity<AiQuestionResponse> generateQuestions(@Valid @RequestBody AiQuestionRequest request) {
        AiQuestionResponse response = aiQuestionService.generateQuestions(request);
        return ResponseEntity.ok(response);
    }
}


