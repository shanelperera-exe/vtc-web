package com.vtcweb.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vtcweb.backend.dto.user.UserDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType; // e.g. Bearer
    private long expiresInSeconds; // access token expiry relative
    private UserDto user;

    @JsonIgnore
    private String refreshToken;
}
