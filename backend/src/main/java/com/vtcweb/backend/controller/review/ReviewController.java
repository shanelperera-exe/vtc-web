package com.vtcweb.backend.controller.review;

import com.vtcweb.backend.dto.review.CreateReviewRequest;
import com.vtcweb.backend.dto.review.ReviewDTO;
import com.vtcweb.backend.model.entity.review.Review;
import com.vtcweb.backend.service.review.ReviewService;
import com.vtcweb.backend.util.Mapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.vtcweb.backend.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReviewController {

    private static final Logger log = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewService reviewService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/api/products/{id}/reviews")
    public ResponseEntity<List<ReviewDTO>> listByProduct(@PathVariable("id") Long id) {
        List<Review> list = reviewService.listByProduct(id);
        List<ReviewDTO> dtos = list.stream().map(Mapper::toReviewDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/api/products/{id}/reviews")
    public ResponseEntity<ReviewDTO> create(@PathVariable("id") Long id,
            @Valid @RequestBody CreateReviewRequest req,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        // Build entity
        Review r = Review.builder()
                .rating(req.getRating())
                .title(req.getTitle())
                .body(req.getBody())
                .name(req.getName())
                .email(req.getEmail())
                .build();
        // set product id placeholder — service will resolve product
        com.vtcweb.backend.model.entity.product.Product p = new com.vtcweb.backend.model.entity.product.Product();
        p.setId(id);
        r.setProduct(p);
        // Prefer SecurityContext (set by JwtAuthenticationFilter) to get user id
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String name = auth.getName();
                if (name != null) {
                    try {
                        Long uid = Long.parseLong(name);
                        com.vtcweb.backend.model.entity.user.User u = new com.vtcweb.backend.model.entity.user.User();
                        u.setId(uid);
                        r.setReviewer(u);
                        if (log.isDebugEnabled())
                            log.debug("Attached reviewer from SecurityContext: {}", uid);
                    } catch (NumberFormatException nfe) {
                        // Not numeric — fall through to header parsing
                        if (log.isDebugEnabled())
                            log.debug("SecurityContext name is not numeric: {}", name);
                    }
                }
            }
        } catch (Exception ex) {
            if (log.isDebugEnabled())
                log.debug("Failed to read SecurityContext authentication: {}", ex.getMessage());
        }

        // If reviewer not set yet, try parsing Authorization header JWT subject
        if (r.getReviewer() == null) {
            try {
                String header = authorizationHeader;
                if (header != null && header.startsWith("Bearer ")) {
                    String token = header.substring(7);
                    Jws<Claims> jws = jwtTokenProvider.parseAndValidate(token);
                    String sub = jws.getBody().getSubject();
                    if (sub != null) {
                        try {
                            Long uid = Long.parseLong(sub);
                            com.vtcweb.backend.model.entity.user.User u = new com.vtcweb.backend.model.entity.user.User();
                            u.setId(uid);
                            r.setReviewer(u);
                            if (log.isDebugEnabled())
                                log.debug("Attached reviewer from Authorization header: {}", uid);
                        } catch (NumberFormatException ignored) {
                            if (log.isDebugEnabled())
                                log.debug("JWT subject not numeric: {}", sub);
                        }
                    }
                }
            } catch (JwtException je) {
                if (log.isDebugEnabled())
                    log.debug("Invalid JWT while parsing Authorization header: {}", je.getMessage());
            }
        }

        Review created = reviewService.create(r);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(Mapper.toReviewDto(created));
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
