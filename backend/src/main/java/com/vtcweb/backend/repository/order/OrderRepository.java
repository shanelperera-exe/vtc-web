package com.vtcweb.backend.repository.order;

import com.vtcweb.backend.model.entity.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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

    // --- Admin analytics helpers (sales = non-cancelled orders) ---

    @Query("select coalesce(sum(o.total),0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED")
    java.math.BigDecimal sumSalesTotalBetween(LocalDateTime start, LocalDateTime end);

    @Query("select count(o) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED")
    long countSalesBetween(LocalDateTime start, LocalDateTime end);

    @Query("select o from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED")
    List<Order> findSalesBetween(LocalDateTime start, LocalDateTime end);

    @Query("select o.status, count(o) from Order o where o.placedAt >= :start and o.placedAt < :end group by o.status")
    List<Object[]> countByStatusBetween(LocalDateTime start, LocalDateTime end);

        // --- Sales analytics (admin/sales) ---

        /** Net sales proxy: subtotal - discount (excludes cancelled). */
        @Query("select coalesce(sum(o.subtotal - o.discountTotal),0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED")
        java.math.BigDecimal sumNetSalesBetween(LocalDateTime start, LocalDateTime end);

        /** Total discount given (excludes cancelled). */
        @Query("select coalesce(sum(o.discountTotal),0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED")
        java.math.BigDecimal sumDiscountBetween(LocalDateTime start, LocalDateTime end);

        /** Daily revenue + order count (excludes cancelled). */
        @Query("select function('date', o.placedAt), coalesce(sum(o.total),0), count(o) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by function('date', o.placedAt) " +
            "order by function('date', o.placedAt) asc")
        List<Object[]> dailyRevenueAndOrdersBetween(LocalDateTime start, LocalDateTime end);

        /** Daily discounts (excludes cancelled). */
        @Query("select function('date', o.placedAt), coalesce(sum(o.discountTotal),0) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by function('date', o.placedAt) " +
            "order by function('date', o.placedAt) asc")
        List<Object[]> dailyDiscountsBetween(LocalDateTime start, LocalDateTime end);

        /** Daily revenue by delivery method (excludes cancelled). */
        @Query("select function('date', o.placedAt), o.deliveryMethod, coalesce(sum(o.total),0) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by function('date', o.placedAt), o.deliveryMethod " +
            "order by function('date', o.placedAt) asc")
        List<Object[]> dailyRevenueByDeliveryMethodBetween(LocalDateTime start, LocalDateTime end);

        /** Payment method split (excludes cancelled). */
        @Query("select o.paymentMethod, count(o), coalesce(sum(o.total),0) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by o.paymentMethod")
        List<Object[]> paymentSplitBetween(LocalDateTime start, LocalDateTime end);

        /** Discounted vs non-discounted sales (excludes cancelled). */
        @Query("select (case when o.discountTotal > 0 then 'discounted' else 'full_price' end), count(o), coalesce(sum(o.total),0) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by (case when o.discountTotal > 0 then 'discounted' else 'full_price' end)")
        List<Object[]> discountedSplitBetween(LocalDateTime start, LocalDateTime end);

        /** Daily cancelled totals (proxy for refunds/returns): returned as positive sums; UI can render as negative. */
        @Query("select function('date', o.placedAt), coalesce(sum(o.total),0), count(o) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status = com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by function('date', o.placedAt) " +
            "order by function('date', o.placedAt) asc")
        List<Object[]> dailyCancelledTotalsBetween(LocalDateTime start, LocalDateTime end);

        /** Hour-of-day performance (0-23) for revenue and order count (excludes cancelled). */
        @Query("select function('hour', o.placedAt), coalesce(sum(o.total),0), count(o) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by function('hour', o.placedAt) " +
            "order by function('hour', o.placedAt) asc")
        List<Object[]> hourlyRevenueAndOrdersBetween(LocalDateTime start, LocalDateTime end);

        /** Customer rollup for scatter chart: frequency (orders) + spend per customer in window (excludes cancelled). */
        @Query("select lower(o.customerEmail), count(o), coalesce(sum(o.total),0) " +
            "from Order o " +
            "where o.placedAt >= :start and o.placedAt < :end and o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by lower(o.customerEmail)")
        List<Object[]> customerSpendAndFrequencyBetween(LocalDateTime start, LocalDateTime end);

        /** First purchase timestamp for customers active in the window (excludes cancelled). */
        @Query("select lower(o.customerEmail), min(o.placedAt) " +
            "from Order o " +
            "where o.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "and lower(o.customerEmail) in (" +
            "  select distinct lower(o2.customerEmail) from Order o2 where o2.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED and o2.placedAt >= :start and o2.placedAt < :end" +
            ") " +
            "group by lower(o.customerEmail)")
        List<Object[]> firstPurchaseForActiveCustomersBetween(LocalDateTime start, LocalDateTime end);
}
