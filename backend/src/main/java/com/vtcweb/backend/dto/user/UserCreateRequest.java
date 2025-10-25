package com.vtcweb.backend.dto.user;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {
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

    @Size(max = 40)
    private String phone;

    @NotBlank
    @Size(min = 8, max = 150)
    private String password; // plain text in request only
}
