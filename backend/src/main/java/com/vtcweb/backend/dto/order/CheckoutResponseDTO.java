package com.vtcweb.backend.dto.order;

import com.vtcweb.backend.model.entity.order.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponseDTO {
    private Long orderId;
    private String orderNumber;
    private OrderStatus status;
    private LocalDateTime placedAt;

    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal taxTotal;
    private BigDecimal shippingFee;
    private BigDecimal total;

    private List<OrderItemDTO> items;
}
