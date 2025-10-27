package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for updating a product. All fields are optional; non-null
 * values will be applied.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateProductRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String shortDescription;

    @JsonProperty("detailedDescription")
    private String detailedDescription;

    @JsonProperty("description")
    private void legacyDescription(String legacy) {
        if (this.detailedDescription == null)
            this.detailedDescription = legacy;
    }

    @DecimalMin("0.0")
    private BigDecimal basePrice;

    private List<@Size(max = 300) String> highlights;

    @Size(max = 16)
    private String status;
}
