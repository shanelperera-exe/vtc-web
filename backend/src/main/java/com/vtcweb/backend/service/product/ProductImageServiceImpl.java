package com.vtcweb.backend.service.product;

import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.product.ProductImage.ImageType;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.repository.product.ProductImageRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import com.vtcweb.backend.service.storage.ImageStorageService;
import com.vtcweb.backend.util.ImageUploadUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;
    private final ImageStorageService imageStorageService;

    @Override
    public ProductImage addToProduct(Long productId, String url, ImageType type) {
        if (url == null || url.isBlank())
            throw new IllegalArgumentException("url must not be blank");
        if (type == null)
            type = ImageType.SECONDARY;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + productId));
        ProductImage image = ProductImage.builder()
                .product(product)
                .url(url)
                .type(type)
                .build();
        return imageRepository.save(image);
    }

    @Override
    public ProductImage addToVariation(Long productId, Long variationId, String url, ImageType type) {
        if (url == null || url.isBlank())
            throw new IllegalArgumentException("url must not be blank");
        if (type == null)
            type = ImageType.SECONDARY;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + productId));
        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new NotFoundException("Variation not found: id=" + variationId));
        if (!variation.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Variation does not belong to product");
        }
        ProductImage image = ProductImage.builder()
                .product(product)
                .variation(variation)
                .url(url)
                .type(type)
                .build();
        return imageRepository.save(image);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductImage getById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ProductImage not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductImage> listByProduct(Long productId, Pageable pageable) {
        return imageRepository.findByProductId(productId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductImage> listByVariation(Long variationId, Pageable pageable) {
        return imageRepository.findByVariationId(variationId, pageable);
    }

    @Override
    public ProductImage update(Long id, String url, ImageType type) {
        ProductImage existing = getById(id);
        if (url != null && !url.isBlank())
            existing.setUrl(url);
        if (type != null)
            existing.setType(type);
        return imageRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        ProductImage existing = getById(id);
        imageRepository.delete(existing);
    }

    @Override
    public int deleteByProduct(Long productId) {
        return imageRepository.deleteByProductId(productId);
    }

    @Override
    public List<ProductImage> syncProductImages(Long productId, String primaryImage, List<String> secondaryImages) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + productId));

        String sku = product.getSku();
        String folder = "products/" + (sku != null ? sku : ("id-" + productId));

        Map<String, ImageType> desiredImages = new LinkedHashMap<>();

        String normalizedPrimary = materialize(primaryImage, folder, (sku != null ? sku : "product") + "-primary");
        if (normalizedPrimary != null && !normalizedPrimary.isBlank()) {
            desiredImages.put(normalizedPrimary, ImageType.PRIMARY);
        }

        if (secondaryImages != null) {
            int index = 0;
            for (String raw : secondaryImages) {
                String normalized = materialize(raw, folder, (sku != null ? sku : "product") + "-secondary-" + index++);
                if (normalized == null || normalized.isBlank())
                    continue;
                if (!desiredImages.containsKey(normalized)) {
                    desiredImages.put(normalized,
                            desiredImages.containsValue(ImageType.PRIMARY) ? ImageType.SECONDARY : ImageType.PRIMARY);
                }
            }
        }

        List<ProductImage> existing = imageRepository.findByProductId(productId);
        Map<String, ProductImage> existingByUrl = existing.stream()
                .filter(img -> img.getUrl() != null && !img.getUrl().isBlank())
                .collect(Collectors.toMap(ProductImage::getUrl, img -> img, (a, b) -> a, LinkedHashMap::new));

        List<ProductImage> persisted = new ArrayList<>();
        for (Map.Entry<String, ImageType> entry : desiredImages.entrySet()) {
            String url = entry.getKey();
            ImageType type = entry.getValue();
            ProductImage image = existingByUrl.get(url);
            if (image == null) {
                image = ProductImage.builder()
                        .product(product)
                        .url(url)
                        .type(type)
                        .build();
            } else {
                image.setType(type);
            }
            persisted.add(imageRepository.save(image));
        }

        Set<String> desiredUrls = new LinkedHashSet<>(desiredImages.keySet());
        for (ProductImage image : existing) {
            if (!desiredUrls.contains(image.getUrl())) {
                imageRepository.delete(image);
                imageStorageService.deleteByUrl(image.getUrl());
            }
        }

        if (!persisted.isEmpty() && persisted.stream().noneMatch(img -> img.getType() == ImageType.PRIMARY)) {
            ProductImage promote = persisted.get(0);
            promote.setType(ImageType.PRIMARY);
            imageRepository.save(promote);
        }

        List<ProductImage> refreshed = imageRepository.findByProductId(productId);
        refreshed.sort((a, b) -> {
            if (a.getType() == b.getType()) {
                return Long.compare(a.getId() != null ? a.getId() : Long.MAX_VALUE,
                        b.getId() != null ? b.getId() : Long.MAX_VALUE);
            }
            return a.getType() == ImageType.PRIMARY ? -1 : 1;
        });
        return refreshed;
    }

    private String materialize(String source, String folder, String nameHint) {
        if (source == null)
            return null;
        String trimmed = source.trim();
        if (trimmed.isEmpty())
            return null;
        try {
            if (ImageUploadUtils.isDataUri(trimmed)) {
                var multipart = ImageUploadUtils.dataUriToMultipartFile(trimmed, nameHint);
                return imageStorageService.upload(multipart, folder).url();
            }
            // If already Cloudinary secure URL, keep as-is (enforces Cloudinary-only
            // persistence)
            if (ImageUploadUtils.isCloudinaryUrl(trimmed)) {
                return trimmed;
            }
            // Otherwise fetch remote and re-upload to Cloudinary
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                var multipart = ImageUploadUtils.remoteImageToMultipart(trimmed, nameHint);
                return imageStorageService.upload(multipart, folder).url();
            }
            throw new IllegalArgumentException("Unsupported image source (must be data URI or HTTP URL): " + trimmed);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to materialize product image", e);
        }
    }
}
