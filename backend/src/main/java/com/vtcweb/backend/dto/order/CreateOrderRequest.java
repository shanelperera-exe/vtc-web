package com.vtcweb.backend.dto.order;

import com.vtcweb.backend.model.entity.order.DeliveryMethod;
import com.vtcweb.backend.model.entity.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotBlank
    private String customerFirstName;
    @NotBlank
    private String customerLastName;
    @Email
    @NotBlank
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
    private PaymentInfoDTO paymentInfo; // required if paymentMethod == CARD

    @Valid
    @NotEmpty
    private List<CreateOrderItemRequest> items;

    private BigDecimal shippingFee; // optional default 0
    private BigDecimal discountTotal; // optional default 0
}
