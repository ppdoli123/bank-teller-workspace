package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.entity.ProductForm;
import com.hanabank.smartconsulting.service.ProductFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "*")
public class ProductFormController {

    @Autowired
    private ProductFormService productFormService;

    // 모든 서식 조회
    @GetMapping("/all")
    public ResponseEntity<List<ProductForm>> getAllForms() {
        List<ProductForm> forms = productFormService.getAllForms();
        return ResponseEntity.ok(forms);
    }

    // 특정 타입의 서식 조회
    @GetMapping("/type/{formType}")
    public ResponseEntity<List<ProductForm>> getFormsByType(@PathVariable String formType) {
        List<ProductForm> forms = productFormService.getFormsByType(formType);
        return ResponseEntity.ok(forms);
    }

    // 특정 상품의 가입 프로세스 서식들 조회
    @GetMapping("/process/{productName}")
    public ResponseEntity<List<ProductForm>> getProcessForms(@PathVariable String productName) {
        List<ProductForm> forms = productFormService.getProcessForms(productName);
        return ResponseEntity.ok(forms);
    }

    // 특정 서식 ID로 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductForm> getFormById(@PathVariable Long id) {
        ProductForm form = productFormService.getFormById(id);
        if (form != null) {
            return ResponseEntity.ok(form);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
