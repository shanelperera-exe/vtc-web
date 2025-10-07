package com.vtcweb.backend.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingCartDTO {
    private Long id;
    private Long userId;
    private List<CartItemDTO> cartItems;
    private Integer totalItems;
    private Double totalPrice;
}