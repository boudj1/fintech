package com.enterprise.api.fintech.repository;

import com.enterprise.api.fintech.model.entity.Transaction;
import com.enterprise.core.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findBySourceAccountIdOrDestinationAccountId(Long sourceId, Long destId, Pageable pageable);
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);
    Page<Transaction> findByOwnerId(Long ownerId, Pageable pageable);
    List<Transaction> findTop10ByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    long countByStatus(TransactionStatus status);
    long countByOwnerId(Long ownerId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'COMPLETED'")
    BigDecimal sumCompletedVolume();
}
