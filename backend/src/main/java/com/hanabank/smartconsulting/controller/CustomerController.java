package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.dto.CustomerDto;
import com.hanabank.smartconsulting.entity.CustomerProduct;
import com.hanabank.smartconsulting.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee/customers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {
    
    private final CustomerService customerService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllCustomers() {
        log.info("모든 고객 정보 조회 요청");
        
        try {
            List<CustomerDto> customers = customerService.getAllCustomers();
            return ResponseEntity.ok(ApiResponse.success("모든 고객 정보 조회 성공", customers));
        } catch (Exception e) {
            log.error("모든 고객 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("고객 정보 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 현재 세션 구독자(태블릿 포함)에게 전체 고객 목록을 브로드캐스트
     */
    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<Map<String, Object>>> broadcastAllCustomers(@RequestParam String sessionId) {
        log.info("세션으로 전체 고객 목록 브로드캐스트 - sessionId: {}", sessionId);
        try {
            List<CustomerDto> customers = customerService.getAllCustomers();

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "customer-list");
            payload.put("data", customers);
            payload.put("timestamp", System.currentTimeMillis());

            String destination = "/topic/session/" + sessionId;
            messagingTemplate.convertAndSend(destination, payload);

            Map<String, Object> resp = new HashMap<>();
            resp.put("sentTo", destination);
            resp.put("count", customers.size());
            return ResponseEntity.ok(ApiResponse.success("고객 목록 브로드캐스트 완료", resp));
        } catch (Exception e) {
            log.error("고객 목록 브로드캐스트 중 오류", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("고객 목록 브로드캐스트 중 오류가 발생했습니다.")
            );
        }
    }
    
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomer(@PathVariable String customerId) {
        log.info("고객 정보 조회 요청: {}", customerId);
        
        Optional<CustomerDto> customer = customerService.getCustomerById(customerId);
        
        if (customer.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("고객 정보 조회 성공", customer.get()));
        } else {
            return ResponseEntity.status(404).body(
                ApiResponse.error("고객을 찾을 수 없습니다.")
            );
        }
    }
    
    @GetMapping("/{customerId}/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomerProducts(@PathVariable String customerId) {
        log.info("고객 보유 상품 조회 요청: {}", customerId);
        
        try {
            List<CustomerProduct> products = customerService.getCustomerProducts(customerId);
            Map<String, Object> summary = customerService.getCustomerProductSummary(customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("products", products);
            response.put("summary", summary);
            
            return ResponseEntity.ok(ApiResponse.success("고객 보유 상품 조회 성공", response));
        } catch (Exception e) {
            log.error("고객 보유 상품 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("고객 보유 상품 조회 중 오류가 발생했습니다.")
            );
        }
    }
    
    @GetMapping("/search/name/{name}")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerByName(@PathVariable String name) {
        log.info("고객 이름으로 검색: {}", name);
        
        Optional<CustomerDto> customer = customerService.getCustomerByName(name);
        
        if (customer.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("고객 검색 성공", customer.get()));
        } else {
            return ResponseEntity.status(404).body(
                ApiResponse.error("고객을 찾을 수 없습니다.")
            );
        }
    }
    
    @GetMapping("/search/contact/{contactNumber}")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerByContactNumber(@PathVariable String contactNumber) {
        log.info("고객 연락처로 검색: {}", contactNumber);
        
        Optional<CustomerDto> customer = customerService.getCustomerByContactNumber(contactNumber);
        
        if (customer.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("고객 검색 성공", customer.get()));
        } else {
            return ResponseEntity.status(404).body(
                ApiResponse.error("고객을 찾을 수 없습니다.")
            );
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(@RequestBody CustomerDto customerDto) {
        log.info("고객 생성 요청: {}", customerDto.getName());
        
        try {
            CustomerDto savedCustomer = customerService.saveCustomer(customerDto);
            return ResponseEntity.ok(ApiResponse.success("고객 생성 성공", savedCustomer));
        } catch (Exception e) {
            log.error("고객 생성 중 오류 발생", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("고객 생성 중 오류가 발생했습니다.")
            );
        }
    }
}


