package com.vtcweb.backend.dto.review;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {
    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 300)
    private String title;

    @NotBlank
    private String body;

    @Size(max = 120)
    private String name;

    @Email
    @Size(max = 200)
    private String email;
}
