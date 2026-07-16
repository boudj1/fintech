package com.enterprise.api.fintech.controller;

import com.enterprise.api.fintech.model.dto.WalletDTO;
import com.enterprise.api.fintech.service.WalletService;
import com.enterprise.core.constants.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/fintech/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping
    public ResponseEntity<WalletDTO.WalletResponse> create(@Valid @RequestBody WalletDTO.CreateWalletRequest request) {
        return ResponseEntity.ok(walletService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalletDTO.WalletResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(walletService.findById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<WalletDTO.WalletResponse> findByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(walletService.findByOwner(ownerId));
    }

    @PostMapping("/{id}/top-up")
    public ResponseEntity<WalletDTO.WalletResponse> topUp(
            @PathVariable Long id,
            @Valid @RequestBody WalletDTO.TopUpRequest request) {
        return ResponseEntity.ok(walletService.topUp(id, request));
    }
}
