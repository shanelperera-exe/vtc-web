package com.vtcweb.backend.repository.user;

import com.vtcweb.backend.model.entity.user.RefreshToken;
import com.vtcweb.backend.model.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    long deleteByUser(User user);
    List<RefreshToken> findAllByUserAndExpiryBefore(User user, Instant time);
}
