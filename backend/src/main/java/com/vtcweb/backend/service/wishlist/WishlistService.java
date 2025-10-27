package com.vtcweb.backend.service.wishlist;

import com.vtcweb.backend.dto.wishlist.WishlistItemDTO;
import com.vtcweb.backend.dto.wishlist.WishlistResponseDTO;

import java.util.List;

public interface WishlistService {
    WishlistResponseDTO getWishlist(Long userId);

    WishlistItemDTO addProduct(Long userId, Long productId);

    void removeProduct(Long userId, Long productId);

    void clear(Long userId);

    WishlistResponseDTO mergeLocal(Long userId, List<Long> productIds);
}
