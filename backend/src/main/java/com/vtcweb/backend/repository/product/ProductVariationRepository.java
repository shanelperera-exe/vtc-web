package com.vtcweb.backend.repository.product;

import com.vtcweb.backend.model.entity.product.ProductVariation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, Long> {

    /**
     * Fetch variations for a product with attributes eagerly loaded.
     * Use paging to avoid loading large collections into memory.
     */
    @EntityGraph(attributePaths = { "attributes" }, type = EntityGraph.EntityGraphType.LOAD)
    Page<ProductVariation> findByProductId(Long productId, Pageable pageable);

    /**
     * Convenience method for small result sets or when paging is not required.
     */
    @EntityGraph(attributePaths = { "attributes" }, type = EntityGraph.EntityGraphType.LOAD)
    List<ProductVariation> findByProductId(Long productId);

    /**
     * Find a specific variation by product and variation id with attributes
     * fetched.
     */
    @EntityGraph(attributePaths = { "attributes" }, type = EntityGraph.EntityGraphType.LOAD)
    Optional<ProductVariation> findByProductIdAndId(Long productId, Long id);

    /**
     * Find variation by product and variation key (unique within a product).
     * Consider enforcing uniqueness at the DB level for (product_id,
     * variation_key).
     */
    @EntityGraph(attributePaths = { "attributes" }, type = EntityGraph.EntityGraphType.LOAD)
    Optional<ProductVariation> findByProductIdAndVariationKey(Long productId, String variationKey);

    /**
     * Existence check for (product, variationKey) pair.
     */
    boolean existsByProductIdAndVariationKey(Long productId, String variationKey);

    /**
     * Lock a variation row for update to safely decrement stock in checkout.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProductVariation> findWithLockingById(Long id);
}
