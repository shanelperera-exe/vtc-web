package com.vtcweb.backend.model.entity.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(  // Define table name and unique constraints to ensure no duplicate options for the same variation type
    name = "variation_options",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"variation_type_id", "value"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductVariationOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(nullable = false, length = 100)
    @ToString.Include
    private String value; // e.g. "Red", "Large", "Cotton"


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variation_type_id", nullable = false)
    private ProductVariationType variationType;
}
