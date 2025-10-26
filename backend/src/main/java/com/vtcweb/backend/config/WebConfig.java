package com.vtcweb.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

/**
 * Central web configuration: CORS + Page serialization mode.
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig {
    // CORS is centrally configured via Spring Security's CorsConfigurationSource bean in SecurityConfig.
    // This avoids duplicate/conflicting CORS handling between Spring MVC and Spring Security layers.
}

