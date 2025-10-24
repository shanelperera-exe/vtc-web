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
import java.util.Base64;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.lang.NonNull;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@lombok.extern.slf4j.Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageService productImageService;
    private final ProductVariationService productVariationService;
    private final com.vtcweb.backend.service.storage.ImageStorageService imageStorageService; // cloud cleanup

    private static final int MAX_SKU_ATTEMPTS = 10_000;
    private static final String DEFAULT_CATEGORY_CODE = "CAT";

    @Override
    public Product create(Product product, Long categoryId) {
        if (product == null) throw new IllegalArgumentException("product must not be null");
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        if (log.isDebugEnabled()) {
            String dd = product.getDetailedDescription();
            log.debug("Creating product name='{}' detailedDescriptionPreview='{}'", product.getName(), dd == null ? "<null>" : dd.substring(0, Math.min(40, dd.length())).replaceAll("\n", " "));
        }
        validateProductFields(product);
        if (productRepository.existsByNameIgnoreCase(product.getName())) {
            throw new ConflictException("Product name already exists: " + product.getName());
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found: id=" + categoryId));
        product.setId(null);
        product.setCategory(category);
        // Default status if not provided
        if (product.getStatus() == null) {
            product.setStatus(com.vtcweb.backend.model.entity.product.ProductStatus.ACTIVE);
        }
        // SKU generation is always derived from category prefix + per-category sequence (CAT-001)
        if (product.getSku() != null && !product.getSku().isBlank()) {
            log.debug("Ignoring client-supplied SKU '{}' in favor of generated value", product.getSku());
        }
        product.setSku(generateSku(category));
        // Normalize highlights if present
        if (product.getHighlights() != null) {
            product.setHighlights(product.getHighlights().stream()
                    .filter(java.util.Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .limit(25)
                    .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new)));
        }
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
    base.setDetailedDescription(request.getDetailedDescription()); // legacy field name handled at DTO level
        base.setBasePrice(request.getBasePrice());
    if (log.isDebugEnabled()) {
        String dd = base.getDetailedDescription();
        log.debug("createFull long description preview='{}'", dd == null ? "<null>" : dd.substring(0, Math.min(60, dd.length())).replaceAll("\n", " "));
    }
    if (request.getHighlights() != null) {
        base.setHighlights(request.getHighlights().stream()
            .filter(java.util.Objects::nonNull)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .limit(25)
            .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new)));
    }
        // Optional status from request
        if (request.getStatus() != null) {
            try {
                base.setStatus(com.vtcweb.backend.model.entity.product.ProductStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                // default in create()
            }
        }
        Product created = create(base, request.getCategoryId());

        // Attach images
        if (request.getImages() != null) {
            for (ProductImageCreateRequest img : request.getImages()) {
                if (img == null) continue;
                String url = img.getUrl();
                ProductImage.ImageType type = img.getType();
                String sku = created.getSku() != null ? created.getSku() : ("id-" + created.getId());
                String folder = "products/" + sku;
                try {
                    if (url != null && !url.isBlank()) {
                        if (url.startsWith("data:image")) {
                            // data URI -> decode
                            int comma = url.indexOf(',');
                            if (comma > 0) {
                                String meta = url.substring(0, comma); // e.g. data:image/png;base64
                                String b64 = url.substring(comma + 1);
                                byte[] bytes = Base64.getDecoder().decode(b64);
                                MultipartFile mf = new InMemoryMultipartFile(
                                        sku + "-img." + deriveExt(meta),
                                        sku + "-img." + deriveExt(meta),
                                        deriveContentType(meta),
                                        bytes
                                );
                                com.vtcweb.backend.service.storage.ImageStorageService.UploadResult uploaded = imageStorageService.upload(mf, folder);
                                url = uploaded.url();
                            }
                        } else if (isExternalNonCloudinaryUrl(url)) {
                            // Fetch remote image bytes then upload so we only persist Cloudinary URL
                            byte[] bytes = downloadImage(url);
                            if (bytes != null && bytes.length > 0) {
                                String meta = guessMetaFromUrl(url);
                                MultipartFile mf = new InMemoryMultipartFile(
                                        sku + "-ext." + deriveExt(meta),
                                        sku + "-ext." + deriveExt(meta),
                                        deriveContentType(meta),
                                        bytes
                                );
                                com.vtcweb.backend.service.storage.ImageStorageService.UploadResult uploaded = imageStorageService.upload(mf, folder);
                                url = uploaded.url();
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to normalize product image for product {}: {}", created.getId(), e.getMessage());
                }
                productImageService.addToProduct(created.getId(), url, type);
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
                // Variation image (data URI support)
                String variationImageUrl = varReq.getImageUrl();
                if (variationImageUrl != null && !variationImageUrl.isBlank()) {
                    try {
                        String skuVar = created.getSku() != null ? created.getSku() : ("id-" + created.getId());
                        String folderVar = "products/" + skuVar + "/variations";
                        if (variationImageUrl.startsWith("data:image")) {
                            int comma = variationImageUrl.indexOf(',');
                            if (comma > 0) {
                                String meta = variationImageUrl.substring(0, comma);
                                String b64 = variationImageUrl.substring(comma + 1);
                                byte[] bytes = Base64.getDecoder().decode(b64);
                                MultipartFile mf = new InMemoryMultipartFile(
                                        skuVar + "-var." + deriveExt(meta),
                                        skuVar + "-var." + deriveExt(meta),
                                        deriveContentType(meta),
                                        bytes
                                );
                                com.vtcweb.backend.service.storage.ImageStorageService.UploadResult up = imageStorageService.upload(mf, folderVar);
                                variationImageUrl = up.url();
                            }
                        } else if (isExternalNonCloudinaryUrl(variationImageUrl)) {
                            byte[] bytes = downloadImage(variationImageUrl);
                            if (bytes != null && bytes.length > 0) {
                                String meta = guessMetaFromUrl(variationImageUrl);
                                MultipartFile mf = new InMemoryMultipartFile(
                                        skuVar + "-var-ext." + deriveExt(meta),
                                        skuVar + "-var-ext." + deriveExt(meta),
                                        deriveContentType(meta),
                                        bytes
                                );
                                com.vtcweb.backend.service.storage.ImageStorageService.UploadResult up = imageStorageService.upload(mf, folderVar);
                                variationImageUrl = up.url();
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Failed to normalize variation image for product {}: {}", created.getId(), e.getMessage());
                    }
                }
                var.setImageUrl(variationImageUrl);
                var.setAttributes(varReq.getAttributes());
                productVariationService.create(created.getId(), var);
            }
        }

        // Return the product with details loaded
        Long createdId = java.util.Objects.requireNonNull(created.getId(), "created id must not be null");
        return productRepository.findOneById(createdId)
            .orElseGet(() -> productRepository.findById(createdId).orElse(created));
    }

    @Override
    @Transactional(readOnly = true)
    public Product getById(Long id) {
        if (id == null) throw new IllegalArgumentException("id must not be null");
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
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        return productRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> list(Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        if (status == null) return list(pageable);
        return productRepository.findByStatus(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listByCategory(Long categoryId, Pageable pageable) {
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        return productRepository.findByCategory_Id(categoryId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listByCategory(Long categoryId, Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        if (status == null) return listByCategory(categoryId, pageable);
        return productRepository.findByCategory_IdAndStatus(categoryId, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> searchByName(String name, Pageable pageable) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        String q = (name == null) ? "" : name.trim();
        // If query is empty after trimming, return all to keep UX simple
        if (q.isEmpty()) {
            return productRepository.findAll(pageable);
        }
    return productRepository
        .findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCaseOrCategory_NameContainingIgnoreCaseOrDetailedDescriptionContaining(
            q, q, q, q, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> searchByName(String name, Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        String q = (name == null) ? "" : name.trim();
        if (status == null) return searchByName(name, pageable);
        if (q.isEmpty()) return list(pageable, status);
        return productRepository
            .findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCaseOrCategory_NameContainingIgnoreCaseOrDetailedDescriptionContainingAndStatus(
                q, q, q, q, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> getBySku(String sku) {
        if (sku == null || sku.isBlank()) return Optional.empty();
        return productRepository.findBySku(sku.trim().toUpperCase());
    }

    // --- Stock-aware listings ---
    @Override
    @Transactional(readOnly = true)
    public Page<Product> listInStock(Pageable pageable) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        return productRepository.findInStock(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listInStock(Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        if (status == null) return listInStock(pageable);
        return productRepository.findInStockByStatus(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listInStockByCategory(Long categoryId, Pageable pageable) {
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        return productRepository.findInStockByCategory(categoryId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listInStockByCategory(Long categoryId, Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        if (status == null) return listInStockByCategory(categoryId, pageable);
        return productRepository.findInStockByCategoryAndStatus(categoryId, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listOutOfStock(Pageable pageable) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        return productRepository.findOutOfStock(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listOutOfStock(Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        if (status == null) return listOutOfStock(pageable);
        return productRepository.findOutOfStockByStatus(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listOutOfStockByCategory(Long categoryId, Pageable pageable) {
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        return productRepository.findOutOfStockByCategory(categoryId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> listOutOfStockByCategory(Long categoryId, Pageable pageable, com.vtcweb.backend.model.entity.product.ProductStatus status) {
        if (categoryId == null) throw new IllegalArgumentException("categoryId must not be null");
        java.util.Objects.requireNonNull(pageable, "pageable must not be null");
        if (status == null) return listOutOfStockByCategory(categoryId, pageable);
        return productRepository.findOutOfStockByCategoryAndStatus(categoryId, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public String previewNextSku(Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("categoryId must not be null");
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found: id=" + categoryId));
        return generateSku(category);
    }

    @Override
    public Product update(Long id, Product updates, Long newCategoryId) {
        if (id == null) throw new IllegalArgumentException("id must not be null");
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
    // Detailed description
    if (updates.getDetailedDescription() != null) existing.setDetailedDescription(updates.getDetailedDescription());
        // Base price
        if (updates.getBasePrice() != null) {
            if (isNegative(updates.getBasePrice())) {
                throw new IllegalArgumentException("basePrice must be >= 0");
            }
            existing.setBasePrice(updates.getBasePrice());
        }
        // Highlights (replace list if provided)
        if (updates.getHighlights() != null) {
            java.util.List<String> sanitized = updates.getHighlights().stream()
                    .filter(java.util.Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .limit(25)
                    .toList();
            existing.setHighlights(new java.util.ArrayList<>(sanitized));
        }
        // Status
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        // Category change
        if (newCategoryId != null) {
            Category newCategory = categoryRepository.findById(newCategoryId)
                    .orElseThrow(() -> new NotFoundException("Category not found: id=" + newCategoryId));
            Long currentCategoryId = existing.getCategory() != null ? existing.getCategory().getId() : null;
            existing.setCategory(newCategory);
            if (newCategory.getId() != null && !java.util.Objects.equals(currentCategoryId, newCategory.getId())) {
                existing.setSku(generateSku(newCategory));
            }
        }
        @SuppressWarnings({"DataFlowIssue", "null"})
        Product saved = productRepository.save(existing);
        return saved;
    }

    @Override
    public void delete(Long id) {
        if (id == null) throw new IllegalArgumentException("id must not be null");
        // Ensure it exists first
        Product existing = getById(id);
        // Collect images (product level and variation images)
        // Product-level images
        java.util.List<com.vtcweb.backend.model.entity.product.ProductImage> images = productImageService.listByProduct(id, org.springframework.data.domain.PageRequest.of(0, 200)).getContent();
        int imgDeleted = 0;
        for (com.vtcweb.backend.model.entity.product.ProductImage img : images) {
            if (imageStorageService.deleteByUrl(img.getUrl())) imgDeleted++;
        }
        // Variation images
        java.util.concurrent.atomic.AtomicInteger varDeleted = new java.util.concurrent.atomic.AtomicInteger(0);
        if (existing.getVariations() != null) {
            existing.getVariations().forEach(var -> { if (imageStorageService.deleteByUrl(var.getImageUrl())) varDeleted.incrementAndGet(); });
        }
        log.debug("Product {} image cleanup results: productImagesDeleted={}, variationImagesDeleted={}", id, imgDeleted, varDeleted.get());
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

    /**
     * SKU Format: CCC-NNN
     *  - CCC: first 3 alphanumeric chars of category name (uppercased, padded with X if shorter)
     *  - NNN: per-category numeric sequence (001, 002, ...)
     * Ensures uniqueness by incrementing sequence until a free candidate is found.
     */
    private String generateSku(Category category) {
        if (category == null) {
            throw new IllegalArgumentException("category must not be null");
        }
        if (category.getId() == null) {
            throw new IllegalArgumentException("Category must be persisted before generating SKU");
        }
    String categoryCode = deriveCategoryCode(category);
        int nextSequence = determineNextSequence(category.getId(), categoryCode);
        int attempts = 0;
        int candidateSequence = nextSequence;
        while (attempts < MAX_SKU_ATTEMPTS) {
            String candidate = formatSku(categoryCode, candidateSequence);
            if (!productRepository.existsBySku(candidate)) {
                return candidate;
            }
            candidateSequence++;
            attempts++;
        }
        throw new IllegalStateException("Unable to generate unique SKU after " + MAX_SKU_ATTEMPTS + " attempts for category " + category.getId());
    }

    private int determineNextSequence(Long categoryId, String categoryCode) {
        String prefixWithDash = categoryCode + "-";
        return productRepository
                .findTopByCategory_IdAndSkuStartingWithOrderBySkuDesc(categoryId, prefixWithDash)
                .map(product -> {
                    int last = extractSequence(product.getSku(), prefixWithDash);
                    return (last >= 1) ? last + 1 : 1;
                })
                .orElse(1);
    }

    private int extractSequence(String sku, String prefixWithDash) {
        if (sku == null || prefixWithDash == null || !sku.startsWith(prefixWithDash)) {
            return 0;
        }
        String tail = sku.substring(prefixWithDash.length());
        if (tail.isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(tail);
        } catch (NumberFormatException ignored) {
            String digitsOnly = tail.replaceAll("[^0-9]", "");
            if (digitsOnly.isEmpty()) {
                return 0;
            }
            return Integer.parseInt(digitsOnly);
        }
    }

    private String deriveCategoryCode(Category category) {
        if (category != null && category.getCode() != null) {
            String explicit = category.getCode().trim().toUpperCase();
            // Accept only alphanumeric 1-3 chars
            if (explicit.matches("[A-Z0-9]{1,3}")) {
                // Pad to 3 chars if shorter (e.g. 'HW' -> 'HWX') to maintain fixed width
                return (explicit + "XXX").substring(0,3);
            }
        }
        String categoryName = category != null ? category.getName() : null;
        if (categoryName == null) return DEFAULT_CATEGORY_CODE;
        String cleaned = categoryName.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (cleaned.isEmpty()) return DEFAULT_CATEGORY_CODE;
        // Consonant-based generation similar to CategoryServiceImpl
        StringBuilder code = new StringBuilder();
        code.append(cleaned.charAt(0));
        String vowels = "AEIOU";
        for (int i = 1; i < cleaned.length() && code.length() < 3; i++) {
            char c = cleaned.charAt(i);
            if (Character.isLetter(c) && vowels.indexOf(c) == -1) {
                code.append(c);
            } else if (Character.isDigit(c)) {
                code.append(c);
            }
        }
        for (int i = 1; i < cleaned.length() && code.length() < 3; i++) {
            char c = cleaned.charAt(i);
            if (code.indexOf(String.valueOf(c)) == -1) {
                code.append(c);
            }
        }
        while (code.length() < 3) code.append('X');
        return code.substring(0,3);
    }

    private String formatSku(String categoryCode, int sequence) {
        return categoryCode + "-" + String.format("%03d", sequence);
    }

    private boolean isExternalNonCloudinaryUrl(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        if (!(lower.startsWith("http://") || lower.startsWith("https://"))) return false;
        return !lower.contains("res.cloudinary.com");
    }

    private byte[] downloadImage(String url) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                    .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)
                    .build();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder(java.net.URI.create(url))
                    .GET()
                    .header("User-Agent", "VTC-Backend/1.0")
                    .build();
            java.net.http.HttpResponse<byte[]> resp = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofByteArray());
            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                String ctype = resp.headers().firstValue("Content-Type").orElse("");
                if (ctype.startsWith("image/")) {
                    return resp.body();
                }
            }
        } catch (Exception e) {
            log.debug("Remote image fetch failed for URL {}: {}", url, e.getMessage());
        }
        return null;
    }

    private String guessMetaFromUrl(String url) {
        if (url == null) return "image/png"; // default
        String lower = url.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/png";
    }

    private String deriveExt(String meta) {
        if (meta == null) return "png"; // default
        if (meta.contains("image/png")) return "png";
        if (meta.contains("image/jpeg")) return "jpg";
        if (meta.contains("image/webp")) return "webp";
        return "png";
    }

    private String deriveContentType(String meta) {
        if (meta == null) return org.springframework.http.MediaType.IMAGE_PNG_VALUE;
        if (meta.contains("image/png")) return org.springframework.http.MediaType.IMAGE_PNG_VALUE;
        if (meta.contains("image/jpeg")) return org.springframework.http.MediaType.IMAGE_JPEG_VALUE;
        if (meta.contains("image/webp")) return "image/webp";
        return org.springframework.http.MediaType.IMAGE_PNG_VALUE;
    }

    /** Simple in-memory MultipartFile implementation. */
    private static class InMemoryMultipartFile implements MultipartFile {
        private final @NonNull String name;
        private final @NonNull String originalFilename;
        private final String contentType;
        private final byte[] content;
        InMemoryMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = java.util.Objects.requireNonNull(name, "name");
            this.originalFilename = java.util.Objects.requireNonNull(originalFilename, "originalFilename");
            this.contentType = contentType;
            this.content = content != null ? content : new byte[0];
        }
        @Override public @NonNull String getName() { return name; }
        @Override public @NonNull String getOriginalFilename() { return originalFilename; }
        @Override public String getContentType() { return contentType; }
        @Override public boolean isEmpty() { return content.length == 0; }
        @Override public long getSize() { return content.length; }
        @Override public @NonNull byte[] getBytes() { return content.clone(); }
        @Override public @NonNull java.io.InputStream getInputStream() { return new java.io.ByteArrayInputStream(content); }
        @Override public void transferTo(@NonNull java.io.File dest) throws java.io.IOException { try (java.io.FileOutputStream fos = new java.io.FileOutputStream(dest)) { fos.write(content); } }
    }
}
