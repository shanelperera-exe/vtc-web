package com.vtcweb.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Cloudinary configuration. Values are read from environment variables or .env file (spring-dotenv).
 * Expected variables:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
@Configuration
public class CloudinaryConfig {

	@Value("${CLOUDINARY_CLOUD_NAME:}")
	private String cloudName;

	@Value("${CLOUDINARY_API_KEY:}")
	private String apiKey;

	@Value("${CLOUDINARY_API_SECRET:}")
	private String apiSecret;

	@Bean
	public Cloudinary cloudinary() {
		if (cloudName == null || cloudName.isBlank()) {
			throw new IllegalStateException("CLOUDINARY_CLOUD_NAME not configured");
		}
		if (apiKey == null || apiKey.isBlank()) {
			throw new IllegalStateException("CLOUDINARY_API_KEY not configured");
		}
		if (apiSecret == null || apiSecret.isBlank()) {
			throw new IllegalStateException("CLOUDINARY_API_SECRET not configured");
		}
		Map<String, Object> config = new HashMap<>();
		config.put("cloud_name", cloudName);
		config.put("api_key", apiKey);
		config.put("api_secret", apiSecret);
		// secure URLs (https)
		config.put("secure", true);
		return new Cloudinary(config);
	}
}
