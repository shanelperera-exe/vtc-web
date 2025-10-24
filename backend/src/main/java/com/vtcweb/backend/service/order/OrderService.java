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
    Order getByOrderNumber(String orderNumber);
    java.util.Optional<Order> getByOrderNumberWithDetails(String orderNumber);
    Optional<Order> getByIdWithDetails(Long id);
    Page<Order> list(Pageable pageable);
    Page<Order> listByCustomerEmail(String email, Pageable pageable);
    Page<Order> listByUserId(Long userId, Pageable pageable);
    Order updateStatus(Long id, OrderStatus newStatus);
    Order updateStatus(Long id, OrderStatus newStatus, java.time.LocalDateTime at);
    void delete(Long id);
}

