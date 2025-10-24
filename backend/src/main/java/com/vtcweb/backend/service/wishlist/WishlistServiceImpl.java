package com.vtcweb.backend.service.wishlist;

import com.vtcweb.backend.dto.wishlist.WishlistItemDTO;
import com.vtcweb.backend.dto.wishlist.WishlistResponseDTO;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductImage;
import com.vtcweb.backend.model.entity.user.User;
import com.vtcweb.backend.model.entity.wishlist.Wishlist;
import com.vtcweb.backend.model.entity.wishlist.WishlistItem;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.user.UserRepository;
import com.vtcweb.backend.repository.wishlist.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public WishlistResponseDTO getWishlist(Long userId) {
        Wishlist wishlist = wishlistRepository.findByUser_Id(userId).orElse(null);
        List<WishlistItemDTO> items = toDtoList(wishlist);
        return WishlistResponseDTO.builder().items(items).build();
    }

    @Override
    @Transactional
    public WishlistItemDTO addProduct(Long userId, Long productId) {
        Wishlist wishlist = loadOrCreate(userId);
        final Wishlist ensuredWishlist = (wishlist.getId() == null) ? wishlistRepository.save(wishlist) : wishlist;
        // If already present, just return existing
        for (WishlistItem wi : ensuredWishlist.getItems()) {
            if (wi.getProduct() != null && Objects.equals(wi.getProduct().getId(), productId)) {
                return toDto(wi);
            }
        }
        Product product = productRepository.findById(Objects.requireNonNull(productId, "productId")).orElseThrow(() -> new NotFoundException("Product not found"));
        WishlistItem item = WishlistItem.builder().wishlist(ensuredWishlist).product(product).build();
        ensuredWishlist.getItems().add(item);
        wishlistRepository.save(ensuredWishlist);
        return toDto(item);
    }

    @Override
    @Transactional
    public void removeProduct(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUser_Id(userId).orElse(null);
        if (wishlist == null || wishlist.getItems() == null) return;
        wishlist.getItems().removeIf(wi -> wi.getProduct() != null && Objects.equals(wi.getProduct().getId(), productId));
        wishlistRepository.save(wishlist);
    }

    @Override
    @Transactional
    public void clear(Long userId) {
        Wishlist wishlist = wishlistRepository.findByUser_Id(userId).orElse(null);
        if (wishlist == null) return;
        wishlist.getItems().clear();
        wishlistRepository.save(wishlist);
    }

    @Override
    @Transactional
    public WishlistResponseDTO mergeLocal(Long userId, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) return getWishlist(userId);
        Wishlist wishlist = loadOrCreate(userId);
        final Wishlist ensuredWishlist2 = (wishlist.getId() == null) ? wishlistRepository.save(wishlist) : wishlist;
        java.util.Set<Long> existing = ensuredWishlist2.getItems().stream()
                .filter(it -> it.getProduct() != null)
                .map(it -> it.getProduct().getId())
                .collect(java.util.stream.Collectors.toSet());
        for (Long pid : productIds) {
            if (pid == null || existing.contains(pid)) continue;
            productRepository.findById(pid).ifPresent(p -> ensuredWishlist2.getItems().add(WishlistItem.builder().wishlist(ensuredWishlist2).product(p).build()));
        }
        wishlistRepository.save(ensuredWishlist2);
        return WishlistResponseDTO.builder().items(toDtoList(ensuredWishlist2)).build();
    }

    private Wishlist loadOrCreate(Long userId) {
        return wishlistRepository.findByUser_Id(Objects.requireNonNull(userId, "userId")).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found for id=" + userId));
            return Wishlist.builder().user(user).items(new java.util.LinkedHashSet<>()).build();
        });
    }

    private List<WishlistItemDTO> toDtoList(Wishlist wishlist) {
        if (wishlist == null || wishlist.getItems() == null) return List.of();
        List<WishlistItemDTO> list = new ArrayList<>();
        for (WishlistItem wi : wishlist.getItems()) {
            list.add(toDto(wi));
        }
        // Preserve insertion order (LinkedHashSet) already; just return
        return list;
    }

    private WishlistItemDTO toDto(WishlistItem wi) {
        if (wi == null) return null;
        Product p = wi.getProduct();
        String image = null;
        if (p != null && p.getImages() != null) {
            image = p.getImages().stream()
                    .filter(java.util.Objects::nonNull)
                    .filter(img -> img.getType() == ProductImage.ImageType.PRIMARY)
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElseGet(() -> p.getImages().stream().filter(java.util.Objects::nonNull).map(ProductImage::getUrl).findFirst().orElse(null));
        }
        java.math.BigDecimal price = p != null ? p.getBasePrice() : null;
        return WishlistItemDTO.builder()
                .id(wi.getId())
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : null)
                .imageUrl(image)
                .sku(p != null ? p.getSku() : null)
                .price(price)
                .build();
    }
}
