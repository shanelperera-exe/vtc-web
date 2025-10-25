package com.vtcweb.backend.dto.cart;

import lombok.*;
import java.util.Map;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {
	private Long id;
	private Long productVariationId;
	private String productName;
	private String variationKey;
	private String imageUrl;
	private BigDecimal price;
	private Integer quantity;
	private BigDecimal itemTotal;
	private Map<String, String> attributes;
}
