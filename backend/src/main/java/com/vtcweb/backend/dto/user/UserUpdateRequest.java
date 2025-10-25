package com.vtcweb.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @Size(max = 80)
    private String firstName;
    @Size(max = 80)
    private String lastName;
    @Email
    @Size(max = 160)
    private String email; // admin may change email
    @Size(max = 40)
    private String phone;
    // Roles/flags handled in dedicated admin endpoints if needed
    // Admin can toggle enabled state via update (maps to active/disabled in UI)
    private Boolean enabled;
}
