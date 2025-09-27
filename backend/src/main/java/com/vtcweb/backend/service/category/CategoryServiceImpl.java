package com.vtcweb.backend.service.category;

import com.vtcweb.backend.exception.ConflictException;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.repository.category.CategoryRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public Category create(Category category) {
        if (category == null) throw new IllegalArgumentException("category must not be null");
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("category.name must not be blank");
        }
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new ConflictException("Category name already exists: " + category.getName());
        }
        // Ensure id is null so JPA treats it as new
        category.setId(null);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Category> list(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    @Override
    public Category update(Long id, Category updates) {
        if (updates == null) throw new IllegalArgumentException("updates must not be null");
        Category existing = getById(id);
        // Name
        if (updates.getName() != null && !updates.getName().isBlank()) {
            String newName = updates.getName();
            if (!newName.equalsIgnoreCase(existing.getName())
                    && categoryRepository.existsByNameIgnoreCase(newName)) {
                throw new ConflictException("Category name already exists: " + newName);
            }
            existing.setName(newName);
        }
        // Description and image fields
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategoryImage() != null) existing.setCategoryImage(updates.getCategoryImage());
        if (updates.getCategoryIcon() != null) existing.setCategoryIcon(updates.getCategoryIcon());
        if (updates.getCarouselImage() != null) existing.setCarouselImage(updates.getCarouselImage());
        return categoryRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Category existing = getById(id);
        if (productRepository.existsByCategory_Id(existing.getId())) {
            throw new ConflictException("Cannot delete category with existing products: id=" + id);
        }
        categoryRepository.deleteById(id);
    }
}
