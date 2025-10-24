package com.vtcweb.backend.service.coupon;

import com.vtcweb.backend.dto.coupon.CouponApplyRequestDTO;
import com.vtcweb.backend.dto.coupon.CouponApplyResponseDTO;

public interface CouponService {
    CouponApplyResponseDTO applyCoupon(CouponApplyRequestDTO req);
}
