package com.hanabank.smartconsulting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
@ComponentScan(basePackages = "com.hanabank.smartconsulting")
public class SmartConsultingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartConsultingApplication.class, args);
    }
}
