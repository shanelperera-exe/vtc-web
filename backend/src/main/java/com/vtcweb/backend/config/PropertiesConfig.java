package com.vtcweb.backend.config;

import com.vtcweb.backend.config.properties.AppCorsProperties;
import com.vtcweb.backend.config.properties.SecurityProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({ AppCorsProperties.class, SecurityProperties.class })
public class PropertiesConfig {
}
