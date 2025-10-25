package com.vtcweb.backend.repository.user;

import com.vtcweb.backend.model.entity.user.BillingAddress;
import com.vtcweb.backend.model.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillingAddressRepository extends JpaRepository<BillingAddress, Long> {
    List<BillingAddress> findByUser(User user);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("delete from BillingAddress b where b.user.id = :userId")
    int deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
