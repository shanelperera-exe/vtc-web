package com.vtcweb.backend.repository.product;

import com.vtcweb.backend.model.entity.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Product entities.
 * Keep methods un-annotated with @Transactional at the interface level so write operations work.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> { // JpaRepository provides CRUD operations for Product entity with Long as ID type

    /**
     * Check if a product exists by name (case insensitive).
     * @param name the product name
     * @return true if exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name);  // Check if a product exists by name (case insensitive)

    /**
     * Find products by category ID with pagination support.
     * @param categoryId the category ID
     * @param pageable pagination information
     * @return paged products in the category
     */
    Page<Product> findByCategory_Id(Long categoryId, Pageable pageable);  // Find products by category ID with pagination support

    /**
     * Find products by name containing substring (case insensitive), paged.
     * @param name the substring to search for
     * @param pageable pagination information
     * @return paged products matching the name
     */
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);   //

    /**
     * Multi-field search: name, shortDescription, category.name containing the query (case-insensitive),
     * or description containing the query (case-sensitive to avoid CLOB + UPPER issues on some DBs like H2).
     */
    Page<Product> findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCaseOrCategory_NameContainingIgnoreCaseOrDescriptionContaining(
            String name,
            String shortDescription,
            String categoryName,
            String description,
            Pageable pageable);

    /**
     * Find a product by ID with its related details eagerly loaded, including variation attributes.
     * @param id the product ID
     * @return Optional containing the product with details, if found
     */
    @EntityGraph(attributePaths = {"category", "images", "variations", "variations.attributes"}, type = EntityGraph.EntityGraphType.LOAD)
    Optional<Product> findOneById(Long id);  // Valid derived query name

    /**
     * Check if any products exist for a given category.
     * @param categoryId the category ID
     * @return true if products exist, false otherwise
     */
    boolean existsByCategory_Id(Long categoryId);
}
