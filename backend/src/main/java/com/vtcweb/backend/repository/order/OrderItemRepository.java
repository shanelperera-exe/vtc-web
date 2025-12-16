package com.vtcweb.backend.repository.order;

import com.vtcweb.backend.model.entity.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("select coalesce(sum(oi.quantity),0) from OrderItem oi where oi.productId = :productId")
    Long sumQuantityByProductId(Long productId);

    @Query("select coalesce(sum(oi.totalPrice),0) from OrderItem oi where oi.productId = :productId")
    BigDecimal sumRevenueByProductId(Long productId);

    @Query("select count(distinct oi.order.id) from OrderItem oi where oi.productId = :productId")
    Long countDistinctOrdersByProductId(Long productId);

    List<OrderItem> findByProductIdAndOrder_PlacedAtAfter(Long productId, LocalDateTime placedAfter);

    @Query("select oi.variationId, coalesce(sum(oi.quantity),0) from OrderItem oi where oi.productId = :productId and oi.variationId is not null group by oi.variationId order by coalesce(sum(oi.quantity),0) desc")
    List<Object[]> sumQuantityByVariation(Long productId);

        // --- Admin analytics helpers (sales = non-cancelled orders) ---

        @Query("select oi.productId, max(oi.productName), max(oi.categoryName), max(oi.imageUrl), coalesce(sum(oi.totalPrice),0) " +
            "from OrderItem oi " +
            "where oi.order.placedAt >= :start and oi.order.placedAt < :end " +
            "and oi.order.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "group by oi.productId " +
            "order by coalesce(sum(oi.totalPrice),0) desc")
        List<Object[]> topProductsByRevenueBetween(LocalDateTime start, LocalDateTime end);

        @Query("select coalesce(sum(oi.totalPrice),0) from OrderItem oi where oi.productId = :productId " +
            "and oi.order.placedAt >= :start and oi.order.placedAt < :end " +
            "and oi.order.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED")
        BigDecimal sumRevenueByProductIdBetween(Long productId, LocalDateTime start, LocalDateTime end);

        @Query("select oi.categoryId, max(oi.categoryName), coalesce(sum(oi.quantity),0) " +
            "from OrderItem oi " +
            "where oi.order.placedAt >= :start and oi.order.placedAt < :end " +
            "and oi.order.status <> com.vtcweb.backend.model.entity.order.OrderStatus.CANCELLED " +
            "and oi.categoryId is not null " +
            "group by oi.categoryId " +
            "order by coalesce(sum(oi.quantity),0) desc")
        List<Object[]> topCategoriesByUnitsBetween(LocalDateTime start, LocalDateTime end);
}
