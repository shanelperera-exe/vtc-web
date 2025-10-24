package com.vtcweb.backend.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartMergeFailureDTO {
    private Long productVariationId;
    private Integer requestedQuantity;
    private String reason;
}
