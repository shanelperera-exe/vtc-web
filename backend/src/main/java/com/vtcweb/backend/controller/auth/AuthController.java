package com.vtcweb.backend.controller.auth;

import com.vtcweb.backend.dto.auth.*;
import com.vtcweb.backend.service.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import com.vtcweb.backend.config.properties.SecurityProperties;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityProperties securityProperties;

    public AuthController(AuthService authService, SecurityProperties securityProperties) {
        this.authService = authService;
        this.securityProperties = securityProperties;
    }

    private static final String REFRESH_COOKIE = "vtc_refresh";
    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from(REFRESH_COOKIE, token == null ? "" : token)
                .httpOnly(true)
                .secure(securityProperties.getCookie().getRefresh().isSecure())
                .path("/")
                .maxAge(token == null ? 0 : securityProperties.getJwt().getRefreshTtlSeconds())
                .sameSite(securityProperties.getCookie().getRefresh().getSameSite())
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse response) {
        AuthResponse auth = authService.register(req);
        if (auth.getRefreshToken() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(auth.getRefreshToken()).toString());
        }
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req, HttpServletRequest request, HttpServletResponse response) {
        String userAgent = request.getHeader("User-Agent");
        String ip = request.getRemoteAddr();
        AuthResponse auth = authService.login(req, userAgent, ip);
        if (auth.getRefreshToken() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(auth.getRefreshToken()).toString());
        }
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshCookie,
                                                        @RequestParam(name = "token", required = false) String tokenParam,
                                                        HttpServletResponse response) {
        String token = refreshCookie != null ? refreshCookie : tokenParam; // allow fallback param
        RefreshTokenResponse r = authService.refresh(token);
        if (token != null) {
            // Extend cookie age
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, token)
                    .httpOnly(true)
                    .secure(securityProperties.getCookie().getRefresh().isSecure())
                    .path("/")
                    .maxAge(r.getRefreshMaxAgeSeconds() > 0 ? r.getRefreshMaxAgeSeconds() : securityProperties.getJwt().getRefreshTtlSeconds())
                    .sameSite(securityProperties.getCookie().getRefresh().getSameSite())
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
        return ResponseEntity.ok(r);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshCookie,
                                       HttpServletResponse response) {
        if (refreshCookie != null) {
            authService.logout(refreshCookie);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(null).toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() { return ResponseEntity.ok(authService.me()); }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.noContent().build();
    }
}
