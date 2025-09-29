package com.vtcweb.backend.repository.product;

import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductImage.ImageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository for ProductImage entities.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /**
     * Find images by product ID.
     * Use with caution for large datasets.
     * @param productId the product ID
     * @return list of images
     */
    List<ProductImage> findByProductId(Long productId);

    /**
     * Find images by product ID, paged.
     * Recommended for large datasets.
     * @param productId the product ID
     * @param pageable paging information
     * @return page of images
     */
    Page<ProductImage> findByProductId(Long productId, Pageable pageable);

    /**
     * Find images by product ID and type.
     * @param productId the product ID
     * @param type the image type
     * @return list of images
     */
    List<ProductImage> findByProductIdAndType(Long productId, ImageType type);

    /**
     * Find images by product ID and type, paged.
     * @param productId the product ID
     * @param type the image type
     * @param pageable paging information
     * @return page of images
     */
    Page<ProductImage> findByProductIdAndType(Long productId, ImageType type, Pageable pageable);

    /**
     * Find images by variation ID.
     * @param variationId the variation ID
     * @return list of images
     */
    List<ProductImage> findByVariationId(Long variationId);

    /**
     * Find images by variation ID, paged.
     * @param variationId the variation ID
     * @param pageable paging information
     * @return page of images
     */
    Page<ProductImage> findByVariationId(Long variationId, Pageable pageable);

    /**
     * Delete images by product ID.
     * This method modifies data and therefore must be annotated with @Modifying and @Transactional.
     * @param productId the product ID
     * @return number of images deleted
     */
    @Modifying
    @Transactional
    int deleteByProductId(Long productId);
}
