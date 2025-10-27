package com.vtcweb.backend.dto.order;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long categoryId;
    private String categoryName;
    private Long variationId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Map<String, String> variationAttributes;
    private String imageUrl;
}
