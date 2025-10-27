package com.vtcweb.backend.model.entity.product;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "product_variations", uniqueConstraints = { // Ensure unique variation_key per product
                @UniqueConstraint(columnNames = { "product_id", "variation_key" })
}, indexes = { // Index to optimize queries filtering by product_id
                @Index(name = "idx_product_variations_product_id", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductVariation {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @EqualsAndHashCode.Include
        @ToString.Include
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "product_id", nullable = false)
        private Product product;

        @Column(precision = 12, scale = 2)
        private BigDecimal price;

        @Builder.Default
        @Column(nullable = false)
        private Integer stock = 0;

        @Column(name = "image_url")
        private String imageUrl;

        @Column(name = "variation_key", nullable = false, length = 500)
        @ToString.Include
        private String variationKey;

        @ElementCollection(fetch = FetchType.LAZY)
        @CollectionTable(name = "product_variation_attributes", joinColumns = @JoinColumn(name = "variation_id"), uniqueConstraints = {
                        @UniqueConstraint(columnNames = { "variation_id", "attribute_name" })
        })
        @MapKeyColumn(name = "attribute_name")
        @Column(name = "attribute_value")
        @Builder.Default
        private Map<String, String> attributes = new HashMap<>();
}
