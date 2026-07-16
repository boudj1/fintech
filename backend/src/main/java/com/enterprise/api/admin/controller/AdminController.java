package com.enterprise.api.admin.controller;

import com.enterprise.api.admin.model.dto.CustomerDTO;
import com.enterprise.api.admin.model.entity.Customer;
import com.enterprise.api.admin.service.AdminService;
import com.enterprise.core.constants.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/admin/customers")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPERVISOR', 'AGENT')")
    public ResponseEntity<CustomerDTO.CustomerResponse> createCustomer(
            @Valid @RequestBody CustomerDTO.CreateCustomerRequest request) {
        return ResponseEntity.ok(adminService.createCustomer(request));
    }

    @GetMapping
    public ResponseEntity<Page<CustomerDTO.CustomerResponse>> findAllCustomers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Customer.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.findAllCustomers(query, status,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO.CustomerResponse> findCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.findCustomerById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPERVISOR')")
    public ResponseEntity<CustomerDTO.CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @RequestBody CustomerDTO.UpdateCustomerRequest request) {
        return ResponseEntity.ok(adminService.updateCustomer(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        adminService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<CustomerDTO.CustomerStats> getCustomerStats() {
        return ResponseEntity.ok(adminService.getCustomerStats());
    }
}
