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
    private Long variationId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private BigDecimal unitPrice;
}
