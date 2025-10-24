package com.vtcweb.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Payload used to synchronise product images (primary + gallery) in one request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductImagesSyncRequest {
    /**
     * Primary product image. May be a secure URL or a data URI (data:image/...;base64,...).
     */
    private String primaryImage;

    /**
     * Optional list of secondary (gallery) images.
     */
    private List<String> secondaryImages = new ArrayList<>();

    public List<String> getSecondaryImages() {
        if (secondaryImages == null) {
            secondaryImages = new ArrayList<>();
        }
        return secondaryImages;
    }
}
