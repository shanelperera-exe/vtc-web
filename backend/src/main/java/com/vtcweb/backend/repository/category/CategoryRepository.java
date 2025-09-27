package com.vtcweb.backend.repository.category;

import com.vtcweb.backend.model.entity.category.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Category entities.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    /**
     * Find a category by name, case-insensitive.
     * @param name the category name
     * @return Optional containing the found category, if any
     */
    Optional<Category> findByNameIgnoreCase(String name);

    /**
     * Check if a category exists by name, case-insensitive.
     * @param name the category name
     * @return true if exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Fetch all categories paged.
     * Recommended for large datasets.
     * @param pageable paging information
     * @return page of categories
     */
    Page<Category> findAll(Pageable pageable);
}
