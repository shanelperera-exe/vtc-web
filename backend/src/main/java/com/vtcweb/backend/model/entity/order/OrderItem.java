package com.vtcweb.backend.model.entity.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_items_order_id", columnList = "order_id"),
        @Index(name = "idx_order_items_product_id", columnList = "product_id"),
        @Index(name = "idx_order_items_variation_id", columnList = "variation_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Snapshot identifiers & names (denormalized for history integrity)
    @Column(name = "product_id", nullable = false)
    private Long productId;

    private String productName;

    @Column(name = "category_id")
    private Long categoryId;

    private String categoryName;

    @Column(name = "variation_id")
    private Long variationId; // optional

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    // Variation attributes snapshot
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "order_item_attributes", joinColumns = @JoinColumn(name = "order_item_id"))
    @MapKeyColumn(name = "attribute_name")
    @Column(name = "attribute_value")
    @Builder.Default
    private Map<String, String> variationAttributes = new HashMap<>();
}
