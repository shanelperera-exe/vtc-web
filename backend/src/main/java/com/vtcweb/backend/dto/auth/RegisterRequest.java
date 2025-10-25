package com.vtcweb.backend.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank
    @Size(max = 80)
    private String firstName;
    @NotBlank
    @Size(max = 80)
    private String lastName;
    @NotBlank
    @Email
    @Size(max = 160)
    private String email;
    @NotBlank
    @Size(min = 8, max = 150)
    private String password;
}
