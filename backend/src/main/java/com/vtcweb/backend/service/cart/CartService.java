package com.vtcweb.backend.service.cart;

import com.vtcweb.backend.dto.cart.CartResponseDTO;
import com.vtcweb.backend.dto.cart.CartItemRequestDTO;
import com.vtcweb.backend.dto.cart.CartItemUpdateRequestDTO;
import com.vtcweb.backend.dto.cart.CartItemResponseDTO;
import java.util.List;

public interface CartService {
	CartResponseDTO getCart(Long userId);

	CartItemResponseDTO addItem(Long userId, CartItemRequestDTO request);

	CartItemResponseDTO updateItem(Long userId, Long cartItemId, CartItemUpdateRequestDTO request);

	void removeItem(Long userId, Long cartItemId);

	void clearCart(Long userId);

	CartResponseDTO mergeLocalCart(Long userId, List<CartItemRequestDTO> localItems);
}
