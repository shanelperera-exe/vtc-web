package com.vtcweb.backend.security;

import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.model.entity.user.Role;
import com.vtcweb.backend.config.properties.SecurityProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenTtlSeconds;
    private final long adminAccessTokenTtlSeconds;

    public JwtTokenProvider(@Value("${security.jwt.secret:changemechangemechangemechangemechangeme1234567890}") String base64Secret,
                            SecurityProperties securityProperties) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        this.accessTokenTtlSeconds = securityProperties.getJwt().getAccessTtlSeconds();
        this.adminAccessTokenTtlSeconds = securityProperties.getJwt().getAdminAccessTtlSeconds();
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        long ttl = user.getRoles() != null && user.getRoles().contains(Role.ROLE_ADMIN)
                ? adminAccessTokenTtlSeconds
                : accessTokenTtlSeconds;
        Instant exp = now.plusSeconds(ttl);
        String roles = user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
        .addClaims(Map.of(
                        "email", user.getEmail(),
                        "roles", roles
                ))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseAndValidate(String token) throws JwtException {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }

    public long getAccessTokenTtlSeconds() { return accessTokenTtlSeconds; }
    public long getAdminAccessTokenTtlSeconds() { return adminAccessTokenTtlSeconds; }
}
