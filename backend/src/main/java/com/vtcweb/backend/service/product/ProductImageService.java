package com.vtcweb.backend.service.product;

import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductImage.ImageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Service contract for product images. */
public interface ProductImageService {

    ProductImage addToProduct(Long productId, String url, ImageType type);

    ProductImage addToVariation(Long productId, Long variationId, String url, ImageType type);

    ProductImage getById(Long id);

    Page<ProductImage> listByProduct(Long productId, Pageable pageable);

    Page<ProductImage> listByVariation(Long variationId, Pageable pageable);

    ProductImage update(Long id, String url, ImageType type);

    void delete(Long id);

    /** Bulk delete by product. Returns number of deleted images. */
    int deleteByProduct(Long productId);
}

