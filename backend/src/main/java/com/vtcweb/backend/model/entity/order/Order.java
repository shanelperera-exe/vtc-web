package com.vtcweb.backend.model.entity.order;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.vtcweb.backend.model.entity.user.User;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_order_number", columnList = "orderNumber", unique = true),
        @Index(name = "idx_orders_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    @ToString.Include
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime placedAt; // creation timestamp

    private LocalDateTime processingStartedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;

    // Customer info snapshot
    @Column(nullable = false, length = 80)
    private String customerFirstName;

    @Column(nullable = false, length = 80)
    private String customerLastName;

    @Column(nullable = false, length = 160)
    private String customerEmail;

    @Column(length = 40)
    private String customerPhone;

    // Link to registered user (optional). Keep customer snapshot fields for
    // historical integrity.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Addresses
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "company", column = @Column(name = "billing_company")),
            @AttributeOverride(name = "line1", column = @Column(name = "billing_line1")),
            @AttributeOverride(name = "line2", column = @Column(name = "billing_line2")),
            @AttributeOverride(name = "city", column = @Column(name = "billing_city")),
            @AttributeOverride(name = "district", column = @Column(name = "billing_district")),
            @AttributeOverride(name = "province", column = @Column(name = "billing_province")),
            @AttributeOverride(name = "postalCode", column = @Column(name = "billing_postal_code")),
            @AttributeOverride(name = "country", column = @Column(name = "billing_country"))
    })
    private Address billingAddress;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "company", column = @Column(name = "shipping_company")),
            @AttributeOverride(name = "line1", column = @Column(name = "shipping_line1")),
            @AttributeOverride(name = "line2", column = @Column(name = "shipping_line2")),
            @AttributeOverride(name = "city", column = @Column(name = "shipping_city")),
            @AttributeOverride(name = "district", column = @Column(name = "shipping_district")),
            @AttributeOverride(name = "province", column = @Column(name = "shipping_province")),
            @AttributeOverride(name = "postalCode", column = @Column(name = "shipping_postal_code")),
            @AttributeOverride(name = "country", column = @Column(name = "shipping_country"))
    })
    private Address shippingAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DeliveryMethod deliveryMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Embedded
    private PaymentInfo paymentInfo; // optional if COD

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // Monetary snapshot
    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal subtotal; // sum of item totalPrice

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal discountTotal; // total discounts applied

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal taxTotal; // total tax applied

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal shippingFee; // shipping cost

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal total; // subtotal - discount + shipping

    @Column(name = "order_notes", columnDefinition = "TEXT")
    private String orderNotes;

    // Idempotency guard to ensure we don't increment stock more than once when an
    // order is cancelled
    @Column(nullable = false)
    @Builder.Default
    private boolean stockRestored = false;

    public void addItem(OrderItem item) {
        if (item == null)
            return;
        items.add(item);
        item.setOrder(this);
    }
}
