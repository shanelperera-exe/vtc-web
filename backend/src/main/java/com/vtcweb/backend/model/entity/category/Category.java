package com.vtcweb.backend.model.entity.category;

import com.vtcweb.backend.model.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
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

    /**
     * Optional short code (up to 3 alphanumeric chars) used for SKU generation.
     * If null or invalid, system derives code from the category name.
     */
    @Column(name = "code", length = 3, unique = false, nullable = true)
    private String code; // e.g. HMW for Homeware

    // Image URLs
    @Column(name = "cat_main_img_url")
    private String catMainImg;   // Main banner image URL (renamed from categoryImage, camelCase fixed)

    @Column(name = "cat_tile_1_url")
    private String catTileImage1;   // Category image tile 1 (renamed from categoryIcon)

    @Column(name = "cat_tile_2_url")
    private String catTileImage2;  // Category image tile 2 (formerly carouselImage)

    // Removed dedicated carousel image: carousel is now static on frontend

    /**
     * Activity status for the category. ACTIVE categories are visible/selectable; INACTIVE are hidden/disabled.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    @Builder.Default
    private CategoryStatus status = CategoryStatus.ACTIVE;

    

    /**
     * Products that belong to this category.
     * NOTE: Avoid cascading remove from category -> product to prevent accidental data loss.
     */
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Product> products = new ArrayList<>();  // One category can have many products(No duplicates)

    // Auditing timestamps
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
