package com.vtcweb.backend.repository.config;

import com.vtcweb.backend.model.entity.config.ShippingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShippingConfigRepository extends JpaRepository<ShippingConfig, Long> {
    Optional<ShippingConfig> findTopByOrderByIdAsc();
}
