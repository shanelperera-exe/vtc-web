package com.vtcweb.backend.service.user;

import com.vtcweb.backend.dto.user.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserDto create(UserCreateRequest req);

    UserDto getById(Long id);

    UserDto getByCode(String userCode);

    Page<UserDto> list(Pageable pageable);

    UserDto update(Long id, UserUpdateRequest req);

    void delete(Long id);

    UserDto getCurrent();

    UserDto updateCurrent(UserUpdateRequest req);

    void changePassword(Long userId, String currentPassword, String newPassword);

    void changePasswordCurrent(ChangePasswordRequest req);

    UserDto getByUserCode(String userCode);

    UserDto updateUserRoles(Long userId, java.util.Set<String> roles);

    Page<UserDto> listWithStats(Pageable pageable);

    UserDto updateStatus(Long userId, boolean enabled);
}
