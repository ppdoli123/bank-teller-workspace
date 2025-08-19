package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.repository.ProductFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/test-forms")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TestFormsController {

    @Autowired
    private ProductFormRepository productFormRepository;

    @RequestMapping(value = "/ping", method = RequestMethod.GET)
    @ResponseBody
    public String ping() {
        System.out.println("🎯 TestFormsController /ping 엔드포인트 호출됨!");
        return "TestFormsController ping 성공! 🎉";
    }

    @RequestMapping(value = "/by-type", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ApiResponse<?>> getFormsByType(@RequestParam String type) {
        try {
            System.out.println("📋 서식 조회 요청 - type: " + type);
            
            List<ProductForm> forms = productFormRepository.findByFormTypeAndIsActive(type, true);
            System.out.println("✅ 조회된 서식 개수: " + forms.size());
            
            return ResponseEntity.ok(ApiResponse.success("서식 조회 성공", forms));
        } catch (Exception e) {
            System.err.println("❌ 서식 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("서식 조회 실패: " + e.getMessage()));
        }
    }
}
