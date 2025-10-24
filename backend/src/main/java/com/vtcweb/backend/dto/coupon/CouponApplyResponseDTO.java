package com.vtcweb.backend.dto.coupon;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CouponApplyResponseDTO {
    private String code;
    private boolean valid;
    private String message;
    private BigDecimal discountAmount; // amount to subtract from subtotal
    private BigDecimal newSubtotal;
}
