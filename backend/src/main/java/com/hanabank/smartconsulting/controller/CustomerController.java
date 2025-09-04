package com.hanabank.smartconsulting.controller;

import com.hanabank.smartconsulting.dto.ApiResponse;
import com.hanabank.smartconsulting.dto.CustomerDto;
import com.hanabank.smartconsulting.dto.CustomerProductSummaryDto;
import com.hanabank.smartconsulting.entity.Customer;
import com.hanabank.smartconsulting.entity.CustomerProduct;
import com.hanabank.smartconsulting.repository.CustomerRepository;
import com.hanabank.smartconsulting.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
    private final CustomerRepository customerRepository;
    private final JdbcTemplate jdbcTemplate;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllCustomers() {
        log.info("모든 고객 정보 조회 요청");
        
        try {
            // JdbcTemplate으로 직접 SQL 실행하여 트랜잭션 문제 완전 회피
            String sql = "SELECT customerid, name, dateofbirth, contactnumber, address, gender, registrationdate FROM customer";
            List<Map<String, Object>> customerRows = jdbcTemplate.queryForList(sql);
            log.info("DB에서 조회된 고객 수: {}", customerRows.size());
            
            if (customerRows.isEmpty()) {
                log.info("고객이 없습니다. 빈 리스트 반환");
                return ResponseEntity.ok(ApiResponse.success("모든 고객 정보 조회 성공", new ArrayList<>()));
            }
            
            List<CustomerDto> customerDtos = new ArrayList<>();
            int successCount = 0;
            int errorCount = 0;
            
            for (Map<String, Object> row : customerRows) {
                try {
                    String customerId = (String) row.get("customerid");
                    log.debug("고객 {} 변환 시작", customerId);
                    
                    // JdbcTemplate 결과를 CustomerDto로 변환
                    CustomerDto dto = new CustomerDto();
                    dto.setCustomerId(customerId);
                    dto.setName((String) row.get("name"));
                    
                    // java.sql.Date를 java.time.LocalDate로 변환
                    java.sql.Date sqlDate = (java.sql.Date) row.get("dateofbirth");
                    dto.setDateOfBirth(sqlDate != null ? sqlDate.toLocalDate() : null);
                    
                    dto.setContactNumber((String) row.get("contactnumber"));
                    dto.setAddress((String) row.get("address"));
                    dto.setGender((String) row.get("gender"));
                    
                    // java.sql.Timestamp를 java.time.LocalDateTime으로 변환
                    java.sql.Timestamp sqlTimestamp = (java.sql.Timestamp) row.get("registrationdate");
                    dto.setRegistrationDate(sqlTimestamp != null ? sqlTimestamp.toLocalDateTime() : null);
                    
                    // 계산된 필드들
                    dto.setPhone(dto.getContactNumber()); // 별칭
                    if (dto.getDateOfBirth() != null) {
                        dto.setAge(java.time.Period.between(dto.getDateOfBirth(), java.time.LocalDate.now()).getYears());
                    }
                    
                    // 상품 정보는 빈 값으로 설정
                    dto.setProducts(new ArrayList<>());
                    dto.setProductSummary(CustomerProductSummaryDto.builder()
                            .totalAssets(0L)
                            .totalDebts(0L)
                            .netAssets(0L)
                            .totalProducts(0)
                            .totalDepositProducts(0)
                            .totalLoanProducts(0)
                            .totalInvestmentProducts(0)
                            .averageInterestRate(0.0)
                            .totalMonthlyPayment(0L)
                            .build());
                    
                    customerDtos.add(dto);
                    successCount++;
                    log.debug("고객 {} 변환 성공", customerId);
                    
                } catch (Exception e) {
                    errorCount++;
                    log.error("고객 변환 중 오류: {} - {}", e.getClass().getSimpleName(), e.getMessage());
                    // 오류가 발생한 고객은 건너뛰고 계속 진행
                    continue;
                }
            }
            
            log.info("고객 목록 조회 완료: 성공 {}개, 오류 {}개, 총 {}개", successCount, errorCount, customerDtos.size());
            return ResponseEntity.ok(ApiResponse.success("모든 고객 정보 조회 성공", customerDtos));
            
        } catch (Exception e) {
            log.error("모든 고객 정보 조회 중 치명적 오류 발생: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("고객 정보 조회 중 오류가 발생했습니다: " + e.getMessage())
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


