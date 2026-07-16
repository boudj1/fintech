package com.enterprise.api.fintech.model.dto;

import com.enterprise.api.fintech.model.entity.Wallet;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletDTO {

    @Data
    public static class CreateWalletRequest {
        @NotNull
        private Long ownerId;
        private String currency = "DZD";
        private BigDecimal dailyLimit;
    }

    @Data
    public static class TopUpRequest {
        @NotNull
        private BigDecimal amount;
        private String description;
    }

    @Data
    public static class WalletResponse {
        private Long id;
        private Long ownerId;
        private BigDecimal balance;
        private String currency;
        private Wallet.WalletStatus status;
        private BigDecimal dailyLimit;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
