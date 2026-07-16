package com.enterprise.api.fintech.controller;

import com.enterprise.api.fintech.model.dto.TransactionDTO;
import com.enterprise.api.fintech.service.TransactionService;
import com.enterprise.core.constants.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/fintech/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDTO.TransactionResponse> create(
            @Valid @RequestBody TransactionDTO.CreateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionDTO.TransactionResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(transactionService.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO.TransactionResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<TransactionDTO.TransactionStats> getStats() {
        return ResponseEntity.ok(transactionService.getStats());
    }
}
