package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for creating a product.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateProductRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String shortDescription;

    @JsonProperty("detailedDescription")
    private String detailedDescription;

    @JsonProperty("description")
    private void legacyDescription(String legacy) { if (this.detailedDescription == null) this.detailedDescription = legacy; }

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal basePrice;

    // The category to place the product into
    @NotNull
    private Long categoryId;

    // Optional bullet-point highlights
    private List<@Size(max = 300) String> highlights;

    // Optional client-supplied SKU; backend overrides with generated value.
    @Size(max = 40)
    private String sku;

    // Optional status at creation; defaults to ACTIVE server-side if missing
    @Size(max = 16)
    private String status;
}
