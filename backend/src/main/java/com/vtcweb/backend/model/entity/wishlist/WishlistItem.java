package com.vtcweb.backend.model.entity.wishlist;

import com.vtcweb.backend.model.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wishlist_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_wishlist_item_wishlist_product", columnNames = { "wishlist_id", "product_id" })
}, indexes = {
        @Index(name = "idx_wishlist_items_wishlist_id", columnList = "wishlist_id"),
        @Index(name = "idx_wishlist_items_product_id", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wishlist_id", nullable = false)
    private Wishlist wishlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
