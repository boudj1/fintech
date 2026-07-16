package com.enterprise.api.admin.controller;

import com.enterprise.api.fintech.model.dto.ProductDTO;
import com.enterprise.api.fintech.service.ProductService;
import com.enterprise.core.constants.Constants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Constants.API_V1 + "/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class ProductManagementController {

    private final ProductService productService;

    @GetMapping
    public List<ProductDTO.Response> listAll() {
        return productService.getActiveCatalog();
    }

    @PostMapping
    public ResponseEntity<ProductDTO.Response> create(@Valid @RequestBody ProductDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ProductDTO.Response update(@PathVariable Long id, @RequestBody ProductDTO.UpdateRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        ProductDTO.UpdateRequest req = new ProductDTO.UpdateRequest();
        req.setActive(false);
        productService.updateProduct(id, req);
        return ResponseEntity.noContent().build();
    }
}
