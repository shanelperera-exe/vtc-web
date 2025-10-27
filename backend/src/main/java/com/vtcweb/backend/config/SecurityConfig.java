package com.vtcweb.backend.config;

import com.vtcweb.backend.config.properties.AppCorsProperties;
import com.vtcweb.backend.security.JwtAuthenticationFilter;
import com.vtcweb.backend.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.stream.Stream;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider provider) {
        return new JwtAuthenticationFilter(provider);
    }

    @Bean
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(c -> {
                })
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Permit unauthenticated access to root and common static resources.
                        // Patterns like /**/*.css are invalid with PathPatternParser; use directory
                        // wildcards instead.
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico",
                                "/static/**", "/public/**", "/assets/**",
                                "/css/**", "/js/**", "/images/**")
                        .permitAll()
                        // Open specific authentication endpoints and read-only product/category GETs
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/auth/forgot-password", "/api/auth/reset-password")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
                        // Allow submitting product reviews without authentication
                        // Allow posting reviews for a specific product (single-level path).
                        // patterns like "/**/reviews" are not supported by PathPatternParser
                        // and caused a PatternParseException (double wildcard followed by more data).
                        .requestMatchers(HttpMethod.POST, "/api/products/*/reviews").permitAll()
                        // Allow public email submissions for newsletter signup and contact auto-reply
                        .requestMatchers(HttpMethod.POST, "/api/email/newsletter-welcome", "/api/email/contact-reply")
                        .permitAll()
                        // Admin APIs by convention
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MANAGER")
                        .anyRequest().authenticated())
                .exceptionHandling(eh -> {
                });

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @ConditionalOnClass(AuthenticationConfiguration.class)
    @ConditionalOnBean(AuthenticationConfiguration.class)
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AppCorsProperties corsProps) {
        CorsConfiguration cfg = new CorsConfiguration();
        // Merge configured origins with useful defaults and Vercel preview wildcard.
        List<String> patterns = Stream.concat(
                corsProps.originList().stream(),
                Stream.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://*.vercel.app"))
                .distinct().toList();
        cfg.setAllowedOriginPatterns(patterns);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        cfg.setAllowCredentials(true);
        cfg.setExposedHeaders(List.of("Location", "Authorization"));
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
