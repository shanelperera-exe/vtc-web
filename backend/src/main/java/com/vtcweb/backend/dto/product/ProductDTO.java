package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String sku; // immutable identifier
    private String name;
    private String shortDescription;
    @JsonProperty("detailedDescription")
    private String detailedDescription;

    private BigDecimal basePrice;
    
    private BigDecimal price;

    private BigDecimal compareAtPrice;

    private Long categoryId;
    private String categoryName;

    private String category;

    private List<String> imageUrls;

    private String image;
    private String primaryImageUrl;

    private List<ProductVariationDTO> variations;

    private List<String> highlights;

    private Integer imageCount;
    private Integer variationCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String status; // "active" | "inactive"
}
