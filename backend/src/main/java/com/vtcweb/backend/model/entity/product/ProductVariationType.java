package com.vtcweb.backend.model.entity.product;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "variation_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductVariationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(nullable = false, length = 100)
    @ToString.Include
    private String name; // e.g. "Color", "Size", "Material"

    @OneToMany(mappedBy = "variationType", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariationOption> options = new ArrayList<>();
}
