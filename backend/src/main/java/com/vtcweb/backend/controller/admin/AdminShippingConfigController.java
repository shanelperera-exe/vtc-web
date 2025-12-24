package com.vtcweb.backend.controller.admin;

// import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.core.env.Environment;
import java.math.BigDecimal;
import com.vtcweb.backend.service.config.ShippingConfigService;

@RestController
@RequestMapping("/api/admin/shipping-config")
public class AdminShippingConfigController {

    @Autowired
    private ShippingConfigService shippingConfigService;

    @GetMapping
    public ResponseEntity<BigDecimal> getShippingAmount() {
        BigDecimal amount = shippingConfigService.getAmount();
        return ResponseEntity.ok(amount);
    }

    @PostMapping
    public ResponseEntity<?> setShippingAmount(@RequestParam("amount") BigDecimal amount) {
        try {
            shippingConfigService.setAmount(amount);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update shipping amount");
        }
    }
}
