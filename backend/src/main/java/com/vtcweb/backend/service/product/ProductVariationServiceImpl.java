package com.vtcweb.backend.service.product;

import com.vtcweb.backend.exception.ConflictException;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import com.vtcweb.backend.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariationServiceImpl implements ProductVariationService {

    private final ProductVariationRepository variationRepository;
    private final ProductRepository productRepository;

    @Override
    public ProductVariation create(Long productId, ProductVariation variation) {
        if (productId == null)
            throw new IllegalArgumentException("productId must not be null");
        if (variation == null)
            throw new IllegalArgumentException("variation must not be null");
        if (variation.getPrice() != null && variation.getPrice().signum() < 0) {
            throw new IllegalArgumentException("variation.price must be >= 0");
        }
        if (variation.getStock() != null && variation.getStock() < 0) {
            throw new IllegalArgumentException("variation.stock must be >= 0");
        }
        if (variation.getAttributes() == null || variation.getAttributes().isEmpty()) {
            throw new IllegalArgumentException("variation.attributes must not be empty");
        }
        String derivedKey = Mapper.buildVariationKey(variation.getAttributes());
        if (derivedKey == null || derivedKey.isBlank()) {
            throw new IllegalArgumentException("variation.attributes contain no valid entries");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + productId));
        if (variationRepository.existsByProductIdAndVariationKey(product.getId(), derivedKey)) {
            throw new ConflictException("Variation already exists for product with same attributes");
        }
        variation.setId(null);
        variation.setProduct(product);
        variation.setVariationKey(derivedKey);
        return variationRepository.save(variation);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariation getById(Long id) {
        return variationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ProductVariation not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductVariation> getByProductAndKey(Long productId, String variationKey) {
        return variationRepository.findByProductIdAndVariationKey(productId, variationKey);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductVariation> listByProduct(Long productId, Pageable pageable) {
        return variationRepository.findByProductId(productId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariation> listByProduct(Long productId) {
        return variationRepository.findByProductId(productId);
    }

    @Override
    @NonNull
    public ProductVariation update(Long id, ProductVariation updates) {
        if (updates == null)
            throw new IllegalArgumentException("updates must not be null");
        ProductVariation existing = getById(id);
        boolean attributesUpdated = false;
        // attributes replacement
        if (updates.getAttributes() != null) {
            if (updates.getAttributes().isEmpty()) {
                throw new IllegalArgumentException("variation.attributes must not be empty");
            }
            attributesUpdated = true;
            existing.setAttributes(updates.getAttributes());
        }
        // recompute and validate key if attributes changed
        if (attributesUpdated) {
            String newKey = Mapper.buildVariationKey(existing.getAttributes());
            if (newKey == null || newKey.isBlank()) {
                throw new IllegalArgumentException("variation.attributes contain no valid entries");
            }
            if (!newKey.equals(existing.getVariationKey())
                    && variationRepository.existsByProductIdAndVariationKey(existing.getProduct().getId(), newKey)) {
                throw new ConflictException("Variation already exists for product with same attributes");
            }
            existing.setVariationKey(newKey);
        }
        // price
        if (updates.getPrice() != null) {
            if (updates.getPrice().signum() < 0)
                throw new IllegalArgumentException("price must be >= 0");
            existing.setPrice(updates.getPrice());
        }
        // stock
        if (updates.getStock() != null) {
            if (updates.getStock() < 0)
                throw new IllegalArgumentException("stock must be >= 0");
            existing.setStock(updates.getStock());
        }
        // image url
        if (updates.getImageUrl() != null)
            existing.setImageUrl(updates.getImageUrl());
        // ignore updates.getVariationKey(); key is derived from attributes
        ProductVariation saved = variationRepository.save(existing);
        if (saved == null) {
            throw new IllegalStateException("Failed to save ProductVariation");
        }
        return saved;
    }

    @Override
    public void delete(Long id) {
        ProductVariation existing = getById(id);
        variationRepository.delete(existing);
    }
}
