package com.vtcweb.backend.repository.order;

import com.vtcweb.backend.model.entity.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    boolean existsByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"items", "items.variationAttributes"}, type = EntityGraph.EntityGraphType.LOAD)
    Optional<Order> findOneById(Long id);

    @Override
    @EntityGraph(attributePaths = {"items"}, type = EntityGraph.EntityGraphType.LOAD)
    Page<Order> findAll(Pageable pageable);
}

