package com.vtcweb.backend.service.product;

import com.vtcweb.backend.model.entity.product.ProductVariation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductVariationService {

    ProductVariation create(Long productId, ProductVariation variation);

    ProductVariation getById(Long id);

    Optional<ProductVariation> getByProductAndKey(Long productId, String variationKey);

    Page<ProductVariation> listByProduct(Long productId, Pageable pageable);

    List<ProductVariation> listByProduct(Long productId);

    ProductVariation update(Long id, ProductVariation updates);

    void delete(Long id);
}
