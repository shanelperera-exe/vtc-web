
package com.vtcweb.backend.dto.wishlist;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponseDTO {
    private Long id; // wishlistItem id
    private Long productId;
    private String productName;
    private String sku;
    private String imageUrl;
    private java.math.BigDecimal price;
}
