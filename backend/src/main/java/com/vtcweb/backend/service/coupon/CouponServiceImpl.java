package com.vtcweb.backend.service.coupon;

import com.vtcweb.backend.dto.coupon.CouponApplyRequestDTO;
import com.vtcweb.backend.dto.coupon.CouponApplyResponseDTO;
import com.vtcweb.backend.model.entity.coupon.Coupon;
import com.vtcweb.backend.repository.coupon.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponApplyResponseDTO applyCoupon(CouponApplyRequestDTO req) {
        CouponApplyResponseDTO resp = new CouponApplyResponseDTO();
        String code = req.getCode();
        resp.setCode(code);
        if (code == null || code.trim().isEmpty()) {
            resp.setValid(false);
            resp.setMessage("Coupon code required");
            resp.setDiscountAmount(BigDecimal.ZERO);
            resp.setNewSubtotal(req.getSubtotal());
            return resp;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (coupon == null) {
            resp.setValid(false);
            resp.setMessage("Coupon not found");
            resp.setDiscountAmount(BigDecimal.ZERO);
            resp.setNewSubtotal(req.getSubtotal());
            return resp;
        }

        LocalDate now = LocalDate.now();
        if (Boolean.FALSE.equals(coupon.getActive())) {
            resp.setValid(false);
            resp.setMessage("Coupon is inactive");
            resp.setDiscountAmount(BigDecimal.ZERO);
            resp.setNewSubtotal(req.getSubtotal());
            return resp;
        }
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            resp.setValid(false);
            resp.setMessage("Coupon not yet valid");
            resp.setDiscountAmount(BigDecimal.ZERO);
            resp.setNewSubtotal(req.getSubtotal());
            return resp;
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            resp.setValid(false);
            resp.setMessage("Coupon expired");
            resp.setDiscountAmount(BigDecimal.ZERO);
            resp.setNewSubtotal(req.getSubtotal());
            return resp;
        }

        BigDecimal subtotal = req.getSubtotal() == null ? BigDecimal.ZERO : req.getSubtotal();
        if (coupon.getMinSubtotal() != null && subtotal.compareTo(coupon.getMinSubtotal()) < 0) {
            resp.setValid(false);
            resp.setMessage("Cart subtotal too low for this coupon");
            resp.setDiscountAmount(BigDecimal.ZERO);
            resp.setNewSubtotal(subtotal);
            return resp;
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getPercentOff() != null && coupon.getPercentOff() > 0) {
            // compute percentage discount and round to 2 decimals
            discount = subtotal.multiply(BigDecimal.valueOf(coupon.getPercentOff()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if (coupon.getAmountOff() != null) {
            discount = coupon.getAmountOff();
        }
        if (discount.compareTo(subtotal) > 0) discount = subtotal;

        resp.setValid(true);
        resp.setMessage("Coupon applied");
        resp.setDiscountAmount(discount.setScale(2, RoundingMode.HALF_UP));
        resp.setNewSubtotal(subtotal.subtract(discount).setScale(2, RoundingMode.HALF_UP));
        return resp;
    }
}
