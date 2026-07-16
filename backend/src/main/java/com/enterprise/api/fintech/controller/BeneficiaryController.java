package com.enterprise.api.fintech.controller;

import com.enterprise.api.fintech.model.dto.BeneficiaryDTO;
import com.enterprise.api.fintech.service.BeneficiaryService;
import com.enterprise.core.constants.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Constants.API_V1 + "/fintech/beneficiaries")
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @GetMapping("/owner/{ownerId}")
    public List<BeneficiaryDTO.Response> getByOwner(@PathVariable Long ownerId) {
        return beneficiaryService.getByOwner(ownerId);
    }

    @GetMapping("/owner/{ownerId}/active")
    public List<BeneficiaryDTO.Response> getActiveByOwner(@PathVariable Long ownerId) {
        return beneficiaryService.getActiveByOwner(ownerId);
    }

    @PostMapping("/owner/{ownerId}")
    public ResponseEntity<BeneficiaryDTO.Response> create(
            @PathVariable Long ownerId,
            @Valid @RequestBody BeneficiaryDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(beneficiaryService.create(ownerId, request));
    }

    @PutMapping("/{id}/owner/{ownerId}")
    public BeneficiaryDTO.Response update(
            @PathVariable Long id,
            @PathVariable Long ownerId,
            @Valid @RequestBody BeneficiaryDTO.UpdateRequest request) {
        return beneficiaryService.update(id, ownerId, request);
    }

    @DeleteMapping("/{id}/owner/{ownerId}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @PathVariable Long ownerId) {
        beneficiaryService.delete(id, ownerId);
        return ResponseEntity.noContent().build();
    }
}
