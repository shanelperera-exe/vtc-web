package com.vtcweb.backend.dto.wishlist;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private String sku;
    private java.math.BigDecimal price;
}
