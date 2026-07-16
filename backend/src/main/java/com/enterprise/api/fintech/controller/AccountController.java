package com.enterprise.api.fintech.controller;

import com.enterprise.api.fintech.model.dto.AccountDTO;
import com.enterprise.api.fintech.service.AccountService;
import com.enterprise.core.constants.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/fintech/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AccountDTO.AccountResponse> create(@Valid @RequestBody AccountDTO.CreateAccountRequest request) {
        return ResponseEntity.ok(accountService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<AccountDTO.AccountResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(accountService.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO.AccountResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AccountDTO.AccountResponse> update(
            @PathVariable Long id,
            @RequestBody AccountDTO.UpdateAccountRequest request) {
        return ResponseEntity.ok(accountService.update(id, request));
    }

    @GetMapping("/stats")
    public ResponseEntity<AccountDTO.AccountStats> getStats() {
        return ResponseEntity.ok(accountService.getStats());
    }
}
