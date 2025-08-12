package com.hanabank.smartconsulting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class SmartConsultingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartConsultingApplication.class, args);
    }
}
