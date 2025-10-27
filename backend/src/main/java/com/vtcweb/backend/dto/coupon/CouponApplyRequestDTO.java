package com.vtcweb.backend.dto.coupon;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CouponApplyRequestDTO {
    private String code;
    private BigDecimal subtotal;
}
