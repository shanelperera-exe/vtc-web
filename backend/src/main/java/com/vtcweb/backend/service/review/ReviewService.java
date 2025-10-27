package com.vtcweb.backend.service.review;

import com.vtcweb.backend.model.entity.review.Review;

import java.util.List;

public interface ReviewService {
    Review create(Review review);

    List<Review> listByProduct(Long productId);

    void delete(Long id);
}
