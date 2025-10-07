package com.vtcweb.backend.model.entity.cart;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shopping_carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "cartItems"})
public class ShoppingCart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "shoppingCart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Custom constructor for required fields
    public ShoppingCart(User user) {
        this();
        this.user = user;
    }

    // Helper methods
    public void addCartItem(CartItem cartItem) {
        cartItems.add(cartItem);
        cartItem.setShoppingCart(this);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeCartItem(CartItem cartItem) {
        cartItems.remove(cartItem);
        cartItem.setShoppingCart(null);
        this.updatedAt = LocalDateTime.now();
    }

    public double getTotalPrice() {
        return cartItems.stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
    }

    public int getTotalItems() {
        return cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
}