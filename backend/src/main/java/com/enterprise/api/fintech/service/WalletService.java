package com.enterprise.api.fintech.service;

import com.enterprise.api.fintech.model.dto.WalletDTO;
import com.enterprise.api.fintech.model.entity.Wallet;
import com.enterprise.api.fintech.repository.WalletRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;

    @Transactional
    public WalletDTO.WalletResponse create(WalletDTO.CreateWalletRequest request) {
        if (walletRepository.existsByOwnerId(request.getOwnerId())) {
            throw new ApiException("Wallet already exists for owner: " + request.getOwnerId(),
                    HttpStatus.CONFLICT, "WALLET_EXISTS");
        }
        Wallet wallet = new Wallet();
        wallet.setOwnerId(request.getOwnerId());
        wallet.setCurrency(request.getCurrency());
        if (request.getDailyLimit() != null) wallet.setDailyLimit(request.getDailyLimit());
        log.info("Wallet created for owner {}", request.getOwnerId());
        return toResponse(walletRepository.save(wallet));
    }

    public WalletDTO.WalletResponse findByOwner(Long ownerId) {
        return toResponse(walletRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ApiException("Wallet not found for owner: " + ownerId, HttpStatus.NOT_FOUND)));
    }

    public WalletDTO.WalletResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public WalletDTO.WalletResponse topUp(Long id, WalletDTO.TopUpRequest request) {
        Wallet wallet = getOrThrow(id);
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        log.info("Wallet {} topped up by {}", id, request.getAmount());
        return toResponse(walletRepository.save(wallet));
    }

    private Wallet getOrThrow(Long id) {
        return walletRepository.findById(id)
                .orElseThrow(() -> new ApiException("Wallet not found: " + id, HttpStatus.NOT_FOUND));
    }

    private WalletDTO.WalletResponse toResponse(Wallet w) {
        WalletDTO.WalletResponse r = new WalletDTO.WalletResponse();
        r.setId(w.getId());
        r.setOwnerId(w.getOwnerId());
        r.setBalance(w.getBalance());
        r.setCurrency(w.getCurrency());
        r.setStatus(w.getStatus());
        r.setDailyLimit(w.getDailyLimit());
        r.setCreatedAt(w.getCreatedAt());
        r.setUpdatedAt(w.getUpdatedAt());
        return r;
    }
}
