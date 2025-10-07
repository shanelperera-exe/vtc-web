package com.vtcweb.backend.repository.cart;

import com.vtcweb.backend.model.entity.cart.CartItem;
import com.vtcweb.backend.model.entity.cart.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByShoppingCart(ShoppingCart shoppingCart);
    Optional<CartItem> findByShoppingCartAndProductId(ShoppingCart shoppingCart, Long productId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.shoppingCart = :shoppingCart AND ci.product.id = :productId")
    void deleteByShoppingCartAndProductId(@Param("shoppingCart") ShoppingCart shoppingCart, 
                                         @Param("productId") Long productId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.shoppingCart = :shoppingCart")
    void deleteAllByShoppingCart(@Param("shoppingCart") ShoppingCart shoppingCart);
}