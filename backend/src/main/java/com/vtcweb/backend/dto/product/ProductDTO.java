package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Product response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDTO {
    private Long id;
    private String name;
    private String shortDescription;
    private String description;

    private BigDecimal basePrice;

    // Category summary
    private Long categoryId;
    private String categoryName;

    // Images as URLs for simple rendering
    private List<String> imageUrls;

    // Include variations for details view
    private List<ProductVariationDTO> variations;

    // Optional convenience stats
    private Integer imageCount;
    private Integer variationCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
