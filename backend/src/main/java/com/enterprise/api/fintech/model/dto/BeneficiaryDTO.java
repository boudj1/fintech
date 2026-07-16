package com.enterprise.api.fintech.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

public class BeneficiaryDTO {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(max = 100)
        private String name;

        @Size(max = 34)
        private String iban;

        @Size(max = 30)
        private String accountNumber;

        @Size(max = 100)
        private String bankName;

        @Size(max = 20)
        private String bankCode;

        private String currency = "DZD";
    }

    @Data
    public static class UpdateRequest {
        @Size(max = 100)
        private String name;

        @Size(max = 34)
        private String iban;

        @Size(max = 30)
        private String accountNumber;

        @Size(max = 100)
        private String bankName;

        private String currency;
        private Boolean active;
    }

    @Data
    public static class Response {
        private Long id;
        private Long ownerId;
        private String name;
        private String iban;
        private String accountNumber;
        private String bankName;
        private String bankCode;
        private String currency;
        private boolean active;
        private LocalDateTime createdAt;
    }
}
