package com.vtcweb.backend.dto.category;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Category response DTO.
 * Mirrors key fields from Category entity while avoiding exposing JPA internals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    // status: "active" or "inactive" (lowercase)
    private String status;

    // Optional short code for SKU customization (e.g., HMW for Homeware)
    private String code;

    // Image URLs (renamed to align with entity field changes)
    private String catMainImg;      // formerly categoryImage, camelCase normalized
    private String catTileImage1;   // formerly categoryIcon
    private String catTileImage2;   // formerly carouselImage
    private String carouselImg;     // new dedicated carousel image

    // Optional convenience field for UI; not persisted
    private Integer productCount;

    // Audit fields for UI (e.g., "last updated")
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
