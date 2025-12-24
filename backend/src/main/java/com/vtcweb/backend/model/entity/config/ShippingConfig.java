package com.vtcweb.backend.model.entity.config;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "shipping_config")
public class ShippingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shipping_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    // Legacy column present in some databases; keep in sync when writing.
    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal legacyAmount;


    public ShippingConfig() {}

    public ShippingConfig(Long id, BigDecimal amount) {
        this.id = id;
        this.amount = amount;
        this.legacyAmount = amount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getLegacyAmount() {
        return legacyAmount;
    }

    public void setLegacyAmount(BigDecimal legacyAmount) {
        this.legacyAmount = legacyAmount;
    }
}
