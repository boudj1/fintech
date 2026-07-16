package com.enterprise.api.fintech.repository;

import com.enterprise.api.fintech.model.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
}
