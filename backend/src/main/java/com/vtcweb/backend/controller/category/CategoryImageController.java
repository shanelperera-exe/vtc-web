package com.vtcweb.backend.controller.category;

import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.service.category.CategoryService;
import com.vtcweb.backend.service.storage.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;

/**
 * Endpoints for uploading category related images (main, icon, carousel).
 * Uses the generic {@link ImageStorageService} (Cloudinary implementation) and persists
 * the resulting URL into the appropriate field on the Category entity.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryImageController {

    private final ImageStorageService imageStorageService;
    private final CategoryService categoryService;

    /**
     * Upload an image for a category. The client specifies which logical slot to fill via the
     * "slot" request parameter.
     * Accepted values (new naming only):
     *  - main     -> catMainImg
     *  - tile1    -> catTileImage1
     *  - tile2    -> catTileImage2
     *  - carousel -> carouselImg (dedicated carousel / banner usage)
     * If omitted defaults to 'main'. Legacy slot names (icon, carousel2, carousel(alias for tile2)) are no longer accepted.
     */
    @PostMapping(value = "/{categoryId}/image/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> uploadCategoryImage(@PathVariable Long categoryId,
                                                                   @RequestParam("file") MultipartFile file,
                                                                   @RequestParam(name = "slot", required = false) String slot) {
        if (file == null || file.isEmpty()) {
            log.warn("Category image upload: missing or empty file. categoryId={}, slot={} (raw slot param={})", categoryId, slot, slot);
            throw new IllegalArgumentException("file is required");
        }
        String normalizedSlot = (slot == null || slot.isBlank()) ? "main" : slot.trim().toLowerCase();
        if (!(normalizedSlot.equals("main") || normalizedSlot.equals("tile1") || normalizedSlot.equals("tile2") || normalizedSlot.equals("carousel"))) {
            throw new IllegalArgumentException("slot must be one of: main, tile1, tile2, carousel");
        }

        // Desired folder structure: categories/{category-name-slug}
        Category existing = categoryService.getById(categoryId);
        String name = existing.getName() != null ? existing.getName() : ("category-" + categoryId);
        String slug = name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (slug.isBlank()) slug = "category-" + categoryId;
        String folder = "categories/" + slug; // all images for this category stored together
        long start = System.currentTimeMillis();
        ImageStorageService.UploadResult uploaded = imageStorageService.upload(file, folder);
        long duration = System.currentTimeMillis() - start;
        log.info("Uploaded category image: categoryId={}, slot={}, folder='{}', publicId={}, bytes={}, took={}ms", categoryId, normalizedSlot, folder, uploaded.publicId(), uploaded.bytes(), duration);

        // Persist URL in the chosen field (existing already loaded)
        switch (normalizedSlot) {
            case "tile1" -> existing.setCatTileImage1(uploaded.url());
            case "tile2" -> existing.setCatTileImage2(uploaded.url());
            case "carousel" -> existing.setCarouselImg(uploaded.url());
            default -> existing.setCatMainImg(uploaded.url());
        }
        Category updated = categoryService.update(categoryId, existing); // reuse update logic

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
        return ResponseEntity.created(location).body(Map.of(
                "categoryId", updated.getId(),
                "slot", normalizedSlot,
                "url", switch (normalizedSlot) {
                    case "tile1" -> updated.getCatTileImage1();
                    case "tile2" -> updated.getCatTileImage2();
                    case "carousel" -> updated.getCarouselImg();
                    default -> updated.getCatMainImg();
                },
                "publicId", uploaded.publicId(),
                "bytes", uploaded.bytes(),
                "format", uploaded.format()
        ));
    }
}
