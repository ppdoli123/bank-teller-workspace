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
    
    public Optional<CustomerDto> getCustomerByIdNumber(String idNumber) {
        return customerRepository.findByIdNumber(idNumber)
                .map(this::convertToDto);
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
        return CustomerDto.builder()
                .id(customer.getId())
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .age(customer.getAge())
                .address(customer.getAddress())
                .idNumber(customer.getIdNumber())
                .income(customer.getIncome())
                .assets(customer.getAssets())
                .investmentGoal(customer.getInvestmentGoal())
                .riskTolerance(customer.getRiskTolerance())
                .investmentPeriod(customer.getInvestmentPeriod())
                .build();
    }
    
    private Customer convertToEntity(CustomerDto customerDto) {
        return Customer.builder()
                .id(customerDto.getId())
                .customerId(customerDto.getCustomerId())
                .name(customerDto.getName())
                .phone(customerDto.getPhone())
                .age(customerDto.getAge())
                .address(customerDto.getAddress())
                .idNumber(customerDto.getIdNumber())
                .income(customerDto.getIncome())
                .assets(customerDto.getAssets())
                .investmentGoal(customerDto.getInvestmentGoal())
                .riskTolerance(customerDto.getRiskTolerance())
                .investmentPeriod(customerDto.getInvestmentPeriod())
                .build();
    }
}


