package com.vtcweb.backend.repository.user;

import com.vtcweb.backend.model.entity.user.ShippingAddress;
import com.vtcweb.backend.model.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByUser(User user);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("delete from ShippingAddress s where s.user.id = :userId")
    int deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
