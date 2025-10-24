package com.vtcweb.backend.controller.category;

import com.vtcweb.backend.dto.category.CategoryDTO;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.service.category.CategoryService;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductRepository productRepository;

    /**
     * Create a new category.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CategoryDTO> create(@RequestBody CategoryDTO request) {
        Category toCreate = Mapper.toEntity(request);
        Category created = categoryService.create(toCreate);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(Mapper.toDto(created));
    }

    /**
     * Retrieve category by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(Mapper.toDto(categoryService.getById(id)));
    }

    /**
     * List categories with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<CategoryDTO>> list(Pageable pageable) {
        Page<CategoryDTO> page = categoryService.list(pageable).map(c -> {
            CategoryDTO dto = Mapper.toDto(c);
            // Avoid touching lazy collection; use repository count instead.
            try {
                long count = productRepository.countByCategory_Id(c.getId());
                dto.setProductCount((int) count);
            } catch (Exception ignored) {
                // count fallback: leave null on error
            }
            return dto;
        });
        return ResponseEntity.ok(page);
    }

    /**
     * Update a category. Only non-null/non-blank fields are applied.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CategoryDTO> update(@PathVariable("id") Long id, @RequestBody CategoryDTO request) {
        Category updates = Mapper.toEntity(request);
        Category updated = categoryService.update(id, updates);
        return ResponseEntity.ok(Mapper.toDto(updated));
    }

    /**
     * Delete a category by id.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
