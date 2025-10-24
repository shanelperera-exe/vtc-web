package com.vtcweb.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    private final Duration cartTtl;

    public CacheConfig(@Value("${app.cache.cart.ttl-seconds:300}") long cartTtlSeconds) {
        this.cartTtl = Duration.ofSeconds(cartTtlSeconds);
    }

    /**
     * Create a CacheManager that prefers Redis, but gracefully falls back to an in-memory cache
     * if Redis is unavailable (e.g. not running in local dev).
     */
    @Bean
    public CacheManager cacheManager(ObjectProvider<RedisConnectionFactory> factoryProvider) {
        RedisConnectionFactory connectionFactory = factoryProvider.getIfAvailable();
        try {
            if (connectionFactory != null) {
                // Proactively test connectivity to avoid runtime failures on first cache access
                connectionFactory.getConnection().ping();
            } else {
                throw new IllegalStateException("No RedisConnectionFactory available");
            }

            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .disableCachingNullValues()
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

            Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
            cacheConfigurations.put("cart", defaultConfig.entryTtl(cartTtl));

            log.info("Using RedisCacheManager for caching with cart TTL {} seconds", cartTtl.getSeconds());
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withInitialCacheConfigurations(cacheConfigurations)
                    .transactionAware()
                    .build();
        } catch (Exception ex) {
            log.warn("Redis unavailable, falling back to in-memory cache. Reason: {}", ex.getMessage());
            // Simple in-memory cache as a safe fallback for development
            return new ConcurrentMapCacheManager("cart");
        }
    }

    /**
     * Swallow cache layer errors so that Redis outages never break primary request flows.
     */
    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(@NonNull RuntimeException exception, @NonNull org.springframework.cache.Cache cache, @NonNull Object key) {
                log.debug("Cache GET error on {}:{} - {}", cache != null ? cache.getName() : "<null>", key, exception.toString());
            }

            @Override
            public void handleCachePutError(@NonNull RuntimeException exception, @NonNull org.springframework.cache.Cache cache, @NonNull Object key, @Nullable Object value) {
                log.debug("Cache PUT error on {}:{} - {}", cache != null ? cache.getName() : "<null>", key, exception.toString());
            }

            @Override
            public void handleCacheEvictError(@NonNull RuntimeException exception, @NonNull org.springframework.cache.Cache cache, @NonNull Object key) {
                log.debug("Cache EVICT error on {}:{} - {}", cache != null ? cache.getName() : "<null>", key, exception.toString());
            }

            @Override
            public void handleCacheClearError(@NonNull RuntimeException exception, @NonNull org.springframework.cache.Cache cache) {
                log.debug("Cache CLEAR error on {} - {}", cache != null ? cache.getName() : "<null>", exception.toString());
            }
        };
    }
}
