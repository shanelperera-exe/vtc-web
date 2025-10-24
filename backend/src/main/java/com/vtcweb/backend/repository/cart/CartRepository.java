package com.vtcweb.backend.repository.cart;

import com.vtcweb.backend.model.entity.cart.Cart;
import com.vtcweb.backend.model.entity.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
	@EntityGraph(attributePaths = {"items"}, type = EntityGraph.EntityGraphType.LOAD)
	Optional<Cart> findByUser(User user);

	@EntityGraph(attributePaths = {"items"}, type = EntityGraph.EntityGraphType.LOAD)
	Optional<Cart> findByUser_Id(Long userId);

	// Hard-delete the cart (and its items via cascade) for a given user id
	@org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
	@org.springframework.data.jpa.repository.Query("delete from Cart c where c.user.id = :userId")
	int deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
