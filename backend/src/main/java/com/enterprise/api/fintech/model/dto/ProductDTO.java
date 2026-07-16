package com.enterprise.api.fintech.model.dto;

import com.enterprise.api.fintech.model.entity.Product;
import com.enterprise.api.fintech.model.entity.UserProduct;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDTO {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String code;

        @NotBlank
        private String name;

        private String description;

        @NotNull
        private Product.ProductCategory category;

        private BigDecimal monthlyFee = BigDecimal.ZERO;

        /** Comma-separated features (e.g. "IBAN DZ,Virements illimités"). */
        private String features;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private String description;
        private BigDecimal monthlyFee;
        private String features;
        private Boolean active;
    }

    @Data
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private String description;
        private String category;
        private BigDecimal monthlyFee;
        private List<String> features;
        private boolean active;
        private LocalDateTime createdAt;
    }

    @Data
    public static class SubscriptionResponse {
        private Long id;
        private Long userId;
        private Response product;
        private String status;
        private LocalDateTime subscribedAt;
        private LocalDateTime expiresAt;
    }

    @Data
    public static class SubscribeRequest {
        @NotNull
        private Long productId;
    }
}
