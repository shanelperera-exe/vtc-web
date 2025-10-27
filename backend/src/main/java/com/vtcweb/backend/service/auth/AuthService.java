package com.vtcweb.backend.service.auth;

import com.vtcweb.backend.dto.auth.*;
import com.vtcweb.backend.dto.user.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest req);

    AuthResponse login(AuthRequest req, String userAgent, String ipAddress);

    RefreshTokenResponse refresh(String refreshToken);

    void logout(String refreshToken);

    UserDto me();

    // Password reset flows
    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
