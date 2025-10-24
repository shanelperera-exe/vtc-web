package com.vtcweb.backend.model.entity.product;

import com.vtcweb.backend.model.entity.category.Category;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_products_sku", columnNames = {"sku"})
       },
       indexes = {
           @Index(name = "idx_products_category_id", columnList = "category_id"),
           @Index(name = "idx_products_status", columnList = "status")
       }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "sku", nullable = false, length = 40, unique = true)
    @ToString.Include
    private String sku; // Immutable stock keeping unit

    @Column(nullable=false, length=150)
    @ToString.Include
    private String name;

    @Column
    private String shortDescription;

    @Lob // Large Object, suitable for large text or binary data
    @Column(name = "description", columnDefinition = "TEXT")
    private String detailedDescription; // renamed from description

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable=false, precision = 12, scale = 2)
    @ToString.Include
    private BigDecimal basePrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = true, length = 16)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariation> variations = new ArrayList<>();

    // Use Set to avoid Hibernate multiple bag fetch issues when fetching several collections eagerly
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductImage> images = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_highlights", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "highlight", length = 300, nullable = false)
    @Builder.Default
    private List<String> highlights = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}