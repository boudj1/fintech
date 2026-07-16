package com.enterprise.api.fintech.service;

import com.enterprise.api.fintech.model.dto.ProductDTO;
import com.enterprise.api.fintech.model.entity.Product;
import com.enterprise.api.fintech.model.entity.UserProduct;
import com.enterprise.api.fintech.repository.ProductRepository;
import com.enterprise.api.fintech.repository.UserProductRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final UserProductRepository userProductRepository;

    public List<ProductDTO.Response> getActiveCatalog() {
        return productRepository.findByActiveTrueOrderByCategoryAscNameAsc()
                .stream().map(this::toResponse).toList();
    }

    public List<ProductDTO.Response> getByCategory(String category) {
        Product.ProductCategory cat = Product.ProductCategory.valueOf(category.toUpperCase());
        return productRepository.findByCategoryAndActiveTrue(cat)
                .stream().map(this::toResponse).toList();
    }

    public List<ProductDTO.SubscriptionResponse> getUserProducts(Long userId) {
        return userProductRepository.findByUserId(userId)
                .stream().map(this::toSubscriptionResponse).toList();
    }

    @Transactional
    public ProductDTO.SubscriptionResponse subscribe(Long userId, Long productId) {
        if (userProductRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ApiException("Already subscribed to this product", HttpStatus.CONFLICT, "ALREADY_SUBSCRIBED");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        if (!product.isActive()) {
            throw new ApiException("Product is not available", HttpStatus.BAD_REQUEST, "PRODUCT_UNAVAILABLE");
        }

        UserProduct up = new UserProduct();
        up.setUserId(userId);
        up.setProduct(product);

        log.info("User {} subscribed to product {}", userId, product.getCode());
        return toSubscriptionResponse(userProductRepository.save(up));
    }

    @Transactional
    public void unsubscribe(Long userId, Long productId) {
        UserProduct up = userProductRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ApiException("Subscription not found", HttpStatus.NOT_FOUND));
        up.setStatus(UserProduct.UserProductStatus.CANCELLED);
        userProductRepository.save(up);
        log.info("User {} unsubscribed from product {}", userId, productId);
    }

    // Admin operations
    @Transactional
    public ProductDTO.Response createProduct(ProductDTO.CreateRequest request) {
        if (productRepository.existsByCode(request.getCode())) {
            throw new ApiException("Product code already exists", HttpStatus.CONFLICT, "PRODUCT_CODE_DUPLICATE");
        }
        Product p = new Product();
        p.setCode(request.getCode());
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        p.setCategory(request.getCategory());
        p.setMonthlyFee(request.getMonthlyFee());
        p.setFeatures(request.getFeatures());

        log.info("Product created | code={}", request.getCode());
        return toResponse(productRepository.save(p));
    }

    @Transactional
    public ProductDTO.Response updateProduct(Long id, ProductDTO.UpdateRequest request) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        if (request.getName() != null) p.setName(request.getName());
        if (request.getDescription() != null) p.setDescription(request.getDescription());
        if (request.getMonthlyFee() != null) p.setMonthlyFee(request.getMonthlyFee());
        if (request.getFeatures() != null) p.setFeatures(request.getFeatures());
        if (request.getActive() != null) p.setActive(request.getActive());

        return toResponse(productRepository.save(p));
    }

    private ProductDTO.Response toResponse(Product p) {
        ProductDTO.Response r = new ProductDTO.Response();
        r.setId(p.getId());
        r.setCode(p.getCode());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setCategory(p.getCategory().name());
        r.setMonthlyFee(p.getMonthlyFee());
        r.setFeatures(p.getFeatureList());
        r.setActive(p.isActive());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }

    private ProductDTO.SubscriptionResponse toSubscriptionResponse(UserProduct up) {
        ProductDTO.SubscriptionResponse r = new ProductDTO.SubscriptionResponse();
        r.setId(up.getId());
        r.setUserId(up.getUserId());
        r.setProduct(toResponse(up.getProduct()));
        r.setStatus(up.getStatus().name());
        r.setSubscribedAt(up.getSubscribedAt());
        r.setExpiresAt(up.getExpiresAt());
        return r;
    }
}
