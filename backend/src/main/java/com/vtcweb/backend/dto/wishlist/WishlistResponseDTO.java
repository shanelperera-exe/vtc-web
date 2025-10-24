package com.vtcweb.backend.dto.wishlist;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponseDTO {
    private List<WishlistItemDTO> items;
}
