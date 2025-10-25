package com.vtcweb.backend.repository.user;

import com.vtcweb.backend.model.entity.user.PasswordResetToken;
import com.vtcweb.backend.model.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteAllByUserAndExpiryBefore(User user, Instant before);

    long deleteByUser(User user);
}
