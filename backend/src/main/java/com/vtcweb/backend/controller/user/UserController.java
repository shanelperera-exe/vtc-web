package com.vtcweb.backend.controller.user;

import com.vtcweb.backend.dto.user.*;
import com.vtcweb.backend.service.user.UserService;
import com.vtcweb.backend.service.user.UserAddressService;
import com.vtcweb.backend.dto.user.BillingAddressDTO;
import com.vtcweb.backend.dto.user.ShippingAddressDTO;
import com.vtcweb.backend.service.order.OrderService;
import com.vtcweb.backend.dto.order.OrderDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.Set;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final OrderService orderService;
    private final UserAddressService userAddressService;

    public UserController(UserService userService, OrderService orderService, UserAddressService userAddressService) {
        this.userService = userService;
        this.orderService = orderService;
        this.userAddressService = userAddressService;
    }

    // Current user endpoints
    @GetMapping("/users/me")
    public ResponseEntity<UserDto> current() {
        return ResponseEntity.ok(userService.getCurrent());
    }

    @PutMapping("/users/me")
    public ResponseEntity<UserDto> updateCurrent(@Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(userService.updateCurrent(req));
    }

    @PostMapping("/users/me/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        userService.changePasswordCurrent(req);
        return ResponseEntity.noContent().build();
    }

    // Admin / Manager endpoints (MANAGER can do everything; ADMIN limited to
    // customer accounts enforced in service layer)
    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<UserDto>> list(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 100));
        return ResponseEntity.ok(userService.listWithStats(pageable));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // Fetch by userCode (external identifier) for frontend-friendly routing
    @GetMapping("/admin/users/code/{userCode}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserDto> getByCode(@PathVariable String userCode) {
        return ResponseEntity.ok(userService.getByUserCode(userCode));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(userService.update(id, req));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Update enabled/disabled status
    @PutMapping("/admin/users/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserDto> updateStatus(@PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest req) {
        return ResponseEntity.ok(userService.updateStatus(id, Boolean.TRUE.equals(req.getEnabled())));
    }

    // Manager-only endpoint to change roles (MANAGER can assign roles including
    // ADMIN); service prevents unlawful downgrades if needed
    @PutMapping("/admin/users/{id}/roles")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<UserDto> updateRoles(@PathVariable Long id, @RequestBody Set<String> roles) {
        return ResponseEntity.ok(userService.updateUserRoles(id, roles));
    }

    // Orders of a specific user (by customer's email snapshot at order time)
    @GetMapping("/admin/users/{id}/orders")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<OrderDTO>> userOrders(@PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 100));
        // Use service to get email (also enforces scope)
        UserDto user = userService.getById(id);
        Page<OrderDTO> orders = orderService.listByCustomerEmail(user.getEmail(), pageable)
                .map(com.vtcweb.backend.util.Mapper::toOrderDtoWithItems);
        return ResponseEntity.ok(orders);
    }

    // Addresses of a specific user
    @GetMapping("/admin/users/{id}/addresses/billing")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<java.util.List<BillingAddressDTO>> userBillingAddresses(@PathVariable Long id) {
        // getById enforces scope and 404 if no such user
        userService.getById(id);
        return ResponseEntity.ok(userAddressService.listBillingForUser(id));
    }

    @GetMapping("/admin/users/{id}/addresses/shipping")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<java.util.List<ShippingAddressDTO>> userShippingAddresses(@PathVariable Long id) {
        userService.getById(id);
        return ResponseEntity.ok(userAddressService.listShippingForUser(id));
    }

    // Orders by userCode wrapper for convenience
    @GetMapping("/admin/users/code/{userCode}/orders")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<OrderDTO>> userOrdersByCode(@PathVariable String userCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 100));
        UserDto user = userService.getByUserCode(userCode);
        Page<OrderDTO> orders = orderService.listByCustomerEmail(user.getEmail(), pageable)
                .map(com.vtcweb.backend.util.Mapper::toOrderDtoWithItems);
        return ResponseEntity.ok(orders);
    }
}
