package com.enterprise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EnterpriseAIPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(EnterpriseAIPlatformApplication.class, args);
    }
}
