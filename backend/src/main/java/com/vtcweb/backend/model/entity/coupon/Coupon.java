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

    private Integer percentOff;

    private BigDecimal amountOff;

    private LocalDate startsAt;
    private LocalDate expiresAt;

    private Boolean active = true;

    private BigDecimal minSubtotal;
}
