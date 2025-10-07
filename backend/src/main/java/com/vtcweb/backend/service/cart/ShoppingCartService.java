package com.vtcweb.backend.service.cart;

import com.vtcweb.backend.model.entity.cart.CartItem;
import com.vtcweb.backend.model.entity.cart.ShoppingCart;
import java.util.List;

public interface ShoppingCartService {
    ShoppingCart getOrCreateCart(Long userId);
    ShoppingCart addItemToCart(Long userId, Long productId, Integer quantity);
    ShoppingCart updateItemQuantity(Long userId, Long productId, Integer quantity);
    ShoppingCart removeItemFromCart(Long userId, Long productId);
    ShoppingCart clearCart(Long userId);
    List<CartItem> getCartItems(Long userId);
    double getCartTotal(Long userId);
    int getCartItemCount(Long userId);
}