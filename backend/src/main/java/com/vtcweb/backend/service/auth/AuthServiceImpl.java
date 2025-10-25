package com.vtcweb.backend.service.auth;

import com.vtcweb.backend.dto.auth.*;
import com.vtcweb.backend.config.properties.SecurityProperties;
import com.vtcweb.backend.dto.user.UserDto;
import com.vtcweb.backend.exception.InvalidCredentialsException;
import com.vtcweb.backend.exception.TokenRefreshException;
import com.vtcweb.backend.model.entity.user.RefreshToken;
import com.vtcweb.backend.model.entity.user.Role;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.RefreshTokenRepository;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.security.JwtTokenProvider;
import com.vtcweb.backend.service.user.UserService;
import com.vtcweb.backend.util.Mapper;
import com.vtcweb.backend.service.email.EmailService;
import com.vtcweb.backend.service.email.EmailTemplateKey;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.vtcweb.backend.repository.user.PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService; // for mapping convenience
    private final EmailService emailService;
    private final com.vtcweb.backend.config.EmailProperties emailProperties;
    private final long refreshTtlSeconds;
    private final long adminRefreshTtlSeconds;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider,
                           UserService userService, SecurityProperties securityProperties, EmailService emailService,
                           com.vtcweb.backend.repository.user.PasswordResetTokenRepository passwordResetTokenRepository,
                           com.vtcweb.backend.config.EmailProperties emailProperties) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailProperties = emailProperties;
        this.refreshTtlSeconds = securityProperties.getJwt().getRefreshTtlSeconds();
        this.adminRefreshTtlSeconds = securityProperties.getJwt().getAdminRefreshTtlSeconds();
    }

    @Override
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new InvalidCredentialsException("Email already registered");
        }
        User user = User.builder()
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .email(req.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .build();
        user.setUserCode(generateUniqueUserCode());
    user.addRole(Role.ROLE_CUSTOMER); // default role
        user = userRepository.save(user);
    String access = jwtTokenProvider.generateAccessToken(user);
    RefreshToken rt = createRefreshToken(user);
    AuthResponse response = AuthResponse.builder()
                .accessToken(access)
                .tokenType("Bearer")
        .expiresInSeconds(user.isAdmin() ? jwtTokenProvider.getAdminAccessTokenTtlSeconds() : jwtTokenProvider.getAccessTokenTtlSeconds())
                .user(Mapper.toUserDto(user))
        .refreshToken(rt.getToken())
                .build();

    // Fire-and-forget welcome email
    try {
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            java.util.Map<String, Object> params = new java.util.HashMap<>();
            String customerName = String.format("%s %s",
                    user.getFirstName() == null ? "" : user.getFirstName(),
                    user.getLastName() == null ? "" : user.getLastName()).trim();
            params.put("customer_name", customerName.isBlank() ? user.getEmail() : customerName);
            emailService.sendTemplateAsync(EmailTemplateKey.ACCOUNT_WELCOME, user.getEmail(), "Welcome to VTC", params);
        }
    } catch (Exception ignored) {
        // Do not block registration on email failure
    }

    return response;
    }

    @Override
    public AuthResponse login(AuthRequest req, String userAgent, String ipAddress) {
    User user = userRepository.fetchWithRolesByEmail(req.getEmail())
        .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
    if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
        throw new InvalidCredentialsException("Invalid credentials");
    }
    // Set lastLogin timestamp
    user.setLastLogin(java.time.Instant.now());
    userRepository.save(user);
    String access = jwtTokenProvider.generateAccessToken(user);
    RefreshToken rt = createRefreshToken(user);
    return AuthResponse.builder()
        .accessToken(access)
        .tokenType("Bearer")
        .expiresInSeconds(user.isAdmin() ? jwtTokenProvider.getAdminAccessTokenTtlSeconds() : jwtTokenProvider.getAccessTokenTtlSeconds())
        .user(Mapper.toUserDto(user))
        .refreshToken(rt.getToken())
        .build();
    }

    @Override
    public RefreshTokenResponse refresh(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new TokenRefreshException("Invalid refresh token"));
        if (rt.isRevoked() || rt.isExpired()) {
            throw new TokenRefreshException("Refresh token expired or revoked");
        }
    User user = rt.getUser();
    String access = jwtTokenProvider.generateAccessToken(user);
    long accessTtl = user.isAdmin() ? jwtTokenProvider.getAdminAccessTokenTtlSeconds() : jwtTokenProvider.getAccessTokenTtlSeconds();
    long refreshMaxAge = user.isAdmin() ? adminRefreshTtlSeconds : refreshTtlSeconds;
        return RefreshTokenResponse.builder()
                .accessToken(access)
                .tokenType("Bearer")
        .expiresInSeconds(accessTtl)
        .refreshMaxAgeSeconds(refreshMaxAge)
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(rt -> {
            rt.setRevoked(true);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto me() {
        return userService.getCurrent();
    }

    @Override
    @SuppressWarnings("null")
    public void forgotPassword(ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) return;
        userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .ifPresent(user -> {
                    // Clean up old tokens for this user
                    passwordResetTokenRepository.deleteAllByUserAndExpiryBefore(user, java.time.Instant.now());
                    // Create token valid for 30 minutes
                    String token = generateSecureToken();
                    com.vtcweb.backend.model.entity.user.PasswordResetToken prt = com.vtcweb.backend.model.entity.user.PasswordResetToken.builder()
                            .user(user)
                            .token(token)
                            .expiry(java.time.Instant.now().plusSeconds(30 * 60))
                            .used(false)
                            .build();
                    passwordResetTokenRepository.save(prt);
                    // Build reset link - assume frontend route /reset?token={token}
                    String base = StringUtils.hasText(emailProperties.getSiteUrl()) ? emailProperties.getSiteUrl() : "http://localhost:5173";
                    String link = String.format("%s/reset?token=%s", base, token);
                    // Send email
                    try {
                        java.util.Map<String, Object> params = new java.util.HashMap<>();
                        String customerName = String.format("%s %s",
                                user.getFirstName() == null ? "" : user.getFirstName(),
                                user.getLastName() == null ? "" : user.getLastName()).trim();
                        params.put("customer_name", customerName.isBlank() ? user.getEmail() : customerName);
                        params.put("reset_link", link);
                        emailService.sendTemplateAsync(EmailTemplateKey.PASSWORD_RESET, user.getEmail(), "Reset your VTC password", params);
                    } catch (Exception ignored) {}
                });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        if (request == null || request.getToken() == null || request.getToken().isBlank() ||
                request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("Invalid reset request");
        }
        var tokenOpt = passwordResetTokenRepository.findByToken(request.getToken().trim());
        var prt = tokenOpt.orElseThrow(() -> new com.vtcweb.backend.exception.InvalidCredentialsException("Invalid reset token"));
        if (prt.isUsed() || prt.getExpiry() == null || prt.getExpiry().isBefore(java.time.Instant.now())) {
            throw new com.vtcweb.backend.exception.InvalidCredentialsException("Expired or used token");
        }
        var user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);
    }

    @SuppressWarnings("null")
    private RefreshToken createRefreshToken(User user) {
        // Could purge old expired tokens for user
        refreshTokenRepository.findAllByUserAndExpiryBefore(user, Instant.now()).forEach(refreshTokenRepository::delete);
        long ttl = user.isAdmin() ? adminRefreshTtlSeconds : refreshTtlSeconds;
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(generateSecureToken())
                .expiry(Instant.now().plusSeconds(ttl))
                .build();
        return refreshTokenRepository.save(rt);
    }

    private String generateSecureToken() {
        // 32 random bytes base64url without padding + UUID portion to reduce collision probability
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes) + "." + UUID.randomUUID();
    }

    private String generateUniqueUserCode() {
        final int hexLen = 9;
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        String code;
        int attempts = 0;
        do {
            byte[] bytes = new byte[6];
            rnd.nextBytes(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            code = "USR-" + sb.substring(0, hexLen);
            attempts++;
            if (attempts > 10) {
                throw new IllegalStateException("Unable to generate unique user code after 10 attempts");
            }
        } while (userRepository.existsByUserCode(code));
        return code;
    }
}
