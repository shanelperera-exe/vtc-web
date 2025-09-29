package com.vtcweb.backend.service.order;

import com.vtcweb.backend.dto.order.CreateOrderItemRequest;
import com.vtcweb.backend.dto.order.CreateOrderRequest;
import com.vtcweb.backend.exception.NotFoundException;
import com.vtcweb.backend.model.entity.category.Category;
import com.vtcweb.backend.model.entity.order.*;
import com.vtcweb.backend.model.entity.product.Product;
import com.vtcweb.backend.model.entity.product.ProductVariation;
import com.vtcweb.backend.repository.order.OrderRepository;
import com.vtcweb.backend.repository.product.ProductRepository;
import com.vtcweb.backend.repository.product.ProductVariationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public Order create(CreateOrderRequest request) {
        if (request == null) throw new IllegalArgumentException("request must not be null");
        validateCreateRequest(request);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PLACED);
        order.setCustomerFirstName(request.getCustomerFirstName());
        order.setCustomerLastName(request.getCustomerLastName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());

        // Addresses
        order.setBillingAddress(toAddressEntity(request.getBillingAddress()));
        order.setShippingAddress(toAddressEntity(request.getShippingAddress()));
        order.setDeliveryMethod(request.getDeliveryMethod());
        order.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentMethod() == PaymentMethod.CARD) {
            if (request.getPaymentInfo() == null) {
                throw new IllegalArgumentException("paymentInfo required for CARD payments");
            }
            order.setPaymentInfo(toPaymentInfoEntity(request.getPaymentInfo()));
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderItemRequest itemReq : request.getItems()) {
            if (itemReq == null) continue;
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found: id=" + itemReq.getProductId()));
            Category category = product.getCategory();
            ProductVariation variation = null;
            if (itemReq.getVariationId() != null) {
                variation = variationRepository.findByProductIdAndId(product.getId(), itemReq.getVariationId())
                        .orElseThrow(() -> new NotFoundException("Variation not found: productId=" + product.getId() + ", variationId=" + itemReq.getVariationId()));
            }
            int qty = (itemReq.getQuantity() == null) ? 0 : itemReq.getQuantity();
            if (qty <= 0) throw new IllegalArgumentException("quantity must be >= 1");

            BigDecimal unitPrice;
            if (variation != null && variation.getPrice() != null) {
                unitPrice = variation.getPrice();
            } else if (product.getBasePrice() != null) {
                unitPrice = product.getBasePrice();
            } else {
                throw new IllegalStateException("No price available for product id=" + product.getId());
            }
            if (unitPrice.signum() < 0) throw new IllegalStateException("unitPrice negative for product id=" + product.getId());

            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));
            subtotal = subtotal.add(totalPrice);

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .categoryId(category != null ? category.getId() : null)
                    .categoryName(category != null ? category.getName() : null)
                    .variationId(variation != null ? variation.getId() : null)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    // snapshot attributes defensively (clone) to preserve historical integrity
                    .variationAttributes(variation != null ? new java.util.HashMap<>(variation.getAttributes()) : new java.util.HashMap<>())
                    .build();
            order.addItem(item);
        }

        BigDecimal shippingFee = defaultNonNegative(request.getShippingFee());
        BigDecimal discountTotal = defaultNonNegative(request.getDiscountTotal());
        if (discountTotal.compareTo(subtotal) > 0) {
            // clamp discount to subtotal
            discountTotal = subtotal;
        }
        BigDecimal total = subtotal.subtract(discountTotal).add(shippingFee);

        order.setSubtotal(subtotal);
        order.setDiscountTotal(discountTotal);
        order.setShippingFee(shippingFee);
        order.setTotal(total);

        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getByIdWithDetails(Long id) {
        return orderRepository.findOneById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> list(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Override
    public Order updateStatus(Long id, OrderStatus newStatus) {
        if (newStatus == null) throw new IllegalArgumentException("newStatus must not be null");
        Order order = getById(id);
        OrderStatus current = order.getStatus();
        if (current == newStatus) return order; // idempotent

        // Enforce linear progression
        switch (newStatus) {
            case PROCESSING -> {
                if (current != OrderStatus.PLACED) {
                    throw new IllegalArgumentException("Cannot move to PROCESSING from " + current);
                }
                order.setStatus(OrderStatus.PROCESSING);
                order.setProcessingStartedAt(LocalDateTime.now());
            }
            case SHIPPED -> {
                if (current != OrderStatus.PROCESSING) {
                    throw new IllegalArgumentException("Cannot move to SHIPPED from " + current);
                }
                order.setStatus(OrderStatus.SHIPPED);
                order.setShippedAt(LocalDateTime.now());
            }
            case DELIVERED -> {
                if (current != OrderStatus.SHIPPED) {
                    throw new IllegalArgumentException("Cannot move to DELIVERED from " + current);
                }
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredAt(LocalDateTime.now());
            }
            case PLACED -> throw new IllegalArgumentException("Cannot revert status to PLACED");
        }
        return orderRepository.save(order);
    }

    @Override
    public void delete(Long id) {
        Order existing = getById(id);
        orderRepository.delete(existing);
    }

    private void validateCreateRequest(CreateOrderRequest r) {
        if (isBlank(r.getCustomerFirstName())) throw new IllegalArgumentException("customerFirstName blank");
        if (isBlank(r.getCustomerLastName())) throw new IllegalArgumentException("customerLastName blank");
        if (isBlank(r.getCustomerEmail())) throw new IllegalArgumentException("customerEmail blank");
        if (r.getItems() == null || r.getItems().isEmpty()) throw new IllegalArgumentException("items empty");
        if (r.getBillingAddress() == null) throw new IllegalArgumentException("billingAddress null");
        if (r.getShippingAddress() == null) throw new IllegalArgumentException("shippingAddress null");
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    private String generateOrderNumber() {
        // Format: ORD-YYYYMMDD-<8base36>
        String date = java.time.LocalDate.now().toString().replaceAll("-", "");
        String random; int attempts = 0;
        do {
            long val = Math.abs(RANDOM.nextLong());
            random = Long.toString(val, 36).toUpperCase(Locale.ROOT);
            if (random.length() > 8) random = random.substring(0,8);
            attempts++;
            if (attempts > 10) throw new IllegalStateException("Unable to generate unique order number");
        } while (orderRepository.existsByOrderNumber("ORD-" + date + "-" + random));
        return "ORD-" + date + "-" + random;
    }

    private Address toAddressEntity(com.vtcweb.backend.dto.order.AddressDTO dto) {
        if (dto == null) return null;
        return Address.builder()
                .line1(dto.getLine1())
                .line2(dto.getLine2())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .country(dto.getCountry())
                .build();
    }

    private PaymentInfo toPaymentInfoEntity(com.vtcweb.backend.dto.order.PaymentInfoDTO dto) {
        if (dto == null) return null;
        return PaymentInfo.builder()
                .cardType(dto.getCardType())
                .cardLast4(dto.getCardLast4())
                .cardExpMonth(dto.getCardExpMonth())
                .cardExpYear(dto.getCardExpYear())
                .build();
    }

    private BigDecimal defaultNonNegative(BigDecimal v) {
        if (v == null) return BigDecimal.ZERO;
        if (v.signum() < 0) throw new IllegalArgumentException("Negative monetary value not allowed");
        return v;
    }
}
