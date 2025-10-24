package com.vtcweb.backend.model.entity.coupon;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    // percentage discount (0-100) if set
    private Integer percentOff;

    // fixed amount discount in smallest currency unit (e.g., LKR)
    private BigDecimal amountOff;

    private LocalDate startsAt;
    private LocalDate expiresAt;

    private Boolean active = true;

    // minimum subtotal to apply coupon
    private BigDecimal minSubtotal;
}
