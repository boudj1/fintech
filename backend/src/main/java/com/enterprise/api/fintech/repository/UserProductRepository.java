package com.enterprise.api.fintech.repository;

import com.enterprise.api.fintech.model.entity.UserProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProductRepository extends JpaRepository<UserProduct, Long> {
    List<UserProduct> findByUserIdAndStatus(Long userId, UserProduct.UserProductStatus status);
    List<UserProduct> findByUserId(Long userId);
    Optional<UserProduct> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    long countByStatus(UserProduct.UserProductStatus status);
}
