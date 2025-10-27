package com.vtcweb.backend.repository.order;

import com.vtcweb.backend.model.entity.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    boolean existsByOrderNumber(String orderNumber);

    java.util.Optional<Order> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = { "items", "items.variationAttributes" }, type = EntityGraph.EntityGraphType.LOAD)
    java.util.Optional<Order> findOneByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = { "items", "items.variationAttributes" }, type = EntityGraph.EntityGraphType.LOAD)
    Optional<Order> findOneById(Long id);

    @EntityGraph(attributePaths = { "items" }, type = EntityGraph.EntityGraphType.LOAD)
    @org.springframework.lang.NonNull
    Page<Order> findAll(@org.springframework.lang.NonNull Pageable pageable);

    @EntityGraph(attributePaths = { "items" }, type = EntityGraph.EntityGraphType.LOAD)
    Page<Order> findByUserId(Long userId, org.springframework.data.domain.Pageable pageable);

    // Aggregates for user stats
    @Query("select count(o) from Order o where lower(o.customerEmail) = lower(?1)")
    long countByCustomerEmailIgnoreCase(String email);

    @Query("select coalesce(sum(o.total),0) from Order o where lower(o.customerEmail) = lower(?1)")
    java.math.BigDecimal sumTotalByCustomerEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = { "items" }, type = EntityGraph.EntityGraphType.LOAD)
    org.springframework.data.domain.Page<Order> findByCustomerEmailIgnoreCase(String email,
            org.springframework.data.domain.Pageable pageable);

    // Detach user reference from orders before deleting the user to avoid FK
    // violations
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("update Order o set o.user = null where o.user.id = :userId")
    int detachUserFromOrders(@org.springframework.data.repository.query.Param("userId") Long userId);
}
