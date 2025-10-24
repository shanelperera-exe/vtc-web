package com.vtcweb.backend.dto.order;

import com.vtcweb.backend.model.entity.order.DeliveryMethod;
import com.vtcweb.backend.model.entity.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {
    // Optional customer snapshot fields; if omitted, service will fallback to authenticated user
    private String customerFirstName;
    private String customerLastName;
    @Email
    private String customerEmail;
    private String customerPhone;

    @Valid
    @NotNull
    private AddressDTO billingAddress;

    @Valid
    @NotNull
    private AddressDTO shippingAddress;

    @NotNull
    private DeliveryMethod deliveryMethod;

    @NotNull
    private PaymentMethod paymentMethod;

    @Valid
    private PaymentInfoDTO paymentInfo; // required if CARD

    private BigDecimal shippingFee; // optional override
    private BigDecimal discountTotal; // optional
    // Optional coupon code applied by customer
    private String couponCode;

    // Optional free-text order notes from customer
    @Size(max = 5000)
    private String orderNotes;
}
