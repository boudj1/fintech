package com.enterprise.api.admin.model.dto;

import com.enterprise.api.admin.model.entity.Customer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

public class CustomerDTO {

    @Data
    public static class CreateCustomerRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank
        @Email
        private String email;
        private String phone;
        private String company;
        private String address;
        private String city;
        private String country;
        private String notes;
        private String preferredLanguage = "en";
    }

    @Data
    public static class UpdateCustomerRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String company;
        private String address;
        private String city;
        private String country;
        private String notes;
        private Customer.Status status;
        private String preferredLanguage;
    }

    @Data
    public static class CustomerResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String company;
        private String address;
        private String city;
        private String country;
        private Customer.Status status;
        private String notes;
        private String preferredLanguage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class CustomerStats {
        private long total;
        private long active;
        private long inactive;
        private long blocked;
    }
}
