package com.vtcweb.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

/**
 * Enable stable JSON serialization for Spring Data Page instances across the app.
 * This uses VIA_DTO mode which produces a stable structure when you return Page<T> of DTOs.
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig {
    // Intentionally empty. The annotation configures page serialization globally.
}

