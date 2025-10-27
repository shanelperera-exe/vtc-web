package com.vtcweb.backend.dto.category;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    // status: "active" or "inactive"
    private String status;

    // short code for SKU customization (ex:, HMW for Homeware)
    private String code;

    private String catMainImg;
    private String catTileImage1;
    private String catTileImage2;

    private Integer productCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
