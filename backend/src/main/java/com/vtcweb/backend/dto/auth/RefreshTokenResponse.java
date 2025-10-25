package com.vtcweb.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshTokenResponse {
    private String accessToken;
    private String tokenType;
    private long expiresInSeconds;
    // internal use only to set cookie max-age in controller
    @JsonIgnore
    private long refreshMaxAgeSeconds;
}
