package com.vtcweb.backend.dto.cart;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {
	private List<CartItemResponseDTO> items;
	private BigDecimal subtotal;
	private BigDecimal tax;
	private BigDecimal total;
	@Builder.Default
	private List<CartMergeFailureDTO> mergeFailures = List.of();
}
