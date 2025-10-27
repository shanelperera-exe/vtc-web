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

    Page<Product> list(Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status);

    Page<Product> listByCategory(Long categoryId, Pageable pageable);

    Page<Product> listByCategory(Long categoryId, Pageable pageable,
            com.vtcweb.backend.model.entity.product.ProductStatus status);

    Page<Product> searchByName(String name, Pageable pageable);

    Page<Product> searchByName(String name, Pageable pageable,
            com.vtcweb.backend.model.entity.product.ProductStatus status);

    /** Find product by SKU (case-insensitive normalization). */
    Optional<Product> getBySku(String sku);

    // Stock-aware listings
    Page<Product> listInStock(Pageable pageable);

    Page<Product> listInStock(Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status);

    Page<Product> listInStockByCategory(Long categoryId, Pageable pageable);

    Page<Product> listInStockByCategory(Long categoryId, Pageable pageable,
            com.vtcweb.backend.model.entity.product.ProductStatus status);

    Page<Product> listOutOfStock(Pageable pageable);

    Page<Product> listOutOfStock(Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status);

    Page<Product> listOutOfStockByCategory(Long categoryId, Pageable pageable);

    Page<Product> listOutOfStockByCategory(Long categoryId, Pageable pageable,
            com.vtcweb.backend.model.entity.product.ProductStatus status);

    /** Preview the next SKU for a given category without persisting. */
    String previewNextSku(Long categoryId);

    Product update(Long id, Product updates, Long newCategoryId);

    void delete(Long id);
}
