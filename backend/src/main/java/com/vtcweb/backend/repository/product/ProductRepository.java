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
 * Keep methods un-annotated with @Transactional at the interface level so write
 * operations work.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> { // JpaRepository provides CRUD operations for
                                                                          // Product entity with Long as ID type

    /**
     * Check if a product exists by name (case insensitive).
     * 
     * @param name the product name
     * @return true if exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name); // Check if a product exists by name (case insensitive)

    /**
     * Find products by category ID with pagination support.
     * 
     * @param categoryId the category ID
     * @param pageable   pagination information
     * @return paged products in the category
     */
    Page<Product> findByCategory_Id(Long categoryId, Pageable pageable); // Find products by category ID with pagination
                                                                         // support

    Page<Product> findByCategory_IdAndStatus(Long categoryId,
            com.vtcweb.backend.model.entity.product.ProductStatus status, Pageable pageable);

    /**
     * Find products by name containing substring (case insensitive), paged.
     * 
     * @param name     the substring to search for
     * @param pageable pagination information
     * @return paged products matching the name
     */
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable); //

    Page<Product> findByNameContainingIgnoreCaseAndStatus(String name,
            com.vtcweb.backend.model.entity.product.ProductStatus status, Pageable pageable);

    /** List by status only. */
    Page<Product> findByStatus(com.vtcweb.backend.model.entity.product.ProductStatus status, Pageable pageable);

    /**
     * Multi-field search: name, shortDescription, category.name containing the
     * query (case-insensitive),
     * or description containing the query (case-sensitive to avoid CLOB + UPPER
     * issues on some DBs like H2).
     */
    Page<Product> findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCaseOrCategory_NameContainingIgnoreCaseOrDetailedDescriptionContaining(
            String name,
            String shortDescription,
            String categoryName,
            String detailedDescription,
            Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCaseOrCategory_NameContainingIgnoreCaseOrDetailedDescriptionContainingAndStatus(
            String name,
            String shortDescription,
            String categoryName,
            String detailedDescription,
            com.vtcweb.backend.model.entity.product.ProductStatus status,
            Pageable pageable);

    /**
     * Find a product by ID with its related details eagerly loaded, including
     * variation attributes.
     * 
     * @param id the product ID
     * @return Optional containing the product with details, if found
     */
    @EntityGraph(attributePaths = { "category", "images", "variations",
            "variations.attributes" }, type = EntityGraph.EntityGraphType.LOAD)
    Optional<Product> findOneById(Long id); // Valid derived query name

    /**
     * Check if any products exist for a given category.
     * 
     * @param categoryId the category ID
     * @return true if products exist, false otherwise
     */
    boolean existsByCategory_Id(Long categoryId);

    /**
     * Count products for a given category ID.
     * 
     * @param categoryId the category ID
     * @return number of products in the category
     */
    long countByCategory_Id(Long categoryId);

    /**
     * Check existence by SKU.
     */
    boolean existsBySku(String sku);

    /** Find by SKU. */
    Optional<Product> findBySku(String sku);

    /** Find the latest SKU within a category prefix. */
    Optional<Product> findTopByCategory_IdAndSkuStartingWithOrderBySkuDesc(Long categoryId, String skuPrefix);

    // --- Stock-aware queries ---
    // In-stock = at least one variation with stock > 0
    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) > 0")
    Page<Product> findInStock(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v where p.status = :status group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) > 0")
    Page<Product> findInStockByStatus(
            @org.springframework.data.repository.query.Param("status") com.vtcweb.backend.model.entity.product.ProductStatus status,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v where p.category.id = :categoryId group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) > 0")
    Page<Product> findInStockByCategory(@org.springframework.data.repository.query.Param("categoryId") Long categoryId,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v where p.category.id = :categoryId and p.status = :status group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) > 0")
    Page<Product> findInStockByCategoryAndStatus(
            @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
            @org.springframework.data.repository.query.Param("status") com.vtcweb.backend.model.entity.product.ProductStatus status,
            Pageable pageable);

    // Out-of-stock = no variations with stock > 0 (including products with zero
    // variations)
    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) = 0")
    Page<Product> findOutOfStock(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v where p.status = :status group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) = 0")
    Page<Product> findOutOfStockByStatus(
            @org.springframework.data.repository.query.Param("status") com.vtcweb.backend.model.entity.product.ProductStatus status,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v where p.category.id = :categoryId group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) = 0")
    Page<Product> findOutOfStockByCategory(
            @org.springframework.data.repository.query.Param("categoryId") Long categoryId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select p from Product p left join p.variations v where p.category.id = :categoryId and p.status = :status group by p having coalesce(sum(case when v.stock > 0 then 1 else 0 end),0) = 0")
    Page<Product> findOutOfStockByCategoryAndStatus(
            @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
            @org.springframework.data.repository.query.Param("status") com.vtcweb.backend.model.entity.product.ProductStatus status,
            Pageable pageable);
}
