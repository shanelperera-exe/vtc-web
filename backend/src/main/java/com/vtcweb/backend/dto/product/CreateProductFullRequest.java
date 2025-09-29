package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateProductFullRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String shortDescription;

    private String description;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal basePrice;

    @NotNull
    private Long categoryId;

    @Valid
    private List<ProductImageCreateRequest> images;

    @Valid
    private List<ProductVariationCreateRequest> variations;
}

