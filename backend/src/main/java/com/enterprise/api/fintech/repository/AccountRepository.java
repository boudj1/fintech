package com.enterprise.api.fintech.repository;

import com.enterprise.api.fintech.model.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByOwnerId(Long ownerId);
    Page<Account> findByStatus(Account.AccountStatus status, Pageable pageable);
    Optional<Account> findByAccountNumber(String accountNumber);
    long countByStatus(Account.AccountStatus status);
}
