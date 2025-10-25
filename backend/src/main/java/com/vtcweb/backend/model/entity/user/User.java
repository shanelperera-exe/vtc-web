package com.vtcweb.backend.model.entity.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
    @Index(name = "idx_users_last_name", columnList = "last_name"),
    @Index(name = "idx_users_user_code", columnList = "user_code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Public facing stable identifier (e.g. displayed in UI) distinct from numeric PK
    @Column(name = "user_code", nullable = false, unique = true, length = 20, updatable = false)
    private String userCode;

    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 80)
    private String lastName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean locked = false;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @Column(name = "last_login")
    private Instant lastLogin;

    // Convenience helpers
    public void addRole(Role role) { if (role != null) roles.add(role); }
    public boolean isAdmin() { return roles.contains(Role.ROLE_ADMIN); }
    public boolean isManager() { return roles.contains(Role.ROLE_MANAGER); }

    // Ensure a stable, public-facing code exists even if created outside the service layer
    @PrePersist
    private void ensureUserCode() {
        if (this.userCode == null || this.userCode.isBlank()) {
            this.userCode = generateRandomUserCode();
        }
    }

    private static String generateRandomUserCode() {
        // Format: USR- + 9 lowercase hex chars (example: USR-83f91b1f5)
        final int hexLen = 9;
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        byte[] bytes = new byte[6]; // 12 hex chars; we will take first 9
        rnd.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return "USR-" + sb.substring(0, hexLen);
    }
}
