package com.enterprise.api.fintech.service;

import com.enterprise.api.fintech.model.dto.TransactionDTO;
import com.enterprise.api.fintech.model.entity.Transaction;
import com.enterprise.api.fintech.repository.TransactionRepository;
import com.enterprise.core.enums.TransactionStatus;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionDTO.TransactionResponse create(TransactionDTO.CreateTransactionRequest request) {
        Transaction tx = new Transaction();
        tx.setReferenceNumber("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        tx.setSourceAccountId(request.getSourceAccountId());
        tx.setDestinationAccountId(request.getDestinationAccountId());
        tx.setAmount(request.getAmount());
        tx.setCurrency(request.getCurrency());
        tx.setType(request.getType());
        tx.setDescription(request.getDescription());
        tx.setStatus(TransactionStatus.PROCESSING);

        Transaction saved = transactionRepository.save(tx);
        saved.setStatus(TransactionStatus.COMPLETED);
        saved.setProcessedAt(LocalDateTime.now());

        log.info("Transaction {} processed: {} {}", saved.getReferenceNumber(), saved.getAmount(), saved.getCurrency());
        return toResponse(transactionRepository.save(saved));
    }

    public Page<TransactionDTO.TransactionResponse> findAll(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::toResponse);
    }

    public TransactionDTO.TransactionResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public TransactionDTO.TransactionStats getStats() {
        TransactionDTO.TransactionStats stats = new TransactionDTO.TransactionStats();
        stats.setTotal(transactionRepository.count());
        stats.setPending(transactionRepository.countByStatus(TransactionStatus.PENDING));
        stats.setCompleted(transactionRepository.countByStatus(TransactionStatus.COMPLETED));
        stats.setFailed(transactionRepository.countByStatus(TransactionStatus.FAILED));
        stats.setTotalVolume(transactionRepository.sumCompletedVolume());
        return stats;
    }

    private Transaction getOrThrow(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ApiException("Transaction not found: " + id, HttpStatus.NOT_FOUND));
    }

    private TransactionDTO.TransactionResponse toResponse(Transaction t) {
        TransactionDTO.TransactionResponse r = new TransactionDTO.TransactionResponse();
        r.setId(t.getId());
        r.setReferenceNumber(t.getReferenceNumber());
        r.setSourceAccountId(t.getSourceAccountId());
        r.setDestinationAccountId(t.getDestinationAccountId());
        r.setAmount(t.getAmount());
        r.setCurrency(t.getCurrency());
        r.setType(t.getType());
        r.setStatus(t.getStatus());
        r.setDescription(t.getDescription());
        r.setFee(t.getFee());
        r.setProcessedAt(t.getProcessedAt());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }
}
