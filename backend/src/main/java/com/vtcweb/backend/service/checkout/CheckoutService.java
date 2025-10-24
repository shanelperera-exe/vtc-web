package com.vtcweb.backend.service.checkout;

import com.vtcweb.backend.dto.order.CheckoutRequestDTO;
import com.vtcweb.backend.dto.order.CheckoutResponseDTO;

public interface CheckoutService {
    CheckoutResponseDTO checkout(Long userId, CheckoutRequestDTO request);
}
