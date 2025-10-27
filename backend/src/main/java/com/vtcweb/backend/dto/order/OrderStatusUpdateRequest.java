package com.vtcweb.backend.dto.order;

import com.vtcweb.backend.model.entity.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateRequest {
    @NotNull
    private OrderStatus newStatus;

    private LocalDateTime at;
}
