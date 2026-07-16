package com.enterprise.api.chatbot.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Financial context injected into the AI chatbot so it can answer
 * questions about the user's accounts, transactions and beneficiaries.
 */
@Data
@AllArgsConstructor
public class ChatbotContext {

    private List<AccountSummary> accounts;
    private List<TransactionSummary> recentTransactions;
    private List<BeneficiarySummary> beneficiaries;
    private WalletSummary wallet;

    public record AccountSummary(
            String accountNumber,
            String type,
            BigDecimal balance,
            String currency,
            String status
    ) {}

    public record TransactionSummary(
            String reference,
            BigDecimal amount,
            String currency,
            String type,
            String status,
            String description,
            LocalDateTime date
    ) {}

    public record BeneficiarySummary(
            String name,
            String iban,
            String bankName,
            String currency
    ) {}

    public record WalletSummary(
            BigDecimal balance,
            String currency,
            BigDecimal dailyLimit
    ) {}
}
