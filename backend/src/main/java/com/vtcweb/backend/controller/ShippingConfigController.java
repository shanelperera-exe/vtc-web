package com.vtcweb.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import com.vtcweb.backend.service.config.ShippingConfigService;

@RestController
@RequestMapping("/api/shipping-config")
public class ShippingConfigController {

    @Autowired
    private ShippingConfigService shippingConfigService;

    @GetMapping
    public ResponseEntity<BigDecimal> getShippingAmount() {
        BigDecimal amount = shippingConfigService.getAmount();
        return ResponseEntity.ok(amount);
    }
}
