package com.vtcweb.backend.controller.product;

import com.vtcweb.backend.dto.product.CreateProductFullRequest;
import com.vtcweb.backend.dto.product.CreateProductRequest;
import com.vtcweb.backend.dto.product.ProductDTO;
import com.vtcweb.backend.dto.product.UpdateProductRequest;
import com.vtcweb.backend.dto.product.ProductStatsDTO;
import com.vtcweb.backend.dto.product.ProductStatusUpdateRequest;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.service.product.ProductService;
import com.vtcweb.backend.util.Mapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @org.springframework.beans.factory.annotation.Autowired
    private com.vtcweb.backend.repository.order.OrderItemRepository orderItemRepository;
    @org.springframework.beans.factory.annotation.Autowired
    private com.vtcweb.backend.repository.product.ProductVariationRepository productVariationRepository;

    /**
     * Create a new product under a category.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
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
        java.util.Optional<Product> opt = productService.getByIdWithDetails(id);
        return opt.map(p -> ResponseEntity.ok(Mapper.toDtoWithDetails(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * List products with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> list(Pageable pageable,
                                                @RequestParam(name = "status", required = false) String status,
                                                @RequestParam(name = "stock", required = false) String stock) {
        boolean provided = status != null;
        com.vtcweb.backend.model.entity.product.ProductStatus st = parseStatus(status);
        if (!provided) {
            // Default public listing to ACTIVE products only when status is not provided
            st = com.vtcweb.backend.model.entity.product.ProductStatus.ACTIVE;
        }
        StockFilter sf = parseStock(stock);
        Page<Product> products;
        if (sf == StockFilter.IN_STOCK) {
            products = (st == null) ? productService.listInStock(pageable) : productService.listInStock(pageable, st);
        } else if (sf == StockFilter.OUT_OF_STOCK) {
            products = (st == null) ? productService.listOutOfStock(pageable) : productService.listOutOfStock(pageable, st);
        } else {
            products = (st == null) ? productService.list(pageable) : productService.list(pageable, st);
        }
        // Collect IDs to batch-fetch images
        java.util.List<Long> ids = products.stream().map(Product::getId).toList();
        java.util.Map<Long, String> primaryMap = resolvePrimaryImages(ids);
        Page<ProductDTO> page = products.map(p -> {
            ProductDTO dto = Mapper.toDtoShallow(p);
            String primary = primaryMap.get(p.getId());
            if (primary != null) {
                dto.setImage(primary);
                dto.setPrimaryImageUrl(primary);
            }
            return dto;
        });
        return ResponseEntity.ok(page);
    }

    /**
     * List products by category with pagination.
     */
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<Page<ProductDTO>> listByCategory(@PathVariable("categoryId") Long categoryId, Pageable pageable,
                                                           @RequestParam(name = "status", required = false) String status,
                                                           @RequestParam(name = "stock", required = false) String stock) {
        boolean provided = status != null;
        com.vtcweb.backend.model.entity.product.ProductStatus st = parseStatus(status);
        if (!provided) {
            st = com.vtcweb.backend.model.entity.product.ProductStatus.ACTIVE;
        }
        StockFilter sf = parseStock(stock);
        Page<Product> products;
        if (sf == StockFilter.IN_STOCK) {
            products = (st == null) ? productService.listInStockByCategory(categoryId, pageable)
                    : productService.listInStockByCategory(categoryId, pageable, st);
        } else if (sf == StockFilter.OUT_OF_STOCK) {
            products = (st == null) ? productService.listOutOfStockByCategory(categoryId, pageable)
                    : productService.listOutOfStockByCategory(categoryId, pageable, st);
        } else {
            products = (st == null)
                    ? productService.listByCategory(categoryId, pageable)
                    : productService.listByCategory(categoryId, pageable, st);
        }
        java.util.List<Long> ids = products.stream().map(Product::getId).toList();
        java.util.Map<Long, String> primaryMap = resolvePrimaryImages(ids);
        Page<ProductDTO> page = products.map(p -> {
            ProductDTO dto = Mapper.toDtoShallow(p);
            String primary = primaryMap.get(p.getId());
            if (primary != null) {
                dto.setImage(primary);
                dto.setPrimaryImageUrl(primary);
            }
            return dto;
        });
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
                               @RequestParam(name = "sku", required = false) String sku,
                               @RequestParam(name = "status", required = false) String status,
                               Pageable pageable) {
        if (sku != null && !sku.isBlank()) {
            java.util.Optional<Product> opt = productService.getBySku(sku);
            if (opt.isPresent()) {
                Product p = opt.get();
                java.util.List<ProductDTO> list = java.util.List.of(enrichWithPrimary(Mapper.toDtoShallow(p), resolvePrimaryImages(java.util.List.of(p.getId()))));
                return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(java.util.Objects.requireNonNull(list), java.util.Objects.requireNonNull(pageable), 1));
            } else {
                return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(java.util.Objects.requireNonNull(java.util.List.of()), java.util.Objects.requireNonNull(pageable), 0));
            }
        }
        boolean provided = status != null;
        com.vtcweb.backend.model.entity.product.ProductStatus st = parseStatus(status);
        if (!provided) {
            st = com.vtcweb.backend.model.entity.product.ProductStatus.ACTIVE;
        }
        Page<Product> products = (st == null)
            ? productService.searchByName(name, pageable)
            : productService.searchByName(name, pageable, st);
        java.util.List<Long> ids = products.stream().map(Product::getId).toList();
        java.util.Map<Long, String> primaryMap = resolvePrimaryImages(ids);
        Page<ProductDTO> page = products.map(p -> {
            ProductDTO dto = Mapper.toDtoShallow(p);
            String primary = primaryMap.get(p.getId());
            if (primary != null) {
                dto.setImage(primary);
                dto.setPrimaryImageUrl(primary);
            }
            return dto;
        });
        return ResponseEntity.ok(page);
    }

    @GetMapping("/next-sku")
    public ResponseEntity<java.util.Map<String, String>> previewNextSku(@RequestParam("categoryId") Long categoryId) {
        return ResponseEntity.ok(java.util.Map.of("sku", productService.previewNextSku(categoryId)));
    }

    /**
     * Aggregated stats by product SKU.
     * Public GET for dashboards. Uses SKU resolution -> productId, computes totals and 90-day daily series.
     */
    @GetMapping("/by-sku/{sku}/stats")
    public ResponseEntity<ProductStatsDTO> statsBySku(@PathVariable("sku") String sku,
                                                      @RequestParam(name = "days", required = false, defaultValue = "90") int days) {
        if (sku == null || sku.isBlank()) return ResponseEntity.badRequest().build();
        java.util.Optional<Product> opt = productService.getBySku(sku);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Product p = opt.get();

        Long pid = p.getId();
        long units = java.util.Objects.requireNonNullElse(orderItemRepository.sumQuantityByProductId(pid), 0L);
        java.math.BigDecimal revenue = java.util.Objects.requireNonNullElse(orderItemRepository.sumRevenueByProductId(pid), java.math.BigDecimal.ZERO);
        long orderCount = java.util.Objects.requireNonNullElse(orderItemRepository.countDistinctOrdersByProductId(pid), 0L);
        java.math.BigDecimal avgPrice = (units > 0)
                ? revenue.divide(java.math.BigDecimal.valueOf(units), java.math.RoundingMode.HALF_UP)
                : java.math.BigDecimal.ZERO;

        // Build daily sales for last N days
        int window = Math.max(1, Math.min(365, days));
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate start = today.minusDays(window - 1);
        java.util.Map<String, ProductStatsDTO.DataPoint> series = new java.util.LinkedHashMap<>();
        for (int i = 0; i < window; i++) {
            String d = start.plusDays(i).toString();
            series.put(d, ProductStatsDTO.DataPoint.builder().date(d).units(0).revenue(java.math.BigDecimal.ZERO).build());
        }
        var since = start.atStartOfDay();
        var recent = orderItemRepository.findByProductIdAndOrder_PlacedAtAfter(pid, since);
        for (var oi : recent) {
            java.time.LocalDate d = oi.getOrder() != null && oi.getOrder().getPlacedAt() != null
                    ? oi.getOrder().getPlacedAt().toLocalDate() : null;
            if (d == null) continue;
            String key = d.toString();
            var dp = series.get(key);
            if (dp != null) {
                long addUnits = java.util.Objects.requireNonNullElse(oi.getQuantity(), 0);
                java.math.BigDecimal addRev = java.util.Objects.requireNonNullElse(oi.getTotalPrice(), java.math.BigDecimal.ZERO);
                dp.setUnits(dp.getUnits() + addUnits);
                dp.setRevenue(dp.getRevenue().add(addRev));
            }
        }

        // Top variants by units (if variations exist)
        java.util.List<ProductStatsDTO.TopVariant> topVariants = new java.util.ArrayList<>();
        for (Object[] row : orderItemRepository.sumQuantityByVariation(pid)) {
            Long variationId = (Long) row[0];
            long vUnits = ((Number) row[1]).longValue();
            if (variationId == null) continue;
            var pvOpt = productVariationRepository.findById(variationId);
            String label = pvOpt.map(v -> {
                var attrs = v.getAttributes();
                if (attrs == null || attrs.isEmpty()) return "Variation " + v.getId();
                return attrs.entrySet().stream().sorted(java.util.Map.Entry.comparingByKey())
                        .map(e -> e.getKey() + "=" + e.getValue()).reduce((a,b)->a+" | "+b).orElse("Variation " + v.getId());
            }).orElse("Variation " + variationId);
            topVariants.add(ProductStatsDTO.TopVariant.builder().variationId(variationId).label(label).units(vUnits).build());
        }

        // pick primary image
        String primary = resolvePrimaryImages(java.util.List.of(pid)).get(pid);

        ProductStatsDTO dto = ProductStatsDTO.builder()
                .productId(pid)
                .sku(p.getSku())
                .name(p.getName())
                .primaryImageUrl(primary)
                .totalUnitsSold(units)
                .totalRevenue(revenue)
                .orderCount(orderCount)
                .averagePrice(avgPrice)
                .dailySales(new java.util.ArrayList<>(series.values()))
                .topVariants(topVariants)
                .build();
        return ResponseEntity.ok(dto);
    }

    /**
     * Update a product. Only provided fields are applied. Category can be changed via newCategoryId.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
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
     * Update product status only (admin/managers). Accepts {"status": "active|inactive|ACTIVE|INACTIVE"}.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ProductDTO> updateStatus(@PathVariable("id") Long id,
                                                   @Valid @RequestBody ProductStatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String raw = request.getStatus().trim().toUpperCase();
        com.vtcweb.backend.model.entity.product.ProductStatus st;
        try {
            st = com.vtcweb.backend.model.entity.product.ProductStatus.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
        // Build minimal updates entity
        Product updates = new Product();
        updates.setStatus(st);
        Product updated = productService.update(id, updates, null);
        return ResponseEntity.ok(Mapper.toDtoShallow(updated));
    }

    /**
     * Delete a product by id.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Helper methods for primary image enrichment ---
    @org.springframework.beans.factory.annotation.Autowired
    private com.vtcweb.backend.repository.product.ProductImageRepository productImageRepository;

    private java.util.Map<Long, String> resolvePrimaryImages(java.util.Collection<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) return java.util.Collections.emptyMap();
        java.util.List<com.vtcweb.backend.model.entity.product.ProductImage> images = productImageRepository.findByProduct_IdIn(productIds);
        java.util.Map<Long, String> map = new java.util.HashMap<>();
        for (com.vtcweb.backend.model.entity.product.ProductImage img : images) {
            if (!productIds.contains(img.getProduct().getId())) continue;
            if (img.getType() == com.vtcweb.backend.model.entity.product.ProductImage.ImageType.PRIMARY) {
                map.put(img.getProduct().getId(), img.getUrl());
            } else {
                map.putIfAbsent(img.getProduct().getId(), img.getUrl());
            }
        }
        return map;
    }

    private ProductDTO enrichWithPrimary(ProductDTO dto, java.util.Map<Long, String> primaryMap) {
        if (dto == null) return null;
        String primary = primaryMap.get(dto.getId());
        if (primary != null) {
            dto.setImage(primary);
            dto.setPrimaryImageUrl(primary);
        }
        return dto;
    }

    private com.vtcweb.backend.model.entity.product.ProductStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null; // caller decides default
        String s = status.trim().toUpperCase();
        if ("ALL".equals(s)) return null; // explicit no-filter
        try {
            return com.vtcweb.backend.model.entity.product.ProductStatus.valueOf(s);
        } catch (IllegalArgumentException ex) {
            return null; // invalid -> no filter
        }
    }

    private enum StockFilter { IN_STOCK, OUT_OF_STOCK, NONE }
    private StockFilter parseStock(String stock) {
        if (stock == null || stock.isBlank()) return StockFilter.NONE;
        String s = stock.trim().toLowerCase();
        if (s.equals("in") || s.equals("in-stock") || s.equals("instock") || s.equals("available")) return StockFilter.IN_STOCK;
        if (s.equals("out") || s.equals("out-of-stock") || s.equals("outofstock") || s.equals("unavailable")) return StockFilter.OUT_OF_STOCK;
        return StockFilter.NONE;
    }
}
