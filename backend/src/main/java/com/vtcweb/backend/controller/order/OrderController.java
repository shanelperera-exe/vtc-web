package com.vtcweb.backend.controller.order;

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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final com.vtcweb.backend.service.user.UserService userService;

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
        Order order = orderService.getById(id);
        enforceOwnerOrAdmin(order);
        return ResponseEntity.ok(Mapper.toOrderDtoShallow(order));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<OrderDTO> getByIdWithItems(@PathVariable("id") Long id) {
        Order order = orderService.getById(id);
        enforceOwnerOrAdmin(order);
        return ResponseEntity.of(orderService.getByIdWithDetails(id).map(Mapper::toOrderDtoWithItems));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<OrderDTO>> list(Pageable pageable) {
        Page<OrderDTO> page = orderService.list(pageable).map(Mapper::toOrderDtoShallow);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDTO> getByOrderNumber(@PathVariable("orderNumber") String orderNumber) {
        Order order = orderService.getByOrderNumber(orderNumber);
        enforceOwnerOrAdmin(order);
        return ResponseEntity.ok(Mapper.toOrderDtoShallow(order));
    }

    @GetMapping("/number/{orderNumber}/details")
    public ResponseEntity<OrderDTO> getByOrderNumberWithItems(@PathVariable("orderNumber") String orderNumber) {
        Order order = orderService.getByOrderNumber(orderNumber);
        enforceOwnerOrAdmin(order);
        return ResponseEntity.of(orderService.getByOrderNumberWithDetails(orderNumber).map(Mapper::toOrderDtoWithItems));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<Page<OrderDTO>> myOrders(Pageable pageable) {
        // Prefer querying by user id when the current user is a registered account.
        try {
            com.vtcweb.backend.dto.user.UserDto me = userService.getCurrent();
            if (me != null && me.getId() != null) {
                Page<OrderDTO> page = orderService.listByUserId(me.getId(), pageable).map(Mapper::toOrderDtoShallow);
                return ResponseEntity.ok(page);
            }
        } catch (Exception ignored) {
            // Fall back to email-based query for compatibility (e.g., guest accounts linked by email)
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        Page<OrderDTO> page = orderService.listByCustomerEmail(email, pageable).map(Mapper::toOrderDtoShallow);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<OrderDTO> updateStatus(@PathVariable("id") Long id,
                                                 @Valid @RequestBody OrderStatusUpdateRequest request) {
        Order updated = orderService.updateStatus(id, request.getNewStatus());
        return ResponseEntity.ok(Mapper.toOrderDtoShallow(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','MANAGER')")
    public ResponseEntity<OrderDTO> cancel(@PathVariable("id") Long id) {
        Order order = orderService.getById(id);
        enforceOwnerOrAdmin(order);
        Order updated = orderService.updateStatus(id, com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED);
        return ResponseEntity.ok(Mapper.toOrderDtoShallow(updated));
    }

    private void enforceOwnerOrAdmin(Order order) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return; // will be blocked by global security if unauthenticated
        String email = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> {
            String r = a.getAuthority();
            return "ROLE_ADMIN".equals(r) || "ROLE_MANAGER".equals(r);
        });
        if (!isAdmin && order != null && order.getCustomerEmail() != null && !order.getCustomerEmail().equalsIgnoreCase(email)) {
            throw new com.vtcweb.backend.exception.ForbiddenException("Access denied");
        }
    }
}

