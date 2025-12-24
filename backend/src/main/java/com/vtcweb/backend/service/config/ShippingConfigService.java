package com.vtcweb.backend.service.config;

import com.vtcweb.backend.model.entity.config.ShippingConfig;
import com.vtcweb.backend.repository.config.ShippingConfigRepository;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ShippingConfigService {

    private final ShippingConfigRepository repo;
    private final Environment env;

    public ShippingConfigService(ShippingConfigRepository repo, Environment env) {
        this.repo = repo;
        this.env = env;
    }

    public BigDecimal getAmount() {
        return repo.findTopByOrderByIdAsc()
                .map(ShippingConfig::getAmount)
                .orElseGet(() -> new BigDecimal(env.getProperty("shipping.amount", "0")));
    }

    public ShippingConfig setAmount(BigDecimal amount) {
        return repo.findTopByOrderByIdAsc()
                .map(cfg -> { cfg.setAmount(amount); return repo.save(cfg); })
                .orElseGet(() -> repo.save(new ShippingConfig(null, amount)));
    }
}
