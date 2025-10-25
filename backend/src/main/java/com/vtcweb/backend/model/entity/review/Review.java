package com.vtcweb.backend.model.entity.review;

import com.vtcweb.backend.model.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_reviews_product_id", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private com.vtcweb.backend.model.entity.user.User reviewer;

    @Column(nullable = false)
    private Integer rating; // 1..5

    @Column(length = 300)
    private String title;

    @Lob
    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(length = 120)
    private String name; // public display name

    @Column(length = 200)
    private String email; // kept private

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
