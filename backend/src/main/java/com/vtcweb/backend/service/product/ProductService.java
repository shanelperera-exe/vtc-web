package com.vtcweb.backend.service.product;

import com.vtcweb.backend.dto.product.CreateProductFullRequest;
import com.vtcweb.backend.model.entity.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Service contract for product management.
 */
public interface ProductService {

    Product create(Product product, Long categoryId);

    // Create a product along with images and variations atomically
    Product createFull(CreateProductFullRequest request);

    Product getById(Long id);

    /** Fetch product with relations loaded, when needed by UI. */
    Optional<Product> getByIdWithDetails(Long id);

    Page<Product> list(Pageable pageable);

    Page<Product> listByCategory(Long categoryId, Pageable pageable);

    Page<Product> searchByName(String name, Pageable pageable);

    Product update(Long id, Product updates, Long newCategoryId);

    void delete(Long id);
}
