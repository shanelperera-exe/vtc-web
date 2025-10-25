package com.vtcweb.backend.service.category;

import com.vtcweb.backend.exception.ConflictException;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.repository.category.CategoryRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.service.storage.ImageStorageService;
import com.vtcweb.backend.util.ImageUploadUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@lombok.extern.slf4j.Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ImageStorageService imageStorageService; // for cloud cleanup & uploads

    @Override
    public Category create(Category category) {
        if (category == null) throw new IllegalArgumentException("category must not be null");
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("category.name must not be blank");
        }
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new ConflictException("Category name already exists: " + category.getName());
        }
        // Default status
        if (category.getStatus() == null) {
            category.setStatus(com.vtcweb.backend.model.entity.category.CategoryStatus.ACTIVE);
        }
        // Validate optional code
        if (category.getCode() != null) {
            String trimmed = category.getCode().trim().toUpperCase();
            if (!trimmed.isEmpty() && !trimmed.matches("[A-Z0-9]{1,3}")) {
                throw new IllegalArgumentException("category.code must be 1-3 alphanumeric chars (A-Z0-9)");
            }
            category.setCode(trimmed.isEmpty() ? null : trimmed);
        } else {
            // Auto-generate if not supplied
            category.setCode(generateCodeFromName(category.getName()));
        }
        // Materialize any inline image payloads (data URIs) prior to initial persist
        String slug = slugify(category.getName());
        String folder = buildCategoryFolder(slug);
        category.setCatMainImg(materializeImage(category.getCatMainImg(), folder, slug + "-main"));
        category.setCatTileImage1(materializeImage(category.getCatTileImage1(), folder, slug + "-tile1"));
        category.setCatTileImage2(materializeImage(category.getCatTileImage2(), folder, slug + "-tile2"));
        category.setCarouselImg(materializeImage(category.getCarouselImg(), folder, slug + "-carousel"));

        // Ensure id is null so JPA treats it as new
        category.setId(null);
        // Default status if not provided
        if (category.getStatus() == null) {
            category.setStatus(com.vtcweb.backend.model.entity.category.CategoryStatus.ACTIVE);
        }
        return categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Category getById(Long id) {
        if (id == null) throw new IllegalArgumentException("id must not be null");
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Category> list(Pageable pageable) {
        if (pageable == null) throw new IllegalArgumentException("pageable must not be null");
        return categoryRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Category> list(Pageable pageable, com.vtcweb.backend.model.entity.category.CategoryStatus status) {
        if (pageable == null) throw new IllegalArgumentException("pageable must not be null");
        if (status == null) return categoryRepository.findAll(pageable);
        return categoryRepository.findByStatus(status, pageable);
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

        String slug = slugify(existing.getName());
        String folder = buildCategoryFolder(slug);

        if (updates.getCatMainImg() != null) {
            String resolved = materializeImage(updates.getCatMainImg(), folder, slug + "-main");
            boolean clearRequested = updates.getCatMainImg().trim().isEmpty();
            if (resolved == null && clearRequested) {
                if (existing.getCatMainImg() != null) {
                    imageStorageService.deleteByUrl(existing.getCatMainImg());
                    existing.setCatMainImg(null);
                }
            } else if (resolved != null && !resolved.equals(existing.getCatMainImg())) {
                imageStorageService.deleteByUrl(existing.getCatMainImg());
                existing.setCatMainImg(resolved);
            }
        }
        if (updates.getCatTileImage1() != null) {
            String resolved = materializeImage(updates.getCatTileImage1(), folder, slug + "-tile1");
            boolean clearRequested = updates.getCatTileImage1().trim().isEmpty();
            if (resolved == null && clearRequested) {
                if (existing.getCatTileImage1() != null) {
                    imageStorageService.deleteByUrl(existing.getCatTileImage1());
                    existing.setCatTileImage1(null);
                }
            } else if (resolved != null && !resolved.equals(existing.getCatTileImage1())) {
                imageStorageService.deleteByUrl(existing.getCatTileImage1());
                existing.setCatTileImage1(resolved);
            }
        }
        if (updates.getCatTileImage2() != null) {
            String resolved = materializeImage(updates.getCatTileImage2(), folder, slug + "-tile2");
            boolean clearRequested = updates.getCatTileImage2().trim().isEmpty();
            if (resolved == null && clearRequested) {
                if (existing.getCatTileImage2() != null) {
                    imageStorageService.deleteByUrl(existing.getCatTileImage2());
                    existing.setCatTileImage2(null);
                }
            } else if (resolved != null && !resolved.equals(existing.getCatTileImage2())) {
                imageStorageService.deleteByUrl(existing.getCatTileImage2());
                existing.setCatTileImage2(resolved);
            }
        }
        if (updates.getCarouselImg() != null) {
            String resolved = materializeImage(updates.getCarouselImg(), folder, slug + "-carousel");
            boolean clearRequested = updates.getCarouselImg().trim().isEmpty();
            if (resolved == null && clearRequested) {
                if (existing.getCarouselImg() != null) {
                    imageStorageService.deleteByUrl(existing.getCarouselImg());
                    existing.setCarouselImg(null);
                }
            } else if (resolved != null && !resolved.equals(existing.getCarouselImg())) {
                imageStorageService.deleteByUrl(existing.getCarouselImg());
                existing.setCarouselImg(resolved);
            }
        }
        // Status
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        // Code (allow change; does NOT retroactively regenerate existing product SKUs)
        if (updates.getCode() != null) {
            String trimmed = updates.getCode().trim().toUpperCase();
            if (!trimmed.isEmpty() && !trimmed.matches("[A-Z0-9]{1,3}")) {
                throw new IllegalArgumentException("category.code must be 1-3 alphanumeric chars (A-Z0-9)");
            }
            existing.setCode(trimmed.isEmpty() ? null : trimmed);
        } else if (existing.getCode() == null && updates.getName() != null && !updates.getName().isBlank()) {
            // If still no code, generate one from (possibly updated) name
            existing.setCode(generateCodeFromName(existing.getName()));
        }
        // Status
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        return categoryRepository.save(existing);
    }

    /**
     * Build a 3-character code from a category name favoring consonants after the first letter.
     * Example: Homeware -> HMW, Plastic -> PLS, Stationary -> STT (first + next consonants).
     */
    private String generateCodeFromName(String name) {
        if (name == null) return null;
        String cleaned = name.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (cleaned.isEmpty()) return null;
        StringBuilder code = new StringBuilder();
        code.append(cleaned.charAt(0));
        String vowels = "AEIOU";
        // Pass 1: consonants after first
        for (int i = 1; i < cleaned.length() && code.length() < 3; i++) {
            char c = cleaned.charAt(i);
            if (Character.isLetter(c) && vowels.indexOf(c) == -1) {
                code.append(c);
            } else if (Character.isDigit(c)) {
                // Allow digits as a fallback consonant-like char
                code.append(c);
            }
        }
        // Pass 2: fill with remaining characters (including vowels)
        for (int i = 1; i < cleaned.length() && code.length() < 3; i++) {
            char c = cleaned.charAt(i);
            if (code.indexOf(String.valueOf(c)) == -1) {
                code.append(c);
            }
        }
        while (code.length() < 3) code.append('X');
        return code.substring(0,3);
    }

    private String materializeImage(String raw, String folder, String nameHint) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null; // explicit clear
        }
        try {
            if (ImageUploadUtils.isDataUri(trimmed)) {
                var multipart = ImageUploadUtils.dataUriToMultipartFile(trimmed, nameHint);
                return imageStorageService.upload(multipart, folder).url();
            }
            if (ImageUploadUtils.isCloudinaryUrl(trimmed)) {
                return trimmed; // already a Cloudinary asset
            }
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                var multipart = ImageUploadUtils.remoteImageToMultipart(trimmed, nameHint);
                return imageStorageService.upload(multipart, folder).url();
            }
            throw new IllegalArgumentException("Unsupported image source (must be data URI or HTTP URL): " + trimmed);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to materialize category image", e);
        }
    }

    private String slugify(String name) {
        if (name == null) return "category";
        String normalized = name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (normalized.isBlank()) {
            normalized = "category";
        }
        return normalized;
    }

    private String buildCategoryFolder(String slug) {
        String effective = (slug == null || slug.isBlank()) ? "category" : slug;
        return "categories/" + effective;
    }

    @Override
    public void delete(Long id) {
        if (id == null) throw new IllegalArgumentException("id must not be null");
        Category existing = getById(id);
        if (productRepository.existsByCategory_Id(existing.getId())) {
            throw new ConflictException("Cannot delete category with existing products: id=" + id);
        }
        // Best-effort cloud cleanup (ignore failures)
        boolean mainDel = imageStorageService.deleteByUrl(existing.getCatMainImg());
        boolean iconDel = imageStorageService.deleteByUrl(existing.getCatTileImage1());
        boolean carDel = imageStorageService.deleteByUrl(existing.getCatTileImage2());
        boolean carouselDel = imageStorageService.deleteByUrl(existing.getCarouselImg());
        log.debug("Category {} image cleanup results: main={}, icon={}, tile2={}, carouselImg={}", id, mainDel, iconDel, carDel, carouselDel);
        categoryRepository.deleteById(id);
    }
}
