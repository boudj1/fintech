package com.enterprise.api.fintech.model.dto;

import com.enterprise.api.fintech.model.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountDTO {

    @Data
    public static class CreateAccountRequest {
        @NotNull
        private Long ownerId;
        @NotNull
        private Account.AccountType type;
        @NotBlank
        private String currency;
    }

    @Data
    public static class UpdateAccountRequest {
        private Account.AccountStatus status;
        private BigDecimal dailyLimit;
    }

    @Data
    public static class AccountResponse {
        private Long id;
        private String accountNumber;
        private Long ownerId;
        private Account.AccountType type;
        private BigDecimal balance;
        private String currency;
        private Account.AccountStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class AccountStats {
        private long total;
        private long active;
        private long suspended;
        private BigDecimal totalBalance;
    }
}
