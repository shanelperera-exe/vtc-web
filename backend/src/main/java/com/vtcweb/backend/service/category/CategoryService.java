package com.vtcweb.backend.service.category;

import com.vtcweb.backend.model.entity.category.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service contract for category management.
 */
public interface CategoryService {

    Category create(Category category);

    Category getById(Long id);

    Page<Category> list(Pageable pageable);

    Category update(Long id, Category updates);

    void delete(Long id);
}
