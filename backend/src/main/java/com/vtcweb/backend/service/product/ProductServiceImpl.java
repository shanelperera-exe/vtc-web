package com.vtcweb.backend.service.product;

import com.vtcweb.backend.dto.product.CreateProductFullRequest;
import com.vtcweb.backend.dto.product.ProductImageCreateRequest;
import com.vtcweb.backend.dto.product.ProductVariationCreateRequest;
import com.vtcweb.backend.exception.ConflictException;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.repository.category.CategoryRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageService productImageService;
    private final ProductVariationService productVariationService;

    @Override
    public Product create(Product product, Long categoryId) {
        if (product == null) throw new IllegalArgumentException("product must not be null");
        validateProductFields(product);
        if (productRepository.existsByNameIgnoreCase(product.getName())) {
            throw new ConflictException("Product name already exists: " + product.getName());
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found: id=" + categoryId));
        product.setId(null);
        product.setCategory(category);
        // Variations/images are managed separately; ensure they are initialized
        return productRepository.save(product);
    }

    @Override
    public Product createFull(CreateProductFullRequest request) {
        if (request == null) throw new IllegalArgumentException("request must not be null");
        // Create base product first
        Product base = new Product();
        base.setName(request.getName());
        base.setShortDescription(request.getShortDescription());
        base.setDescription(request.getDescription());
        base.setBasePrice(request.getBasePrice());
        Product created = create(base, request.getCategoryId());

        // Attach images
        if (request.getImages() != null) {
            for (ProductImageCreateRequest img : request.getImages()) {
                if (img == null) continue;
                ProductImage.ImageType type = img.getType();
                productImageService.addToProduct(created.getId(), img.getUrl(), type);
            }
        }

        // Attach variations (attributes-driven; variationKey is derived server-side)
        if (request.getVariations() != null) {
            for (ProductVariationCreateRequest varReq : request.getVariations()) {
                if (varReq == null) continue;
                if (varReq.getAttributes() == null || varReq.getAttributes().isEmpty()) {
                    throw new IllegalArgumentException("variation.attributes must not be empty");
                }
                String key = Mapper.buildVariationKey(varReq.getAttributes());
                if (key == null || key.isBlank()) {
                    throw new IllegalArgumentException("variation.attributes contain no valid entries");
                }
                ProductVariation var = new ProductVariation();
                var.setVariationKey(key); // internal uniqueness key; not exposed
                var.setPrice(varReq.getPrice());
                var.setStock(varReq.getStock() != null ? varReq.getStock() : 0);
                var.setImageUrl(varReq.getImageUrl());
                var.setAttributes(varReq.getAttributes());
                productVariationService.create(created.getId(), var);
            }
        }

        // Return the product with details loaded
        return productRepository.findOneById(created.getId())
                .orElseGet(() -> productRepository.findById(created.getId()).orElse(created));
    }

    @Override
    @Transactional(readOnly = true)
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> getByIdWithDetails(Long id) {
        return productRepository.findOneById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> list(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategory_Id(categoryId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> searchByName(String name, Pageable pageable) {
        String q = (name == null) ? "" : name.trim();
        // If query is empty after trimming, return all to keep UX simple
        if (q.isEmpty()) {
            return productRepository.findAll(pageable);
        }
        return productRepository
                .findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCaseOrCategory_NameContainingIgnoreCaseOrDescriptionContaining(
                        q, q, q, q, pageable);
    }

    @Override
    public Product update(Long id, Product updates, Long newCategoryId) {
        if (updates == null) throw new IllegalArgumentException("updates must not be null");
        Product existing = getById(id);
        // Name
        if (updates.getName() != null && !updates.getName().isBlank()) {
            String newName = updates.getName();
            if (!newName.equalsIgnoreCase(existing.getName())
                    && productRepository.existsByNameIgnoreCase(newName)) {
                throw new ConflictException("Product name already exists: " + newName);
            }
            existing.setName(newName);
        }
        // Short description
        if (updates.getShortDescription() != null) existing.setShortDescription(updates.getShortDescription());
        // Description
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        // Base price
        if (updates.getBasePrice() != null) {
            if (isNegative(updates.getBasePrice())) {
                throw new IllegalArgumentException("basePrice must be >= 0");
            }
            existing.setBasePrice(updates.getBasePrice());
        }
        // Category change
        if (newCategoryId != null) {
            Category newCategory = categoryRepository.findById(newCategoryId)
                    .orElseThrow(() -> new NotFoundException("Category not found: id=" + newCategoryId));
            existing.setCategory(newCategory);
        }
        return productRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        // Ensure it exists first
        Product existing = getById(id);
        productRepository.delete(existing);
    }

    private void validateProductFields(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("product.name must not be blank");
        }
        if (product.getBasePrice() == null || isNegative(product.getBasePrice())) {
            throw new IllegalArgumentException("product.basePrice must be >= 0");
        }
    }

    private boolean isNegative(BigDecimal value) {
        return value.signum() < 0;
    }
}
