package com.vtcweb.backend.service.review;

import com.vtcweb.backend.model.entity.review.Review;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.repository.review.ReviewRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public Review create(Review review) {
        if (review == null) throw new IllegalArgumentException("review required");
        Long pid = review.getProduct() != null ? review.getProduct().getId() : null;
        if (pid == null) throw new IllegalArgumentException("product id required");
        Product product = productRepository.findById(pid)
                .orElseThrow(() -> new NotFoundException("Product not found: id=" + pid));
        review.setProduct(product);
        return reviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> listByProduct(Long productId) {
        if (productId == null) throw new IllegalArgumentException("productId required");
        return reviewRepository.findByProduct_IdOrderByCreatedAtDesc(productId);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (id == null) return;
        reviewRepository.deleteById(id);
    }
}
