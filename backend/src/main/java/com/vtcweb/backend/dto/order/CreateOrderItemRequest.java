package com.vtcweb.backend.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderItemRequest {
    @NotNull
    private Long productId;
    private Long variationId; // optional

    @NotNull
    @Min(1)
    private Integer quantity;

    // Optional client-suggested unit price (will be validated/overridden by server using product/variation price if null)
    private BigDecimal unitPrice;
}

