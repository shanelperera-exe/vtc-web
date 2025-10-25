package com.vtcweb.backend.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusUpdateRequest {
    @NotNull
    private Boolean enabled;
}
