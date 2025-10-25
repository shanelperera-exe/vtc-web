package com.vtcweb.backend.repository.user;

import com.vtcweb.backend.model.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByUserCode(String userCode);
    boolean existsByUserCode(String userCode);

    @Query("select u from User u join fetch u.roles where lower(u.email)=lower(:email)")
    Optional<User> fetchWithRolesByEmail(@Param("email") String email);

    // Count users with MANAGER role
    @Query("select count(u) from User u join u.roles r where r = com.vtcweb.backend.model.entity.user.Role.ROLE_MANAGER")
    long countManagers();
    @Query("select u from User u join u.roles r where r = com.vtcweb.backend.model.entity.user.Role.ROLE_MANAGER")
    Optional<User> findManager();
}
