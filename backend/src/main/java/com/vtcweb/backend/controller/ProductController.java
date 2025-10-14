package com.vtcweb.backend.controller;

import com.vtcweb.backend.dto.product.CreateProductFullRequest;
import com.vtcweb.backend.dto.product.CreateProductRequest;
import com.vtcweb.backend.dto.product.ProductDTO;
import com.vtcweb.backend.dto.product.UpdateProductRequest;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.service.product.ProductService;
import com.vtcweb.backend.util.Mapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Create a new product under a category.
     */
    @PostMapping
    public ResponseEntity<ProductDTO> create(@Valid @RequestBody CreateProductRequest request) {
        Product toCreate = Mapper.fromCreateRequest(request);
        Product created = productService.create(toCreate, request.getCategoryId());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(Mapper.toDtoShallow(created));
    }

    /**
     * Create a full product (base + images + variations) atomically.
     */
    @PostMapping("/add")
    public ResponseEntity<ProductDTO> createFull(@Valid @RequestBody CreateProductFullRequest request) {
        Product created = productService.createFull(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(Mapper.toDtoWithDetails(created));
    }

    /**
     * Retrieve product by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(Mapper.toDtoShallow(productService.getById(id)));
    }

    /**
     * Retrieve product by id with details (relations eager-loaded via repository method).
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<ProductDTO> getByIdWithDetails(@PathVariable("id") Long id) {
        return ResponseEntity.of(productService.getByIdWithDetails(id).map(Mapper::toDtoWithDetails));
    }

    /**
     * List products with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> list(Pageable pageable) {
        Page<ProductDTO> page = productService.list(pageable).map(Mapper::toDtoShallow);
        return ResponseEntity.ok(page);
    }

    /**
     * List products by category with pagination.
     */
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<Page<ProductDTO>> listByCategory(@PathVariable("categoryId") Long categoryId, Pageable pageable) {
        Page<ProductDTO> page = productService.listByCategory(categoryId, pageable).map(Mapper::toDtoShallow);
        return ResponseEntity.ok(page);
    }

    /**
     * Search products by text with pagination.
     * Matches across: name (ignore case), shortDescription (ignore case), category name (ignore case),
     * and description (case-sensitive to avoid CLOB + UPPER issues on certain DBs like H2).
     * Use query param 'name' for compatibility (e.g., /api/products/search?name=book).
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> search(@RequestParam(name = "name", required = false) String name,
                                                Pageable pageable) {
        Page<ProductDTO> page = productService.searchByName(name, pageable).map(Mapper::toDtoShallow);
        return ResponseEntity.ok(page);
    }

    /**
     * Update a product. Only provided fields are applied. Category can be changed via newCategoryId.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable("id") Long id,
                                          @Valid @RequestBody UpdateProductRequest request,
                                          @RequestParam(name = "newCategoryId", required = false) Long newCategoryId) {
        // Build a minimal updates entity
        Product updates = new Product();
        Mapper.applyUpdates(updates, request);
        Product updated = productService.update(id, updates, newCategoryId);
        return ResponseEntity.ok(Mapper.toDtoShallow(updated));
    }

    /**
     * Delete a product by id.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
