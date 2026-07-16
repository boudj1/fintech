package com.enterprise.api.chatbot.service;

import com.enterprise.api.chatbot.model.dto.ChatbotContext;
import com.enterprise.api.fintech.repository.AccountRepository;
import com.enterprise.api.fintech.repository.BeneficiaryRepository;
import com.enterprise.api.fintech.repository.TransactionRepository;
import com.enterprise.api.fintech.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotContextService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final WalletRepository walletRepository;

    /**
     * Builds a financial context snapshot for a given user.
     * This is injected into the AI system prompt so the chatbot can answer
     * questions about the user's real financial data.
     */
    public ChatbotContext buildContext(Long userId) {
        List<ChatbotContext.AccountSummary> accounts = accountRepository
                .findByOwnerId(userId)
                .stream()
                .map(a -> new ChatbotContext.AccountSummary(
                        a.getAccountNumber(), a.getType().name(),
                        a.getBalance(), a.getCurrency(), a.getStatus().name()))
                .toList();

        List<ChatbotContext.TransactionSummary> transactions = transactionRepository
                .findTop10ByOwnerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(t -> new ChatbotContext.TransactionSummary(
                        t.getReferenceNumber(), t.getAmount(), t.getCurrency(),
                        t.getType().name(), t.getStatus().name(),
                        t.getDescription(), t.getCreatedAt()))
                .toList();

        List<ChatbotContext.BeneficiarySummary> beneficiaries = beneficiaryRepository
                .findByOwnerIdAndActiveTrue(userId)
                .stream()
                .map(b -> new ChatbotContext.BeneficiarySummary(
                        b.getName(), b.getIban(), b.getBankName(), b.getCurrency()))
                .toList();

        ChatbotContext.WalletSummary wallet = walletRepository.findByOwnerId(userId)
                .map(w -> new ChatbotContext.WalletSummary(
                        w.getBalance(), w.getCurrency(), w.getDailyLimit()))
                .orElse(null);

        log.debug("Chatbot context built for user={} accounts={} txns={} beneficiaries={}",
                userId, accounts.size(), transactions.size(), beneficiaries.size());

        return new ChatbotContext(accounts, transactions, beneficiaries, wallet);
    }
}
