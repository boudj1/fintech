package com.enterprise.api.fintech.repository;

import com.enterprise.api.fintech.model.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByOwnerIdOrderByNameAsc(Long ownerId);
    List<Beneficiary> findByOwnerIdAndActiveTrue(Long ownerId);
    boolean existsByOwnerIdAndIban(Long ownerId, String iban);
    long countByOwnerIdAndActiveTrue(Long ownerId);
}
