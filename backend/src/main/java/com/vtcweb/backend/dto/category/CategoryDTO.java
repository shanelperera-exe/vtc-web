package com.vtcweb.backend.dto.category;

import com.fasterxml.jackson.annotation.JsonInclude;
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

    // Image URLs
    private String categoryImage;
    private String categoryIcon;
    private String carouselImage;

    // Optional convenience field for UI; not persisted
    private Integer productCount;
}
