package com.enterprise.api.fintech.repository;

import com.enterprise.api.fintech.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByCategoryAscNameAsc();
    List<Product> findByCategoryAndActiveTrue(Product.ProductCategory category);
    Optional<Product> findByCode(String code);
    boolean existsByCode(String code);
}
