package com.vtcweb.backend.service.order;

import com.vtcweb.backend.dto.order.CreateOrderRequest;
import com.vtcweb.backend.model.entity.order.Order;
import com.vtcweb.backend.model.entity.order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface OrderService {
    Order create(CreateOrderRequest request);
    Order getById(Long id);
    Optional<Order> getByIdWithDetails(Long id);
    Page<Order> list(Pageable pageable);
    Order updateStatus(Long id, OrderStatus newStatus);
    void delete(Long id);
}

