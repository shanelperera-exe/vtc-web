package com.vtcweb.backend.model.entity.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images", indexes = { // Indexes to optimize queries filtering by product_id and variation_id
        @Index(name = "idx_product_images_product_id", columnList = "product_id"),
        @Index(name = "idx_product_images_variation_id", columnList = "variation_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductImage {

    // Enum to define image types(Enum -> a special "class" that represents a group of constants (unchangeable variables, like final variables)
    public enum ImageType {
        PRIMARY,
        SECONDARY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    // URL of the image
    @Column(nullable = false, length = 500)
    @ToString.Include
    private String url;

    /* Type of image: PRIMARY or SECONDARY */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ImageType type;

    /* Many images can be associated with one product */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /* For images specific to a variation */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variation_id")
    private ProductVariation variation;
}
