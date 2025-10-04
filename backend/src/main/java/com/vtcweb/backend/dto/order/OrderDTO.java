package com.vtcweb.backend.dto.order;

import com.vtcweb.backend.model.entity.order.DeliveryMethod;
import com.vtcweb.backend.model.entity.order.OrderStatus;
import com.vtcweb.backend.model.entity.order.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private LocalDateTime placedAt;
    private LocalDateTime processingStartedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;

    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;

    private AddressDTO billingAddress;
    private AddressDTO shippingAddress;

    private DeliveryMethod deliveryMethod;
    private PaymentMethod paymentMethod;
    private PaymentInfoDTO paymentInfo;

    private List<OrderItemDTO> items;

    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingFee;
    private BigDecimal total;
}

