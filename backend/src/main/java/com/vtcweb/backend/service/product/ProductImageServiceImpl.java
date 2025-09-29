package com.vtcweb.backend.service.product;

import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductImage.ImageType;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.repository.product.ProductImageRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;

    @Override
    public ProductImage addToProduct(Long productId, String url, ImageType type) {
        if (url == null || url.isBlank()) throw new IllegalArgumentException("url must not be blank");
        if (type == null) type = ImageType.SECONDARY;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + productId));
        ProductImage image = ProductImage.builder()
                .product(product)
                .url(url)
                .type(type)
                .build();
        return imageRepository.save(image);
    }

    @Override
    public ProductImage addToVariation(Long productId, Long variationId, String url, ImageType type) {
        if (url == null || url.isBlank()) throw new IllegalArgumentException("url must not be blank");
        if (type == null) type = ImageType.SECONDARY;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + productId));
        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new NotFoundException("Variation not found: id=" + variationId));
        if (!variation.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Variation does not belong to product");
        }
        ProductImage image = ProductImage.builder()
                .product(product)
                .variation(variation)
                .url(url)
                .type(type)
                .build();
        return imageRepository.save(image);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductImage getById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ProductImage not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductImage> listByProduct(Long productId, Pageable pageable) {
        return imageRepository.findByProductId(productId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductImage> listByVariation(Long variationId, Pageable pageable) {
        return imageRepository.findByVariationId(variationId, pageable);
    }

    @Override
    public ProductImage update(Long id, String url, ImageType type) {
        ProductImage existing = getById(id);
        if (url != null && !url.isBlank()) existing.setUrl(url);
        if (type != null) existing.setType(type);
        return imageRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        ProductImage existing = getById(id);
        imageRepository.delete(existing);
    }

    @Override
    public int deleteByProduct(Long productId) {
        return imageRepository.deleteByProductId(productId);
    }
}

