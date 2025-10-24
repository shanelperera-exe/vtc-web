package com.vtcweb.backend.config;

import com.vtcweb.backend.model.entity.user.Role;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Bootstraps an initial admin account if none exists. Controlled via env vars:
 * ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME.
 * The account is created only if no user with ROLE_ADMIN exists.
 */
@Component
@Profile("!test")
public class BootstrapAdminRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(BootstrapAdminRunner.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapAdminRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean anyAdmin = userRepository.findAll().stream().anyMatch(u -> u.getRoles() != null && u.getRoles().contains(Role.ROLE_ADMIN));
        if (anyAdmin) {
            return;
        }
        String email = System.getenv().getOrDefault("ADMIN_EMAIL", "admin@vidara.local");
        String password = System.getenv().getOrDefault("ADMIN_PASSWORD", "ChangeMe!12345");
        String first = System.getenv().getOrDefault("ADMIN_FIRST_NAME", "System");
        String last = System.getenv().getOrDefault("ADMIN_LAST_NAME", "Admin");

        if (userRepository.existsByEmailIgnoreCase(email)) {
            log.info("Admin bootstrap skipped: user with email {} already exists", email);
            return;
        }

        // If no manager exists yet, the first admin should be the manager as well
        boolean anyManager = userRepository.countManagers() > 0;
        Set<Role> roles = anyManager ? Set.of(Role.ROLE_ADMIN) : Set.of(Role.ROLE_ADMIN, Role.ROLE_MANAGER);

        User admin = User.builder()
            .firstName(first)
            .lastName(last)
            .email(email.toLowerCase())
            .passwordHash(passwordEncoder.encode(password))
            .enabled(true)
            .locked(false)
            .roles(roles)
            .build();
        // Generate a random user code similar to AuthServiceImpl but simpler here
        admin.setUserCode("USR-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 9));
        admin = userRepository.save(admin);
        log.warn("Bootstrapped default admin account: {} (id={}). Please rotate credentials immediately.", admin.getEmail(), admin.getId());
    }
}
