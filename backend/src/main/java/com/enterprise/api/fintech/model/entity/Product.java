package com.enterprise.api.fintech.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Column(name = "monthly_fee", precision = 10, scale = 2)
    private BigDecimal monthlyFee = BigDecimal.ZERO;

    /** Comma-separated list of feature labels. */
    @Column(columnDefinition = "TEXT")
    private String features;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public List<String> getFeatureList() {
        if (features == null || features.isBlank()) return List.of();
        return Arrays.asList(features.split(","));
    }

    public enum ProductCategory {
        ACCOUNT, SAVINGS, CARD, TRANSFER, BUSINESS
    }
}
