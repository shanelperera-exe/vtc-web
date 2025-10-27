package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductVariationCreateRequest {

    @DecimalMin("0.0")
    private BigDecimal price;

    @Min(0)
    private Integer stock;

    private String imageUrl;

    /**
     * Required: free-form attributes for this variation. Example: {"Color": "Red",
     * "Size": "M"}
     * The server derives a deterministic internal key from these attributes and
     * uses it for uniqueness per product.
     */
    private Map<String, String> attributes;
}
