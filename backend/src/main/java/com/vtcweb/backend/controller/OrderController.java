package com.vtcweb.backend.controller;

import com.vtcweb.backend.dto.order.CreateOrderRequest;
import com.vtcweb.backend.dto.order.OrderDTO;
import com.vtcweb.backend.dto.order.OrderStatusUpdateRequest;
import com.vtcweb.backend.model.entity.order.Order;
import com.vtcweb.backend.service.order.OrderService;
import com.vtcweb.backend.util.Mapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> create(@Valid @RequestBody CreateOrderRequest request) {
        Order created = orderService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(Mapper.toOrderDtoWithItems(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(Mapper.toOrderDtoShallow(orderService.getById(id)));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<OrderDTO> getByIdWithItems(@PathVariable("id") Long id) {
        return ResponseEntity.of(orderService.getByIdWithDetails(id).map(Mapper::toOrderDtoWithItems));
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO>> list(Pageable pageable) {
        Page<OrderDTO> page = orderService.list(pageable).map(Mapper::toOrderDtoShallow);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateStatus(@PathVariable("id") Long id,
                                                 @Valid @RequestBody OrderStatusUpdateRequest request) {
        Order updated = orderService.updateStatus(id, request.getNewStatus());
        return ResponseEntity.ok(Mapper.toOrderDtoShallow(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

