package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.entity.ProductDocument;
// import com.hanabank.smartconsulting.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    // private final RagService ragService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentName") String documentName,
            @RequestParam("storagePath") String storagePath) {
        
        try {
            log.info("Processing document: {} from path: {}", documentName, storagePath);
            
            // Process the document with RAG (비활성화)
            // ragService.processDocument(file.getBytes(), documentName, storagePath);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document processed successfully");
            response.put("documentName", documentName);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing document: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to process document: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getProcessingStatus() {
        // TODO: Implement status checking
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ready");
        return ResponseEntity.ok(response);
    }
}
