package com.vtcweb.backend.repository.wishlist;

import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.model.entity.wishlist.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUser(User user);

    Optional<Wishlist> findByUser_Id(Long userId);

    // Hard-delete the wishlist (and items via cascade) for a given user id
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("delete from Wishlist w where w.user.id = :userId")
    int deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
