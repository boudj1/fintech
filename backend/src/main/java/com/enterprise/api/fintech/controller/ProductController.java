package com.enterprise.api.fintech.controller;

import com.enterprise.api.fintech.model.dto.ProductDTO;
import com.enterprise.api.fintech.service.ProductService;
import com.enterprise.core.constants.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Constants.API_V1 + "/fintech/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductDTO.Response> getCatalog() {
        return productService.getActiveCatalog();
    }

    @GetMapping("/category/{category}")
    public List<ProductDTO.Response> getByCategory(@PathVariable String category) {
        return productService.getByCategory(category);
    }

    @GetMapping("/subscriptions/{userId}")
    public List<ProductDTO.SubscriptionResponse> getUserSubscriptions(@PathVariable Long userId) {
        return productService.getUserProducts(userId);
    }

    @PostMapping("/subscriptions/{userId}")
    public ResponseEntity<ProductDTO.SubscriptionResponse> subscribe(
            @PathVariable Long userId,
            @RequestBody ProductDTO.SubscribeRequest request) {
        return ResponseEntity.ok(productService.subscribe(userId, request.getProductId()));
    }

    @DeleteMapping("/subscriptions/{userId}/{productId}")
    public ResponseEntity<Void> unsubscribe(@PathVariable Long userId, @PathVariable Long productId) {
        productService.unsubscribe(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
