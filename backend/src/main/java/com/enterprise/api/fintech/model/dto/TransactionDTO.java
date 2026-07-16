package com.enterprise.api.fintech.model.dto;

import com.enterprise.api.fintech.model.entity.Transaction;
import com.enterprise.core.enums.TransactionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDTO {

    @Data
    public static class CreateTransactionRequest {
        private Long sourceAccountId;
        private Long destinationAccountId;
        @NotNull
        @DecimalMin("0.01")
        private BigDecimal amount;
        @NotNull
        private Transaction.TransactionType type;
        private String currency = "DZD";
        private String description;
    }

    @Data
    public static class TransactionResponse {
        private Long id;
        private String referenceNumber;
        private Long sourceAccountId;
        private Long destinationAccountId;
        private BigDecimal amount;
        private String currency;
        private Transaction.TransactionType type;
        private TransactionStatus status;
        private String description;
        private BigDecimal fee;
        private LocalDateTime processedAt;
        private LocalDateTime createdAt;
    }

    @Data
    public static class TransactionStats {
        private long total;
        private long pending;
        private long completed;
        private long failed;
        private BigDecimal totalVolume;
    }
}
