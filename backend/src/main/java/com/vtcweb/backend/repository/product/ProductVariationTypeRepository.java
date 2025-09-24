package com.vtcweb.backend.repository.product;

import com.vtcweb.backend.model.entity.product.ProductVariationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ProductVariationType entities.
 */
@Repository
public interface ProductVariationTypeRepository extends JpaRepository<ProductVariationType, Long> {

    /**
     * Find a variation type by name, case-insensitive.
     * @param name the name to search for
     * @return Optional containing the found entity, if any
     */
    Optional<ProductVariationType> findByNameIgnoreCase(String name);

    /**
     * Check if a variation type exists by name, case-insensitive.
     * @param name the name to check
     * @return true if exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Fetch all variation types with their options eagerly loaded.
     * Note: override the default findAll to attach an EntityGraph.
     */
    @Override
    @EntityGraph(attributePaths = {"options"}, type = EntityGraph.EntityGraphType.LOAD)
    List<ProductVariationType> findAll();

    /**
     * Fetch all variation types with their options eagerly loaded, paged.
     */
    @Override
    @EntityGraph(attributePaths = {"options"}, type = EntityGraph.EntityGraphType.LOAD)
    Page<ProductVariationType> findAll(Pageable pageable);
}
