package com.vtcweb.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.Arrays;
import java.util.List;

// Configuration properties for CORS settings
@ConfigurationProperties(prefix = "app.cors")
public record AppCorsProperties(@DefaultValue("https://vtc-web.vercel.app,http://localhost:5173") String allowedOrigins) {
    public List<String> originList() {
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
