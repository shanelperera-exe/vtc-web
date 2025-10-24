package com.vtcweb.backend.controller.coupon;

import com.vtcweb.backend.dto.coupon.CouponApplyRequestDTO;
import com.vtcweb.backend.dto.coupon.CouponApplyResponseDTO;
import com.vtcweb.backend.service.coupon.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/apply")
    public ResponseEntity<CouponApplyResponseDTO> apply(@Valid @RequestBody CouponApplyRequestDTO req) {
        CouponApplyResponseDTO resp = couponService.applyCoupon(req);
        return ResponseEntity.ok(resp);
    }
}
