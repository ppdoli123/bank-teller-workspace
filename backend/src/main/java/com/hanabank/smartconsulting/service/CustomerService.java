package com.hanabank.smartconsulting.service;

import com.hanabank.smartconsulting.dto.CustomerDto;
import com.hanabank.smartconsulting.entity.Customer;
import com.hanabank.smartconsulting.entity.CustomerProduct;
import com.hanabank.smartconsulting.repository.CustomerProductRepository;
import com.hanabank.smartconsulting.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerProductRepository customerProductRepository;
    
    public Optional<CustomerDto> getCustomerById(String customerId) {
        return customerRepository.findByCustomerId(customerId)
                .map(this::convertToDto);
    }
    
    public Optional<CustomerDto> getCustomerByName(String name) {
        return customerRepository.findByName(name)
                .map(this::convertToDto);
    }
    
    public Optional<CustomerDto> getCustomerByContactNumber(String contactNumber) {
        return customerRepository.findByContactNumber(contactNumber)
                .map(this::convertToDto);
    }
    
    public List<CustomerDto> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(this::convertToDto)
                .toList();
    }
    
    public List<CustomerProduct> getCustomerProducts(String customerId) {
        return customerProductRepository.findByCustomerCustomerId(customerId);
    }
    
    public Map<String, Object> getCustomerProductSummary(String customerId) {
        Long totalAssets = customerProductRepository.getTotalAssetsByCustomerId(customerId);
        Long totalDebts = customerProductRepository.getTotalDebtsByCustomerId(customerId);
        Long netAssets = totalAssets - totalDebts;
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAssets", totalAssets != null ? totalAssets : 0L);
        summary.put("totalDebts", totalDebts != null ? totalDebts : 0L);
        summary.put("netAssets", netAssets);
        
        return summary;
    }
    
    public CustomerDto saveCustomer(CustomerDto customerDto) {
        Customer customer = convertToEntity(customerDto);
        Customer savedCustomer = customerRepository.save(customer);
        return convertToDto(savedCustomer);
    }
    
    private CustomerDto convertToDto(Customer customer) {
        CustomerDto dto = CustomerDto.builder()
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .dateOfBirth(customer.getDateOfBirth())
                .contactNumber(customer.getContactNumber())
                .address(customer.getAddress())
                .gender(customer.getGender())
                .registrationDate(customer.getRegistrationDate())
                .build();
        
        // 계산된 필드들
        dto.setPhone(customer.getContactNumber()); // 별칭
        if (customer.getDateOfBirth() != null) {
            dto.setAge(java.time.Period.between(customer.getDateOfBirth(), java.time.LocalDate.now()).getYears());
        }
        
        return dto;
    }
    
    private Customer convertToEntity(CustomerDto customerDto) {
        return Customer.builder()
                .customerId(customerDto.getCustomerId())
                .name(customerDto.getName())
                .dateOfBirth(customerDto.getDateOfBirth())
                .contactNumber(customerDto.getContactNumber())
                .address(customerDto.getAddress())
                .gender(customerDto.getGender())
                .registrationDate(customerDto.getRegistrationDate())
                .build();
    }
}


