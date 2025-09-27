package com.vtcweb.backend.util;

import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.model.entity.product.Product;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Simple manual mapper to keep controllers/services decoupled from JPA entities at the API layer.
 */
public final class Mapper {

    private Mapper() {}

    // Category mappings (shallow by default to avoid lazy collection access)
    public static CategoryDTO toDto(Category category) {
        if (category == null) return null;
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .categoryImage(category.getCategoryImage())
                .categoryIcon(category.getCategoryIcon())
                .carouselImage(category.getCarouselImage())
                // productCount intentionally omitted to avoid lazy init issues
                .build();
    }

    public static Category toEntity(CategoryDTO dto) {
        if (dto == null) return null;
        Category category = new Category();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setCategoryImage(dto.getCategoryImage());
        category.setCategoryIcon(dto.getCategoryIcon());
        category.setCarouselImage(dto.getCarouselImage());
        return category;
    }

    // Product mappings
    /**
     * Shallow mapping: does not traverse lazy collections.
     */
    public static ProductDTO toDtoShallow(Product product) {
        if (product == null) return null;
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    /**
     * Detailed mapping: expects relations (images, variations) to be loaded.
     */
    public static ProductDTO toDtoWithDetails(Product product) {
        if (product == null) return null;
        List<String> imageUrls = Optional.ofNullable(product.getImages())
                .orElse(Collections.emptyList())
                .stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        Integer variationCount = product.getVariations() == null ? null : product.getVariations().size();
        Integer imageCount = product.getImages() == null ? null : product.getImages().size();

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrls(imageUrls)
                .imageCount(imageCount)
                .variationCount(variationCount)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static Product fromCreateRequest(CreateProductRequest req) {
        if (req == null) return null;
        Product product = new Product();
        product.setName(req.getName());
        product.setShortDescription(req.getShortDescription());
        product.setDescription(req.getDescription());
        product.setBasePrice(req.getBasePrice());
        // category is set in service using req.getCategoryId()
        return product;
    }

    public static void applyUpdates(Product target, UpdateProductRequest updates) {
        if (target == null || updates == null) return;
        if (updates.getName() != null) {
            target.setName(updates.getName());
        }
        if (updates.getShortDescription() != null) {
            target.setShortDescription(updates.getShortDescription());
        }
        if (updates.getDescription() != null) {
            target.setDescription(updates.getDescription());
        }
        if (updates.getBasePrice() != null) {
            target.setBasePrice(updates.getBasePrice());
        }
    }

    public static ProductDTO toDto(Product product) {
        return toDtoShallow(product);
    }
}
