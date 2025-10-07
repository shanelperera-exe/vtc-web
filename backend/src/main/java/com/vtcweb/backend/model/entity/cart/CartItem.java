package com.vtcweb.backend.model.entity.cart;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shopping_cart_id", nullable = false)
    private ShoppingCart shoppingCart;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "added_at")
    @Builder.Default
    private LocalDateTime addedAt = LocalDateTime.now();

    // Custom constructor for required fields
    public CartItem(ShoppingCart shoppingCart, Product product, Integer quantity) {
        this();
        this.shoppingCart = shoppingCart;
        this.product = product;
        this.quantity = quantity;
    }

    // Business logic
    public double getTotalPrice() {
        return product.getBasePrice().doubleValue() * quantity;
    }
}