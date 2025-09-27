package com.vtcweb.backend.model.entity.category;

import com.vtcweb.backend.model.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)  // Lombok: Generates toString() using only fields marked with @ToString.Include
@EqualsAndHashCode(onlyExplicitlyIncluded = true)  // Lombok: Generates equals() and hashCode() using only fields marked with @EqualsAndHashCode.Include
@Builder  // Generates a builder pattern, useful for creating objects in a readable way
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  //lets the database auto-generate IDs using the identity column strategy (Auto Incrementing ID)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    @ToString.Include
    @EqualsAndHashCode.Include
    private String name;

    @Column(length = 300)
    private String description;

    // Image URLs
    @Column(name = "cat_img_url")
    private String categoryImage;   // Main banner image URL

    @Column(name = "cat_icon_url")
    private String categoryIcon;   // Category image URL

    @Column(name = "carsl_img_url")
    private String carouselImage;  // Icon image URL

    /**
     * Products that belong to this category.
     * NOTE: Avoid cascading remove from category -> product to prevent accidental data loss.
     */
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Product> products = new ArrayList<>();  // One category can have many products(No duplicates)
}
