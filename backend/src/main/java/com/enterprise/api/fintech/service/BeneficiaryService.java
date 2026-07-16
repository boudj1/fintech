package com.enterprise.api.fintech.service;

import com.enterprise.api.fintech.model.dto.BeneficiaryDTO;
import com.enterprise.api.fintech.model.entity.Beneficiary;
import com.enterprise.api.fintech.repository.BeneficiaryRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;

    public List<BeneficiaryDTO.Response> getByOwner(Long ownerId) {
        return beneficiaryRepository.findByOwnerIdOrderByNameAsc(ownerId)
                .stream().map(this::toResponse).toList();
    }

    public List<BeneficiaryDTO.Response> getActiveByOwner(Long ownerId) {
        return beneficiaryRepository.findByOwnerIdAndActiveTrue(ownerId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public BeneficiaryDTO.Response create(Long ownerId, BeneficiaryDTO.CreateRequest request) {
        if (request.getIban() != null && beneficiaryRepository.existsByOwnerIdAndIban(ownerId, request.getIban())) {
            throw new ApiException("Beneficiary with this IBAN already exists", HttpStatus.CONFLICT, "BENEFICIARY_DUPLICATE");
        }

        Beneficiary b = new Beneficiary();
        b.setOwnerId(ownerId);
        b.setName(request.getName());
        b.setIban(request.getIban());
        b.setAccountNumber(request.getAccountNumber());
        b.setBankName(request.getBankName());
        b.setBankCode(request.getBankCode());
        b.setCurrency(request.getCurrency());

        log.info("Beneficiary created | owner={} name={}", ownerId, request.getName());
        return toResponse(beneficiaryRepository.save(b));
    }

    @Transactional
    public BeneficiaryDTO.Response update(Long id, Long ownerId, BeneficiaryDTO.UpdateRequest request) {
        Beneficiary b = getOwnedOrThrow(id, ownerId);

        if (request.getName() != null) b.setName(request.getName());
        if (request.getIban() != null) b.setIban(request.getIban());
        if (request.getAccountNumber() != null) b.setAccountNumber(request.getAccountNumber());
        if (request.getBankName() != null) b.setBankName(request.getBankName());
        if (request.getCurrency() != null) b.setCurrency(request.getCurrency());
        if (request.getActive() != null) b.setActive(request.getActive());

        return toResponse(beneficiaryRepository.save(b));
    }

    @Transactional
    public void delete(Long id, Long ownerId) {
        Beneficiary b = getOwnedOrThrow(id, ownerId);
        b.setActive(false);
        beneficiaryRepository.save(b);
        log.info("Beneficiary deactivated | id={} owner={}", id, ownerId);
    }

    private Beneficiary getOwnedOrThrow(Long id, Long ownerId) {
        Beneficiary b = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Beneficiary not found", HttpStatus.NOT_FOUND));
        if (!b.getOwnerId().equals(ownerId)) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        return b;
    }

    private BeneficiaryDTO.Response toResponse(Beneficiary b) {
        BeneficiaryDTO.Response r = new BeneficiaryDTO.Response();
        r.setId(b.getId());
        r.setOwnerId(b.getOwnerId());
        r.setName(b.getName());
        r.setIban(b.getIban());
        r.setAccountNumber(b.getAccountNumber());
        r.setBankName(b.getBankName());
        r.setBankCode(b.getBankCode());
        r.setCurrency(b.getCurrency());
        r.setActive(b.isActive());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}
