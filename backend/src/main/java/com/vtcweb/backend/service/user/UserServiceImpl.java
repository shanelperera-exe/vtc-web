package com.vtcweb.backend.service.user;

import com.vtcweb.backend.dto.user.*;
import com.vtcweb.backend.exception.ConflictException;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.exception.ForbiddenException;
import com.vtcweb.backend.model.entity.user.Role;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.repository.order.OrderRepository;
import com.vtcweb.backend.util.Mapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;
    private final com.vtcweb.backend.repository.cart.CartRepository cartRepository;
    private final com.vtcweb.backend.repository.wishlist.WishlistRepository wishlistRepository;
    private final com.vtcweb.backend.repository.user.BillingAddressRepository billingAddressRepository;
    private final com.vtcweb.backend.repository.user.ShippingAddressRepository shippingAddressRepository;
    private final com.vtcweb.backend.repository.user.RefreshTokenRepository refreshTokenRepository;
    private final com.vtcweb.backend.repository.user.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.vtcweb.backend.service.email.EmailService emailService;
    private final com.vtcweb.backend.config.EmailProperties emailProperties;
    private final com.vtcweb.backend.repository.review.ReviewRepository reviewRepository;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, OrderRepository orderRepository,
                           com.vtcweb.backend.repository.cart.CartRepository cartRepository,
                           com.vtcweb.backend.repository.wishlist.WishlistRepository wishlistRepository,
                           com.vtcweb.backend.repository.user.BillingAddressRepository billingAddressRepository,
                           com.vtcweb.backend.repository.user.ShippingAddressRepository shippingAddressRepository,
                           com.vtcweb.backend.repository.user.RefreshTokenRepository refreshTokenRepository,
                           com.vtcweb.backend.repository.user.PasswordResetTokenRepository passwordResetTokenRepository,
                           com.vtcweb.backend.service.email.EmailService emailService,
                           com.vtcweb.backend.config.EmailProperties emailProperties,
                           com.vtcweb.backend.repository.review.ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.billingAddressRepository = billingAddressRepository;
        this.shippingAddressRepository = shippingAddressRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.emailProperties = emailProperties;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public UserDto create(UserCreateRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        // ADMIN may only create CUSTOMER; MANAGER may create elevated roles via role update endpoint later
        User user = User.builder()
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .email(req.getEmail().trim().toLowerCase())
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .build();
        user.setUserCode(generateUniqueUserCode());
        user.addRole(Role.ROLE_CUSTOMER);
        user = userRepository.save(user);
        return Mapper.toUserDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getById(Long id) {
        User target = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(target);
        UserDto dto = Mapper.toUserDto(target);
        enrichWithStats(dto);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getByCode(String userCode) {
        if (userCode == null || userCode.isBlank()) throw new NotFoundException("User not found");
        User target = userRepository.findByUserCode(userCode).orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(target);
        UserDto dto = Mapper.toUserDto(target);
        enrichWithStats(dto);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> list(Pageable pageable) {
        // Listing is allowed; filtering of elevated users from ADMIN could be added later if required
        return userRepository.findAll(pageable).map(Mapper::toUserDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getByUserCode(String userCode) {
        if (userCode == null || userCode.isBlank()) throw new NotFoundException("User not found");
        User target = userRepository.findByUserCode(userCode)
                .orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(target);
        UserDto dto = Mapper.toUserDto(target);
        enrichWithStats(dto);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> listWithStats(Pageable pageable) {
        return userRepository.findAll(pageable).map(u -> {
            UserDto dto = Mapper.toUserDto(u);
            enrichWithStats(dto);
            return dto;
        });
    }

    @Override
    public UserDto update(Long id, UserUpdateRequest req) {
        User target = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(target);
        applyUpdates(target, req);
        return Mapper.toUserDto(target);
    }

    @Override
    public void delete(Long id) {
        User target = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(target);
        // Prevent deleting the only manager
        if (target.getRoles().contains(Role.ROLE_MANAGER)) {
            long managerCount = userRepository.countManagers();
            if (managerCount <= 1) {
                throw new ConflictException("Cannot delete the only manager account");
            }
        }
            // 1) Detach/anonymize reviews authored by this user to preserve review content
            try {
                reviewRepository.anonymizeReviewsForDeletedUser(target.getId(), "Deleted User");
            } catch (Exception ignored) { }

            // 1.5) Detach user reference from orders as a runtime-safe fallback so delete
            // succeeds even if the DB migration to set the FK to ON DELETE SET NULL hasn't
            // been applied yet. This is idempotent and keeps order snapshot fields intact.
            try {
                orderRepository.detachUserFromOrders(target.getId());
            } catch (Exception ignored) { }

            // 2) Delete dependent rows with NOT NULL FKs that would block user deletion
            try { refreshTokenRepository.deleteByUser(target); } catch (Exception ignored) {}
            try { passwordResetTokenRepository.deleteByUser(target); } catch (Exception ignored) {}
            try { billingAddressRepository.deleteByUserId(target.getId()); } catch (Exception ignored) {}
            try { shippingAddressRepository.deleteByUserId(target.getId()); } catch (Exception ignored) {}
            try { wishlistRepository.deleteByUserId(target.getId()); } catch (Exception ignored) {}
            try { cartRepository.deleteByUserId(target.getId()); } catch (Exception ignored) {}

            // 3) Physically delete user row. Orders.user FK should be configured as ON DELETE SET NULL
            // so that orders keep their snapshot but the relation is removed. The DB migration to
            // change the FK must be applied before using this code in production.
            userRepository.delete(target);
    }

    @Override
    public UserDto updateStatus(Long userId, boolean enabled) {
        User target = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(target);
        target.setEnabled(enabled);
        return Mapper.toUserDto(target);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrent() {
        User user = currentUserEntity();
        return Mapper.toUserDto(user);
    }

    @Override
    public UserDto updateCurrent(UserUpdateRequest req) {
        User user = currentUserEntity();
        applyUpdates(user, req);
        return Mapper.toUserDto(user);
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        enforceAdminScope(user);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        // Notify user about password change (fire-and-forget)
        try {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                java.util.Map<String, Object> params = new java.util.HashMap<>();
                String customerName = String.format("%s %s",
                        user.getFirstName() == null ? "" : user.getFirstName(),
                        user.getLastName() == null ? "" : user.getLastName()).trim();
                params.put("customer_name", customerName.isBlank() ? user.getEmail() : customerName);
                String base = (emailProperties != null && emailProperties.getSiteUrl() != null && !emailProperties.getSiteUrl().isBlank())
                        ? emailProperties.getSiteUrl() : "http://localhost:5173";
                params.put("account_link", base + "/account");
                emailService.sendTemplateAsync(com.vtcweb.backend.service.email.EmailTemplateKey.PASSWORD_CHANGED,
                        user.getEmail(), "Your password was changed", params);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void changePasswordCurrent(ChangePasswordRequest req) {
        User user = currentUserEntity();
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        // Notify user about password change (fire-and-forget)
        try {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                java.util.Map<String, Object> params = new java.util.HashMap<>();
                String customerName = String.format("%s %s",
                        user.getFirstName() == null ? "" : user.getFirstName(),
                        user.getLastName() == null ? "" : user.getLastName()).trim();
                params.put("customer_name", customerName.isBlank() ? user.getEmail() : customerName);
                String base = (emailProperties != null && emailProperties.getSiteUrl() != null && !emailProperties.getSiteUrl().isBlank())
                        ? emailProperties.getSiteUrl() : "http://localhost:5173";
                params.put("account_link", base + "/account");
                emailService.sendTemplateAsync(com.vtcweb.backend.service.email.EmailTemplateKey.PASSWORD_CHANGED,
                        user.getEmail(), "Your password was changed", params);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public UserDto updateUserRoles(Long userId, java.util.Set<String> rolesRequested) {
        User acting = currentUserEntity();
        if (!acting.getRoles().contains(Role.ROLE_MANAGER)) {
            throw new ForbiddenException("Only MANAGER may change roles");
        }
        User target = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        if (rolesRequested == null || rolesRequested.isEmpty()) {
            throw new IllegalArgumentException("At least one role required");
        }
        // Normalize & validate
        java.util.Set<Role> newRoles = new java.util.HashSet<>();
        for (String r : rolesRequested) {
            if (r == null) continue;
            String trimmed = r.trim().toUpperCase();
            if (trimmed.isEmpty()) continue;
            if (!trimmed.startsWith("ROLE_")) {
                trimmed = "ROLE_" + trimmed; // allow passing CUSTOMER vs ROLE_CUSTOMER
            }
            try {
                Role roleEnum = Role.valueOf(trimmed);
                newRoles.add(roleEnum);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Unknown role: " + r);
            }
        }
        if (newRoles.isEmpty()) {
            throw new IllegalArgumentException("No valid roles provided");
        }

        // Enforce unique MANAGER
        boolean assigningManager = newRoles.contains(Role.ROLE_MANAGER);
        if (assigningManager) {
            java.util.Optional<User> existingManager = userRepository.findManager();
            if (existingManager.isPresent() && !existingManager.get().getId().equals(target.getId())) {
                throw new ConflictException("Manager already exists (user id=" + existingManager.get().getId() + ")");
            }
        } else if (target.getRoles().contains(Role.ROLE_MANAGER)) {
            // Prevent removing manager role from the only manager
            throw new ConflictException("Cannot remove MANAGER role from the only manager");
        }

        target.getRoles().clear();
        target.getRoles().addAll(newRoles);
        return Mapper.toUserDto(target);
    }

    private User currentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) throw new IllegalStateException("No authenticated user");
        return userRepository.fetchWithRolesByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Current user not found"));
    }

    private void applyUpdates(User user, UserUpdateRequest req) {
        if (req.getFirstName() != null && !req.getFirstName().isBlank()) user.setFirstName(req.getFirstName().trim());
        if (req.getLastName() != null && !req.getLastName().isBlank()) user.setLastName(req.getLastName().trim());
        if (req.getEmail() != null && !req.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
                throw new ConflictException("Email already in use");
            }
            user.setEmail(req.getEmail().trim().toLowerCase());
        }
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getEnabled() != null) user.setEnabled(Boolean.TRUE.equals(req.getEnabled()));
    }

    private void enrichWithStats(UserDto dto) {
        if (dto == null || dto.getEmail() == null) return;
        long count = orderRepository.countByCustomerEmailIgnoreCase(dto.getEmail());
        java.math.BigDecimal total = orderRepository.sumTotalByCustomerEmailIgnoreCase(dto.getEmail());
        dto.setOrderCount((int) Math.min(count, Integer.MAX_VALUE));
        dto.setTotalSpend(total);
    }

    // Enforce hierarchy: MANAGER > ADMIN > CUSTOMER.
    // ADMIN cannot act on MANAGER or ADMIN targets; MANAGER can act on all; users cannot act on themselves for privilege escalation (except self-updates handled separately).
    private void enforceAdminScope(User target) {
        User acting = currentUserEntity();
        if (acting.getId().equals(target.getId())) return; // allow self operations where method permits
        boolean actingIsManager = acting.getRoles().contains(Role.ROLE_MANAGER);
        if (actingIsManager) return; // full access
        boolean actingIsAdmin = acting.getRoles().contains(Role.ROLE_ADMIN);
        if (actingIsAdmin) {
            boolean targetElevated = target.getRoles().contains(Role.ROLE_ADMIN) || target.getRoles().contains(Role.ROLE_MANAGER);
            if (targetElevated) {
                throw new ForbiddenException("ADMIN may not manage other admins or manager");
            }
            return;
        }
        // Non-admin non-manager should not reach here because of controller @PreAuthorize, but guard anyway
        throw new ForbiddenException("Insufficient privileges");
    }

    private String generateUniqueUserCode() {
        // Format: USR- + 9 lowercase hex chars (example: USR-83f91b1f5)
        final int hexLen = 9;
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        String code;
        int attempts = 0;
        do {
            byte[] bytes = new byte[6]; // 12 hex chars -> will substring to 9
            rnd.nextBytes(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            code = "USR-" + sb.substring(0, hexLen);
            attempts++;
            if (attempts > 10) {
                throw new IllegalStateException("Unable to generate unique user code after 10 attempts");
            }
        } while (userRepository.existsByUserCode(code));
        return code;
    }
}
