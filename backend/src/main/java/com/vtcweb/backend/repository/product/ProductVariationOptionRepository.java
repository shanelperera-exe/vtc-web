package com.vtcweb.backend.repository.product;

import com.vtcweb.backend.model.entity.product.ProductVariationOption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ProductVariationOption entities.
 */
@Repository
public interface ProductVariationOptionRepository extends JpaRepository<ProductVariationOption, Long> {

    /**
     * Find variation options by variation type ID.
     * Use with caution for large datasets.
     * @param variationTypeId the variation type ID
     * @return list of variation options
     */
    List<ProductVariationOption> findByVariationTypeId(Long variationTypeId);

    /**
     * Find variation options by variation type ID, paged.
     * Recommended for large datasets.
     * @param variationTypeId the variation type ID
     * @param pageable paging information
     * @return page of variation options
     */
    Page<ProductVariationOption> findByVariationTypeId(Long variationTypeId, Pageable pageable);

    /**
     * Check if a variation option exists by variation type ID and value (case-insensitive).
     * @param variationTypeId the variation type ID
     * @param value the option value
     * @return true if exists, false otherwise
     */
    boolean existsByVariationTypeIdAndValueIgnoreCase(Long variationTypeId, String value);
}
