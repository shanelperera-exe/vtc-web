package com.vtcweb.backend.repository.wishlist;

import com.vtcweb.backend.model.entity.wishlist.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByWishlist_IdAndProduct_Id(Long wishlistId, Long productId);
    int deleteByWishlist_IdAndProduct_Id(Long wishlistId, Long productId);
}
