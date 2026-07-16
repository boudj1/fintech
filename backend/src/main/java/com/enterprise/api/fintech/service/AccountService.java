package com.enterprise.api.fintech.service;

import com.enterprise.api.fintech.model.dto.AccountDTO;
import com.enterprise.api.fintech.model.entity.Account;
import com.enterprise.api.fintech.repository.AccountRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountDTO.AccountResponse create(AccountDTO.CreateAccountRequest request) {
        Account account = new Account();
        account.setOwnerId(request.getOwnerId());
        account.setType(request.getType());
        account.setCurrency(request.getCurrency());
        account.setAccountNumber(generateAccountNumber());
        log.info("Account created for owner {}", request.getOwnerId());
        return toResponse(accountRepository.save(account));
    }

    public Page<AccountDTO.AccountResponse> findAll(Pageable pageable) {
        return accountRepository.findAll(pageable).map(this::toResponse);
    }

    public AccountDTO.AccountResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public AccountDTO.AccountResponse update(Long id, AccountDTO.UpdateAccountRequest request) {
        Account account = getOrThrow(id);
        if (request.getStatus() != null) account.setStatus(request.getStatus());
        return toResponse(accountRepository.save(account));
    }

    public AccountDTO.AccountStats getStats() {
        AccountDTO.AccountStats stats = new AccountDTO.AccountStats();
        stats.setTotal(accountRepository.count());
        stats.setActive(accountRepository.countByStatus(Account.AccountStatus.ACTIVE));
        stats.setSuspended(accountRepository.countByStatus(Account.AccountStatus.SUSPENDED));
        return stats;
    }

    private Account getOrThrow(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ApiException("Account not found: " + id, HttpStatus.NOT_FOUND));
    }

    private String generateAccountNumber() {
        return "ACC-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    private AccountDTO.AccountResponse toResponse(Account a) {
        AccountDTO.AccountResponse r = new AccountDTO.AccountResponse();
        r.setId(a.getId());
        r.setAccountNumber(a.getAccountNumber());
        r.setOwnerId(a.getOwnerId());
        r.setType(a.getType());
        r.setBalance(a.getBalance());
        r.setCurrency(a.getCurrency());
        r.setStatus(a.getStatus());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
