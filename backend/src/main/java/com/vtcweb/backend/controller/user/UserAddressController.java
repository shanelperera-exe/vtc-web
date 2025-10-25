package com.vtcweb.backend.controller.user;

import com.vtcweb.backend.dto.user.BillingAddressDTO;
import com.vtcweb.backend.dto.user.ShippingAddressDTO;
import com.vtcweb.backend.service.user.UserAddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
public class UserAddressController {
    private final UserAddressService svc;

    public UserAddressController(UserAddressService svc) { this.svc = svc; }

    @GetMapping("/billing")
    public ResponseEntity<List<BillingAddressDTO>> listBilling() {
        return ResponseEntity.ok(svc.listBilling());
    }

    @PostMapping("/billing")
    public ResponseEntity<BillingAddressDTO> createBilling(@Valid @RequestBody BillingAddressDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(svc.createBilling(dto));
    }

    @PutMapping("/billing/{id}")
    public ResponseEntity<BillingAddressDTO> updateBilling(@PathVariable Long id, @Valid @RequestBody BillingAddressDTO dto) {
        return ResponseEntity.ok(svc.updateBilling(id, dto));
    }

    @DeleteMapping("/billing/{id}")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        svc.deleteBilling(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/shipping")
    public ResponseEntity<List<ShippingAddressDTO>> listShipping() {
        return ResponseEntity.ok(svc.listShipping());
    }

    @PostMapping("/shipping")
    public ResponseEntity<ShippingAddressDTO> createShipping(@Valid @RequestBody ShippingAddressDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(svc.createShipping(dto));
    }

    @PutMapping("/shipping/{id}")
    public ResponseEntity<ShippingAddressDTO> updateShipping(@PathVariable Long id, @Valid @RequestBody ShippingAddressDTO dto) {
        return ResponseEntity.ok(svc.updateShipping(id, dto));
    }

    @DeleteMapping("/shipping/{id}")
    public ResponseEntity<Void> deleteShipping(@PathVariable Long id) {
        svc.deleteShipping(id);
        return ResponseEntity.noContent().build();
    }
}
