package com.vtcweb.backend.dto.user;

import lombok.*;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String userCode; // formatted external identifier e.g. USR-83f91b1f5
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Set<String> roles; // stringified roles
    private boolean enabled;
    private boolean locked;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLogin;
    // Aggregated stats (optional; may be null when not requested)
    private Integer orderCount;
    private BigDecimal totalSpend;
}
