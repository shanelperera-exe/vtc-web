package com.vtcweb.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class FlywayRepairStrategy {

    private static final Logger log = LoggerFactory.getLogger(FlywayRepairStrategy.class);

    @Bean
    public FlywayMigrationStrategy repairAndMigrate() {
        return flyway -> {
            try {
                log.info("Running Flyway.repair() to fix checksum mismatches if present...");
                flyway.repair();
            } catch (Exception e) {
                log.warn("Flyway.repair() failed: {}", e.getMessage());
            }
            log.info("Running Flyway.migrate()");
            flyway.migrate();
        };
    }
}
