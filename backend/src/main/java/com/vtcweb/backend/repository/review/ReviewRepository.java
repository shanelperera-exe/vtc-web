package com.vtcweb.backend.repository.review;

import com.vtcweb.backend.model.entity.review.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId);

    /**
     * Detach all reviews referencing the given user id by nulling the foreign key and
     * setting a neutral public display name. This prevents FK violations on user deletion
     * while keeping the review content for future readers.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE reviews SET user_id = NULL, name = :deletedName, email = NULL WHERE user_id = :userId", nativeQuery = true)
    int anonymizeReviewsForDeletedUser(@Param("userId") Long userId, @Param("deletedName") String deletedName);
}
